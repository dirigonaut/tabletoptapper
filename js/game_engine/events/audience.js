class Audience {
	static Dict_To_Args(_audience) {
		if (_audience instanceof Audience) { return new Error(`Cannot call Audience.Dict_To_Args on an instance of a Audience.`)}
		if (typeof _audience == string) { _audience = JSON.parse(_audience); }

		return [_audience["audience_id"], _audience["events"], _audience["listeners"], _audience["state"]];
	}

	audience_id 	= undefined;
	events 			= undefined;

	start_regex 	= undefined;
	stop_regex		= undefined;
	delete_regex	= undefined;

	state			= undefined;
	listeners		= undefined;

	target			= undefined;
	controller		= undefined;
	options			= undefined;
	destructor		= undefined;

	constructor(_audience_id, _events, _listeners=[], _state=State.None) {
		let deserialize = function([_l]) { return this.register_listener(Listener(...Listener.Dict_To_Args(_l))) }.bind(this);

		this.audience_id 	= _audience_id;
		
		this.events			= _events;
		this.start_regex 	= (_events["start"]) 	? RegExp(_events["start"]) 	: undefined;
		this.stop_regex 	= (_events["stop"]) 	? RegExp(_events["stop"]) 	: undefined;
		this.delete_regex 	= (_events["delete"]) ? RegExp(_events["delete"]) : undefined;

		this.listeners		= _listeners.map(deserialize);
		this.listener_ids 	= Object.fromEntries(this.listeners.map((_idx, _l) => [_l.listener_id, -this.listeners.length + _idx]));
		this.state			= _state;

		this.target 		= new EventTarget();

		if (this.state == State.Waiting) {
			this.controller 	= new AbortController();
			this.options		= { signal: this.controller.signal };
			this.counter		= 0;
		}
	};

	set_events = function(_events) {
		this.events			= _events;

		this.start_regex 	= (_events["start"]) 	? RegExp(_events["start"]) 	: undefined;
		this.stop_regex 	= (_events["stop"]) 	? RegExp(_events["stop"]) 	: undefined;
		this.delete_regex	= (_events["delete"]) ? RegExp(_events["delete"]) : undefined;
	};

	register_listener = function(_listener) {
		if (!_listener) { throw new Error(`Cannot instantiate null listener in audience:${this.audience_id}`)};

		_listener = (Array.isArray(_listener)) ? _listener : Listener.Dict_To_Args(_listener);
		let listener = new Listener(..._listener);

		if (this.state == State.Waiting) {
			listener.wire(this.target, this.options, this.deregister_listener.bind(this));
		}

		this.listeners.push(listener);
		this.listener_ids[listener.listener_id] = -this.listeners.length;
		return listener;
	};

	deregister_listener = function(_listener_id) {
		if (_listener_id in this.listener_ids) {
			// convert the idx back to a left index and base 0 it
			let l_idx = (this.listener_ids[_listener_id] + 1) * -1;

			this.listeners = this.listeners.splice(l_idx, 1);
			delete this.listener_ids[_listener_id];
		}
	};

	_fifo_to_lifo_resolver = function() {
		return function(_method) {
			if (_method) {
				this.filo_queue.unshift(_method);
			}
	
			this.count += 1;
			if (this.count >= this.length) {
				this.filo_queue.forEach((_m) => _m());
			}
		}.bind({"length": this.listeners.length, "count": 0, "filo_queue": []}); 
	};

	wire = function(_target, _options, _state_callback) {
		if (!this.start_regex) {
			throw new Error(`Audience cannot listen for an event with a null/undefined/empty start: ${this.start_regex}`);
		}

		if (!this.stop_regex) {
			throw new Error(`Audience cannot listen for an event with a null/undefined/empty stop: ${this.stop_regex}`);
		}

		if (this.state = state.Waiting) {
			throw new Error(`Cannot wire audience: ${this.audience_id}, it is already wired.`);
		}

		_target.addEventListener(
			_target, 
			this.on_trigger(
				() => _target.removeEventListener(_target, method, _options),
				_state_callback
			),
			_options
		);

		this.state = state.Waiting;
	};

	on_event = function(_callback, _event) {
		this.destructor = _callback;

		return function(_event) {
			let payload = publisher.get_payload_data(_event);
			let event_id 	= payload[0];

			if (this.delete_regex && this.delete_regex.test(event_id)) {
				logger.log("audience", `${this.audience_id} has found a match for the delete event: ${this.delete_regex}`);

				this.controller.abort();
				this.listeners = null;
				delete this.target;

				this.state = State.Finished;
				_callback(this.state);

			} else if (this.state == State.Waiting) {
				if (this.stop_regex && this.stop_regex.test(event_id)) {
					logger.log("audience", `${this.audience_id} has found a match for the stop event: ${this.stop_regex}`);

					this.state = State.None;
					this.controller.abort()

					for (let listener of this.listeners) {
						listener.state = State.None;
					}

				} else {
					payload = [event_id, payload[1], this._fifo_to_lifo_resolver()];
					this.target.dispatchEvent(new CustomEvent(Event_Key, { bubbles: false, detail: payload}));
				}

			} else if (this.state == State.None) {
				 if (this.start_regex && (this.start_regex.test(event_id))) {
					logger.log("audience", `${this.audience_id} has found a match for the start event: ${this.start_regex}`);

					this.state 			= State.Waiting;
					this.controller 	= new AbortController();
					this.options		= { signal: this.controller.signal };
					this.counter 		= 0;

					for (let listener of this.listeners) {
						listener.wire(this.target, this.options, this.deregister_listener.bind(this));
					}
				}
			} 
		}.bind(this);
	};

	destroy = function() {
		if (this.controller) { this.controller.abort(); }
		this.listeners = null;
		this.listener_ids = null;

		this.state = State.Finished;
		delete this.target;
		this.destructor(this.state);
	};

	dict = function() {
		return {
			"audience_id":	this.audience_id,
			"events":		this.events,
			"listeners":	this.listeners.map((_l) => _l.dict()),
			"state":		this.state,
		}
	};
}