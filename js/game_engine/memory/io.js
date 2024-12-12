const io = Object({
	actions: ["size", "has", "keys", "values", "read", "lookup", "write", "concat", "set_at", "copy", "null", "is", "profile", "delete", "at_t", "delete_t", "resolve_t", "write_t", "touch"],

	data_sets: {
		"game_d": game_data,
		"save_d": save_data,
		"rule_d": rule_data
	},

	refresh_data_set: function() {
		this.data_sets["save_d"] = save_data;
		this.data_sets["game_d"] = game_data;
		this.data_sets["rule_d"] = rule_data;
	},

	path_to_keys: function(_path) {
		let results = []

		let is_slice = true;
		let slash	= 0;
		let start = 0;
		let colon = 0;
		for(let idx = 0; idx < _path.length; ++idx) {
			switch(_path[idx]) {
				case(":"):
					colon = idx;
					break;
					
				case("/"):
					is_slice = !is_slice;
					slash = (is_slice) ? 1 : slash;
					break;

				case("."):
					if (is_slice) {
						results.push((colon > start)
							? [_path.slice(start + slash, colon - slash), _path.slice(colon+1, idx)]
							: [_path.slice(start + slash, idx - slash)]);

						slash = 0;
						start = idx + 1;
					}
			}
		}

		if (colon > start) {
			results.push([_path.slice(start + slash, colon - slash), _path.slice(colon+1, _path.length)]);
		} else {
			results.push([_path.slice(start + slash, _path.length - slash)]);
		}
		
		return results;
	},

	event_handler: function(_action, _args, _resolve, _reject) {
		logger.func("io", "io.event_handler", arguments);

		switch(_action) {
			case("read"):
				return _resolve(this.read(..._args));
			case("write"):
				return _resolve(this.write(..._args));
			case("touch"):
				return _resolve(this.read(..._args));
			case("delete"):
				return _resolve(this.delete(..._args));
			case("concat"):
				return _resolve(this.concat(..._args));
			case("set_at"):
				return _resolve(this.set_at(..._args));
			case("size"):
				return _resolve(this.size(_args));
			case("lookup"):
				return _resolve(this.lookup(..._args));
			case("keys"):
				return _resolve(this.keys(..._args));
			case("values"):
				return _resolve(this.values(..._args));
			case("copy"):
				return _resolve(this.copy(..._args));
			case("has"):
				return _resolve(this.has(..._args));
			case("null"):
				return _resolve(this.null(..._args));
			case("is"):
				return _resolve(this.in(..._args));
			case("at_t"):
				return _resolve(this.at_t(..._args));
			case("resolve_t"):
				return _resolve(this.resolve_t(..._args));
			case("write_t"):
				return _resolve(this.write_t(..._args));
			case("delete_t"):
				return _resolve(this.delete_t(..._args));
			case("profile"):
				return _resolve(profile.name);
			default:
				_reject(new Error(`io.${_action} is not a valid command`));
		}
	},

	_recur: function(_node, _path, _value=undefined) {
		if (_path == null && _value == undefined) { return _node; }
		let key = _path.shift()

		// If it is a read operation and a * is encountered at an array entry then recur through all entries
		if (key[0] == "*") {
			if (!_path.length) 					{ throw new Error(`Invalid: * operator, not allowed as last entry in path.`); }
			if (!Array.isArray(_node)) 	{ throw new Error(`Invalid: * operator, ${_node} is not an array.`); }
			if (_value != undefined) 		{ throw new Error(`Invalid: * operator, in write operation.`); }

			let results = [];
			for(let idx = 0; idx < _node.length; ++idx) {
				results.push(this._recur(_node[idx], _path.slice()));
			}

			return results;
		} else {
			// Step into the next entry
			let node = _node[(Array.isArray(_node)) ? parseInt(key[0]) : key[0]];

			// If the entry is nullish then see if we can generate it from a passed in data type.
			if (node == null || node == undefined) {
				switch(key[1]) {
					case("{}"):	_node[key[0]] = {}; node = _node[key[0]]; break;
					case("[]"):	_node[key[0]] = []; node = _node[key[0]]; break;
				}
			}
			
			if ((_value != undefined && _path.length == 1) && ((new String(_path[0]) == `${parseInt(_path[0])}`) || typeof node == "object")) {
				// Write operation
				logger.debug("io", `Writing to: ${key[0]}.${_path[0]}, value`); console.log(_value);
				node[(Array.isArray(node)) ? _path[0] : String(_path[0])] = (_value.data == "null") ? null : _value.data;
				return _value.data;

			} else if (_path.length > 0) {
				// Navigate operation
				return this._recur(node, _path, _value);

			} else {
				// Read operation
				return node;
			}
		}
	},

	// Write operations -----------------------------------------------------------------------------------------
	write: function(_data_set, _path, _value) {
		let result = this._recur(this.data_sets[_data_set], [["data"]].concat(this.path_to_keys(_path)), {"data": _value});
		publisher.publish("state", [_data_set,_path, result]);
		return result;
	},

	delete: function(_data_set, _path, _key) {
		let path = this.path_to_keys(_path);
		let key = (arguments.length < 3) ? path.pop(-1)[0] : _key;

		let result = this._recur(this.data_sets[_data_set].data, path)
		if (result == null || this.data_sets[_data_set].data == undefined) {
			throw new Error(`Cannot delete ${key} from ${result} it doesn't exist.`);
		}

		if (Array.isArray(result)) {
			result.splice(key, 1);
		} else if (typeof result == "object") {
			delete result[key];
		} else {
			result[key] = undefined;
		}

		publisher.publish("state", [_data_set, _path, result]);
		return true;
	},

	concat: function(_data_set, _path, _value) {
		let idx = null;
		// Exposing a raw array.concat vs one that saves to the state. 
		if (Array.isArray(_data_set) && (_value == null || _value == undefined)) {
			idx = _data_set.push(_path);
			return {"idx": idx, "data": _data_set};
		};
		
		let result = this._recur(this.data_sets[_data_set].data, this.path_to_keys(_path));
		if (!Array.isArray(result)) { 
			throw new Error(`io.concat at: ${_data_set}:${_path} can only be used on arrays`);
		}

		idx = result.push(_value);
		publisher.publish("state", [_data_set, _path, result]);
		console.log(result)
		return {"idx": idx - 1, "data": result};
	},

	set_at: function(_data_set, _path, _key, _value) {
		let path = this.path_to_keys(_path);
		let value = (arguments.length < 4) ? _key : _value;
		let key = (arguments.length < 4) ? path.pop(-1)[0] : _key;

		let result = this._recur(this.data_sets[_data_set].data, path);
		if (typeof result != "object" || Array.isArray(result) || result == undefined || result == null) { 
			throw new Error(`io.set_at at: ${_data_set}:${_path} can only be used on dicts`);
		}

		result[key] = value;
		publisher.publish("state", [_data_set, _path, result]);
		return {"key": key, "data": result};
	},

	// Read operations -----------------------------------------------------------------------------------------
	read: function(_data_set, _path) {
		return this._recur(this.data_sets[_data_set].data, this.path_to_keys(_path));
	},

	touch: function(_data_set, _path) {
		this._recur(this.data_sets[_data_set].data, this.path_to_keys(_path));
		return _path;
	},

	size: function(_args) {
		let result = _args;
		if (Object.keys(this.data_sets).includes(_args[0])) {
			result = this._recur(this.data_sets[_args[0]].data, this.path_to_keys(_args[1]));
		} else {
			result = result[0];
		}

		if (typeof result != "object" || result == null || result == undefined) { 
			throw new Error(`io.size at: ${_args[0]}:${_args[1]} can only be used on arrays/dicts not: ${result}`)
		};

		return (Array.isArray(result)) ? result.length : Object.keys(result).length;
	},

	copy: function(_data_set, _path) {
		let result = this._recur(this.data_sets[_data_set].data, this.path_to_keys(_path));
		if ( result == null || result == undefined) { 
			throw new Error(`io.copy at: ${_data_set}:${_path}, is null`)
		};

		return JSON.parse(JSON.stringify(result));
	},

	keys: function(_data_set, _path, _value) {
		let result = this._recur(this.data_sets[_data_set].data, this.path_to_keys(_path));
		if (typeof result != "object" || result == null || result == undefined) { 
			throw new Error(`io.keys at: ${_data_set}:${_path} can only be used on arrays/dicts not: ${result}`)
		};

		if (Array.isArray(result)) {
			return result;
		} else {
			return Object.keys(result);
		}
	},

	values: function(_data_set, _path, _value) {
		let result = this._recur(this.data_sets[_data_set].data, this.path_to_keys(_path));
		if (typeof result != "object" || result == null || result == undefined) { 
			throw new Error(`io.values at: ${_data_set}:${_path} can only be used on arrays/dicts not: ${result}`)
		};

		if (Array.isArray(result)) {
			return result;
		} else {
			return Object.values(result);
		}
	},

	lookup: function(_data_set, _path, _value) {
		let result = this._recur(this.data_sets[_data_set].data, this.path_to_keys(_path));
		if (typeof result != "object" || result == null || result == undefined) { 
			throw new Error(`io.lookup at: ${_data_set}:${_path} can only be used on arrays/dicts not: ${result}`)
		};

		if (Array.isArray(result) == false) {
			result = Object.entries(result);
		}

		return result[ops.clamp(_value, 0, result.length - 1)];
	},

	// Check operations -----------------------------------------------------------------------------------------
	has: function(_data_set, _path, _value) {
		let result = this._recur(this.data_sets[_data_set].data, this.path_to_keys(_path));
		if (typeof result != "object" || result == null || result == undefined) { 
			throw new Error(`io.has at: ${_data_set}:${_path} can only be used on arrays/dicts not: ${result}`)
		};

		if (Array.isArray(result)) {
			return result.includes(_value);
		} else {
			return Object.keys(result).includes(_value);
		}
	},

	null: function(_data_set, _path) {
		let result = this._recur(this.data_sets[_data_set].data, this.path_to_keys(_path));
		return (result == null || result == undefined);
	},

	is: function(_data_set, _path) {
		let result = this._recur(this.data_sets[_data_set].data, this.path_to_keys(_path));
		return (result != null && result != undefined);
	},

	// Tree operations ------------------------------------------------------------------------------------------
	_tree: function(_node, _path, _attribute) {
		// If has result then read the value at the name for the branch
		if (_attribute["results"] ?? false) {
			_attribute.results.push(_node[_attribute.name] ?? _attribute.default);
		}

		if (_path.length == 0) {
			// If at end and has value then write the value to the name for the branch
			if ((_attribute.value ?? false)) 				{ _node[_attribute.name] = _attribute.value }
			// Else if at end and has cascade then delete the node from the the branch
			else if ((_attribute.cascade ?? false))	{ delete _node[_attribute.name] };
			return;
		}

		let key = `+${_path.shift()}`;
		if (!(_node[key] ?? false)) {
			if (_attribute.value ?? false) { 					// If the branch does not exist on write then create an empty object and continue
				_node[key] = {}; 
			} else if (_attribute.cascade ?? false) { // If the branch does not exist on delete then error
				throw new Error(`There is no child at key: ${key} to process a delete_t on.`)
			} else {																	//  If the branch does not exist on read, return the results thus far
				return; 
			} 
		}
		
		// Recur down the tree
		this._tree(_node[key], _path, _attribute);

		// As we bubble up from the delete if there are no other nodes then delete the branch at this level
		if ((_attribute.cascade ?? false) && (Object.keys(_node[key]).length == 0)) {
			delete _node[key];
		}
	},

	at_t: function(_data_set, _path, _key, _default) {
		if (_default ?? true) {	throw new Error(`IO.at_t cannot have a null value for default, ${JSON.stringify(arguments)}`); }
		let attribute = {"name": _key, "default": _default, "results": []};

		let split_path 	= this.path_to_keys(_path);
		let tree_path 	= split_path.pop()[0].split("+");
		let root 				= this._recur(this.data_sets[_data_set].data, split_path);

		this._tree(root, tree_path, attribute);
		return attribute.results.at(-1);
	},

	resolve_t: function(_data_set, _path, _key, _default) {
		if (_default ?? true) {	throw new Error(`IO.resolve_t cannot have a null value for default, ${JSON.stringify(arguments)}`); }
		let attribute = {"name": _key, "default": _default, "results": []};

		let split_path 	= this.path_to_keys(_path);
		let tree_path 	= split_path.pop()[0].split("+");
		let root 				= this._recur(this.data_sets[_data_set].data, split_path);

		this._tree(root, tree_path, attribute);
		return attribute.results;
	},

	write_t: function(_data_set, _path, _key, _value) {
		let attribute = {"name": _key, "value": _value};

		let split_path 	= this.path_to_keys(_path);
		let tree_path 	= split_path.pop()[0].split("+");
		let root 				= this._recur(this.data_sets[_data_set].data, split_path);

		this._tree(root, tree_path, attribute);
		return _value;
	},

	delete_t: function(_data_set, _path, _key) {
		let attribute = {"name": _key, "cascade": true};

		let split_path 	= this.path_to_keys(_path);
		let tree_path 	= split_path.pop()[0].split("+");
		let root 				= this._recur(this.data_sets[_data_set].data, split_path);

		this._tree(root, tree_path, attribute);
		return true;
	},
})