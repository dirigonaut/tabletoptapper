const stack = Object({
	actions: ["result", "goto", "inject", "template", "loop", "branch", "return", "resolve", "step_result", "var_sub"],

	result_idx: 0,
	results: [],
	processes: [],

	get_process: function(_idx=0) {
		if (arguments.length > 0) {	logger.func("stack", "stack.get_process", arguments); };

		if (this.processes.length == 0) { return null; }
		let process = this.processes.at(_idx);

		if ([State.None, State.Waiting].includes(process.state)) { return process; }

		_idx = (_idx == 0 || _idx == -this.processes.length) ? 0 : _idx;
		if (_idx != 0) { throw new Error(`Attempted to get process: ${_idx} rule which is not available.`); }

		while (this.processes.length > 0 && [State.Failed, State.Skipped, State.Finished].includes(process.state)) {
			this.processes.at(_idx).destructor();
			this.processes.shift();
			process = this.processes.at(_idx);
		}

		return process;
	},

	event_handler: function(_action, _args, _resolve, _reject) {
		logger.func("stack", "stack.event_handler", arguments);

		switch(_action) {
			case("result"):
				return _resolve(this.push_result(_args));
			case("inject"):
				return _resolve(this.inject(..._args));
			case("branch"):
				return _resolve(this.branch(..._args));
			case("loop"):
				return _resolve(this.loop(..._args));
			case("template"):
				return _resolve(this.template(..._args));
			case("return"):
				return _resolve((_args.length < 2) ? this.return(0, ..._args) : this.return(..._args));
			case("goto"):
				return _resolve((_args.length < 2) ? this.goto(0, ..._args) : this.goto(..._args));
			case("step_result"):
				return _resolve((_args.length < 3) ? this.step_result(0, ..._args) : this.step_result(..._args));
			case("process"):
				return _resolve(this.new_process(..._args));
			case("resolve"):
				return _resolve(..._args);
			case("var_sub"):
				return _resolve(this.var_sub(..._args));
			default:
				_reject(new Error(`stack.${_action} is not a valid command`));
		}
	},

	push_result: function(_result) {
		//this.results.push(_result);
		return true;
	},

	new_process: function(_parent_idx=null) {
		logger.func("stack", "stack.new_process", arguments);
		let right_idx = -(this.processes.length + 1);
		this.processes.unshift(new Process(_parent_idx, right_idx));
		return right_idx;
	},

	branch: function(_is, _true, _false) {
		logger.func("stack", "stack.branch", arguments);
		_is = (Array.isArray(_is)) ? ops.math(..._is) : _is;
		let outcome = (_is) ? _true : (_false == "null") ? null : _false;

		if (outcome) {
			return new Promise(function (_resolve, _reject) {
				let args = (outcome.args) ? outcome.args : [];

				if ("inject" == outcome.action && (!Array.isArray(args) || args.length > 2 || args.length == 0)) { 
					throw new Error(`branch.inject requires 1-2 args: [rule, args], not ${JSON.stringify(args)}`)
				} else if ("loop" == outcome.action && ((!Array.isArray(args) || args.length > 3 || args.length < 2))) {
					throw new Error(`branch.loop requires 3 args: [rule, iter, args]: ${JSON.stringify(args)}`)
				}

				publisher.publish(Action_Targets[outcome.action], [outcome.action, args, _resolve, _reject]);
			}).then(function(_result) {
				return {"action": outcome.action, "result": _result};
			});
		}
	},

	loop: function(_rule_id, _indices, _args) {
		logger.func("stack", "stack.loop", arguments);
		let iter_idx = _args.indexOf("$idx$");
		let rule_ids = [];

		if (_indices.length == 0) {
			logger.warn("stack", `Loop was called with empty indices: ${_indices} for rule_id: ${_rule_id}`)
		}

		for (let idx = 0; idx < _indices.length; ++idx) {
			let arg_copy = _args.slice()
			if (iter_idx > -1) {
				arg_copy[iter_idx] = _indices[idx];
			}

			rule_ids.push(stack.inject(this.template(_rule_id, arg_copy)));
		}

		return rule_ids;
	},
	
	trigger: function(_event_id, _conditional, _injectable, _args) {
		publisher.subscribe(new EventTarget(), "event", 
			publisher.pass_through(function(_event_id, _value, _resolve, _reject) {
				if (_event_id.indexOf(_event_id) == 0) {
					if (_conditional.length == 0 || ops.math(_conditional[0], _conditional[1], _value)) {
						let process_id = this.new_process(this.get_process().right_idx);
						this.inject(_injectable, _args, process_id);
					}
				}
			}, publisher.sub_options())
		)
	},

	inject: function(_rule, _data=null, _process=0, _at=0) {
		logger.func("stack", "stack.inject", arguments);
		let process = this.processes.at(_process);
		let rule = undefined;
		
		if (typeof _rule == "string" && Array.isArray(_data)) {
			let template_check = _data.at(-1);
			template_check = (template_check) ? template_check["id"] : template_check;

			if (template_check && typeof template_check == "object" && Array.isArray(template_check) == false) {
				rule = new Rule(_rule, _data, this.result_idx, process.right_idx, process.parent_idx); // An unpacked filled out template rule

			} else {
				let template = this.template(_rule, _data);
				rule = new Rule(...template, this.result_idx, process.right_idx, process.parent_idx); // A template with args 
			}

		} else if (typeof _rule == "string" && _data == null) {
			rule = new Rule(_rule, rule_data.get(_rule), this.result_idx, process.right_idx, process.parent_idx); // A rule id

		} else if (Array.isArray(_rule) && _data == null) {
			rule = new Rule(..._rule, this.result_idx, process.right_idx, process.parent_idx); // A packed filled out template rule
		}

		if (rule != undefined) {
			if (process != null && process != undefined) {
				process.insert(rule, _at);
			} else {
				throw new Error(`Unable to inject rule: ${rule} into process: ${_process} at: ${_at}`, { "cause": { "code": "Null_Ref", "value": this.processes}});
			}
			
			this.result_idx += 1;
			return rule.rule_stack_id();
		} else {
			throw new Error(`Unable to inject rule: ${rule} with args:`, { "cause": { "code": "Invalid_Args", "value": Array.from(arguments)}});
		}
	},

	template: function(_rule_id, _args, _steps=null) {
		logger.func("stack", "stack.template", arguments);
		let rule = JSON.parse(JSON.stringify((_steps == null) ? rule_data.get(_rule_id) : _steps));
		let arg_keys = rule[0];
		
		if (_args && Array.isArray(arg_keys)) {
			if (_args.length > arg_keys.length) {
				logger.warn("stack", `stack.template, for rule_id:${_rule_id} there are more arguments: ${_args.length} than required: ${arg_keys.length}.`);
			} else if (_args.length < arg_keys.length) {
				throw new Error(`stack.template, rule_id: ${_rule_id} requires: [${arg_keys.length}, ${arg_keys}] not: [${_args.length}, ${_args}]`);
			}
	
			arg_keys = arg_keys.slice();
			_args = _args.slice();
	
			for(let idx = 0; idx < _args.length; ++idx) {
				if (arg_keys.length > idx) {
					arg_keys[idx] = [arg_keys[idx], _args[idx]];
				}
			}
	
			rule[0] = arg_keys;
		}
	
		return [_rule_id, rule];
	},

	return: function(_process_idx, _value=null) {
		logger.func("stack", "stack.return", arguments);
		let process = this.get_process(_process_idx);
		return process.get_rule().return(_value);
	},

	step_result: function(_process_idx, _step_idx, _value) {
		logger.func("stack", "stack.step_result", arguments);
		let process = this.get_process(_process_idx);
		return process.get_rule().set_result_for_step_at_idx(_step_idx, _value);
	},

	var_sub: function(_process_idx, _args) {
		logger.func("stack", "stack.var_sub", arguments);
		let process = this.get_process(_process_idx);
		return process.get_rule().substitute(_args);
	},

	goto: function(_process_idx, _to_step) {
		logger.func("stack", "stack.goto", arguments);
		let process = this.get_process(_process_idx);
		let rule = process.get_rule();
		let split = _to_step.split(".");

		if (split.length == 3) { 
			step_idx = rule.get_step_idx_by(...split);
		} else {
			throw new Error(`stack.goto requires at least two args delimited by . ex: (<id>.<direction>) not: ${_to_step}`);
		};

		if(step_idx > -1) {
			return rule.to_step_idx(step_idx);
		} else {
			throw new Error(`For process(${_process_idx}).rule(${rule.id}).step(${rule.step_idx}) there is no step of type: ${split[0]} matching: ${split[1]} using logic: ${split[2]}`);
		}
	},
});