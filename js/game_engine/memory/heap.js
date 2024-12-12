const heap_regex = /(?<delimited><(?<key>[$\.\w]+)>)/g;
const heap = Object({
	actions: ["h_get", "h_pop", "h_push", "h_put", "watch", "ignore"],

	heap: {},
	watch_heap: {},
	watchers: {},

	set: function(_states) {
		if (_states.watchers) {
			Object.values(_states.watchers).forEach(function(_w) { this.watch(_w["key"], _w["pattern"], _w["path"], _w["at"]) }.bind(this));
		}
	},

	get: function() {
		return { "watchers": this.watchers };
	},

	on_state: function(_data_set, _path, _delta) {
		if (_data_set == "save_d") {
			for(let watcher of Object.values(this.watchers)) {
				if (_path.match(watcher.regex) != null) {
					this.watch_heap[watcher.key] = (watcher.at != null) ? _delta[watcher.at] : _delta;
				}
			}
		}
	},

	event_handler: function(_action, _args, _resolve, _reject) {
		logger.func("heap", "heap.event_handler", arguments);

		switch(_action) {
			case("h_get"):
				var result = this.h_get(..._args);
				if (result == null || result == undefined) { logger.warn("heap", `There is no value for key: ${_args[0]} in the heap.`); }
				return _resolve(this.h_get(..._args));
			case("h_pop"):
				var result = this.h_get(..._args, true);
				if (result == null || result == undefined) { logger.warn("heap", `There is no value for key: ${_args[0]} in the heap.`); }
				return _resolve(this.h_get(..._args));
			case("h_put"):
				return _resolve(this.h_put(..._args));
			case("h_push"):
				return _resolve(this.h_push(..._args));
			case("watch"):
				return _resolve(this.watch(..._args));
			case("ignore"):
				return _resolve(this.ignore(..._args));
			default:
				_reject(new Error(`heap.${_action} is not a valid command`));
		}
	},

	h_has: function(_key) {
		let cleaned_key = _key.replaceAll("$", "")
		return ((Object.keys(this.heap).includes(cleaned_key) || Object.keys(this.watchers).includes(cleaned_key)));
	},

	h_get: function(_key, _default=null) {
		let result = this.heap[_key];
		if (result != null && result != undefined) { return result; }

		if (_default != null && _default != undefined) {
			this.heap[_key] = _default;
			return _default;
		}

		if(this.watchers[_key] != undefined) {
			result = this.watch_heap[_key];
			result = io.read("save_d", this._replace_tokens(`${this.watchers[_key].path}`));

			if (this.watchers[_key].at != null) { 
				result = result[this.watchers[_key].at];
			}

			this.watch_heap[_key] = result;
			return result
		}
	},

	h_pop: function(_key, _default=null) {
		let result = this.h_get(_key, _default)
		delete this.heap[_key];
		return result;
	},

	h_put: function(_key, _value) {
		this.heap[_key] = _value;
		return true;
	},

	h_push: function(_key, _value) {
		let data_set = this.h_get(_key);

		if (data_set != null && data_set != undefined) {
			data_set.push(_value);
		} else {
			data_set = [_value];
		}
		
		this.heap[_key] = data_set;
		return true;
	},

	watch: function(_h_key, _pattern, _path, _at=null) {
		if (Object.keys(this.watchers).includes(_h_key)) { return false; }
		this.watchers[_h_key] = {"key": _h_key, "pattern": _pattern, "regex": new RegExp(_pattern, "g"), "path": _path, "at": _at};
		return true;
	},

	ignore: function(_h_key) {
		delete this.watchers[_h_key];
		delete this.watch_heap[_h_key];
		return true;
	},

	purge: function(_watched=false) {
		this.heap = {};
		if (_watched == true) {	this.watch_heap = {};	}
	},

	_replace_tokens: function(_path) {
		if(typeof _path != "string") { return; }

		for (const match of Array.from(_path.matchAll(heap_regex)).toReversed()) {
			if (match.groups.key.indexOf("$") < 0) { continue; }
			let keys = match.groups.key.split(".");

			// Resolve variable post processing
			for (const k_idx in keys) {
				if (keys[k_idx].indexOf("$") >= 0) { 
					let value = keys[k_idx].replaceAll("$", "");
					keys[k_idx] = heap.h_get(value);
				} else {
					continue; 
				}
			}

			if (match.groups.delimited.length == _path.length) {
				_path = keys.join(".");
			} else {
				_path = _path.substring(0, match.index) + keys.join(".") + _path.substring(match.index + match.groups.delimited.length);
			}
		}

		return _path;
	},
})