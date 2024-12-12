class Vector {
	static filter_operators = Object.freeze(["&", "|", "^", "<", ">", "<=", ">=", "==", "!=", "is", "isnt", ".", "~", "min", "max", "clmp"]);
	static operations = {
		"+":		function(_x, _y) 	{ return _x + _y; },
		"-":		function(_x, _y) 	{ return _x - _y; },
		"*":		function(_x, _y) 	{ return _x * _y; },
		"%":		function(_x, _y) 	{ return _x % _y; },
		"/":		function(_x, _y) 	{ return _x / _y; },
		"&":		function(_x, _y) 	{ return _x & _y; },
		"|":		function(_x, _y) 	{ return _x | _y; },
		"^":		function(_x, _y) 	{ return _x ^ _y; },
		"<":		function(_x, _y) 	{ return _x < _y; },
		">":		function(_x, _y) 	{ return _x > _y; },
		">=":		function(_x, _y) 	{ return _x >= _y; },
		"<=":		function(_x, _y) 	{ return _x <= _y; },
		"==":		function(_x, _y) 	{ return _x == _y; },
		"!=":		function(_x, _y) 	{ return _x != _y; },
		"is":		function(_x, _y) 	{ return (arguments.length == 1) ? (_x): (_y); },
		"isnt":	function(_x, _y) 	{ return (arguments.length == 1) ? (!_x): (!_y); },
		".":		function(_x, _y) 	{ return _x[_y]; },
		"~":		function(_x, _y) 	{ return new RegExp(_y).test(_x); },
		"min":	function(_x, _y) 	{ return Math.min(_x, _y) },
		"max":	function(_x, _y) 	{ return Math.max(_x, _y) },
		"clmp":	function(_x, _y) 	{ return Math.min(Math.max(_x, _y.min), _y.max) },
	};

	static transform(_vector_1, _operation, _vector_2) {
		if (Array.isArray(_vector_1) && !Array.isArray(_vector_2)) {
			_vector_2 = _vector_1.slice().fill(_vector_2, 0, _vector_1.length);
		}

		let t_vector_1 = _vector_1.slice();
		_operation = (typeof _operation == "string") ? Vector.operations[_operation] : _operation;

		for(let idx = 0; idx < _vector_2.length; ++idx) {
			t_vector_1[idx] = _operation(t_vector_1[idx], _vector_2[idx]);
		}

		return t_vector_1;
	};

	static reduce(_vector_1, _operation, _accumulator = null) {
		if (_vector_1.length == 0) { throw new Error(`Invalid: Vector.reduce(${_vector_1}, ${_operation}) on set with 0 values.`); }

		let accumulator = (_accumulator != null) ? _accumulator : (typeof _vector_1[0] == "string") ? "" : 0;
		let value = _vector_1.reduce(Vector.operations[_operation], accumulator);

		return [_vector_1.indexOf(value), value];
	};

	static relations = Object.freeze(["1:1", "1:*", "*:*"]);
	static filter(_values, _filters, _operation, _relation, _field) {
		if (!Vector.filter_operators.includes(_operation)) {
			throw new Error(`Vector.filter can only use bool operators: ${Vector.filter_operators} not: ${_operation}`)
		}
		if (!Vector.relations.includes(_relation)) {
			throw new Error(`Vector.filter can only use relationships: ${Vector.relations} not: ${_relation}`)
		}

		switch(_relation) {
			case("1:1"):
				if (_values.length != _filters.length) { 
					throw new Error(`Vector.filter using relation=1:1, _filters.length: ${_filters.length} != _values.length: ${_values.length}`)
				}
				
				if (_field ?? false) {
					return _values.filter((elem, idx) => Vector.operations[_operation](elem[_field], _filters[idx][_field]));
				} else {
					return _values.filter((elem, idx) => Vector.operations[_operation](elem, _filters[idx]));
				}

			case("1:*"):
				let filter = (Array.isArray(_filters)) ? _filters[0] : _filters;

				if (_field ?? false) {
					return _values.filter((elem, idx) => Vector.operations[_operation](elem[_field], filter[_field]));
				} else {
					return _values.filter((elem, idx) => Vector.operations[_operation](elem, filter));
				}

			case("*:*"):
				if (_values.length != _filters.length) { 
					throw new Error(`Vector.filter using relation=*:*, _filters.length: ${_filters.length} != _values.length: ${_values.length}`)
				}

				let result_filter = _values.splice().fill(0, 0, _values.length - 1);
				for(let key of _values.keys) {
					result_filter[key] |= _filters.reduce((truthy, filter) => truthy || Vector.operations[_operation](_values[key], filter));
				}

				return _values.filter((elem, idx) => result_filter[key]);
		}
	};

	static remove(_values, _filters) {
		for(let idx = 0; idx < _filters.length; ++idx) {
			let at = _values.indexOf(_filters[idx])
			if (at > -1) {
				_values.splice(at, 1);
			}
		}

		return _values
	};

	static shift(_vector, _by) {
		let t_vector = _vector.slice();
		if(_by > 0) {
			for (let idx = 0; idx < _by; ++idx) { 
				t_vector.unshift(t_vector.pop()); 
			};
		} else if (_by < 0) {
			for (let idx = 0; idx < abs(_by); ++idx) { 
				t_vector.push(t_vector.shift()); 
			};
		}
		return t_vector;
	};

	static clamp(_vector, _low, _high) {
		let t_vector = _vector.slice();
		for (let idx = 0; idx < t_vector.length; ++idx) { 
			t_vector[idx] = ops.clamp(t_vector[idx], _low, _high);
		}; 
		return t_vector;
	};
};