
class Listener {
	static Event = {"Trigger": "trigger", "Reset": "reset", "Delete": "delete"};
	static Action = {"Pattern": 0, "Method": 1, "Args": 2};

	static Dict_To_Args(_listener) {
		if (_listener instanceof Listener) { return new Error(`Cannot call Listener.Dict_To_Args on an instance of a Listener.`)}
		if (typeof _listener == string) { _listener = JSON.parse(_listener); }

		return [_listener["listener_id"], _listener["events"], _listener["limit"], _listener["state"]];
	}

	listener_id 	= undefined;
	events			= undefined;

	trigger_regex	= undefined;
	delete_regex	= undefined;
	reset_regex		= undefined;

	limit			= undefined;
	state			= undefined;
	destructor		= undefined;

	constructor(_listener_id, _events, _limit="*", _state=State.None) {
		this.set_events(_events);

		this.listener_id 	= _listener_id;
		this.limit			= (Array.isArray(_limit)) ? _limit : [0, _limit];
		this.state			= _state;
	};

	set_events = function(_events) {
		this.events			= _events;
		this.trigger_regex 	= (_events[Listener.Event.Trigger]) ? RegExp(_events[Listener.Event.Trigger][Listener.Action.Pattern])	: undefined;
		this.delete_regex 	= (_events[Listener.Event.Delete]) 	? RegExp(_events[Listener.Event.Delete][Listener.Action.Pattern]) 	: undefined;
		this.reset_regex 	= (_events[Listener.Event.Reset]) 	? RegExp(_events[Listener.Event.Reset][Listener.Action.Pattern]) 		: undefined;
	};

	wire = function(_target, _options, _deregister_callback) {
		if (!this.trigger_regex) {
			throw new Error(`Cannot listen for an event with a null/undefined/empty trigger: ${this.trigger_regex}`);
		}

		if (this.state == State.Waiting) {
			throw new Error(`Cannot wire listener: ${this.trigger_regex}, it is already wired.`);
		}

		let method = this.on_event(function _tear_down() { 
			_target.removeEventListener(_target, method, _options); 
			_deregister_callback(this.listener_id);
		}.bind(this));

		_target.addEventListener(Event_Key, method, _options);
		this.state = State.Waiting;
	};

	on_event = function(_destructor) {
		this.destructor = _destructor;

		return function(_event) {
			let payload 	= publisher.get_payload_data(_event);
			let event_id 	= payload[0];
			let args 		= payload[1];
			let resolve 	= payload[2];

			console.log(this.events)
			console.log(_event)
			if (this.state == State.Waiting && this.trigger_regex.test(event_id)) {
				if (this.limit[1] != "*") {
					this.limit[0] += 1;

					if (this.limit[0] >= this.limit[1]) {
						this.state = State.Finished;
					}
				}

				if (this.events[Listener.Event.Trigger][Listener.Action.Method] != undefined && this.events[Listener.Event.Trigger][Listener.Action.Method] != null) {
					logger.log("listener", `Event: ${this.listener_id}.${Listener.Event.Trigger}`, this.events[Listener.Event.Trigger]);
					return resolve(this._create_callback(Listener.Event.Trigger, args));
				}

			} else if (this.reset_regex && this.reset_regex.test(event_id) && this.limit[1] != "*") {
					this.limit[0] = 0;
					this.state = State.Waiting;

					if (this.events[Listener.Event.Reset][Listener.Action.Method] != undefined && this.events[Listener.Event.Reset][Listener.Action.Method] != null) {
						logger.log("listener", `Event: ${this.listener_id}.${Listener.Event.Reset}`, this.events[Listener.Event.Reset]);
						return resolve(this._create_callback(Listener.Event.Reset, args));
					}

			} else if (this.delete_regex && ((this.state == State.Finished && this.events[Listener.Event.Delete] == "$limit$") || this.delete_regex.test(event_id))) {
				if (this.events[Listener.Event.Delete][Listener.Action.Method] != undefined && this.events[Listener.Event.Delete][Listener.Action.Method] != null) {
					logger.log("listener", `Event: ${this.listener_id}.${Listener.Event.Delete}`, this.events[Listener.Event.Delete]);
					return resolve(this._create_callback(Listener.Event.Delete, args));
				}

				_destructor();
			
			}

			resolve();
		}.bind(this)
	};

	// Pass back to a middle man function to execute in reverse order of firing.
	// This is needed since the stack is a LIFO queue and events are FIFO.
	_create_callback = function(_event_id, _args) {
		return function() {
			try {
				let args = this.events[_event_id][Listener.Action.Args];
				args = (args != undefined && args != null) ? args : []; 

				stack.inject(this.events[_event_id][Listener.Action.Method], this._format_args(args, _args), stack.new_process(stack.get_process().right_idx));
			} catch(e) {
				game_loop.state = State.Failed;
				throw e;
			}
		}.bind(this)
	};

	_format_args = function(_listener_args, _event_args=[]) {
		let stringified = JSON.stringify(_listener_args);

		let limit_delta = (this.limit != "*") ? this.limit[1] - this.limit[0] : Infinity
		stringified = stringified.replaceAll(`"$limit$"`, limit_delta).replaceAll(`$limit$`, limit_delta);
		stringified = stringified.replaceAll(`"$event_idx$"`, _event_args[0]);

		for(let idx = 1; idx < _event_args.length; ++idx) {
			stringified = stringified.replaceAll((typeof p_arg == "string") ? `"$${idx - 1}$"`: `$${idx - 1}$`, _event_args[idx]);
		}
	
		return JSON.parse(stringified);
	};

	dict = function() {
		return {
			"listener_id":	this.listener_id,
			"events": 		this.events,
			"limit":		this.limit,
			"state":		this.state
		}
	};
}