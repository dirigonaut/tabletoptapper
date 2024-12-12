const Event_Key = "event";

class Subscriber {
	target 		= undefined;
	controller  = undefined;

	constructor(_target, _event, _func) {
		this.target = _target;
		this.controller = new AbortController();

		let option = {signal: this.controller.signal};
		this.target.addEventListener(_event, _func, option);
		option.signal.addEventListener("abort", () => _target.removeEventListener(_event, _func, option), true);
	};

	destructor = function() {
		this.controller.abort();
	}
};

const publisher = Object({
	actions: ["audience", "bind", "context", "event", "listen"],

	subscriptions: 	{},
	contexts: 			{},

	get: function() {
		if (this.contexts) {
			return Object.entries(this.contexts).map(([_k,_v]) => _v.dict() );
		} else {
			return [];
		}
	},

	set: function(_contexts) {
		for(let context of _contexts) {
			this.context(context.context_id, "+", context);
		}

		for(let context_1 of Object.values(this.contexts)) {
			for(let context_2 of context_1.bound) {
				Context.Bind(context_1, context_2, false);
			}
		}
	},

	publish: function(_event, _payload={}) {
		let subscribers = this.subscriptions[_event];

		if (subscribers) {
			let event = new CustomEvent(_event, { bubbles: false, detail: _payload});

			for (let subscriber of subscribers) {
				subscriber.target.dispatchEvent(event);
			}
		}
	},

	subscribe: function(_subscriber, _event, _func) {
		logger.func("publisher", "publisher.subscribe", arguments, true);

		if (this.subscriptions[_event] == null) {
			this.subscriptions[_event] = []
		}
		
		this.subscriptions[_event].push(new Subscriber(_subscriber, _event, _func));
	},

	unsubscribe: function(_subscriber, _event) {
		let subscribers = this.subscriptions[_event];

		if(Array.isArray(subscribers) == true) {
			let idx = subscribers.findIndex((_s) => _s.target == _subscriber);

			if (idx > -1) {
				subscribers.splice(idx,1).forEach((_s) => _s.destructor());
			}
		}
	},

	pass_through: function(_node, _method="event_handler") {
		if (typeof _node === 'function') {
			return function(e) { 				
				if (Array.isArray(e.detail)) {
					_node(...e.detail);
				} else {
					_node(e.detail);
				};
			}
		} else {
			return function(e) { 
				if (Array.isArray(e.detail)) {
					_node[_method](...e.detail);
				} else {
					_node[_method](e.detail);
				};
			}
		}
	},

	get_payload_data(_payload) {
		return _payload["detail"]
	},

	clean_input: function(_composite, _operation, _required) {
		if (!(["+","-"].includes(_operation))) { throw new Error(`composite: ${_composite} is missing a valid:[+, -] _operation: ${_operation}.`); }
		let split = _composite.split(":");
		if (split.length < _required) { throw new Error(`composite: ${_composite} requires ${_required} keys delimited by a ':'.`); }
		return split;
	},

	event_handler: function(_action, _args, _resolve, _reject) {
		logger.func("publisher", "publisher.event_handler", arguments);

		switch(_action) {
			case("event"):
				return this.event(_args, _resolve, _reject);
			case("listen"):
				return _resolve(this.listener(..._args));
			case("audience"):
				return _resolve(this.audience(..._args));
			case("context"):
				return _resolve(this.context(..._args));
			case("filter"):
				return _resolve(this.filter(..._args));
			case("bind"):
				return _resolve(this.bind(..._args));
			default:
				_reject(new Error(`publisher.${_action} is not a valid command`));
		}
	},

	event: function(_payload, _resolve, _reject) {
		let promises = [];

		if (this.contexts) {
			for (let context of Object.values(this.contexts)) {
				promises.push(new Promise(function(_resolve, _reject) {
					context.filter(new CustomEvent(Event_Key, { 
								bubbles: false, 
								cancelable: true, 
								detail: [_payload[0], _payload[1], _resolve, _reject]
							}
						)
					);
				}))
			}
		}

		return Promise.allSettled(promises).then((_results) => _resolve(_payload));
	},

	context: function(_composite_id, _operation, _args) {
		let composite = this.clean_input(_composite_id, _operation, 1);

		if (_operation == "+") {
			if (composite[0] in this.contexts) {
				if (_args) { 
					this.contexts[composite[0]].add_filter(..._args); 
				}
			} else {
				this.contexts[composite[0]] = new Context(...((Array.isArray(_args)) ? [composite[0], _args] : Context.Dict_To_Args(_args)));
			}

			return composite[0];

		} else if (_operation == "-") {
			if (typeof composite[0] != "string") { throw new Error(`publisher.context for operation: ${_operation} requires the context_id not: ${composite[0]}`); }

			if (composite[0] in this.contexts) {
				if (_args) { 
					this.contexts[composite[0]].remove_filter(..._args); 
				} else {
					let context = this.contexts[composite[0]];
					for(let other of context.bound) {
						context.unbind(other);
						
						if (this.contexts[other]) {
							this.contexts[other].unbind(context.context_id);
						}
					}

					context.destroy();
					delete this.contexts[composite[0]];
				}
			}
		}
	},

	bind: function(_composite_id, _operation, _other_id, _both=true) {
		let composite = this.clean_input(_composite_id, _operation, 1);

		let context_1 = this.contexts[composite[0]];
		if (context_1 == undefined) { throw new Error(`Context: ${composite[0]} does not exist to ${_operation} a bind to ${_other_id}.`) };
		let context_2 = this.contexts[_other_id];
		if (context_2 == undefined) { throw new Error(`Context: ${_other_id} does not exist to ${_operation} a bind to ${composite[0]}.`) };

		if (_operation == "+") {
			context_1.bind(context_2);
			if (!_both) { return; }
			context_2.bind(context_1);

		} else if (_operation == "-") {
			context_1.unbind(context_2.context_id);
			if (!_both) { return; }
			context_2.unbind(context_1.context_id);

		}
	},

	audience: function(_composite_id, _operation, _args) {
		let composite = this.clean_input(_composite_id, _operation, 2);

		let context = this.contexts[composite[0]];
		if (context == undefined) { throw new Error(`Context: ${composite[0]} does not exist to ${_operation} an audience to.`) };

		if (_operation == "+") {
			return context.add_audience(composite[1], _args);
		} else if (_operation == "-") {
			context.remove_audience(composite[1]);
		}
	},

	listener: function(_composite_id, _operation, _events=[], _limit, _rule, _args=[]) {
		let composite = this.clean_input(_composite_id, _operation, 3);

		let context = this.contexts[composite[0]];
		if (context == undefined) { throw new Error(`Context: ${composite[0]} does not exist to ${_operation} a listener to.`) };

		if (_operation == "+") {
			return context.add_listener(composite[1], [composite[2], _events, _limit, _rule, _args]);
		} else if (_operation == "-") {
			context.remove_listener(composite[1], composite[2]);
		}
	},
});