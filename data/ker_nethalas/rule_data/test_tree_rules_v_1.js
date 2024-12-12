const rule_data = Object({
	get: function(_key) { 
		let split = _key.split(".");
		let result = (split.length > 0) ? this : null;

		for (let key of split) {
			result = result[key];
		}

		return JSON.parse(JSON.stringify(result));
	},

	start: [
		{"id": "null", 			"action": "inject", 	"args": ["tree.all_tests", []]},
		{"id": "notify",		"action": "notify", 	"args": ["All tests complete"]},
	],

	tree: {
		all_tests: [
			{"id": "null",			"action": "log", 			"args": ["--------------------------------------------------"]},
			{"id": "null", 			"action": "inject", 	"args": ["tree.write_test_no_generation"]},
			{"id": "notify",		"action": "notify", 	"args": ["Finished: tree.write_test_no_generation"]},
			{"id": "null",			"action": "log", 			"args": ["--------------------------------------------------"]},
			{"id": "null", 			"action": "inject", 	"args": ["tree.read_test_no_defaults"]},
			{"id": "notify",		"action": "notify", 	"args": ["Finished: tree.read_test_no_defaults"]},
			{"id": "null",			"action": "log", 			"args": ["--------------------------------------------------"]},
			{"id": "null", 			"action": "inject", 	"args": ["tree.write_test_with_generation"]},
			{"id": "notify",		"action": "notify", 	"args": ["Finished: tree.write_test_with_generation"]},
			{"id": "null",			"action": "log", 			"args": ["--------------------------------------------------"]},
			{"id": "null", 			"action": "inject", 	"args": ["tree.read_test_with_defaults"]},
			{"id": "notify",		"action": "notify", 	"args": ["Finished: tree.read_test_with_defaults"]},
			{"id": "null",			"action": "log", 			"args": ["--------------------------------------------------"]},
			{"id": "null", 			"action": "inject", 	"args": ["tree.delete_test_no_cascade"]},
			{"id": "notify",		"action": "notify", 	"args": ["Finished: tree.delete_test_no_cascade"]},
			{"id": "null",			"action": "log", 			"args": ["--------------------------------------------------"]},
			{"id": "null", 			"action": "inject", 	"args": ["tree.delete_test_with_cascade_1"]},
			{"id": "notify",		"action": "notify", 	"args": ["Finished: tree.delete_test_with_cascade_1"]},
			{"id": "null",			"action": "log", 			"args": ["--------------------------------------------------"]},
			{"id": "null", 			"action": "inject", 	"args": ["tree.delete_test_with_cascade_2"]},
			{"id": "notify",		"action": "notify", 	"args": ["Finished: tree.delete_test_with_cascade_2"]},
			{"id": "null",			"action": "log", 			"args": ["--------------------------------------------------"]},
			{"id": "null", 			"action": "inject", 	"args": ["tree.read_test_with_partial"]},
			{"id": "notify",		"action": "notify", 	"args": ["Finished: tree.read_test_with_partial"]},
			{"id": "null",			"action": "log", 			"args": ["--------------------------------------------------"]},
			{"id": "null", 			"action": "inject", 	"args": ["tree.delete_test_with_bad_path"]},
			{"id": "notify",		"action": "notify", 	"args": ["Finished: tree.delete_test_with_bad_path"]},
			{"id": "null",			"action": "log", 			"args": ["--------------------------------------------------"]},
			{"id": "notify",		"action": "notify", 	"args": ["All tree.tests complete"]},
		],

		read_test_no_defaults: [
			{"id": "values",		"action": "read_t",		"args": ["game_d", "models.character.check+camp+act+endurance+disease", "vantage", 0]},
			{"id": "total",			"action": "reduce",		"args": ["<values>", "+"]},
			{"id": "null",			"action": "log", 			"args": ["<values> => <total>"]},
		],

		read_test_with_defaults: [
			{"id": "values",		"action": "read_t",		"args": ["game_d", "models.character.check+camp+act+endurance+disease", "vantage", 0]},
			{"id": "total",			"action": "reduce",		"args": ["<values>", "+"]},
			{"id": "null",			"action": "log", 			"args": ["<values> => <total>"]},
		],

		read_test_with_partial: [
			{"id": "values",		"action": "read_t",		"args": ["game_d", "models.character.check+test+act+skill+action", "vantage", 0]},
			{"id": "total",			"action": "reduce",		"args": ["<values>", "+"]},
			{"id": "null",			"action": "log", 			"args": ["<values> => <total>"]},
		],

		write_test_no_generation: [
			{"id": "values",		"action": "write_t",	"args": ["game_d", "models.character.check+camp+act+endurance+disease", "vantage", 1]},
		],

		write_test_with_generation: [
			{"id": "values",		"action": "write_t",	"args": ["game_d", "models.character.check+test+act+skill+action", "vantage", 1]},
		],

		delete_test_no_cascade: [
			{"id": "values",		"action": "delete_t",	"args": ["game_d", "models.character.check+camp+act+endurance+disease", "vantage"]},
		],

		delete_test_with_cascade_1: [
			{"id": "values",		"action": "delete_t",	"args": ["game_d", "models.character.check+test+act+skill+action", "vantage"]},
		],

		delete_test_with_cascade_2: [
			{"id": "values",		"action": "delete_t",	"args": ["game_d", "models.character.check+camp", "vantage"]},
			{"id": "values",		"action": "read",		"args": ["game_d", "models.character.check"]},
		],

		delete_test_with_bad_path: [
			{"id": "values",		"action": "delete_t",	"args": ["game_d", "models.character.check+camp+act+endurance+disease", "vantage"]},
		],
	},
})