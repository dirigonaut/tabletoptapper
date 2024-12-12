const storage = Object({
	db: null,
	version: null,

	_version: function(_namespace, _action=null) {
		this.version = localStorage.getItem("storage-version");

		if (this.version == null) {
			this.version = 1;
			localStorage.setItem(`${_namespace}-storage-version`, this.version);
		}

		switch(_action) {
			case("increment"):
				this.version += 1;
				localStorage.setItem(`${_namespace}-storage-version`, this.version);
				break;
			case("delete"):
				this.version = null;
				localStorage.removeItem(`${_namespace}-storage-version`);
				break;
		}
	},

	_open_db: function(_namespace, _schema) {
		if (this.version == null) { this._version(_namespace); }

		if (this.db && this.db.name == _namespace) {
			return Promise.resolve(this.db);

		} else {
			return new Promise(function(_resolve, _reject) {
				const request = indexedDB.open(_namespace, this.version);
				request.onerror = (_event) => {
					_reject(_event);
				};

				request.onupgradeneeded = function(_event) {
					logger.log("storage", `Updating db schema for: ${_namespace}.`);
					_schema(_event.target.result);
				}.bind(this);

				request.onsuccess = function(_event) {
					logger.log("storage", `Opened db: ${_namespace}`)
					this.db = _event.target.result;
					_resolve(this.db);
				}.bind(this);
			}.bind(this))
		}
	},

	drop_db: function(_namespace) {
		return new Promise(function(_resolve, _reject) {
			if (this.db != null) {
				this.db.close();
			}

			const DBDeleteRequest = indexedDB.deleteDatabase(_namespace);

			DBDeleteRequest.onerror = (_event) => {
				console.error(`Database: ${_namespace}, errored on delete.`);
				_reject(_event)
			};
	
			DBDeleteRequest.onsuccess = (_event) => {
				console.log(`Database: ${_namespace}, deleted successfully`);
				_resolve(true);
			};
	
			this._version(_namespace, "delete");
		}.bind(this));
	},

	drop_table: function(_namespace, _table, _p_key) {
		return this._open_db(_namespace, function(_db) {
			_db.deleteObjectStore(_table);
		});
	},

	get_table_keys: function(_namespace, _table, _key) {
		return this._open_db(_namespace, schemas[_table])
			.then((_db) => {
				return new Promise(function(_resolve, _reject) {
					const store = _db.transaction([_table], "readonly").objectStore(_table);

					let keys = [];
					store.openCursor().onsuccess = (_event) => {
						const cursor = _event.target.result;

						if (cursor) {
							keys.push(cursor.key);
							cursor.continue();
						} else{
							_resolve(keys);
						}
					};
				});
			}
		);
	},

	create_data: function(_namespace, _table, _object) {
		return this._open_db(_namespace, schemas[_table])
			.then((_db) => {
				return new Promise(function(_resolve, _reject) {
					const store = _db.transaction([_table], "readwrite").objectStore(_table);
					const request = store.add(_object);

					request.onerror = (_event) => {
						console.log(_object);
						_reject(_event);
					};
		
					request.onsuccess = (_event) => {
						_resolve(_event);
					};
				});
			}
		);
	},

	read_data: function(_namespace, _table, _key) {
		return this._open_db(_namespace, schemas[_table])
			.then((_db) => {
				return new Promise(function(_resolve, _reject) {
					const store = _db.transaction([_table], "readonly").objectStore(_table);
					const request = store.get(_key);

					request.onerror = (_event) => {
						_reject(_event);
					};
		
					request.onsuccess = (_event) => {
						_resolve(_event.target.result);
					};
				});
			}
		);
	},

	update_data: function(_namespace, _table, _key, _kv_pairs) {
		return this._open_db(_namespace, schemas[_table])
			.then((_db) => {
				return new Promise(function(_resolve, _reject) {
					const store = _db.transaction([_table], "readwrite").objectStore(_table);
					const request = store.get(_key);

					request.onerror = (_event) => {
						_reject(_event);
					};
		
					request.onsuccess = (_event) => {
						const data = _event.target.result;
			
						for (let _pair of Object.entries(_kv_pairs)) {
							data[_pair[0]] = _pair[1];
						}
					
						// Put this updated object back into the database.
						const requestUpdate = store.put(data);
						requestUpdate.onerror = (_event) => {
							_reject(_event);
						}

						requestUpdate.onsuccess = (_event) => {
							_resolve(_event)
						}
					};
				});
			}
		);
	},

	delete_data: function(_namespace, _table, _key) {
		return this._open_db(_namespace, schemas[_table])
			.then((_db) => {
				return new Promise(function(_resolve, _reject) {
					const store = _db.transaction([_table], "readwrite").objectStore(_table);
					const request = store.delete(_key);

					request.onerror = (_event) => {
						_reject(_event);
					};
		
					request.onsuccess = (_event) => {
						_resolve(_event);
					};
				});
			}
		);
	},

	load: function(_namespace, _table, _key) {
		return this.read_data(_namespace, _table, _key);
	},

	save: function(_namespace, _table, _data) {
		logger.log("storage", `Saving data for ${_namespace}.${_table}.${_data.version}`)
		return this.create_data(_namespace, _table, _data);
	},

	prune: function(_namespace, _table, _max_auto_saves=10) {
		return this.get_table_keys(_namespace, _table, "id")
			.then(async function(_keys) {
				_keys = _keys.sort((_a, _b) => { return (parseInt(_a.split("-").at(-1)) < parseInt(_b.split("-").at(-1)) ? -1 : 1) });

				if (_keys.length > 10) {
					for (let idx = 0; _keys.length > _max_auto_saves; ++idx) {
						let key = _keys[idx]
						await this.delete_data(_namespace, _table, key);

						_keys.shift();
					}
				}
			}.bind(this)
		);
	},

	get_databases: function() {
		return indexedDB.databases()
			.then(function(_dbs) {
				let databases = [];

				for(let db of _dbs) {
					databases.push([db.name, db.version]);
				}

				return Promise.resolve(databases);
			}
		)
	},
});

const schemas = Object({
	"auto-save": function(_db) {
		logger.log("storage", "Creating schema for table auto-save.")
		const objectStore = _db.createObjectStore("auto-save", { keyPath: "id" });
		objectStore.createIndex("id", "id", { unique: true });
	},
})