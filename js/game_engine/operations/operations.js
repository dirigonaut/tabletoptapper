const ops = Object({
	actions: ["roll", "math", "clamp", "format", "reduce", "filter", "remove", "shift", "get", "pop", "set", "ifelse", "range", "includes", "at", "split", "reverse", "replace", "palindrome", "entries"],

	event_handler: function(_action, _args, _resolve, _reject) {
		logger.func("ops", "ops.event_handler", arguments);

		switch(_action) {
			case("roll"):
				return _resolve(this.roll(..._args));
			case("math"):
				return _resolve(this.math(..._args));
			case("clamp"):
				return _resolve(this.clamp(..._args));
			case("reduce"):
				return _resolve(Vector.reduce(..._args));
			case("filter"):
				return _resolve(Vector.filter(..._args));
			case("remove"):
				return _resolve(Vector.remove(..._args));
			case("shift"):
				return _resolve(Vector.shift(..._args));
			case("get"):
				return _resolve((_args[0][_args[1]] != undefined && _args[0][_args[1]] != null) ? _args[0][_args[1]] : _args[2]);
			case("pop"):
				var result = _args[0][_args[1]];
				delete _args[0][_args[1]];
				return _resolve(result);
			case("set"):
				_args[0][_args[1]] = _args[2];
				return _resolve(_args[0]);
			case("ifelse"):
				return _resolve(this.ifelse(..._args));
			case("range"):
				return _resolve(Array.from({length: _args}, (v, i) => i).toReversed());
			case("includes"):
				return _resolve(this.includes(..._args));
			case("at"):
				return _resolve(this.at(..._args));
			case("format"):
				return _resolve(this.format(..._args));
			case("split"):
				return _resolve(_args[0].split(_args[1]));
			case("reverse"):
				return _resolve(_args[0].toReversed());
			case("replace"):
				return _resolve(_args[0].replaceAll(_args[1], _args[2]));
			case("palindrome"):
				return _resolve(this.palindrome(_args[0]));
			case("entries"):
				return _resolve(Object.entries(_args[0]));
			default:
				_reject(new Error(`ops.${_action} is not a valid command`));
		}
	},

	roll: function(_faces, _roll=null) {
		return (_roll == null) ? Math.floor(Math.random() * _faces) : this.clamp(_roll, 0, _faces);
	},

	math: function(_value_1, _operator, _value_2) {
		if (_operator == undefined) {
			if (Array.isArray(_value_1)) {
				throw new Error(`ops.math remove extra brackets surrounding args: ${JSON.stringify(arguments)}`);
			} else {
				throw new Error(`ops.math no operator was passed in for args: ${JSON.stringify(arguments)}`);
			}
		}

		if (Vector.operations[_operator] == undefined) {
			throw new Error(`ops.math invalid operator: ${_operator}, for args: ${JSON.stringify(arguments)}`);
		}

		if ((typeof _value_1 != typeof _value_2) && !(Array.isArray(_value_1) || Array.isArray(_value_2))) {
			logger.warn("ops", "ops.math", `${_value_1}:${typeof _value_1} != ${_value_2}:${typeof _value_2}`);
		}

		if(Array.isArray(_value_1) && _value_1.length == 3 && Vector.operations[_value_1[1]]) {
			_value_1 = this.math(..._value_1);
		}

		if(Array.isArray(_value_2) && _value_2.length == 3 && Vector.operations[_value_2[1]]) {
			_value_2 = this.math(..._value_2);
		}

		return (Array.isArray(_value_1) || Array.isArray(_value_2)) ? Vector.transform(_value_1, _operator, _value_2) : Vector.operations[_operator](_value_1, _value_2);
	},

	clamp: function(_value, _min, _max) {
		return Math.min(Math.max(_value, _min), _max);
	},

	ifelse: function(_is, _outcome_1, outcome_2){
		_is = (Array.isArray(_is)) ? ops.math(..._is) : _is;
		return (_is) ? _outcome_1 : outcome_2;
	},

	includes: function(_object, _value) {
		return (Array.isArray(_object)) ? _object.includes(_value) : Object.keys(_object).includes(_value);
	},

	at: function(_delimited, _idx, _delimiter=".") {
		return _delimited.split(_delimiter).at(_idx);
	},

	format: function() {
		let args = Array.from(arguments);
		let text = args.shift();

		for(let idx in args) {
			text = text.replaceAll(`__${idx}__`, args[idx])
		}

		return text
	},

	palindrome: function(_value) {
		let value = `${_value}`;
		let i = 0;
		let j = value.length - 1;

		if (j == i) {
			return false;
		}

		while(i < j) {
			if(value[i] != value[j]) {
				return false
			}

			i += 1;
			j -= 1;
		}

		return true;
	},
});