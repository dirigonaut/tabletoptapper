let save_data = Object({
	get: function() { return this.data; },
	set: function(_data) { this.data = _data; },

	data: {
		"context": "traverse.actions",

		"domain_idx": -1,
		"domains": [],

		"character_idx": 0,
		"character_party": [],
		"character_turns": null,

		"enemy_idx": 0,
		"enemy_party": [],
		"enemy_turns": null,

		"encounter": null,
	},
})