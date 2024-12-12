const Action_Targets = {};
const step_regex = /(?<delimited><(?<root>[$\w]+)\.*(?<path>[$\.\w]+)*>)/g;

class Step {
	rule_id			= undefined;
	id 					= undefined;
	action			= undefined;
	template		= undefined;

	args				= undefined;
	result			= undefined;
	state				= State.None;

	process			= undefined;

	constructor(_rule_id, _dict) {
		this.rule_id	= _rule_id;
		this.id				= _dict.id;
		this.action		= _dict.action;
		this.template	= Object.freeze(JSON.parse(JSON.stringify(_dict.args)));

		this.reset();
	};

	static replace_tokens (_results, _args) {
		if (_args == null) { return };

		if(Array.isArray(_args)) {
			for (let idx = 0; idx < _args.length; ++idx) {
				_args[idx] = Step.replace_tokens(_results, _args[idx]);
			}
		} else if(typeof _args == "object") {
			for (const[_key, _value] of Object.entries(_args)) {
				let key = Step.replace_tokens(_results, _key);
				_args[key] = Step.replace_tokens(_results, _value);

				if (key != _key) {
					delete _args[_key];
				}
			}

		} else if(typeof _args == "string") {
			const matches = Array.from(_args.matchAll(step_regex)).toReversed();

			for (const match of matches) {
				let root = match.groups.root;
				let path = (match.groups.path ?? false) ? match.groups.path.split(".") : [];
				let new_arg;

				if (!Object.keys(_results).includes(root) && !heap.h_has(root)) {
					throw new Error(`Unable to find a replacement for variable: ${match.groups.root}`);
				}

				// Add the root to the list
				path.unshift(root);
				
				// Resolve variable post processing
				while (path.length) {
					let key = path.shift();

					if (new_arg == null) {
						new_arg = (key.indexOf("$") >= 0) ? heap.h_get(key.replaceAll("$", "")) : _results[key];
					} else {
						new_arg = (key.indexOf("$") >= 0) ? new_arg[heap.h_get(key.replaceAll("$", ""))] : new_arg[key];
					}
				}

				if (match.groups.delimited.length == _args.length) {
					_args = new_arg;
				} else {
					_args = _args.substring(0, match.index) + new_arg + _args.substring(match.index + match.groups.delimited.length);
				}
			}
		}

		return _args;
	};

	get = function(_key) {
		return (this.hasOwnProperty(_key) && _key != "process") ? this[_key] : null;
	};

	set = function (_key, _value) {
		if (this.hasOwnProperty(_key) && _key != "process") {
			this[_key] = _value;
		}
	};

	run = function(_step_results, _step_idx) {
		if (State.Waiting == this.state) 					{ return this.process; }
		else if (State.Finished == this.state) 		{ return Promise.resolve([`${this.rule_id}-${this.id}`, this.state]); }
		else if (State.Skipped == this.state) 		{ return Promise.resolve([`${this.rule_id}-${this.id}`, this.state]); }
		else if (State.Failed == this.state) 			{ return Promise.reject([`${this.rule_id}-${this.id}`, this.state]);  }
	
		return new Promise(function (_resolve, _reject) {//	--------------------------------------------------- Publish Action
			try {
				let args = JSON.parse(JSON.stringify(this.template));

				switch(this.action) {
					case("watch"):
						this.set("args", args);
						break;
					case("event"):
						this.set("args", Step.replace_tokens(_step_results, args));
						this.result = this.args[1];
						this.args[1] = [_step_idx].concat(this.args[1]);
						break;
					default:
						this.set("args", Step.replace_tokens(_step_results, args));
			}
		} catch(e) {
			e.message = `In step: ${this.rule_id}.${this.id}, ${e.message}`;
			throw e;
		}

			let action_target = Action_Targets[this.action];
			if (!action_target) { throw new Error(`Action: ${this.action} does not have an associated target.`); }
			publisher.publish(Action_Targets[this.action], [this.action, this.args, _resolve, _reject]);
	
		}.bind(this))
		.then(function(_result) {// --------------------------------------------------------------------------- Format Results
			let action = this.action;
			let result = _result;

			if (this.action == "branch" && _result != null && _result != undefined) {
				action = _result.action;

				if (action == "inject") {
					result = [_result.result];
				}
				else  {
					result = _result.result;
				}
			} else if (this.action == "inject") {
				result = [result];
			}

			let payload = {"action": action, "result": result};
			return payload
	
		}.bind(this))
		.then(function(_kwargs) {// --------------------------------------------------------------------------- Branch Promise
			if (["inject", "loop"].includes(_kwargs.action) && Array.isArray(_kwargs.result) && _kwargs.result.length > 0) {
				this.set("state", State.Waiting);
				
				this.process = this._wait(_kwargs.action, _kwargs.result)
				.then(function(_result) { 
					return this._save(_kwargs.action, _result);
				}.bind(this));

			} else {
				return this._save(_kwargs.action, (this.action == "event") ? this.result : _kwargs.result);
			}

		}.bind(this))
		.then(function() {//----------------------------------------------------------------------------------- Return Id/State
			return [`${this.rule_id}-${this.id}`, this.state];
		}.bind(this))
	};
	
	_wait = function(_action, _result_keys) {
		return new Promise(async function (_resolve, _reject) {
			let target_type = _result_keys.reduce((type, curr) => `${type}-${curr}`, this.action);
			let target = new EventTarget(target_type);
			let results;
	
			publisher.subscribe(target, "rule", async function(_payload) {
				let args = publisher.get_payload_data(_payload);

				if (_result_keys.includes(args[0])) {
					let key = args[0];
					if (key instanceof Promise) {
						key = await key;
					}

					let value = args[1]
					if (_action == "inject") {
						results = value
					} else if (Array.isArray(results)) {
						results.push(value)
					} else {
						results = [value]
					}

					_result_keys.splice(_result_keys.indexOf(args[0]), 1);
				}

				if (_result_keys.length == 0) {
					publisher.unsubscribe(target, "rule");
					_resolve(results);
				}
			}.bind(this))
		}.bind(this))
	}
	
	_save = function(_action, _result) {
		return new Promise(function (_resolve, _reject) {
			this.result = _result;
			this.state = State.Finished;
			publisher.publish("stack", ["result", this.dict(), _resolve, _reject]);
		}.bind(this))
	};
	
	reset = function () {
		this.args 	= JSON.parse(JSON.stringify(this.template));
		this.result	= undefined; 
		this.state	= State.None;
	};

	dict = function() {
		return {
			"rule_id":	this.rule_id,
			"id": 			this.id,
			"action":		this.action,
			"template":	this.template,
			"args": 		(typeof this.args == "object" && this.args != null) ? JSON.stringify(this.args) : this.args,
			"result": 	this.result,
			"state": 		this.state,
		}
	};
};