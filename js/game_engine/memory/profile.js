const State = Object.freeze({Failed: 0, None: 1, Waiting: 2, Skipped: 3, Finished: 4});

const profile = ({
	name: undefined,
	version: undefined,
	id: undefined,
	is_delta: false,

	references: {},

	get_profiles: function() {
		return storage.get_databases();
	},

	get_saves: async function() {
		if (this.name == undefined) { throw new Error("profile.name must be set before get_saves can be called.") };
		let saves = await storage.get_table_keys(this.name, "auto-save", "id");
		return saves;
	},

	set_profile: function(_name) {
		this.name = _name;
	},

	set_save: function(_version) {
		this.version = _version;
		this.id = `${this.name}-${this.version}`;
	},

	register: function(_key, _serialize, _deserialize) {
		this.references[_key] = {"get": _serialize, "set": _deserialize};
	},

	initialize: function(_name, _version=0, _state=null) {
		this.name 		= _name;
		this.version 	= _version;
		this.id 			= `${this.name}-${this.version}`;
		
		if (_state) {
			let state = JSON.parse(_state);
			Object.entries(state).forEach(function([_k, _v]) { this.references[_k].set(_v)}.bind(this));
			publisher.publish("profile");
		}
	},

	save_data: async function() {
		if (this.name == undefined) 		{ throw new Error("profile.name must be set before save_data can be called.") };
		if (this.version == undefined) 	{ throw new Error("profile.version must be set before save_data can be called.") };
		if (this.is_delta == false) 		{ return; }

		this.version += 1;
		let data = this.dict();

		for (const [_key, _value] of Object.entries(this.references)){
			data["state"][_key] = this.references[_key]["get"]();
		}

		data.state = JSON.stringify(data.state);
		await storage.save(this.name, "auto-save", data)
		.then(() => { return storage.prune(this.name, "auto-save"); });

		this.is_delta = false;
	},

	load_data: async function(_id=null) {
		if (this.name == undefined) { throw new Error("profile.name must be set before load_data can be called.") };
		let id = (_id) ? _id : this.id;
		
		await storage.load(this.name, "auto-save", `${id}`)
		.then(function(_data) {
			this.initialize(
				_data.name, 
				_data.version,
				_data.state,
			)
		}.bind(this));
	},

	delete_data: async function(_id=null) {
		if (this.name == undefined) { throw new Error("profile.name must be set before delete_data can be called.") };
		let id = (_id) ? _id : this.id;

		await storage.delete_data(this.name, "auto-save", `${id}`);
	},

	delete_profile: async function(_name) {
		let name = (_name) ? _name : this.name;
		await storage.drop_db(name);
	},

	on_state: function() {
		this.is_delta = true;
	},

	dict: function() {
		return {
			"id": 			`${this.name}-${this.version}`,
			"name": 		this.name,
			"version":	this.version,
			"state": 		{},
		}
	}
});