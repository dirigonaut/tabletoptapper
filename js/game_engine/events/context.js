class Context {
	static Dict_To_Args(_context) {
		if (_context instanceof Context) { return new Error(`Cannot call Context.Dict_To_Args on an instance of a Context.`)}
		if (typeof _context == "string") { _context = JSON.parse(_context); }

		return [_context["context_id"], _context["_filters"], _context["_audiences"], _context["_bound"]];
	};

	context_id	= undefined;
	audiences	= undefined;

	filters		= undefined;
	regex		= undefined;
	bound		= undefined;

	default_target	= undefined;
	bound_target	= undefined;
	controllers		= undefined;

	constructor(_context_id, _filters=[], _audiences=[], _bound=[]) {
		this.context_id 		= _context_id;

		let deserialize 		= function([_id, _a]) { return [_id, this.add_audience(...Audience.Dict_To_Args(_a))]; }.bind(this);
		this.audiences			= Object.fromEntries(_audiences.map(deserialize));

		this.filters			= _filters;
		this.regex				= _filters.map((_f) => RegExp(_f) );
		this.bound				= _bound;
		this.controllers		= {};

		this.default_target		= new EventTarget();
		this.bound_target		= new EventTarget();
	};

	filter = async function(_event) {
		let payload 	= publisher.get_payload_data(_event);
		let event_id 	= payload[0];
		let resolve 	= payload[2];
		let reject 		= payload[3];

		for (let filter of this.regex) {
			if (filter.test(event_id)) { 
				this.default_target.dispatchEvent(_event);
				return resolve(true);
			}
		}

		reject(false);
	};

	bind = function(_context_2) {
		let abort  = new AbortController();
		let option = { signal: abort.signal };
		let method = function (_event) {_context_2.bound_target.dispatchEvent(new CustomEvent(Event_Key, { bubbles: false, detail: publisher.get_payload_data(_event)}))};

		this.bound.push(_context_2.context_id);
		this.controllers[_context_2.context_id] = abort;
		this.default_target.addEventListener(Event_Key, method, option);

		abort.signal.addEventListener("abort", function() {
			this.default_target.removeEventListener(Event_Key, method, option);
			delete this.bound[_context_2.context_id];
			delete this.controllers[_context_2.context_id];
		}.bind(this), true);
	};

	unbind(_other_id) {
		if(_other_id in this.controllers) {
			this.controllers[_other_id].abort();
		}
	};

	add_filter = function(_filter, _idx=-1) {
		if (this.filters.indexOf(_filter) == -1) {
			if (_idx > -1) {
				this.filters.splice(_idx, 0, _filter);
				this.regex.splice(_idx, 0, RegExp(_filter));
			} else {
				this.filters.push(_filter);
				this.regex.push(RegExp(_filter));
			}
		}
	};

	remove_filter = function(_filter) {
		let at = this.filters.indexOf(_filter);
		if (at > -1) {
			this.filters = this.filters.splice(at, 1);
			this.regex = this.regex.splice(at, 1)
		}
	};

	add_audience = function(_audience_id, _events, _listeners=[], _state=State.None) {
		if (_audience_id in this.audiences) {
			let audience = this.audiences[_audience_id];
			for(const [key, pattern] of Object.entries(_events)) {
				audience[`${key}_id`] = pattern;
			}
			
		} else {
			let audience = new Audience(_audience_id, _events, _listeners, _state);
			this.audiences[_audience_id] = audience;

			let controller = new AbortController();
			let options = { signal: controller.signal };

			let method = audience.on_event(function(_state) {
				if (_state == State.Finished) {
					controller.abort();
					this.default_target.removeEventListener(Event_Key, method, options); 
					this.bound_target.removeEventListener(Event_Key, method, options); 
					delete this.audiences[_audience_id];
				}
			}.bind(this));

			this.default_target.addEventListener(Event_Key,	method, options);
			this.bound_target.addEventListener(Event_Key,	method, options);
		}

		return `${this.context_id}:${_audience_id}`;
	};

	remove_audience = function(_audience_id) {
		if (_audience_id in this.audiences) {
			this.audiences[_audience_id].destroy();
			delete this.audiences[_audience_id];
			
		} else {
			throw new Error(`Context: ${this.context_id} does not have audience_id: ${_audience_id} to remove.`);
		}
	};

	add_listener = function(_audience_id, _listener) {
		if (_audience_id in this.audiences) {
			let audience = this.audiences[_audience_id];
			let listener_id = (Array.isArray(_listener)) ? _listener[0] : _listener["listener_id"];

			if (listener_id in audience.listener_ids) {
				let events = (Array.isArray(_listener)) ? _listener[1] : _listener["events"];
				let listener = audience.listeners.at(audience.listener_ids[listener_id]);
				for(const [key, pattern] of Object.entries(events)) {
					listener[`${key}_id`] = pattern;
				}

			} else {
				this.audiences[_audience_id].register_listener(_listener);
			}

			return `${this.context_id}:${_audience_id}:${listener_id}`;

		} else {
			throw new Error(`Context: ${this.context_id} does not have audience_id: ${_audience_id} to attach a listener to.`);
		}
	};

	remove_listener = function(_audience_id, _listener_id) {
		if (_audience_id in this.audiences) {
			let audience = this.audiences[_audience_id];

			if (audience && _listener_id in audience.listeners) { 
				audience.listeners[_listener_id].destructor();
			} else {
				logger.warn("context", `There is no listener: ${_listener_id} in ${this.context_id}:${_audience_id}`);
			}

		} else {
			throw new Error(`Context: ${this.context_id} does not have audience_id: ${_audience_id} to remove a listener from.`);
		}
	};

	destroy = function(_others) {
		for (let audience of Object.values(this.audiences)) {
			audience.destroy();
		}

		delete this.default_target;
		delete this.bound_target;
	};

	dict = function() {
		return {
			"context_id":	this.context_id,
			"filters":		this.filters,
			"audiences":	Object.entries(this.audiences).map(([_k, _a]) => [_k, _a.dict()]),
			"bound":			this.bound,
		}
	};
}

