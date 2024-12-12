class Rule {
	id 				= undefined;
	rule_idx		= undefined;

	process_idx 	= undefined;
	parent_idx		= undefined;

	arguments 		= undefined;
	rule_args		= undefined;

	steps 			= undefined;
	step_idx 		= undefined;

	state  			= undefined;
	result 			= undefined;
	
	constructor(_id, _steps, _rule_idx, _process_idx, _parent_idx) {
		this.id 			= _id;
		this.rule_idx 		= _rule_idx;

		this.process_idx 	= _process_idx;
		this.parent_idx  	= _parent_idx;

		this.arguments 		= (Array.isArray(_steps[0])) ? _steps.shift(): [];
		this.rule_args		= Object.assign({
			"this_process": 	this.process_idx, 
			"parent_process": this.parent_idx
		}, Object.fromEntries(this.arguments));

		this.steps			= _steps.map((step) => new Step(this.rule_stack_id(), step));
		this.step_keys		= _steps.map((step) => step.id);
		this.step_idx 		= 0

		this.state 			= State.None;
	};

	rule_stack_id = function() {
		return `${this.id}_${this.rule_idx}`;
	}

	get = function(_key) {
		return this[_key];
	};

	get_finished_step_results = function() {
		return this.steps.reduce(function (_map, _step) { 
			if (_step.state == State.Finished) { 
				_map[_step.id] = _step.result; 
			}

			_map["step_idx"] = this.step_idx; 
			return _map;
		}.bind(this), Object.assign({}, this.rule_args));
	};

	static From = Object.freeze({"start": 0, "end": 1, "prev": 2, "next": 3});
	get_step_idx_by = function(_step_key, _step_value, _from) {

		let comparator;
		switch(_step_key) {
			case("id"):
				comparator = (_steps, _idx, _value) => _steps[_idx].id == _value;
				break;
			case("action"):
				comparator = (_steps, _idx, _value) => _steps[_idx].action == _value;
				break;
			default:
				throw new Error(`Rule.get_step_idx_by can only search by (id, action) not ${_step_key}`)
		}

		let at = 0;
		let to = 0;
		let direction = 0;
		let condition = null;
		switch(Rule.From[_from]) {
			case(Rule.From.start):
				at = 0;
				to = this.steps.length;
				direction = 1;
				condition = function(_at, _to) { return _at < _to; }
				break;
			case(Rule.From.end):
				at = this.steps.length;
				to = 0;
				direction = -1;
				condition = function(_at, _to) { return _at >= _to; }
				break;
			case(Rule.From.prev):
				at = this.step_idx - 1;
				to = 0;
				direction = -1;
				condition = function(_at, _to) { return _at >= _to; }
				break;
			case(Rule.From.next):
				at = this.step_idx + 1;
				to = this.steps.length;
				direction = 1;
				condition = function(_at, _to) { return _at < _to; }
				break;
			default:
				throw new Error(`Rule.get_step_idx_by must be passed a directional ex: ${Object.keys(Rule.From)}, not: ${_from}`);
		}

		while(condition(at, to)) {
			if (comparator(this.steps, at, _step_value)) {
				return at;
			}

			at += direction;
		}

		return -1;
	};

	set_result_for_step_at_idx = function(_idx, _result) {
		if (this.steps.length > _idx && _idx > -1) {
			if (this.steps[_idx] instanceof Step) {
				this.steps[_idx].result = _result;
				this.steps[_idx].state = State.Finished;

				return this.steps[_idx].result;
			}
		}
	};

	next = function() {
		let step = this.steps[this.step_idx];

		if (step != null) {
			if (step.state == State.Finished) {
				this.step_idx += 1;
				step = this.steps[this.step_idx];
			}

			if (step != null && step != undefined) {
				return step.run((step.state == State.None) ? this.get_finished_step_results() : [], this.step_idx);
			}
		}

		if (this.step_idx >= this.steps.length && this.state == State.None) {
			this.state = State.Finished;
			publisher.publish("rule", [this.rule_stack_id(), this.result]);
		}

		return Promise.resolve([this.rule_stack_id(), this.state]);
	};

	substitute = function(_args) {
		return Step.replace_tokens(this.get_finished_step_results(), _args.slice());
	};

	return = function(_value) {
		this.step_idx += 1;

		if (this.step_idx < this.steps.length) {
			this.to_step_idx(this.steps.length);
		}

		this.result = _value;
		return this.rule_stack_id();
	};

	to_step_idx = function(_idx) {
		_idx = (_idx < 0) ? this.step_idx + _idx : _idx;
		_idx = ops.clamp(_idx, 0, this.steps.length);
		if (_idx == this.step_idx) { return this.step_idx; }

		if (this.step_idx < _idx) { 
			while(this.step_idx < _idx) {
				if (this.steps[this.step_idx] != null && this.steps[this.step_idx].state != State.Finished) {
					this.steps[this.step_idx].state = State.Skipped;
				}

				this.step_idx += 1;
			}
		} else {
			while(this.step_idx >= _idx) {
				this.steps[this.step_idx].reset();
				
				if(this.step_idx > _idx) {
					this.step_idx -= 1;
				} else {
					break;
				}
			}

			this.step_idx = ops.clamp(this.step_idx, 0, this.steps.length);
		}

		return this.step_idx;
	};

	dict = function() {
		return {
			"id": 			this.id,
			"rule_idx": 	this.rule_idx,
			"steps": 		((this.arguments) ? [Object.entries(this.arguments)] : []) + this.steps.map((step) => step.dict()),
			"step_idx":		this.step_idx,
			"state": 		this.state,
			"result":		this.result
		}
	};
};