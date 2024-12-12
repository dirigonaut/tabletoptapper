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
		{"id": "null", 			"action": "inject", 	"args": ["contexts.all_tests", []]},
		{"id": "notify",		"action": "notify", 	"args": ["All tests complete"]},
	],

	contexts: {
		all_tests: [
		{"id": "null",			"action": "log", 			"args": ["--------------------------------------------------"]},
		{"id": "null", 			"action": "inject", 	"args": ["contexts.bind_unbind_both_test", []]},
		{"id": "notify",		"action": "notify", 	"args": ["Finished: contexts.bind_unbind_both_test"]},
		{"id": "null",			"action": "log", 			"args": ["--------------------------------------------------"]},
		{"id": "null", 			"action": "inject", 	"args": ["contexts.bind_unbind_one_test", []]},
		{"id": "notify",		"action": "notify", 	"args": ["Finished: contexts.bind_unbind_one_test"]},
		{"id": "null",			"action": "log", 			"args": ["--------------------------------------------------"]},
		{"id": "null", 			"action": "inject", 	"args": ["contexts.add_duplicates_test", []]},
		{"id": "notify",		"action": "notify", 	"args": ["Finished: contexts.add_duplicates_test"]},
		{"id": "null",			"action": "log", 			"args": ["--------------------------------------------------"]},
		{"id": "null", 			"action": "inject", 	"args": ["contexts.add_del_context_filters_test", []]},
		{"id": "notify",		"action": "notify", 	"args": ["Finished: contexts.add_del_context_filters_test"]},
		{"id": "null",			"action": "log", 			"args": ["--------------------------------------------------"]},
		{"id": "null", 			"action": "inject", 	"args": ["contexts.basic_test", []]},
		{"id": "notify",		"action": "notify", 	"args": ["Finished: contexts.basic_test"]},
		{"id": "null",			"action": "log", 			"args": ["--------------------------------------------------"]},
		{"id": "null", 			"action": "inject", 	"args": ["contexts.race_condition_test", []]},
		{"id": "notify",		"action": "notify", 	"args": ["Finished: contexts.race_condition_test"]},
		{"id": "null",			"action": "log", 			"args": ["--------------------------------------------------"]},
		{"id": "null", 			"action": "inject", 	"args": ["contexts.interrupt_edit_test", []]},
		{"id": "notify",		"action": "notify", 	"args": ["Finished: contexts.interrupt_edit_test"]},
		{"id": "null",			"action": "log", 			"args": ["--------------------------------------------------"]},
		{"id": "null", 			"action": "inject", 	"args": ["contexts.interrupt_edit_with_race_test", []]},
		{"id": "notify",		"action": "notify", 	"args": ["Finished: contexts.interrupt_edit_with_race_test"]},
		{"id": "null",			"action": "log", 			"args": ["--------------------------------------------------"]},
		{"id": "null", 			"action": "inject", 	"args": ["contexts.interrupt_edit_sequence_test", []]},
		{"id": "notify",		"action": "notify", 	"args": ["Finished: contexts.interrupt_edit_sequence_test"]},
		{"id": "null",			"action": "log", 			"args": ["--------------------------------------------------"]},
		{"id": "notify",		"action": "notify", 	"args": ["All context.tests complete"]},
		],

		basic_test: [
			{"id": "null",		"action": "context",	"args": ["test_context", "+", ["^context\\.\\w*"]]},
			{"id": "null",		"action": "audience",	"args": ["test_context:test_audience", "+", {"start": "context.audience.start", "stop": "context.audience.stop", "delete": "context.audience.delete"}]},
			{"id": "null",		"action": "listen", 	"args": ["test_context:test_audience:test_listener", "+", {"trigger": "context.audience.listener.trigger", "reset": "context.audience.listener.reset", "delete": "context.audience.listener.delete"}, 3, "contexts.log_event", ["listener has $limit$ triggers left."]]},
			{"id": "a_start", "action": "event", 		"args": ["context.audience.start", "a_start"]},
			{"id": "null", 		"action": "event", 		"args": ["context.audience.listener.trigger", "l_trigger"]},
			{"id": "null", 		"action": "event", 		"args": ["context.audience.listener.trigger", "l_trigger"]},
			{"id": "null", 		"action": "event", 		"args": ["context.audience.listener.trigger", "l_trigger"]},
			{"id": "null",		"action": "log", 			"args": ["event trigger"]},
			{"id": "null", 		"action": "event", 		"args": ["context.audience.listener.trigger", "l_trigger"]},
			{"id": "null",		"action": "log", 			"args": ["reset trigger"]},
			{"id": "null", 		"action": "event", 		"args": ["context.audience.listener.reset", 	"l_trigger"]},
			{"id": "null",		"action": "log", 			"args": ["event trigger"]},
			{"id": "null", 		"action": "event", 		"args": ["context.audience.listener.trigger", "l_trigger"]},
			{"id": "null", 		"action": "event", 		"args": ["context.audience.stop", "a_stop"]},
			{"id": "null",		"action": "log", 			"args": ["event trigger"]},
			{"id": "null", 		"action": "event", 		"args": ["context.audience.listener.trigger", "l_trigger"]},
			{"id": "null", 		"action": "event", 		"args": ["context.audience.start", "a_start"]},
			{"id": "null", 		"action": "event", 		"args": ["context.audience.listener.trigger", "l_trigger"]},
			{"id": "null", 		"action": "event", 		"args": ["context.audience.listener.delete", "l_trigger"]},
			{"id": "null", 		"action": "event", 		"args": ["context.audience.delete", "a_delete"]},
			{"id": "null",		"action": "context",	"args": ["test_context", "-"]},
		],

		race_condition_test: [
			{"id": "null",		"action": "context",	"args": ["test_context", "+", ["^context\\.\\w*"]]},
			{"id": "null",		"action": "audience",	"args": ["test_context:test_audience", "+", {"start": "context.audience.start", "stop": "context.audience.stop", "delete": "context.audience.delete"}]},
			{"id": "null",		"action": "listen", 	"args": ["test_context:test_audience:test_listener_1", "+", {"trigger": "context.audience.listener.trigger", "reset": "context.audience.listener.reset.1", "delete": "context.audience.listener.delete.1"}, 3, "contexts.log_event", ["listener.1 has $limit$ triggers left."]]},
			{"id": "null",		"action": "listen", 	"args": ["test_context:test_audience:test_listener_2", "+", {"trigger": "context.audience.listener.trigger", "reset": "context.audience.listener.reset.2", "delete": "context.audience.listener.delete.2"}, 4, "contexts.log_event", ["listener.2 has $limit$ triggers left."]]},
			{"id": "a_start", "action": "event", 		"args": ["context.audience.start", "a_start"]},
			{"id": "null", 		"action": "event", 		"args": ["context.audience.listener.trigger", "l_trigger"]},
			{"id": "null", 		"action": "event", 		"args": ["context.audience.listener.trigger", "l_trigger"]},
			{"id": "null", 		"action": "event", 		"args": ["context.audience.listener.trigger", "l_trigger"]},
			{"id": "null", 		"action": "event", 		"args": ["context.audience.listener.delete.1", "l_trigger"]},
			{"id": "null", 		"action": "event", 		"args": ["context.audience.listener.delete.2", "l_trigger"]},
			{"id": "null", 		"action": "event", 		"args": ["context.audience.delete", "a_delete"]},
			{"id": "null",		"action": "context",	"args": ["test_context", "-"]},
		],

		interrupt_edit_test:[
			{"id": "null",		"action": "context",	"args": ["test_context", "+", ["^context\\.\\w*"]]},
			{"id": "null",		"action": "audience",	"args": ["test_context:test_audience", "+", {"start": "context.audience.start", "stop": "context.audience.stop", "delete": "context.audience.delete"}]},
			{"id": "null",		"action": "listen", 	"args": ["test_context:test_audience:test_listener", "+", {"trigger": "context.audience.listener.trigger", "reset": "context.audience.listener.reset", "delete": "$limit$"}, 1, "contexts.set_die", [4, "$event_idx$"]]},
			{"id": "null", 		"action": "event", 		"args": ["context.audience.start"]},
			{"id": "name",		"action": "resolve", 	"args": ["Test"]},
			{"id": "die",			"action": "resolve", 	"args": [6]},
			{"id": "log",			"action": "log", 			"args": ["Rolling for <name>'s Aether: d<die> + 8"]},
			{"id": "die",			"action": "event", 		"args": ["context.audience.listener.trigger", 6]},
			{"id": "log",			"action": "log", 			"args": ["Rolling for <name>'s Aether: d<die> + 8"]},
			{"id": "inject", 	"action": "inject", 	"args": ["contexts.roll_plus_one", ["<die>", "Aether"]]},
			{"id": "modifier","action": "math", 		"args": ["<inject>", "+", 8]},
			{"id": "log",			"action": "log", 			"args": ["<name>'s Aether is <modifier>"]},
			{"id": "die",			"action": "event", 		"args": ["context.audience.listener.trigger", 6]},
			{"id": "null", 		"action": "event", 		"args": ["context.audience.delete", "a_delete"]},
			{"id": "null",		"action": "context",	"args": ["test_context", "-"]},
		],

		interrupt_edit_with_race_test:[
			{"id": "null",		"action": "context",	"args": ["test_context", "+", ["^context\\.\\w*"]]},
			{"id": "null",		"action": "audience",	"args": ["test_context:test_audience", "+", {"start": "context.audience.start", "stop": "context.audience.stop", "delete": "context.audience.delete"}]},
			{"id": "null",		"action": "listen", 	"args": ["test_context:test_audience:test_listener.1", "+", {"trigger": "context.audience.listener.trigger", "reset": "context.audience.listener.reset.1", "delete": "$limit$"}, 1, "contexts.set_die", [4, "$event_idx$"]]},
			{"id": "null",		"action": "listen", 	"args": ["test_context:test_audience:test_listener.2", "+", {"trigger": "context.audience.listener.trigger", "reset": "context.audience.listener.reset.2", "delete": "$limit$"}, 1, "contexts.set_die", [8, "$event_idx$"]]},
			{"id": "null", 		"action": "event", 		"args": ["context.audience.start"]},
			{"id": "name",		"action": "resolve", 	"args": ["Test"]},
			{"id": "die",			"action": "resolve", 	"args": [6]},
			{"id": "log",			"action": "log", 			"args": ["Rolling for <name>'s Aether: d<die> + 8"]},
			{"id": "die",			"action": "event", 		"args": ["context.audience.listener.trigger", 6]},
			{"id": "log",			"action": "log", 			"args": ["Rolling for <name>'s Aether: d<die> + 8"]},
			{"id": "inject", 	"action": "inject", 	"args": ["contexts.roll_plus_one", ["<die>", "Aether"]]},
			{"id": "modifier","action": "math", 		"args": ["<inject>", "+", 8]},
			{"id": "log",			"action": "log", 			"args": ["<name>'s Aether is <modifier>"]},
			{"id": "null",		"action": "context",	"args": ["test_context", "-"]},
		],

		interrupt_edit_sequence_test:[
			{"id": "null",		"action": "context",	"args": ["test_context", "+", ["^context\\.\\w*"]]},
			{"id": "null",		"action": "audience",	"args": ["test_context:test_audience", "+", {"start": "context.audience.start", "stop": "context.audience.stop", "delete": "context.audience.delete"}]},
			{"id": "null",		"action": "listen", 	"args": ["test_context:test_audience:test_listener.1", "+", {"trigger": "context.audience.listener.trigger.1", "reset": "context.audience.listener.reset.1", "delete": "$limit$"}, 1, "contexts.set_die", [4, "$event_idx$"]]},
			{"id": "null",		"action": "listen", 	"args": ["test_context:test_audience:test_listener.2", "+", {"trigger": "context.audience.listener.trigger.2", "reset": "context.audience.listener.reset.2", "delete": "$limit$"}, 1, "contexts.set_die", [8, "$event_idx$"]]},
			{"id": "null", 		"action": "event", 		"args": ["context.audience.start"]},
			{"id": "name",		"action": "resolve", 	"args": ["Test"]},
			{"id": "die",			"action": "resolve", 	"args": [6]},
			{"id": "log",			"action": "log", 			"args": ["Rolling for <name>'s Aether: d<die> + 8"]},
			{"id": "die",			"action": "event", 		"args": ["context.audience.listener.trigger.1", 6]},
			{"id": "log",			"action": "log", 			"args": ["Rolling for <name>'s Aether: d<die> + 8"]},
			{"id": "die",			"action": "event", 		"args": ["context.audience.listener.trigger.2", "<die>"]},
			{"id": "inject", 	"action": "inject", 	"args": ["contexts.roll_plus_one", ["<die>", "Aether"]]},
			{"id": "modifier","action": "math", 		"args": ["<inject>", "+", 8]},
			{"id": "log",			"action": "log", 			"args": ["<name>'s Aether is <modifier>"]},
			{"id": "null",		"action": "context",	"args": ["test_context", "-"]},
		],

		add_duplicates_test: [
			{"id": "null",		"action": "context",	"args": ["test_context", "+", ["^context\\.\\w*"]]},
			{"id": "null",		"action": "context",	"args": ["test_context", "+", ["^context\\.\\w*"]]},
			{"id": "null",		"action": "audience",	"args": ["test_context:test_audience", "+", {"start": "context.audience.start.1", "stop": "context.audience.stop.1", "delete": "context.audience.delete.1"}]},
			{"id": "null",		"action": "audience",	"args": ["test_context:test_audience", "+", {"start": "context.audience.start.2", "stop": "context.audience.stop.2", "delete": "context.audience.delete.2"}]},
			{"id": "null",		"action": "listen", 	"args": ["test_context:test_audience:test_listener", "+", {"trigger": "context.audience.listener.trigger.1", "reset": "context.audience.listener.reset.1", "delete": "$limit$"}, 1, "contexts.log_event", ["listener.1 has $limit$ triggers left."]]},
			{"id": "null",		"action": "listen", 	"args": ["test_context:test_audience:test_listener", "+", {"trigger": "context.audience.listener.trigger.2", "reset": "context.audience.listener.reset.2", "delete": "$limit$"}, 1, "contexts.log_event", ["listener.1 has $limit$ triggers left."]]},
			{"id": "null", 		"action": "event", 		"args": ["context.audience.start.2"]},
			{"id": "null", 		"action": "event", 		"args": ["context.audience.listener.trigger.2"]},
			{"id": "null",		"action": "context",	"args": ["test_context", "-"]},
		],

		add_del_context_filters_test: [
			{"id": "null",		"action": "context",	"args": ["test_context", "+", ["^context\\.\\w*"]]},
			{"id": "null",		"action": "audience",	"args": ["test_context:test_audience", "+", {"start": "context.audience.start.1", "stop": "context.audience.stop.1", "delete": "context.audience.delete.1"}]},
			{"id": "null",		"action": "listen", 	"args": ["test_context:test_audience:test_listener", "+", {"trigger": "context..listener.trigger.1", "reset": "context..listener.reset.1", "delete": "$limit$"}, 1, "contexts.log_event", ["listener.1 has $limit$ triggers left."]]},
			{"id": "null", 		"action": "event", 		"args": ["context.audience.start.1"]},
			{"id": "null",		"action": "context",	"args": ["test_context", "+", ["^context\\.\\w*.\\w*"]]},
			{"id": "null", 		"action": "event", 		"args": ["context..listener.trigger.1"]},
			{"id": "null",		"action": "context",	"args": ["test_context", "-", ["^context\\.\\w*.\\w*"]]},
			{"id": "null", 		"action": "event", 		"args": ["context..listener.trigger.1"]},
			{"id": "null",		"action": "context",	"args": ["test_context", "-"]},
		],

		bind_unbind_both_test: [
			// First context setup
			{"id": "null",		"action": "context",	"args": ["test_context_1", "+", ["^context\\.\\w+"]]},
			{"id": "null",		"action": "audience",	"args": ["test_context_1:test_audience", "+", {"start": "context\\.audience\\.start\\.1", "stop": "context\\.audience\\.stop\\.1", "delete": "context\\.audience\\.delete\\.1"}]},
			{"id": "null",		"action": "listen", 	"args": ["test_context_1:test_audience:test_listener", "+", {"trigger": "context\\.\\w*\\.listener\\.trigger", "reset": "context\\.\\w*\\.listener\\.reset", "delete": "$limit$"}, 5, "contexts.log_event", ["listener.1 has $limit$ triggers left."]]},
			{"id": "null", 		"action": "event", 		"args": ["context.audience.start.1"]},
			// Second context setup
			{"id": "null",		"action": "context",	"args": ["test_context_2", "+", ["^context\\.\\.\\w+"]]},
			{"id": "null",		"action": "audience",	"args": ["test_context_2:test_audience", "+", {"start": "context\\.\\w*\\.start\\.2", "stop": "context\\.\\w*\\.stop.2", "delete": "context\\.\\.delete\\.2"}]},
			{"id": "null",		"action": "listen", 	"args": ["test_context_2:test_audience:test_listener", "+", {"trigger": "context\\.\\w*\\.listener\\.trigger", "reset": "context\\.\\w*\\.listener\\.reset", "delete": "$limit$"}, 5, "contexts.log_event", ["listener.2 has $limit$ triggers left."]]},
			{"id": "null", 		"action": "event", 		"args": ["context..start.2"]},
			// First context start
			{"id": "null",		"action": "log", 			"args": ["-------------------trigger_1----------------------"]},
			{"id": "null", 		"action": "event", 		"args": ["context.audience.listener.trigger"]},
			// Second context start
			{"id": "null",		"action": "log", 			"args": ["-------------------trigger_2----------------------"]},
			{"id": "null", 		"action": "event", 		"args": ["context..listener.trigger"]},
			{"id": "null",		"action": "log", 			"args": ["--------------------------------------------------"]},
			// Bind both
			{"id": "null",		"action": "bind",			"args": ["test_context_2", "+", "test_context_1", true]},
			{"id": "null",		"action": "log", 			"args": ["test_context_1, test_context_2 bound bidirectionally"]},
			{"id": "null",		"action": "log", 			"args": ["-------------trigger_1&trigger_2------------------"]},
			{"id": "null", 		"action": "event", 		"args": ["context..listener.trigger"]},
			{"id": "null",		"action": "log", 			"args": ["--------------------------------------------------"]},
			// Unbind both
			{"id": "null",		"action": "bind",			"args": ["test_context_2", "-", "test_context_1", true]},
			{"id": "null",		"action": "log", 			"args": ["test_context_1, test_context_2 unbound bidirectionally"]},
			{"id": "null",		"action": "log", 			"args": ["-------------------trigger_1----------------------"]},
			{"id": "null", 		"action": "event", 		"args": ["context.audience.listener.trigger"]},
			{"id": "null",		"action": "log", 			"args": ["--------------------------------------------------"]},
			{"id": "null",		"action": "context",	"args": ["test_context_1", "-"]},
			{"id": "null",		"action": "context",	"args": ["test_context_2", "-"]},
		],

		bind_unbind_one_test: [
			// First context setup
			{"id": "null",		"action": "context",	"args": ["test_context_1", "+", ["^context\\.\\w+"]]},
			{"id": "null",		"action": "audience",	"args": ["test_context_1:test_audience", "+", {"start": "context\\.audience\\.start\\.1", "stop": "context\\.audience\\.stop\\.1", "delete": "context\\.audience\\.delete\\.1"}]},
			{"id": "null",		"action": "listen", 	"args": ["test_context_1:test_audience:test_listener", "+", {"trigger": "context\\.\\w*\\.listener\\.trigger", "reset": "context\\.\\w*\\.listener\\.reset", "delete": "$limit$"}, 5, "contexts.log_event", ["listener.1 has $limit$ triggers left."]]},
			{"id": "null", 		"action": "event", 		"args": ["context.audience.start.1"]},
			// Second context setup
			{"id": "null",		"action": "context",	"args": ["test_context_2", "+", ["^context\\.\\.\\w+"]]},
			{"id": "null",		"action": "audience",	"args": ["test_context_2:test_audience", "+", {"start": "context\\.\\w*\\.start\\.2", "stop": "context\\.\\w*\\.stop.2", "delete": "context\\.\\.delete\\.2"}]},
			{"id": "null",		"action": "listen", 	"args": ["test_context_2:test_audience:test_listener", "+", {"trigger": "context\\.\\w*\\.listener\\.trigger", "reset": "context\\.\\w*\\.listener\\.reset", "delete": "$limit$"}, 5, "contexts.log_event", ["listener.2 has $limit$ triggers left."]]},
			{"id": "null", 		"action": "event", 		"args": ["context..start.2"]},
			// First context start
			{"id": "null",		"action": "log", 			"args": ["-------------------trigger_1----------------------"]},
			{"id": "null", 		"action": "event", 		"args": ["context.audience.listener.trigger"]},
			// Second context start
			{"id": "null",		"action": "log", 			"args": ["-------------------trigger_2----------------------"]},
			{"id": "null", 		"action": "event", 		"args": ["context..listener.trigger"]},
			{"id": "null",		"action": "log", 			"args": ["--------------------------------------------------"]},
			// Bind test_context_2 to test_context_1
			{"id": "null",		"action": "bind",			"args": ["test_context_1", "+", "test_context_2", false]},
			{"id": "null",		"action": "log", 			"args": ["test_context_2 bound to test_context_1"]},
			{"id": "null",		"action": "log", 			"args": ["-------------trigger_1&trigger_2------------------"]},
			{"id": "null", 		"action": "event", 		"args": ["context.audience.listener.trigger"]},
			{"id": "null",		"action": "log", 			"args": ["--------------------------------------------------"]},
			// Unbind test_context_2 from test_context_1
			{"id": "null",		"action": "bind",			"args": ["test_context_1", "-", "test_context_2", false]},
			{"id": "null",		"action": "log", 			"args": ["test_context_2 unbound from test_context_1"]},
			{"id": "null",		"action": "log", 			"args": ["-------------------trigger_2----------------------"]},
			{"id": "null", 		"action": "event", 		"args": ["context.audience.listener.trigger"]},
			{"id": "null",		"action": "log", 			"args": ["--------------------------------------------------"]},
			{"id": "null",		"action": "context",	"args": ["test_context_1", "-"]},
			{"id": "null",		"action": "context",	"args": ["test_context_2", "-"]},
		],

		set_die: [
			["new_die", "event_idx"],
			{"id": "null", 		"action": "step_result",		"args": ["<parent_process>", "<event_idx>", "<new_die>"]},
			{"id": "null", 		"action": "log",						"args": [`------- Die set to: <new_die>.<parent_process> -------`]}
		],
	
		log_event: [
			["message"],
			{"id": "log",			"action": "log",			"args": ["<message>"]},
		],

		roll_plus_one: [
			["die", "desc"],
			{"id": "roll", 		"action": "roll", 		"args": ["<die>"]},
			{"id": "roll_p", 	"action": "math", 		"args": ["<roll>", "+", 1]},
			{"id": "confirm",	"action": "confirm",	"args": ["Rolled a (<roll_p>/<die>) for <desc>.", ["Next",true], ["Set", "roll", "<die>"], ["Reroll","roll"]]},
			{"id": "return",	"action": "return", 	"args": ["<roll_p>"]},
		],
	},
})