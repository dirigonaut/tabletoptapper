const rule_data = Object({
	get: function(_key) { 
		let split = _key.split(".");
		let result = (split.length > 0) ? this : null;

		for (let key of split) {
			result = result[key];

			if (result == null || result == undefined) {
				throw new Error(`There is no rule that matches the key: ${_key}`);
			}
		}

		return result; 
	},

	start: [
		{"id": "char_idx",				"action": "read",		"args": ["save_d", "character_idx"]},
		{"id": "is_character",			"action": "null", 		"args": ["save_d", "character_party.<char_idx>"]},
		{"id": "null", 					"action": "branch", 	"args": ["<is_character>", {"action":"inject", "args":["campaign.new", ["<is_character>"]]}, null]},
		{"id": "null", 					"action": "inject", 	"args": ["campaign.context.next"]},
	],

	campaign: {
		new: [
			["is_character"],
			// Set up character party coordinate watchers
			{"id": "null",				"action": "watch",		"args": ["d_idx", "domain_idx", "domain_idx"]},
			{"id": "null",				"action": "watch",		"args": ["x", "domains\\.\\d+\\.party_coord\\.0", "domains.<$d_idx>.party_coord.0"]},
			{"id": "null",				"action": "watch",		"args": ["y", "domains\\.\\d+\\.party_coord\\.1", "domains.<$d_idx>.party_coord.1"]},
			// Setup Domain Context
			{"id": "null",				"action": "context",		"args": ["domain", "+", ["domain\\."]]},
			// Setup Character
			{"id": "branch", 			"action": "branch", 	"args": ["<is_character>", {"action":"inject", "args":["character.creation.wizard", [0]]}, null]},
			// Setup Domain
			{"id": "domain_idx",		"action": "read", 		"args": ["save_d", "domain_idx"]},
			{"id": "branch", 			"action": "branch", 	"args": [["<domain_idx>", "!=", -1], {"action":"return"}]},
			{"id": "branch", 			"action": "inject",		"args": ["traverse.domain.enter"]},
		],

		context: {
			next: [
				{"id": "null",				"action": "inject", 	"args": ["campaign.context.determine", []]},
				{"id": "null",				"action": "inject", 	"args": ["campaign.context.set", []]},
			],

			set: [
				{"id": "context", 			"action": "read", 		"args": ["save_d", "context"]},
				{"id": "null", 				"action": "action", 	"args": ["<context>"]},
			],

			determine: [
				{"id": "area_f",		"action": "read",		"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>.flags"]},
				// Is there an encounter
				{"id": "combat_f",		"action": "read",		"args": ["game_d", "models.area.flags.contents.is_encounter"]},
				{"id": "null",			"action": "branch",		"args": [["<combat_f>", "&", "<area_f>"], null, {"action": "goto", "args":["id.event_f.next"]}]},
					{"id": "null",			"action": "write", 		"args": ["save_d", "context", "combat.actions"]},
					{"id": "null",			"action": "return",		"args": []},
				// Is there an event
				{"id": "event_f",		"action": "read",		"args": ["game_d", "models.area.flags.contents.is_event"]},
				{"id": "null",			"action": "branch",		"args": [["<event_f>", "&", "<area_f>"], null, {"action": "goto", "args":["id.trader_f.next"]}]},
					//{"id": "null",			"action": "write", 		"args": ["save_d", "context", "event.actions"]},
					//{"id": "null",			"action": "return",		"args": []},
				// Is there a trader
				{"id": "trader_f",	"action": "read",			"args": ["game_d", "models.area.flags.contents.is_event"]},
				{"id": "null",			"action": "branch",		"args": [["<trader_f>", "&", "<area_f>"], null, {"action": "goto", "args":["id.traverse.next"]}]},
					//{"id": "null",			"action": "write", 		"args": ["save_d", "context", "trader.actions"]},
					//{"id": "null",			"action": "return",		"args": []},
				// Else traverse
				{"id": "traverse",	"action": "write", 		"args": ["save_d", "context", "traverse.actions"]},
			],
		},

		preserve_lore: [],
		abandon: [],
	},

	// ------------------------------------------------------------------------------------------------------- Traverse
	traverse: {
		actions: [
			{"id": "choice",			"action": "choice", 	"args": ["What action will you take?", {"move":"traverse.move.choice", "camp":"rest.camp.flow", "breather":"rest.breather.flow", "scavenge":"traverse.area.check.scavenge.do"}, ["camp"]]},
			{"id": "log",				"action": "log", 		"args": ["You chose to <choice.data>."]},
			{"id": "null", 				"action": "branch", 	"args": [["<choice.data>", "==", "camp"], {"action":"action", "args":["rest.camp.actions"]}, {"action":"inject", "args":["<choice.data>"]}]},
			{"id": "null",				"action": "inject", 	"args": ["campaign.context.next", []]},
		],

		move: {
			choice: [
				{"id": "choice",			"action": "choice", 	"args": ["What direction will you go?", ["west", "north", "east", "south"]]},
				{"id": "notify",			"action": "notify", 	"args": ["Party moves <choice.data>."]},
				{"id": "direct",			"action": "read", 		"args": ["game_d", "models.directions.<choice.data>"]},
				{"id": "inject", 			"action": "inject", 	"args": ["traverse.move.direction", ["<direct>"]]},
			],

			direction: [
				["direct"],
				{"id": "door",		"action": "read", 		"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>.doors.<direct>"]},
				// Make sure there is a door in the direction they are moving
				{"id": "no_door",	"action": "math", 		"args": ["<door>", "==", 0]},
				{"id": "branch", 	"action": "branch", 	"args": ["<no_door>", {"action":"notify", "args":["There is only a wall here."]}, null]},
				{"id": "return", 	"action": "branch", 	"args": ["<no_door>", {"action":"return"}, null]},
				// Determine if the door has been opened before or not and branch accordingly
				{"id": "opened",	"action": "math", 		"args": ["<door>", "&", 8]},
				{"id": "branch", 	"action": "branch", 	"args": ["<opened>", 
					{"action": "inject", "args":["traverse.area.door.enter", ["<direct>"]]}, 
					{"action": "inject", "args":["traverse.area.door.open",	["<direct>"]]}]},
			],

			backtrack: [
				["area_type"],
				{"id": "notify",		"action": "notify", 	"args": ["----------- Backtracking <area_type> ------------ "]},
				{"id": "tension", 		"action": "inject", 	"args": ["dice.usage.check", ["domains.<$d_idx>.tension_die", "Tension", "traverse.area.check.tension.flow", true]]},
				{"id": "light_source",	"action": "branch",		"args": [["<area_type>", "==", "room"], {"action": "inject", "args":["character.light_sources.use.party", ["character_party"]]}]},
			],
		},

		domain: {
			enter: [
				// Generate the domain from the model
				{"id": "domain_idx",		"action": "read",			"args": ["save_d", "domain_idx"]},
				{"id": "domain_idx",		"action": "math", 		"args": ["<domain_idx>", "+", 1]},
				{"id": "null",				"action": "write",		"args": ["save_d", "domain_idx", "<domain_idx>"]},
				{"id": "copy", 				"action": "copy",			"args": ["game_d", "models.domain"]},
				{"id": "domain",			"action": "write",		"args": ["save_d", "domains.<domain_idx>", "<copy>"]},
				{"id": "null",				"action": "audience",	"args": ["domain:<domain_idx>", "+", {"start": "domain\\.<domain_idx>.entered", "stop": "domain\\.<domain_idx>.exited" }]},
				{"id": "null",				"action": "event",		"args": ["domain.<domain_idx>.entered", "<domain_idx>"]},
				// Start the Domain rolls
				{"id": "notify",			"action": "notify", 	"args": ["------------- Entered Domain ------------ "]},
				{"id": "inject", 			"action": "inject", 	"args": ["dice.rolls.save_roll_against_table", ["tables.overseers", "domains.<domain_idx>.overseer"]]},
				{"id": "inject", 			"action": "inject", 	"args": ["dice.rolls.save_roll_against_table", ["tables.influence", "domains.<domain_idx>.influence"]]},
				{"id": "party_size",		"action": "size", 		"args": ["save_d", "character_party"]},
				{"id": "p_range",			"action": "range", 		"args": ["<party_size>"]},
				// Add Experience to players for entering new domain
				{"id": "loop",				"action": "loop",			"args": ["character.biography.levels.add_experience", "<p_range>", ["character_party", "$idx$", 50]]},
				// Generate the first room of the domain
				{"id": "copy", 				"action": "copy",			"args": ["game_d", "models.area.floor_plan"]},
				{"id": "set", 				"action": "set",			"args": ["<copy>", "type", "room"]},
				{"id": "has_stair",			"action": "math", 		"args": ["<domain_idx>", "!=", 0]},
				{"id": "branch", 			"action": "branch", 	"args": ["<has_stair>", null, {"action":"goto", "args":["id.map_d.next"]}]},
				{"id": "set", 				"action": "set",			"args": ["<copy>", "contains", "stairs_up"]},
				// Write the model to the domain map data
				{"id": "map_d",				"action": "write",		"args": ["save_d", "domains.<domain_idx>.map.5.5", "<copy>"]},
				// Generate Doors
				{"id": "doors",				"action": "inject", 	"args": ["dice.rolls.lookup_against_table", ["tables.doors", 8]]},
				{"id": "write",				"action": "write",		"args": ["save_d", "domains.<domain_idx>.map.<$y>.<$x>.doors", "<doors>"]},
				{"id": "scavenge",			"action": "inject", 	"args": ["traverse.area.check.scavenge.generate"]},
			],
		},

		area: {
			type: {
				generate: [
					["direct"],
					// Roll for type
					{"id": "lookup", 		"action": "inject", 	"args": ["dice.rolls.roll_against_table", ["game_d", "tables.area_type"]]},
					{"id": "check", 		"action": "math",			"args": ["<lookup.1>", "==", "room"]},
					// Copy model to store data in
					{"id": "copy", 			"action": "copy",			"args": ["game_d", "models.area.floor_plan"]},
					{"id": "copy", 			"action": "set",			"args": ["<copy>", "type", "<lookup.1>"]},
					{"id": "copy", 			"action": "set",			"args": ["<copy>", "shift_by", "<direct>"]},
					// Write the model to the domain map data
					{"id": "map_d",			"action": "write",		"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>", "<copy>"]},
					// Branch to room or corridor rule logic
					{"id": "branch", 		"action": "branch", 	"args": ["<check>", {"action":"inject", "args":["traverse.area.type.room"]}, {"action":"inject", "args":["traverse.area.type.corridor"]}]},
				],
		
				room: [
					{"id": "notify",			"action": "notify", 	"args": ["-------------- Entering Room -------------- "]},
					{"id": "doors",				"action": "inject", 	"args": ["traverse.area.door.roll"]},
					{"id": "tension", 			"action": "inject", 	"args": ["dice.usage.check", ["domains.<$d_idx>.tension_die", "Tension", "traverse.area.check.tension.flow", true]]},
					{"id": "light_source",		"action": "inject",		"args": ["character.light_sources.use.party", ["character_party"]]},
					{"id": "null",				"action": "inject", 	"args": ["traverse.area.check.layer_or_exit.flow"]},
					{"id": "area_f",			"action": "read",		"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>.flags"]},
					// If layer or exit then return
					{"id": "null",				"action": "branch",		"args": [["<area_f>", "!=", 0], {"action":"return"}]},
					{"id": "is_encounter",		"action": "inject", 	"args": ["dice.rolls.roll", [20, "Encounter Check (pass: <10)"]]},
					{"id": "null",				"action": "branch", 	"args": [["<is_encounter>", ">=", 10], {"action":"inject", "args":["traverse.area.check.encounter.lookup"]}, {"action":"inject", "args":["traverse.area.check.event.lookup"]}]},
					{"id": "scavenge",			"action": "inject", 	"args": ["traverse.area.check.scavenge.generate"]},
				],
		
				corridor: [
					{"id": "notify",			"action": "notify", 	"args": ["------------ Entering Corridor ------------ "]},
					{"id": "doors",				"action": "inject", 	"args": ["traverse.area.door.roll"]},
					{"id": "tension", 			"action": "inject", 	"args": ["dice.usage.check", ["domains.<$d_idx>.tension_die", "Tension", "traverse.area.check.tension.flow", true]]},
					{"id": "area_f",			"action": "read",		"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>.flags"]},
					{"id": "is_encounter",		"action": "inject", 	"args": ["dice.rolls.roll", [20, "Encounter Check (pass: <15)"]]},
					{"id": "null",				"action": "branch", 	"args": [["<is_encounter>", ">=", 15], {"action":"inject", "args":["traverse.area.check.encounter.lookup"]}]},
				],
			},

			door: {
				roll: [
					// Get Save Data -----------
					{"id": "shift",			"action": "read",		"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>.shift_by"]},
					// Doors -------------------
					{"id": "d_lookup", 		"action": "inject", 	"args": ["dice.rolls.roll_against_table", ["game_d", "tables.doors"]]},
					{"id": "check", 		"action": "math", 		"args": ["<d_lookup.0>", "==", 0]},
					{"id": "d_lookup", 		"action": "shift", 		"args": ["<d_lookup.1>", "<shift>"]},
					{"id": "sum", 			"action": "resolve", 	"args": ["<d_lookup>"]},
					{"id": "write",			"action": "write",		"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>.doors", "<sum>"]},
					{"id": "return", 		"action": "branch", 	"args": ["<check>", {"action":"return"}, null]},
					// Locked ------------------
					{"id": "locked",		"action": "inject", 	"args": ["dice.rolls.roll_against_table", ["game_d", "tables.locked"]]},
					{"id": "locked", 		"action": "shift", 		"args": ["<locked.1>", "<shift>"]},
					{"id": "temp", 			"action": "math", 		"args": ["<locked>", "*", "<d_lookup>"]},
					{"id": "sum", 			"action": "math", 		"args": ["<temp>", "+", "<sum>"]},
					{"id": "write",			"action": "write",		"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>.doors", "<sum>"]},
					// Trapped -----------------
					{"id": "trapped",		"action": "inject", 	"args": ["dice.rolls.roll_against_table", ["game_d", "tables.trapped"]]},
					{"id": "trapped", 		"action": "shift", 		"args": ["<trapped.1>", "<shift>"]},
					{"id": "temp", 			"action": "math", 		"args": ["<trapped>", "*", "<d_lookup>"]},
					{"id": "sum", 			"action": "math", 		"args": ["<temp>", "+", "<sum>"]},
					{"id": "write",			"action": "write",		"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>.doors", "<sum>"]},
				],
	
				open: [
					["direct"],
					{"id": "door",			"action": "read", 		"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>.doors.<direct>"]},
					// Did you pass the disarm check
					{"id": "trapped",		"action": "math", 		"args": ["<door>", "&", 4]},
					{"id": "trap",			"action": "template",	"args": ["traverse.area.door.check", ["The door is trapped would you like to attempt to disarm the trap?", "<direct>", 4]]},
					{"id": "branch",		"action": "branch", 	"args": ["<trapped>", {"action":"inject", "args":["<trap>"]}, null]},
					{"id": "door",			"action": "read", 		"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>.doors.<direct>"]},
					{"id": "trapped",		"action": "math", 		"args": ["<door>", "&", 4]},
					{"id": "return", 		"action": "branch", 	"args": ["<trapped>", {"action":"return"}, null]},
					// Did you pass the unlock check
					{"id": "locked",		"action": "math", 		"args": ["<door>", "&", 2]},
					{"id": "lock",			"action": "template",	"args": ["traverse.area.door.check", ["The door is locked would you like to attempt to unlock it?", "<direct>", 2]]},
					{"id": "branch", 		"action": "branch", 	"args": ["<locked>", {"action":"inject", "args":["<lock>"]}, null]},
					{"id": "door",			"action": "read", 		"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>.doors.<direct>"]},
					{"id": "locked",		"action": "math", 		"args": ["<door>", "&", 2]},
					{"id": "return", 		"action": "branch", 	"args": ["<locked>", {"action":"return"}, null]},
					// Update the door state to opened
					{"id": "door",			"action": "read", 		"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>.doors.<direct>"]},
					{"id": "state",			"action": "math", 		"args": ["<door>", "+", 8]},
					{"id": "door",			"action": "write", 		"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>.doors.<direct>", "<state>"]},
					//Enter door
					{"id": "enter_d",		"action": "inject", 	"args": ["traverse.area.door.enter", ["<direct>"]]},
				],
		
				check: [
					["text", "direct", "door_state"],
					{"id": "choice",		"action": "choice", 	"args": ["<text>", ["yes", "no"]]},
					{"id": "check",			"action": "math", 		"args": ["<choice.data>", "==", "no"]},
					{"id": "return", 		"action": "branch", 	"args": ["<check>", {"action":"return", "args":[false]}, null]},
					{"id": "char_idx",		"action": "read", 		"args": ["save_d", "character_idx"]},
					{"id": "skill",			"action": "inject",		"args": ["character.attributes.stats.get.total", ["character_party", "<char_idx>", "skill", "thievery"]]},
					{"id": "check",			"action": "inject",		"args": ["dice.skill.check", ["character_party", "<char_idx>", ["skill.thievery"], "+skill+thievery+door"]]},
					{"id": "value",			"action": "ifelse", 	"args": ["<check.roll.pass>", "<door_state>", 0]},
					{"id": "door",			"action": "read", 		"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>.doors.<direct>"]},
					{"id": "state",			"action": "math", 		"args": ["<door>", "-", "<value>"]},
					{"id": "door",			"action": "write", 		"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>.doors.<direct>", "<state>"]},
				],
		
				enter: [
					["direct"],
					// Update the party coord to reflect the new area
					{"id": "x_or_y",	"action": "math", 		"args": ["<direct>", "&", 1]},
					{"id": "x_or_y",	"action": "ifelse", 	"args": ["<x_or_y>", 0, 1]},
					{"id": "is_plus",	"action": "math", 		"args": ["<direct>", ">", 1]},
					{"id": "a_coord",	"action": "read", 		"args": ["save_d", "domains.<$d_idx>.party_coord.<x_or_y>"]},
					{"id": "op",		"action": "ifelse", 	"args": ["<is_plus>", "+", "-"]},
					{"id": "n_coord",	"action": "math", 		"args": ["<a_coord>", "<op>", 1]},
					{"id": "coord",		"action": "write", 		"args": ["save_d", "domains.<$d_idx>.party_coord.<x_or_y>", "<n_coord>"]},
					// If the map has no data for the cell inject an area type rule
					{"id": "check",		"action": "null", 		"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>"]},
					{"id": "shift_by",	"action": "math", 		"args": ["<direct>", "+", 2]},
					{"id": "shift_by",	"action": "math", 		"args": ["<shift_by>", "%", 4]},
					{"id": "branch",	"action": "branch", 	"args": ["<check>", {"action":"inject", "args":["traverse.area.type.generate", ["<shift_by>"]]}, null]},
					{"id": "return", 	"action": "branch", 	"args": ["<check>", {"action":"return"}, null]},
					// The party has been here before inject a backtrack rule
					{"id": "a_type",	"action": "read", 		"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>.type"]},
					{"id": "null", 		"action": "inject", 	"args": ["traverse.move.backtrack", ["<a_type>"]]},
				],
			},

			check: {
				layer_or_exit: {
					flow: [
						{"id": "layer_die",	"action": "read",			"args": ["save_d", "domains.<$d_idx>.layer_die"]},
						// Check for the domain exit if layer die < 3
						{"id": "exit_die",	"action": "read",			"args": ["save_d", "domains.<$d_idx>.exit_die"]},
						{"id": "null",		"action": "branch", 	"args": [[["<exit_die.0>", ">", 3], "&", ["<layer_die.0>", "<", 4]], {"action": "inject", "args":["dice.usage.check", ["domains.<$d_idx>.exit_die", "Exit", "traverse.area.check.layer_or_exit.is_exit", false]]}]},
						// Check for overseer Layer if it hasn't been found
						{"id": "layer_die",	"action": "branch", 	"args": [["<layer_die.0>", ">", 3], {"action": "inject", "args":["dice.usage.check", ["domains.<$d_idx>.layer_die", "Layer", "traverse.area.check.layer_or_exit.is_layer", false]]}]},
					],
			
					is_layer: [
						{"id": "notify",		"action": "notify",		"args": ["You have found the Overseer's layer."]},
						// Get layer_flag + area.flag and save
						{"id": "flag",			"action": "read",		"args": ["game_d", "models.area.flags.contents.is_layer"]},
						{"id": "area_f",		"action": "read",		"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>.flags"]},
						{"id": "flag",			"action": "math",		"args": ["<flag>", "+", "<area_f>"]},
						{"id": "null",			"action": "write",		"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>.flags", "<flag>"]},
						// Generate area data
						{"id": "id",			"action": "read",		"args": ["save_d", "domains.<$d_idx>.overseer"]},
						{"id": "overseer_m",	"action": "read",		"args": ["game_d", "overseers.<id>"]},
						{"id": "overseer_m",	"action": "inject", 	"args": ["traverse.area.check.encounter.generate", ["<overseer_m.id>", 0, "<overseer_m.stats.health>", "<overseer_m.adaptions>"]]},
						// Save to area.data
						{"id": "area_d",		"action": "read",		"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>.data"]},
						{"id": "area_d", 		"action": "set", 		"args": ["<area_d>", "<area_f>", ["<overseer_m>"]]},
						{"id": "null",			"action": "write",		"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>.data", "<area_d>"]},
					],

					is_exit: [
						{"id": "notify",			"action": "notify",			"args": ["You have found the entrance to the next domain."]},
						// Get exit_flag + area.flags and save
						{"id": "flag",				"action": "copy",			"args": ["game_d", "models.area.flags.contents.is_exit_down"]},
						{"id": "area_f",			"action": "read",			"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>.flags"]},
						{"id": "flag",				"action": "math",			"args": ["<flag>", "+", "<area_f>"]},
						{"id": "null",				"action": "write",			"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>.flags", "<flag>"]},
						// Generate area data
						{"id": "exit_m", 			"action": "copy", 			"args": ["game_d", "models.area.contents.exit"]},
						{"id": "exit_m",			"action": "set",			"args": ["<exit_m>", "direction", 1]},
						// Save to area.data
						{"id": "area_d",			"action": "read",			"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>.data"]},
						{"id": "area_d", 			"action": "set", 			"args": ["<area_d>", "<area_f>", "<exit_m>"]},
						{"id": "null",				"action": "write",			"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>.data", "<area_d>"]},
					],
				},

				tension: {
					flow: [
						{"id": "size", 			"action": "size",		"args": ["game_d", "tables.darkness"]},
						{"id": "roll", 			"action": "roll",		"args": ["<size>"]},
						{"id": "lookup",		"action": "lookup",		"args": ["game_d", "tables.darkness", "<roll>"]},
						{"id": "roll_p", 		"action": "math", 		"args": ["<roll>", "+", 1]},
						{"id": "confirm",		"action": "confirm",	"args": ["Rolled a (<roll_p>/d<size>) on Table(tables.darkness): <lookup>.", ["Next",true], ["Set", "roll", "<size>"], ["Reroll","roll"]]},
						{"id": "null",			"action": "concat", 	"args": ["save_d", "domains.<$d_idx>.darkness", "<lookup>"]},
					],
				},

				event: {
					lookup: [
						// Look up Event
						{"id": "event",			"action": "inject", 	"args": ["dice.rolls.roll_against_table", ["game_d", "tables.events"]]},
						// Get event_flag + area_flags and save
						{"id": "flag",			"action": "read",		"args": ["game_d", "models.area.flags.contents.is_event"]},
						{"id": "area_f",		"action": "read",		"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>.flags"]},
						{"id": "area_f",		"action": "math",		"args": ["<flag>", "+", "<area_f>"]},
						{"id": "null",			"action": "write",		"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>.flags", "<flag>"]},
						// Generate event data
						{"id": "event_m", 		"action": "copy", 		"args": ["game_d", "models.area.contents.event"]},
						{"id": "event_m",		"action": "set", 		"args": ["<event_m>", "id", "<event.0>"]},
						// Save to area.data
						{"id": "area_d",		"action": "read",		"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>.data"]},
						{"id": "f_key",			"action": "resolve",	"args": ["_<flag>"]},
						{"id": "area_d", 		"action": "set", 		"args": ["<area_d>", "<f_key>", "<event_m>"]},
						{"id": "null",			"action": "write",		"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>.data", "<area_d>"]},
					],
				},

				encounter: {
					lookup: [
						{"id": "lookup",		"action": "inject", 	"args": ["dice.rolls.roll_against_table", ["save_d", "domains.<$d_idx>.enemy_pool"]]},
						// Get encounter_flag + area_flags and save
						{"id": "flag",			"action": "read",		"args": ["game_d", "models.area.flags.contents.is_encounter"]},
						{"id": "area_f",		"action": "read",		"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>.flags"]},
						{"id": "area_f",		"action": "math",		"args": ["<flag>", "+", "<area_f>"]},
						{"id": "null",			"action": "write",		"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>.flags", "<flag>"]},
						// Generate encounter enemy data
						{"id": "encounter", 	"action": "inject", 	"args": ["traverse.area.check.encounter.generate", ["<lookup.1>"]]},
						// Save to area.data
						{"id": "area_d",		"action": "read",		"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>.data"]},
						{"id": "f_key",			"action": "resolve",	"args": ["_<flag>"]},
						{"id": "area_d", 		"action": "set", 		"args": ["<area_d>", "<f_key>", "<encounter>"]},
						{"id": "null",			"action": "write",		"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>.data", "<area_d>"]},
					],
			
					generate: [
						["enemy_id"],
						// Copy models and load enemy data
						{"id": "encounter_m", "action": "copy", 		"args": ["game_d", "models.area.contents.encounter"]},
						// Fill in enemy instance details
						{"id": "encounter_m", "action": "set", 			"args": ["<encounter_m>", "id", "<enemy_id>"]},
						// Return encounter enemy data
						{"id": "null", 		"action": "return", 		"args": ["<encounter_m>"]},
					],
				},

				scavenge: {
					do: [
						{"id": "area_f",		"action": "read",			"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>.flags"]},
						{"id": "scavenge_f",	"action": "read",			"args": ["game_d", "models.area.flags.contents.is_scavenge"]},
						{"id": "is_loot", 		"action": "math", 			"args": ["<area_f>", "&", "<scavenge_f>"]},
						// If nothing to scavenge then return
						{"id": "null", 			"action": "branch", 		"args": ["<is_loot>", null, {"action":"log","args":["There is nothing to scavenge in this room."]}]},
						{"id": "null", 			"action": "branch", 		"args": ["<is_loot>", null, {"action":"return"}]},
						// Roll scavenging
						{"id": "loot", 			"action": "inject", 		"args": ["dice.rolls.roll_against_table", ["game_d", "tables.scavenge"]]},
						//{"id": "save",				"action": "concat", 	"args": ["save_d", "character_party.<char_idx>.inventory", ["crafting_supplies", "<modifier>"]]},
						// Update area.data
						{"id": "f_key",			"action": "resolve",		"args": ["_<scavenge_f>"]},
						{"id": "scavenge_d",	"action": "read",			"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>.data.<f_key>"]},
						{"id": "scavenged", 	"action": "math", 			"args": ["<scavenge_d.tries.0>", "+", 1]},
						{"id": "is_cleared", 	"action": "math", 			"args": ["<scavenge_d.tries.1>", "==", "<scavenged>"]},
						{"id": "null", 			"action": "write", 			"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>.data.<f_key>.0", "<scavenged>"]},
						{"id": "null", 			"action": "branch", 		"args": ["<is_cleared>", null, {"action":"return"}]},
						// If the room is completely scavenged then clean up area.data
						{"id": "null", 			"action": "delete", 		"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>.data.<f_key>"]},
						{"id": "updated_f", 	"action": "math", 			"args": ["<area_f>", "-", "<scavenge_f>"]},
						{"id": "null", 			"action": "write", 			"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>.flags", "<updated_f>"]},
					],

					generate: [
						// Get scavenge flags + area_flags and save
						{"id": "flag",			"action": "read",			"args": ["game_d", "models.area_flags.is_scavenge"]},
						{"id": "area_f",		"action": "read",			"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>.flags"]},
						{"id": "area_f",		"action": "math",			"args": ["<flag>", "+", "<area_f>"]},
						{"id": "f_key",			"action": "resolve",		"args": ["_<flag>"]},
						{"id": "null",			"action": "write",			"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>.flags", "<area_f>"]},
						// Generate scavenge data
						{"id": "scavenge_m",	"action": "copy", 			"args": ["game_d", "models.area.contents.scavenge"]},
						// Save to area.data
						{"id": "area_d",		"action": "read",			"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>.data"]},
						{"id": "area_d", 		"action": "set", 			"args": ["<area_d>", "<f_key>", "<scavenge_m>"]},
						{"id": "null",			"action": "write",			"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>.data", "<area_d>"]},
					],
				},
			}
		},
	},

	// ------------------------------------------------------------------------------------------------------- Rest
	rest: {
		camp: {
			actions: [
				{"id": "choices",			"action": "resolve", 	"args": [["attune", "barricade", "cook", "craft_bandages", "craft_oil", "craft_rituals", "craft_torches", "heal_condition", "repair", "rest", "swap_amulet", "camp_check"]]},
				{"id": "choice",			"action": "choice", 	"args": ["What action will you take?", "<choices>"]},
				{"id": "log",				"action": "log", 			"args": ["You chose to <choice.data>."]},
				{"id": "inject",			"action": "inject", 	"args": ["<choice.data>"]},
			],
		},

		breather: {
			flow: [
				{"id": "toughness", 	"action": "inject", 	"args": ["dice.rolls.roll", [10, " recovered Toughness"]]},
				{"id": "toughness", 	"action": "math", 		"args": ["<toughness>", "+", 1]},
				// Get all party members that are player characters
				{"id": "party_size",	"action": "size", 		"args": ["save_d", "character_party"]},
				{"id": "p_range",		"action": "range", 		"args": ["<party_size>"]},
				{"id": "p_type",		"action": "read", 		"args": ["save_d", "character_party.*.type"]},
				{"id": "p_players",		"action": "math", 		"args": ["<p_type>", "==", "player"]},
				{"id": "char_idxs",		"action": "filter", 	"args": ["<p_range>", "<p_players>", "is", "1:1"]},
				// Apply stats to all party members
				{"id": "loop",			"action": "loop",		"args": ["rest.breather.recover_stats", "<char_idxs>", ["$idx$", "<toughness>", 1, 2, 5]]},
				// Reduce Tension Die
				{"id": "tension", 		"action": "resolve", 	"args": [2]},
				{"id": "null", 			"action": "event", 		"args": ["breather.tension", "<tension>"]},
				{"id": "toughness", 	"action": "inject", 	"args": ["dice.usage.reduce", ["domains.<$d_idx>.tension_die", "Tension", "encroaching_darkness", true, "<tension>"]]},
			],
	
			recover_stats: [
				["char_idx", "by_toughness", "by_health", "by_exhaustion", "by_light"],
				// Recover Toughness
				{"id": "toughness",			"action": "inject", 	"args": ["character.attributes.stats.add", ["character_party.<char_idx>", "base", "toughness", {"base": "<by_toughness>"}]]},
				// Recover Health
				{"id": "health",			"action": "inject", 	"args": ["character.attributes.stats.add", ["character_party.<char_idx>", "base", "health", {"base": "<by_health>"}]]},
				// Reduce Exhaustion
				{"id": "exhaustion",		"action": "inject", 	"args": ["character.attributes.stats.delete", ["character_party.<char_idx>", "base", "exhaustion", {"base": "<by_exhaustion>"}]]},
				// Reduce Light Source
				{"id": "name",				"action": "read", 		"args": ["save_d", "character_party.<char_idx>.name"]},
				{"id": "null",				"action": "log",		"args": ["<name>'s Toughness: +<by_toughness> to (<toughness.total>/<toughness.max>)"]},
				{"id": "null",				"action": "log",		"args": ["<name>'s Health: +<by_health> to (<health.total>/<health.max>)"]},
				{"id": "null",				"action": "log",		"args": ["<name>'s Exhaustion: -<by_exhaustion> to (<exhaustion.total>/<exhaustion.max>)"]},
				{"id": "null",				"action": "inject",		"args": ["character.light_sources.use.by", ["character_party", "<char_idx>", "<by_light>"]]},
			],
		}
	},
	
	// ------------------------------------------------------------------------------------------------------- Combat
	combat: {
		actions: [
			// Make sure encounter is setup
			{"id": "null",					"action": "inject", 	"args": ["combat.setup.process"]},
			// If the encounter is not over then process the next step
			{"id": "null",					"action": "inject", 	"args": ["combat.round.next"]},
			// Determine if the encounter is over
			{"id": "encounter",				"action": "inject", 	"args": ["combat.destruct.process"]},
		],

		setup: {
			process: [
				{"id": "is_null", 			"action": "null", 		"args": ["save_d", "encounter"]},
				// If encounter is null then the encounter needs to be setup
				{"id": "null", 				"action": "branch", 	"args": ["<is_null>", null, {"action": "return"}]},
					// Copy encounter to base level for ease of use
					{"id": "encntr_f", 			"action": "read", 		"args": ["game_d", "models.area.flags.contents.is_encounter"]},
					{"id": "encounter", 		"action": "read", 		"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>.data._<encntr_f>"]},
					{"id": "null", 				"action": "write", 		"args": ["save_d", "encounter", "<encounter>"]},
					
					// If the combat reset flag is true then reset the enemies
					{"id": "reset",				"action": "branch", 	"args": [[["<encounter.id>", "is"], "&", "<encounter.reset>"], {"action": "loop", "args":["combat.enemies.reset", "<encounter.enemies>", ["$idx$"]]}]},
					// Generate/Load the enemies if they have not been already
					{"id": "enemies",			"action": "branch", 	"args": [[["<encounter.id>", "is"], "&", ["<encounter.enemies>", "isnt"]], {"action": "inject", "args":["combat.enemies.generate"]}]},
					// Determine party order for combat if it has not been already 
					{"id": "order",				"action": "branch", 	"args": [[["<encounter.id>", "is"], "&", ["<encounter.order>", "isnt"]], {"action": "inject", "args":["combat.setup.order"]}]},

					// Copy enemy to enemy_party/idx/turns for parity with character_party/idx/turns
					{"id": "null", 				"action": "write", 		"args": ["save_d", "enemy_party", "<encounter.enemies>"]},
					{"id": "null", 				"action": "write", 		"args": ["save_d", "enemy_idx", 0]},
					{"id": "null", 				"action": "write", 		"args": ["save_d", "enemy_turns", []]},

					// Setup character_turns
					{"id": "characters",		"action": "range", 		"args": ["save_d", "character_party"]},
					{"id": "null", 				"action": "write", 		"args": ["save_d", "character_idx", 0]},
					{"id": "null", 				"action": "write", 		"args": ["save_d", "character_turns", []]},

					// Add variables to watch list
					{"id": "null",				"action": "watch",		"args": ["p_idx", "encounters\\.order\\.idx", "encounter.order.idx"]},
					{"id": "null",				"action": "watch",		"args": ["party", "encounters\\.order\\.parties", "encounter.order.<$p_idx>"]},
			],

			order: [
				// Was the character party ambushed
				{"id": "encounter",			"action": "read",		"args": ["save_d", "encounter"]},
				{"id": "branch", 			"action": "branch", 	"args": [["<encounter.ambushed>", "isnt"], {"action":"goto","args":["id.parties.next"]}]},
					// Create dummy results since there is no roll for ambush
					{"id": "results", 			"action": "inject", 	"args": ["dice.skill.models.inflate.none_to_oppose", ["enemy_party", 0, "character_party", 0]]},
					{"id": "null",				"action": "goto", 		"args": ["id.order.next"]},
				// Determine how to initiate combat
				{"id": "parties",			"action": "resolve", 	"args": ["character_party", "enemy_party"]},
				{"id": "choice",			"action": "choice", 	"args": ["How will the party start combat?", ["ambush", "attack"]]},
				{"id": "chosen",			"action": "log", 		"args": ["Rolling for: <choice.data>"]},
				// If chose ambush then roll surprise
				{"id": "results", 			"action": "branch", 	"args": [["<choice.0>", "==", 1], {"action":"inject", "args":["combat.setup.surprise", "<parties>"]}]},
				// If chose initiative or failed surprise then roll initiative
				{"id": "results", 			"action": "branch", 	"args": [[["<results.pass>", "==", "2"], "|", ["<choice.0>", "==", 1]], {"action":"inject", "args":["combat.setup.initiative", "<parties>"]}, {"action":"resolve", "args":["<result>"]}]},
				// Save the combat party order
				{"id": "order", 			"action": "branch", 	"args": [["<results.pass>", "==", "1"], 
																				{"action": "write", "args":["save_d", "combat_order", ["<results.1.party>", "<results.2.party>", "reset"]]},
																				{"action": "write", "args":["save_d", "combat_order", ["<results.2.party>", "<results.1.party>", "reset"]]}]},
				{"id": "null",				"action": "return", 	"args": ["<results>"]},
			],

			surprise: [
				["i_party", "d_party"],
				// Get the highest stealth skill from the attacking party 
				{"id": "i_stealth",		"action": "read", 		"args": ["save_d", "<i_party>.*.stats.skill.stealth.total"]},
				{"id": "i_highest_s",	"action": "reduce",		"args": ["<i_stealth>", ">="]},
				// Get the highest perception skill for the defending party
				{"id": "d_perception",	"action": "read", 		"args": ["save_d", "<d_party>.*.stats.skill.perception.total"]},
				{"id": "d_highest_p",	"action": "reduce",		"args": ["<d_perception>", ">="]},
				// Add the listener for the surprise penalty
				{"id": "null",			"action": "inject", 	"args": ["effects.add", ["<i_party>", "<i_highest_s.0>", "/combat.initiate.surprise/", "listener.surprise_companion_penalty"]]},
				// Emit events for triggers on surprise rolls
				{"id": "event", 		"action": "event", 		"args": ["<i_party>.<i_highest_s.0>.stealth.roll.surprise"]},
				{"id": "event", 		"action": "event", 		"args": ["<d_party>.<d_highest_p.0>.perception.roll.surprise"]},
				// Make the opposing roll
				{"id": "results", 		"action": "inject", 	"args": ["dice.skill.oppose", [true,
																			{"party": "<i_party>", "idx": "<i_highest_s>", "keys": ["skill.stealth"], "check": "+skill+stealth+surprise"}, 
																			{"party": "<d_party>", "idx": "<d_highest_p>", "keys": ["skill.perception"], "check": "+skill+perception+initiative"}]]},
				// Handle i_party passing opposed check
				{"id": "on_pass", 			"action": "branch", 	"args": [["<results.pass>", "==", "2"], {"action":"goto", "args": ["id.on_fail.next"]}]},
					{"id": "null",				"action": "inject", 	"args": ["effects.add_to_party", ["<i_party>", "/combat.initiate.surprise_bonus/", "listener.surprise_bonus"]]},
					{"id": "event", 			"action": "event", 		"args": ["combat.surprised"]},
				// Handle i_party failing opposed check
				{"id": "on_fail", 			"action": "branch", 	"args": [["<results.pass>", "==", "1"], {"action":"goto", "args": ["id.return.next"]}]},
					{"id": "null",				"action": "inject", 	"args": ["effects.add", ["<i_party>", "<i_highest_s.0>", "/combat.initiate.surprise/", "listener.surprise_fail_penalty"]]},
				// Return results
				{"id": "return",			"action": "return", 	"args": ["<results>"]},
			],

			initiative: [
				["i_party", "d_party"],
				// Get the highest stealth skill from the initiating party 
				{"id": "i_perception",	"action": "read", 		"args": ["save_d", "<i_party>.*.stats.skill.perception.total"]},
				{"id": "i_highest_p",	"action": "reduce",		"args": ["<a_perception>", ">="]},
				// Get the highest perception skill for the defending party
				{"id": "d_perception",	"action": "read", 		"args": ["save_d", "<d_party>.*.stats.skill.perception.total"]},
				{"id": "d_highest_p",	"action": "reduce",		"args": ["<d_perception>", ">="]},
				// Emit events for triggers on surprise rolls
				{"id": "event", 		"action": "event", 		"args": ["<i_party>.<i_highest_p.0>.perception.roll.initiative"]},
				{"id": "event", 		"action": "event", 		"args": ["<d_party>.<d_highest_p.0>.perception.roll.initiative"]},
				// Make the opposing roll
				{"id": "results", 		"action": "inject", 	"args": ["dice.skill.oppose", [true,
																			{"party": "<i_party>", "idx": "<i_highest_p>", "keys": ["skill.perception"], "check": "+skill+perception+initiative"}, 
																			{"party": "<d_party>", "idx": "<d_highest_p>", "keys": ["skill.perception"], "check": "+skill+perception+initiative"}]]},
				// Return results
				{"id": "return",		"action": "return", 	"args": ["<results>"]},
			],
		},

		destruct: {
			process: [ 

			],

			is_finished: [
				// If enemy_party is empty then return encounter over true
				{"id": "enemies",				"action": "size",		"args": ["save_d", "enemy_party"]},
				{"id": "null",					"action": "branch",		"args": ["<enemies>", null, {"action": "return", "args": [true, "character"]}]},

				// If character_party is empty then return encounter over true
				{"id": "characters",		"action": "read",			"args": ["save_d", "character_party"]},
				{"id": "has_player",		"action": "filter", 		"args": ["<characters.type>", "player", "~", "1:*"]},
				{"id": "null",				"action": "branch",			"args": ["<has_player>", null, {"action": "return", "args": [true, "enemy"]}]},
				
				// Else check flee flag

				// Return false and no party
				{"id": "null",				"action": "return", 		"args": [false, "none"]}
			],

			save: [],
			delete: [],
			rewards: [],
		},

		round: {
			reset: [
				// Reset order_idx
				{"id": "null",			"action": "write", 		"args": ["save_d", "encounter.order.idx", 0]},
				// Reset character idx/turns
				{"id": "null",			"action": "write", 		"args": ["save_d", "character_idx", 0]},
				{"id": "null",			"action": "write", 		"args": ["save_d", "character_turns", []]},
				// Reset enemy idx/turns
				{"id": "null",			"action": "write", 		"args": ["save_d", "enemy_idx", 0]},
				{"id": "null",			"action": "write", 		"args": ["save_d", "enemy_turns", []]},
				// Event round start
				{"id": "event", 		"action": "event", 		"args": ["encounter.round.start"]},
			],

			next: [
				// If the combat__data.party is reset then reset the party turn sets
				{"id": "is_reset",		"action": "branch", 		"args": [["<$p_idx>", ">=", 2], {"action":"inject", "args":["combat.round.reset"]}]},
				// Is character party turn
				{"id": "is_char",		"action": "branch", 		"args": [["<$party>", "!=", "character_party"], {"action":"goto", "args":["id.is_enemy.next"]}]},
					{"id": "char_idx",	"action": "inject",			"args": ["combat.turn.character.choose.who"]},
					{"id": "null",		"action": "inject",			"args": ["combat.turn.resolve", ["character", "<char_idx>"]]},
				// Is enemy party turn
				{"id": "is_enemy",		"action": "branch", 		"args": [["<$party>", "!=", "enemy_party"], {"action":"goto", "args":[]}]},
					{"id": "enemy_idx",	"action": "inject",			"args": ["combat.turn.enemy.choose.who"]},
					{"id": "null",		"action": "inject",			"args": ["combat.turn.resolve", ["enemy", "<enemy_idx>"]]},
				// Increment combat_idx if needed
				{"id": "null",			"action": "inject", 		"args": ["combat.round.increment"]}
			],

			increment: [
				{"id": "p_size",		"action": "size", 			"args": ["save_d", "<$party>_party"]},
				{"id": "t_size",		"action": "size", 			"args": ["save_d", "<$party>_turns"]},
				{"id": "p_idx",			"action": "branch", 		"args": [["<t_size>", ">=", "<p_size>"], {"action":"math", "args":["<$p_idx>", "+", 1]}, {"action":"resolve", "args":["<$p_idx>"]}]},
				{"id": "null",			"action": "write", 			"args": ["save_d", "encounter.order.idx", "<p_idx>"]},
			],
		},

		turn: {
			steps: {
				who: [
					// Choose character's turn
					{"id": "char_names",	"action": "read", 			"args": ["save_d", "character_party.*.name"]},
					{"id": "char_turns",	"action": "read", 			"args": ["save_d", "character_turns"]},
					{"id": "char_left",		"action": "remove", 		"args": ["<char_names>", "<char_turns>"]},

					// Choose from characters not in the character_turns list
					{"id": "result",		"action": "inject", 		"args": ["combat.turn.<$party>.choose.who", ["<char_left>"]]},
					{"id": "character",		"action": "filter", 		"args": ["<char_names>", "<choice.1>", "==", "1:*"]},

					// Save to state
					{"id": "char_idx",		"action": "write", 			"args": ["save_d", "character_idx", "<character.0>"]},
					{"id": "char_turn",		"action": "concat", 		"args": ["save_d", "enemy_turns", "<character.1>"]},
					{"id": "null",			"action": "return", 		"args": ["<character.0>"]},
				],

				action: {
					type: [
						{"id": "type",				"action": "inject", 		"args": ["combat.turn.<$party>.choose.action.type"]},
						// Get action type
						{"id": "null", 				"action": "branch", 		"args": [["<choice.0>", "==", 2], {"action":"return", "args": {"type": false, "name": null}}]},
						{"id": "type", 				"action": "resolve", 		"args": [["<choice.0>", "==", 0],  "free", "standard"]},
						// Return action type
						{"id": "null",   			"action": "return",			"args": ["<type>"]}, 
					],

					get: [
						["char_idx", "type"],
						// Get actions 
						{"id": "actions",			"action": "keys", 			"args": ["save_d", "<$party>.<char_idx>.actions.combat.<type>"]},
						// Get action type id
						{"id": "action",			"action": "inject", 		"args": ["combat.turn.<$party>.choose.action.id", ["<char_left>"]]},
						// Load action and return
						{"id": "action",			"action": "read", 			"args": ["save_d", "<$party>.<char_idx>.actions.combat.<type>.<action.name>"]},
						{"id": "null",   			"action": "return",			"args": ["<action>"]}, 
					],
				},

				target: {
					entity: [
						["char_idx", "action"],
						// Get the action data for targeting party and single or multi target
						{"id": "party_idx",		"action": "math", 		"args": [["<action.target.party>", "+", "<$p_idx>"], "%", 2]},
						{"id": "party_id",		"action": "read", 		"args": ["save_d", "encounter.order.parties.<party_idx>"]},
						{"id": "p_chars",		"action": "read", 		"args": ["save_d", "<party_id>"]},
						// Format lists to choose from for party chars
						{"id": "names",			"action": "math", 		"args": ["<p_chars>", ".", "name"]},
						{"id": "idx_range",		"action": "range", 		"args": ["<p_chars>"]},
						// If is multi targeting then skip target logic and return list of party
						{"id": "is_multi",		"action": "branch", 	"args": [["<action.target.count>", "==", -1], {"action":"return", "args":[{"party": "<party_id>", "chars":"<idx_range>"}]}]},
						// If is self targeting then skip target logic and return own char_idx
						{"id": "is_self",		"action": "branch", 	"args": [["<action.target.count>", "==", 0], 	{"action":"return", "args":[{"party": "<party_id>", "chars":["<char_idx>"]}]}]},
						// Else run targeting logic
						{"id": "p_chars",		"action": "concat", 	"args": ["<p_chars>", "back"]},
						{"id": "target",		"action": "inject", 	"args": ["combat.turn.<$party>.choose.target.entity", ["<action.name>", "<names>"]]},
						{"id": "null",   		"action": "return",		"args": [{"party": "<party_id>", "chars":["<target.0>"]}]},
					],

					body_part: [
						["char_idx", "action", "target"],
						// If it is not a physical attack return
						{"id": "is_physical",	"action": "branch", 	"args": [["<action.check>", "!=", "physical"], 	{"action":"return", "args":[-1]}]},
						// Look up targets body type info
						{"id": "body_type",		"action": "read", 		"args": ["save_d", "<target.party>.<target.chars.0>.body"]},
						{"id": "weak_spot",		"action": "read", 		"args": ["save_d", "<target.party>.<target.chars.0>.biography.body.weak_spot"]},

						// Is a targeted body part attack?
						{"id": "is_aimed",		"action": "inject", 	"args": ["combat.turn.<$party>.choose.target.is_aim", ["<action>"]]},

						// Handle if it is a random body part
						{"id": "is_random",		"action": "branch", 	"args": [["<is_aimed>", "==", 1], 	{"action":"goto", "args":["id.is_aimed.next"]}]},
							{"id": "body_part",		"action": "read", 		"args": ["dice.roll_against_table", ["game_d", "tables.bodies.distribution.<body_type>"]]},
							{"id": "body_part",		"action": "resolve", 	"args": [{"type": "<body_type>", "part": "<body_part>", "weaK": "<weak_spot>"}]},
							{"id": "null",   		"action": "goto", 		"args": ["id.return.next"]}, 

						// Handle if it is a targeted body part
						{"id": "is_aimed",		"action": "branch", 	"args": [["<is_aimed>", "==", 0], 	{"action":"goto", "args":["id.return.next"]}]},
							{"id": "body_parts",	"action": "read", 		"args": ["game_d", "tables.bodies.unique.<body_type>"]},
							{"id": "body_part",		"action": "inject", 	"args": ["combat.turn.<$party>.choose.target.body_part", ["<body_type>", "<weak_spot>", "<body_parts>"]]},
							{"id": "body_part",		"action": "resolve", 	"args": [{"type": "<body_type>", "part": "<body_part>", "weaK": "<weak_spot>"}]},
							{"id": "null",			"action": "inject", 	"args": ["effects.add", ["<$party>", "<char_idx>", "targeted_attack", "listener.target_attack_penalty"]]},

						{"id": "return",   		"action": "return",		"args": ["<body_part>"]}, 
					],
				},
			},

			character: {
				choose: {
					who: [
						["options"],
						// Choose from characters not in the character_turns list
						{"id": "choice",			"action": "choice", 		"args": ["Whose turn is it?", "<options>"]},
						{"id": "null",				"action": "return", 		"args": ["<choice>"]},
					],

					action:{
						type: [
							{"id": "choice",		"action": "choice", 	"args": ["What type of action will <name> take?", ["free", "standard", "end"]]},
							{"id": "null",   		"action": "return",		"args": ["<choice.1>"]}, 
						],

						id: [
							["actions"],
							// Add back option
							{"id": "actions",		"action": "concat", 		"args": ["<actions>", "back"]},
							// Get action type id
							{"id": "choice",		"action": "choice", 	"args": ["Which <type> action?", "<actions>"]},
							{"id": "null",   		"action": "return",		"args": ["<choice.1>"]}, 
						],
					},

					target: {
						entity: [
							["name", "targets"],
							{"id": "p_chars",		"action": "concat", 	"args": ["<p_chars>", "back"]},
							{"id": "choice",		"action": "choice", 	"args": ["<name> targets?", "<targets>"]},
							{"id": "null",   		"action": "return",		"args": ["<choice.1>"]},
						],

						is_aim: [ 
							["action"],
							{"id": "choice",		"action": "choice", 	"args": ["Is <action.name> targeting a body part(-30 combat roll)?", "No (Random)", "Yes (Targeted)"]},
							{"id": "null",   		"action": "return",		"args": ["<choice.1>"]},
						],

						body_part: [
							["body_type", "weak_spot", "<body_parts>"],
							{"id": "choice",		"action": "choice", 	"args": ["For body: <body_type> with weak_spot: <weak_spot> target?", "<body_parts>"]},
							{"id": "return",   		"action": "return",		"args": ["<choice>"]}, 
						],
					},

					reaction: [
						["party", "char_idx", "type", "filters"],
						{"id": "reactions", 			"action": "keys", 		"args": ["save_d", "<party>.<char_idx>.combat.reactions.actions"]},
						{"id": "reactions", 			"action": "remove", 	"args": ["<reactions>", "<filters>"]},
						{"id": "choice",				"action": "choice", 	"args": ["What reaction will you take?", "<reactions>"]},
						{"id": "skill",					"action": "get", 		"args": ["<reactions>", "<choice>"]},
						{"id": "return",				"action": "return", 	"args": ["<skill>"]},
					],

					defensive_maneuver: [
						["party", "char_path"],
						{"id": "result", 			"action": "inject", 	"args": ["dice.roll_against_table", ["game_d", "tables.defensive_maneuvers"]]},
						{"id": "dummy",				"action": "log", 			"args": ["<result.1.desc>"]},
						{"id": "rule",				"action": "branch",		"args": [["<result.1.rule>", "!=", null], {"action":"format", "args":["<result.1.rule>", "<char_path>"]}, null]},
						{"id": "dummy",				"action": "branch", 	"args": [["<rule>", "!=", null], {"action":"inject", "args":["<rule>"]}, null]},
					],
				},
			},

			enemy: {
				choose: {
					who: [
						// Choose character's turn
						{"id": "char_names",	"action": "read", 			"args": ["save_d", "enemy_party.*.name"]},
						{"id": "char_turns",	"action": "read", 			"args": ["save_d", "enemy_party"]},
						{"id": "char_left",		"action": "remove", 		"args": ["<char_names>", "<char_turns>"]},

						// Choose from characters not in the character_turns list
						{"id": "character",		"action": "filter", 		"args": ["<char_names>", "<char_left.0>", "==", "1:*"]},

						// Save to state
						{"id": "char_idx",		"action": "write", 			"args": ["save_d", "enemy_idx", "<character.0>"]},
						{"id": "char_turn",		"action": "concat", 		"args": ["save_d", "enemy_turns", "<character.1>"]},
						{"id": "null",			"action": "return", 		"args": ["<character.0>"]},
					],

					action: [
						["char_idx"],
						{"id": "action_id",		"action": "inject", 	"args": ["dice.roll_against_table", ["save_d", "<$party>.<char_idx>.biography.distribution"]]},
						{"id": "null",   		"action": "return",		"args": [{"type": "standard", "name": "<action_id.1>"}]}, 
					],

					target: [
						["char_idx", "action"],
						// Get the action data for targeting party and single or multi target
						{"id": "party_idx",	"action": "math", 		"args": [["<action.target.party>", "+", "<$p_idx>"], "%", 2]},
						{"id": "party_id",	"action": "math", 		"args": ["save_d", "encounter.order.parties.<party_idx>"]},
						{"id": "p_chars",		"action": "read", 		"args": ["save_d", "<party_id>"]},
						// Format lists to choose from for party chars
						{"id": "names",			"action": "math", 		"args": ["<p_chars>", ".", "name"]},
						{"id": "idx_range",	"action": "range", 		"args": ["<p_chars>"]},
						// If is multi targeting then skip target logic and return list of party
						{"id": "is_multi",	"action": "branch", 	"args": [["<action.target.count>", "==", -1], {"action":"return", "args":[{"party": "<party_id>", "chars":"<idx_range>"}]}]},
						// If is self targeting then skip target logic and return own char_idx
						{"id": "is_self",		"action": "branch", 	"args": [["<action.target.count>", "==", 0], 	{"action":"return", "args":[{"party": "<party_id>", "chars":["<char_idx>"]}]}]},
						// Else run targeting logic
						{"id": "target",		"action": "inject", 	"args": ["dice.roll_against_table", ["save_d", "<party_id>"]]},
						{"id": "null",   		"action": "return",		"args": [{"party": "<party_id>", "chars":["<target.0>"]}]}, 
					],

					body_part: [
						["char_idx", "action", "target"],
						{"id": "action",			"action": "read", 		"args": ["save_d", "<$party>.<char_idx>.actions.combat.<action.type>.<action.name>"]},
						// If it is not a physical attack return
						{"id": "is_physical",	"action": "branch", 	"args": [["<action.check>", "!=", "physical"], 	{"action":"return", "args":[-1]}]},
						// Look up targets body type info
						{"id": "body_type",		"action": "read", 		"args": ["save_d", "<target.party>.<target.chars.0>.body"]},
						{"id": "weak_spot",		"action": "read", 		"args": ["save_d", "<target.party>.<target.chars.0>.biography.weak_spot"]},
						// Is a targeted body part attack? 
						// ToDo add logic to check if it has a defensive move to get +30 and go for a crit
						{"id": "aimed",				"action": "resolve", 	"args": [0]},

						// Handle if it is a random body part
						{"id": "is_random",		"action": "branch", 	"args": [["<is_aimed>", "==", 1], 	{"action":"goto", "args":["id.is_aimed.next"]}]},
							{"id": "body_part",		"action": "read", 		"args": ["dice.roll_against_table", ["game_d", "tables.bodies.distribution.<body_type>"]]},
							{"id": "body_part",		"action": "resolve", 	"args": [{"type": "<body_type>", "part": "<body_part>", "weaK": "<weak_spot>"}]},
							{"id": "null",   			"action": "goto", 		"args": ["id.return.next"]}, 

						// Handle if it is a targeted body part
						{"id": "is_aimed",		"action": "branch", 	"args": [["<is_aimed>", "==", 0], 	{"action":"goto", "args":["id.return.next"]}]},
							{"id": "body_parts",	"action": "read", 		"args": ["game_d", "tables.bodies.unique.<body_type>"]},
							{"id": "body_part",		"action": "choice", 	"args": ["For body: <body_type> with weak_spot: <weak_spot> target?", "<body_parts>"]},
							{"id": "body_part",		"action": "resolve", 	"args": [{"type": "<body_type>", "part": "<body_part>", "weaK": "<weak_spot>"}]},
							{"id": "null",				"action": "inject", 	"args": ["effects.add", ["<$party>", "<char_idx>", "targeted_attack", "listener.target_attack_penalty"]]},

						{"id": "return",   		"action": "return",		"args": ["<body_part>"]}, 
					],

					reaction: [],

					defensive_move: [],
				},
			},

			resolve: [
				["type", "char_idx"],
				// Event turn start
				{"id": "event", 			"action": "event", 		"args": ["<$party>.<char_idx>.combat.turn.start"]},
				// Get character data
				{"id": "name",				"action": "read", 		"args": ["save_d", "<$party>.<char_idx>.name"]},
				// Add listener for decrementing action counters
				{"id": "null",				"action": "inject", 	"args": ["effects.add", ["<$party>", "<char_idx>", "turn", "listener.standard_action"]]},
				{"id": "null",				"action": "inject", 	"args": ["effects.add", ["<$party>", "<char_idx>", "turn", "listener.free_action"]]},
				{"id": "null",				"action": "inject", 	"args": ["effects.add", ["<$party>", "<char_idx>", "turn", "listener.re_action"]]},
				// The start of the loop to go through all character actions
				{"id": "loop_start",		"action": "resolve", 	"args": [true]},
				// Get the current count for free and standard actions
				{"id": "standard",			"action": "inject", 	"args": ["character.attributes.stats.get.total", "<$party>", "<char_idx>", "actions", "standard"]},
				{"id": "free",				"action": "inject", 	"args": ["character.attributes.stats.get.total", "<$party>", "<char_idx>", "actions", "free"]},
				// Display action info and choices
				{"id": "null",				"action": "log", 		"args": ["<name> has free: <free>, standard: <standard>, actions left."]},
				// The exit condition ran out of actions
				{"id": "null", 				"action": "branch", 	"args": [[["<free>", "+", "<standard>"], "<=", 0], {"action":"goto", "args":["id.event.next"]}]},

				// Make action type choice 
				{"id": "type",				"action": "inject", 	"args": ["combat.turn.steps.action.type"]},
				// Chose to end turn
				{"id": "null", 				"action": "branch", 	"args": [["<type>", "==", "end"], {"action":"return"}]},

				// Choose the action of type
				{"id": "action",			"action": "inject", 	"args": ["combat.turn.steps.action.get", ["<char_idx>", "<type.1>"]]},
				// Chose to go back aka restart choice
				{"id": "null", 				"action": "branch", 	"args": [["<action.name>", "==", "back"], {"action":"goto", "args":["id.type.prev"]}]},

				// Choose action target entity
				{"id": "targets",			"action": "inject", 	"args": ["combat.turn.steps.target.entity", ["<char_idx>", "<action>"]]},
				// Chose to go back aka restart choice
				{"id": "null", 				"action": "branch", 	"args": [["<targets.1>", "==", "back"], {"action":"goto", "args":["id.action.prev"]}]},

				// If it is a physical attack then go through body targeting logic
				{"id": "is_physical",	"action": "branch", 	"args": [["<action.check>", "!=", "physical"], {"action":"goto", "args":[-1]}]},
					// Choose action target body part
					{"id": "body",				"action": "inject", 	"args": ["combat.turn.steps.choose.body_part", ["<char_idx>", "<action>", "<targets>"]]},
					// Choose to go back aka restart choice
					{"id": "null", 				"action": "branch", 	"args": [["<targets.1>", "==", "back"], {"action":"goto", "args":["id.action.prev"]}]},

				// Log action choices
				{"id": "null",				"action": "log", 		"args": ["<name> uses: <action.name> (<action.type>) on: <targets.chars>."]},
				// Check if action passes to be applied
				{"id": "null",				"action": "inject", 	"args": ["combat.turn.action.inject", ["<char_idx>", "<action>", "<targets>", "<body>"]]},
				// Loop back to id.loop_start.start
				{"id": "null", 				"action": "goto", 		"args": ["id.loop_start.start"]},
				// Event turn end
				{"id": "event", 			"action": "event", 		"args": ["<$party>.<char_idx>.combat.turn.end"]},
			],

			action: {
				inject: [
					["char_idx", "action", "targets", "body"],
					// Log action choices
					{"id": "name",				"action": "read", 		"args": ["save_d", "<$party>.<char_idx>.name"]},
					{"id": "null",				"action": "log", 		"args": ["<name> uses: <action.name> (<action.type>) on: <targets.chars>."]},
					// Check if action passes to be applied
					{"id": "initiator",			"action": "resolve", 	"args": [{"party": "<$party>", "idx": "<char_idx>"}]},
					{"id": "null",				"action": "loop", 		"args": ["combat.turn.character.action.resolve", "<targets>", ["<char_idx>", "<action>", "$idx$", "<body>"]]},
				],

				resolve: [
					["char_idx", "action", "target_party", "target_idx", "body_part"],
					// Resolve a physical action
					{"id": "physical",				"action": "branch", 	"args": [["<action.check.type>", "==", "oppose"], 	null,	{"action":"goto", "args":["id.magical.next"]}]},
						// A stub for the event response to inject a value into
						{"id": "reaction", 			"action": "resolve", 	"args": [{"skills": ["combat.parry"], "vantage": "+combat+parry"}]},
						{"id": "null", 				"action": "event", 		"args": ["<target_party>.<target_idx>.combat.reaction", "reaction"]},
						// Make the opposing roll
						{"id": "roll_results",		"action": "inject", 	"args": ["dice.skill.oppose", [false,
																						{"party": "<$party>", 			"idx": "<char_idx>", 		"keys": "<action.check.skills>", 		"check": "<action.check.vantage>"}, 
																						{"party": "<target_party>", "idx": "<target_idx>",	"keys": "<reaction.check.skills>",	"check": "<reaction.check.vantage>"}]]},
					
					// Resolve a magical action
					{"id": "magical",				"action": "branch", 	"args": [["<action.check>", "==", "magical"], 	null,	{"action":"goto", "args":["id.none.next"]}]},
						// Vantage is the only way to influence magic rolls as an initiator
						{"id": "i_vantage",				"action": "inject", 	"args": ["character.attributes.checks.get", ["<$party>.<char_idx>", "vantage", "<check>"]]},
						// If initiator has a vantage then apply it to the defender vantage
						{"id": "null",					"action": "branch", 	"args": [["<i_vantage>", "==", 0], {"action": "goto", "args": ["id.results.next"]}]},
							{"id": "i_vantage",				"action": "ifelse", 	"args": [["<i_vantage>", "==", 1], "+", "-"]},
							{"id": "null",					"action": "inject", 	"args": ["effects.add", ["<target_party>", "<target_idx>", "attacker_vantage", "skill.magic_resist.<i_vantage>"]]},
						// Make the skill check roll
						{"id": "roll_results",			"action": "inject", 	"args": ["dice.skill.check", [
																																	{"party": "<target_party>", "idx": "<target_idx>",	"keys": ["skill.magic_resist"],	"check": "skill+magic_resist"}]]},
						{"id": "roll_results",			"action": "inject", 	"args": ["dice.skill.models.inflate.magic_to_oppose", ["<$party>", "<char_idx>", "<roll_results>"]]},
						// If initiator has a vantage then remove it to the defender vantage
						{"id": "null",					"action": "branch", 	"args": [["<i_vantage>", "!=", 0], {"action": "inject", "args": ["effects.delete", ["<target_party>", "<target_idx>", "attacker_vantage", "skill.magic_resist.<i_vantage>"]]}]},

					// Resolve an action that requires no check, (ex: Healing a party member)
					{"id": "none",						"action": "branch", 	"args": [["<action.check>", "==", "none"], 			null,	{"action":"goto", "args":["id.return.next"]}]},
						{"id": "roll_results",				"action": "inject", 	"args": ["dice.skill.models.inflate.none_to_oppose", ["<$party>", "<char_idx>", "<target_party>", "<target_idx>"]]},

					// If initiator passes then trigger the action
					{"id": "i_action",				"action": "branch", 	"args": [["<roll_results.pass>", "==", "1"], null, {"action":"goto", "args":["id.d_action.next"]}]},
						{"id": "action_args", 			"action": "var_sub", 	"args": [0, "<action.rule.1>"]},
						{"id": "null",					"action": "inject", 	"args": ["<action.rule.0>", "<action_args>"]},
					
					// If defender passes an oppose check then event for a defensive maneuver
					{"id": "d_action",				"action": "branch", 	"args": [[["<roll_results.pass>", "==", "2"], "&", ["<action.check.type>", "==", "oppose"]], null, {"action":"goto", "args":["id.return.next"]}]},
						{"id": "null", 					"action": "event", 		"args": ["<target_party>.<target_idx>.combat.defensive.maneuver"]},

					{"id": "return",   			"action": "return",		"args": []}, 
				],
			},
		},

		enemies: {
			generate: [
				["enemy_id", "encounter_key"],
				{"id": "count", 		"action": "read", 		"args": ["game_d", "encounters.<enemy_id>.biography.number"]},
				{"id": "count",			"action": "range", 		"args": ["<count>"]},
				{"id": "null", 			"action": "loop", 		"args": ["combat.enemies.add", "<count>", ["<enemy_id>", "$idx$"]]},
				{"id": "null", 			"action": "return", 	"args": ["<count>"]},
			],

			add: [
				["enemy_id", "key"],
				{"id": "enemy", 			"action": "copy", 		"args": ["game_d", "models.character"]},
				{"id": "enemy", 			"action": "concat", 	"args": ["save_d", "enemy_party", "<enemy>"]},
				{"id": "entries", 			"action": "copy", 		"args": ["game_d", "encounters.<type>.<enemy_id>"]},
				{"id": "entries", 			"action": "entries", 	"args": ["<entries>"]},
				{"id": "size", 				"action": "size", 		"args": ["<entries>"]},
				// Create iter
				{"id": "iter", 				"action": "resolve", 	"args": [-1]},
				{"id": "iter", 				"action": "math", 		"args": ["<iter>", "+", 1]},
				// Update the entries of the enemy with its data values
				{"id": "entry", 			"action": "get", 			"args": ["<entries>", "<iter>"]},
				{"id": "enemy", 			"action": "set_at", 	"args": ["save_d", "enemy_party.<enemy.idx>.<entry.0>", "<entry.1>"]},
				{"id": "null",				"action": "inject", 	"args": ["effects.add", ["enemy_party", "<enemy.idx>", "death", "listener.death_check"]]},
				{"id": "null", 				"action": "branch", 	"args": [["<iter>", "<", "<size>"], {"action":"goto","args":["id.iter.prev"]}]},
			],

			reset: [
				["party", "idx", "enemy"],
				{"id": "max_hp",			"action": "inject", 	"args": ["character.attributes.stats.get.total", ["<party>", "<idx>", "base", "health"]]},
				{"id": "null",				"action": "inject", 	"args": ["character.attributes.stats.points.minus", ["<party>", "<idx>", "base", "health", "<all_dealt>"]]},
			],

			load: [
				["flag"],
				{"id": "count", 			"action": "size", 	"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>.data.<flag>.enemies"]},
				{"id": "enemies", 			"action": "read", 	"args": ["save_d", "domains.<$d_idx>.map.<$y>.<$x>.data.<flag>.enemies"]},
				{"id": "null", 				"action": "write", 	"args": ["save_d", "enemy_party", "<enemies>"]},
				// ToDo put in logic to reset enemy health and conditions if camped between combat

				{"id": "null", 				"action": "return", 	"args": ["<count>"]},
			],

			delete: [],
		},
	},

	// ------------------------------------------------------------------------------------------------------- Dice
	dice: {
		rolls: {
			re_roll: [
				["value"],
				{"id": "null",			"action": "goto", 					"args": ["<parent_process>", "<value>"]},
				{"id": "null", 			"action": "log",					"args": ["------- Re-Rolling -------"]}
			],
	
			set_roll: [
				["value", "new_roll", "max"],
				{"id": "idx", 			"action": "goto", 				"args": ["<parent_process>", "<value>"]},
				{"id": "roll",			"action": "clamp", 				"args": ["<new_roll>", 0, "<max>"]},
				{"id": "roll_p", 		"action": "math", 				"args": ["<roll>", "+", 1]},
				{"id": "null", 			"action": "step_result",		"args": ["<parent_process>", "<idx>", "<roll>"]},
				{"id": "null", 			"action": "log",				"args": [`------- Roll set to: <roll_p> -------`]}
			],
	
			set_vantage_roll: [
				["values", "new_roll", "max"],
				// The roll to set to
				{"id": "roll",			"action": "clamp", 					"args": ["<new_roll>", 0, "<max>"]},
				{"id": "roll_p", 		"action": "math", 					"args": ["<roll>", "+", 1]},
				// Set up iterator for values
				{"id": "count", 		"action": "size", 					"args": ["<values>"]},
				{"id": "iter", 			"action": "resolve", 				"args": [[-1, "<count>"]]},
				// Increment iterator
				{"id": "incr", 			"action": "math", 					"args": ["<iter.0>", "+", 1]},
				{"id": "iter", 			"action": "set", 					"args": ["<iter>", 0, "<incr>"]},
				// Basic until loop to set all the rolls (must start with the first and work forward)
				{"id": "value", 		"action": "get", 					"args": ["<values>", "<iter.0>"]},
				{"id": "idx", 			"action": "goto", 					"args": ["<parent_process>", "<value>"]},
				{"id": "null", 			"action": "step_result",			"args": ["<parent_process>", "<idx>", "<roll>"]},
				// Determine if all the values have been processed
				{"id": "null", 			"action": "branch", 				"args": [["<iter.0>", "<", "<iter.1>"], {"action":"goto","args":["id.incr.prev"]}]},
				{"id": "null", 			"action": "log",					"args": [`------- Roll set to: <roll_p> -------`]}
			],
	
			roll: [
				["die", "desc"],
				{"id": "roll", 		"action": "roll", 		"args": ["<die>"]},
				{"id": "roll_p", 	"action": "math", 		"args": ["<roll>", "+", 1]},
				{"id": "confirm",	"action": "confirm",	"args": ["Rolled a (<roll_p>/<die>) for <desc>.", ["Next",true], ["Set", "dice.rolls.set_roll", "action.roll.prev", "<die>"], ["Reroll", "dice.rolls.re_roll", "action.roll.prev"]]},
				{"id": "return",	"action": "return", 	"args": ["<roll>"]},
			],
	
			save_roll: [
				["die", "desc", "path"],
				{"id": "roll", 		"action": "roll", 		"args": ["<die>"]},
				{"id": "roll_p", 	"action": "math", 		"args": ["<roll>", "+", 1]},
				{"id": "confirm",	"action": "confirm",	"args": ["Rolled a (<roll_p>/<die>) for <desc>.", ["Next",true], ["Set", "dice.rolls.set_roll", "action.roll.prev", "<die>"], ["Reroll", "dice.rolls.re_roll", "action.roll.prev"]]},
				{"id": "save",		"action": "write", 		"args": ["save_d", "<path>", "<lookup>"]},
				{"id": "return",	"action": "return", 	"args": ["<lookup>"]},
			],
	
			roll_plus_one: [
				["die", "desc"],
				{"id": "roll", 		"action": "roll", 		"args": ["<die>"]},
				{"id": "roll_p", 	"action": "math", 		"args": ["<roll>", "+", 1]},
				{"id": "confirm",	"action": "confirm",	"args": ["Rolled a (<roll_p>/<die>) for <desc>.", ["Next",true], ["Set", "dice.rolls.set_roll", "action.roll.prev", "<die>"], ["Reroll", "dice.rolls.re_roll", "action.roll.prev"]]},
				{"id": "return",	"action": "return", 	"args": ["<roll_p>"]},
			],
	
			save_roll_plus_one: [
				["die", "desc", "path"],
				{"id": "roll", 		"action": "roll", 		"args": ["<die>"]},
				{"id": "roll_p", 	"action": "math", 		"args": ["<roll>", "+", 1]},
				{"id": "confirm",	"action": "confirm",	"args": ["Rolled a (<roll_p>/<die>) for <desc>.", ["Next",true], ["Set", "dice.rolls.set_roll", "action.roll.prev", "<die>"], ["Reroll", "dice.rolls.re_roll", "action.roll.prev"]]},
				{"id": "save",		"action": "write", 		"args": ["save_d", "<path>", "<roll_p>"]},
				{"id": "return",	"action": "return", 	"args": ["<roll_p>"]},
			],
	
			roll_against_table: [
				["data_set", "path"],
				{"id": "size",		"action": "size", 		"args": ["<data_set>", "<path>"]},
				{"id": "roll", 		"action": "roll", 		"args": ["<size>"]},
				{"id": "lookup",	"action": "lookup",		"args": ["<data_set>", "<path>", "<roll>"]},
				{"id": "roll_p", 	"action": "math", 		"args": ["<roll>", "+", 1]},
				{"id": "confirm",	"action": "confirm",	"args": ["Rolled a (<roll_p>/d<size>) on Table(<path>): <lookup>.", ["Next",true], ["Set", "dice.rolls.set_roll", "action.roll.prev", "<size>"], ["Reroll", "dice.rolls.re_roll", "action.roll.prev"]]},
				{"id": "return",	"action": "return", 	"args": [["<roll>", "<lookup>"]]},
			],
	
			lookup_against_table: [
				["path", "roll"],
				{"id": "lookup",	"action": "lookup",		"args": ["game_d", "<path>", "<roll>"]},
				{"id": "confirm",	"action": "notify",		"args": ["Table(<path>) resolves to: <lookup>."]},
				{"id": "return",	"action": "return", 	"args": ["<lookup>"]},
			],
	
			save_roll_against_table: [
				["table", "path"],
				{"id": "size",		"action": "size", 		"args": ["game_d", "<table>"]},
				{"id": "roll", 		"action": "roll", 		"args": ["<size>"]},
				{"id": "lookup",	"action": "lookup",		"args": ["game_d", "<table>", "<roll>"]},
				{"id": "roll_p", 	"action": "math", 		"args": ["<roll>", "+", 1]},
				{"id": "confirm",	"action": "confirm",	"args": ["Rolled a (<roll_p>/d<size>) on Table(<table>): <lookup>", ["Next",true], ["Set", "dice.rolls.set_roll", "action.roll.prev", "<size>"], ["Reroll", "dice.rolls.re_roll", "action.roll.prev"]]},
				{"id": "save",		"action": "write", 		"args": ["save_d", "<path>", "<lookup>"]},
				{"id": "return",	"action": "return", 	"args": ["<lookup>"]},
			],
		},

		usage: {
			check: [
				["die_path", "desc", "injectable", "resetable"],
				{"id": "die",		"action": "read", 		"args": ["save_d", "<die_path>"]},
				{"id": "roll", 		"action": "roll", 		"args": ["<die.0>"]},
				{"id": "roll_p", 	"action": "math", 		"args": ["<roll>", "+", 1]},
				{"id": "confirm",	"action": "confirm",	"args": ["Rolled a (<roll_p>/d<die.0>) on <desc>:(<=2 fail).", ["Next",true], ["Set", "dice.rolls.set_roll", "action.roll.prev", "<die.0>"], ["Reroll", "dice.rolls.re_roll", "action.roll.prev"]]},
				{"id": "die", 		"action": "branch", 	"args": [["<roll>", "<", 2],  {"action":"inject", "args":["dice.usage.fail", ["<die>", "<die_path>", 2]]}, {"action":"resolve", "args":["<die>"]}]},
				{"id": "event", 	"action": "branch", 	"args": [["<die.0>", "<", 4], {"action":"inject", "args":["<injectable>"]}, null]},
				{"id": "die", 		"action": "branch", 	"args": [[["<die.0>", "<", 4], "&", "<resetable>"], {"action":"inject", "args":["dice.usage.reset", ["<die_path>"]]}, {"action":"resolve", "args":["<die>"]}]},
				{"id": "return",	"action": "return", 	"args": ["<die>"]},
			],
	
			reduce: [
				["die_path", "desc", "injectable", "resetable", "by"],
				{"id": "die",		"action": "read", 		"args": ["save_d", "<die_path>"]},
				{"id": "die", 		"action": "inject", 	"args": ["dice.usage.fail", ["<die>", "<die_path>", "<by>"]]},
				{"id": "event", 	"action": "branch", 	"args": [["<die.0>", "<", 4], {"action":"inject", "args":["<injectable>"]}, null]},
				{"id": "die", 		"action": "branch", 	"args": [[["<die.0>", "<", 4], "&", "<resetable>"], {"action":"inject", "args":["dice.usage.reset", ["<die_path>"]]}, {"action":"resolve", "args":["<die>"]}]},
				{"id": "return",	"action": "return", 	"args": ["<die>"]},
			],
	
			fail: [
				["die", "die_path", "by"],
				{"id": "die",			"action": "resolve", 	"args": ["<die>"]},
				{"id": "die_0",			"action": "math", 		"args": ["<die.0>", "-", "<by>"]},
				{"id": "n_die",			"action": "write", 		"args": ["save_d", "<die_path>", ["<die_0>", "<die.1>"]]},
				{"id": "die_name",		"action": "at", 		"args": ["<die_path>", -1]},
				{"id": "notify",		"action": "notify",		"args": ["Reduced <die_name> die to a d<die_0>."]},
				{"id": "return",		"action": "return", 	"args": ["<n_die>"]},
			],
	
			reset: [
				["die_path"],
				{"id": "die",			"action": "read", 		"args": ["save_d", "<die_path>"]},
				{"id": "write",			"action": "write", 		"args": ["save_d", "<die_path>", ["<die.1>", "<die.1>"]]},
				{"id": "die_name",		"action": "at", 		"args": ["<die_path>", -1]},
				{"id": "notify",		"action": "notify",		"args": ["Reset <die_name> die to a d<die.1>."]},
			],
		},

		skill: {
			roll: [
				["die", "desc", "vantage", "threshold"],
				// Roll 2 die
				{"id": "roll_1", 		"action": "roll", 			"args": ["<die>"]},
				{"id": "roll_2", 		"action": "roll", 			"args": ["<die>"]},
				{"id": "roll_1p", 		"action": "math", 			"args": ["<roll_1>", "+", 1]},
				{"id": "roll_2p", 		"action": "math", 			"args": ["<roll_2>", "+", 1]},
				// Determine if rolls pass and are critical
				{"id": "r1_crit", 		"action": "palindrome", 	"args": ["<roll_1p>"]},
				{"id": "r2_crit", 		"action": "palindrome", 	"args": ["<roll_2p>"]},
				{"id": "r1_pass", 		"action": "math", 			"args": ["<roll_1p>", "<=", "<threshold>"]},
				{"id": "r2_pass", 		"action": "math", 			"args": ["<roll_2p>", "<=", "<threshold>"]},
				{"id": "lowest",		"action": "ifelse",			"args": [["<roll_1p>", "<", "<roll_2p>"], "<roll_1p>", "<roll_2p>"]},
				{"id": "highest",		"action": "ifelse",			"args": [["<roll_1p>", ">", "<roll_2p>"], "<roll_1p>", "<roll_2p>"]},
				// Process logic for advantage roll
				{"id": "advantage",		"action": "branch", 		"args": [["<vantage>", "<", 1], {"action": "goto", "args": ["id.disadvantage.next"]}]},
					{"id": "is_roll1",	"action": "math", 				"args": [["<r1_pass>"], "&", [["<r2_pass>", "==", false], "|", [["<roll_p1>", "==", "<highest>"], "&", [["<r2_crit>", "==", false], "|", "<r1_crit>"]]]]},
					{"id": "result",	"action": "branch",				"args": [["<is_roll1>", "|", [["<r2_pass>", "==", false], "&" ["<roll_p1>", "==", "<lowest>"]]],
																					{"action": "inject", "args": ["dice.skill.model.roll", ["<threshold>", "<roll_1p>", "<r1_crit>", "<r1_pass>"]]},
																					{"action": "inject", "args": ["dice.skill.model.roll", ["<threshold>", "<roll_2p>", "<r2_crit>", "<r2_pass>"]]}]},
				// Process logic for disadvantage
				{"id": "disadvantage",	"action": "branch", 		"args": [["<vantage>", ">", -1], {"action": "goto", "args": ["id.neutral.next"]}]},
					{"id": "is_roll1",	"action": "math", 				"args": [["<r1_pass>", "==", false], "|", [["<r2_pass>"], "&", [["<roll_p1>", "==", "<lowest>"], "&", [["<r1_crit>", "==", false], "|", "<r2_crit>"]]]]},
					{"id": "result",		"action": "branch",			"args": [["<is_roll1>", "|", ["<r2_pass>", "&" ["<roll_p1>", "==", "<highest>"]]], 
																					{"action": "inject", "args": ["dice.skill.model.roll", ["<threshold>", "<roll_1p>", "<r1_crit>", "<r1_pass>"]]},
																					{"action": "inject", "args": ["dice.skill.model.roll", ["<threshold>", "<roll_2p>", "<r2_crit>", "<r2_pass>"]]}]},
				// Process logic for neutral
				{"id": "neutral",		"action": "branch", 		"args": [["<vantage>", "!=", 0], {"action": "goto", "args": ["id.confirm.next"]}]},
					{"id": "result",		"action": "inject",			"args": ["dice.skill.model.roll", ["<threshold>", "<roll_1p>", "<r1_crit>", "<r1_pass>"]]},
				// Determine sentence prefix
				{"id": "prefix", 		"action": "resolve", 		"args": ["Roll: (<roll_1p>/<die>)"]},
				{"id": "prefix", 		"action": "ifelse", 		"args": [["<vantage>", "==", 1], "Advantaged roll: ([<roll_1p>, <roll_2p>]/<die>)", "<prefix>"]},
				{"id": "prefix", 		"action": "ifelse", 		"args": [["<vantage>", "==", -1], "Disadvantaged roll: ([<roll_1p>, <roll_2p>]/<die>)", "<prefix>"]},
				// Send the result to the user to confirm results
				{"id": "confirm",		"action": "confirm",		"args": ["<prefix> result: <result.pass> (<result.roll>/<result.threshold>) for <desc>.", ["Next",true], ["Set", "dice.rolls.set_vantage_roll", ["id.roll_1.start", "id.roll_2.next"], "<die>"], ["Reroll", "dice.rolls.re_roll", "id.roll_1.start"]]},
				{"id": "return",		"action": "return", 		"args": ["<result>"]},
			],

			resolve: [
				["i", "d"],
				// Initiator check
				{"id": "passing_roll",	"action": "branch", 		"args": [
					["<i.roll.pass>", "&", ["<d.roll.pass>", "==", false]], "|", [
						["<i.roll.pass>", "^", "<d.roll.pass>"], "&", [
							[["<i.roll.roll>",  ">", "<d.roll.roll>"], "&", ["<d.roll.crit>",		"==", false]],
							"|",
							[["<i.roll.roll>", "==", "<d.roll.roll>"], "&", ["<i.roll.threshold>", ">=", "<d.roll.threshold>"]],
							"|",
							[["<i.roll.roll>", "<",  "<d.roll.roll>"], "&", ["<i.roll.crit>", "&", ["<d.roll.crit>", "==", false]]]
						]
					],
					{"action": "resolve", "args": ["1"]}, {"action": "resolve", "args": ["0"]}]
				},
				// Defender check
				{"id": "passing_roll",	"action": "branch", 		"args": [
					["<d.roll.pass>", "&", ["<i.roll.pass>", "==", false]], "|", [
						["<d.roll.pass>", "^", "<i.roll.pass>"], "&", [
							[["<d.roll.roll>",  ">", "<i.roll.roll>"], "&", ["<i.roll.crit>",		"==", false]],
							"|",
							[["<d.roll.roll>", "==", "<i.roll.roll>"], "&", ["<d.roll.threshold>", ">=", "<i.roll.threshold>"]],
							"|",
							[["<d.roll.roll>", "<",  "<i.roll.roll>"], "&", ["<d.roll.crit>", "&", ["<i.roll.crit>", "==", false]]]
						]
					],
					{"action": "resolve", "args": ["2"]}, {"action": "resolve", "args": ["<passing_roll>"]}]
				},
				// Determine failing roll from passing roll
				{"id": "failing_roll",	"action": "ifelse", 		"args": [["<passing_roll>", "==", "1"], "2", "0"]},
				{"id": "failing_roll",	"action": "ifelse", 		"args": [["<passing_roll>", "==", "2"], "1", "<failing_roll>"]},
				// Format and return results
				{"id": "results",		"action": "inject",			"args": ["dice.skill.model.oppose", ["<passing_roll>", "<failing_roll>", "<i>", "<d>"]]},
				{"id": "null",			"action": "return",			"args": ["<results>"]},
			],

			check: [
					["party", "char_idx", "keys", "check"],
					{"id": "skills",			"action": "loop",		"args": ["character.attributes.stats.get.total", "<keys>", ["<party>", "<char_idx>", "$idx$", null]]},
					{"id": "values",			"action": "math",		"args": ["<skills>", ".", "value"]},
					{"id": "total",				"action": "reduce",		"args": ["<values>", "+", 0]},
					{"id": "modifier",			"action": "choice",		"args": ["Add skill check modifiers", [0,10,20,30,40,50,-10,-20,-30,-40,-50]]},
					{"id": "total",				"action": "math",		"args": ["<total.1>", "+", "<modifier.data>"]},
					{"id": "vantage",			"action": "inject",		"args": ["character.attributes.checks.get", ["<party>.<char_idx>", "vantage", "<check>"]]},
					{"id": "roll",				"action": "inject",		"args": ["dice.skill.roll", [100, "check <keys>", "<vantage>", "<total>"]]},
					{"id": "results",			"action": "inject",		"args": ["dice.skill.model.skill_check", ["<party>", "<char_idx>", "<keys>", "<check>", "<roll>"]]},
					{"id": "null",				"action": "return",		"args": ["<results>"]},
			],

			oppose: [
				["reroll_until_winner", "initiator", "defender"],
				// Skill check roll for initiator
				{"id": "initiator", "action": "inject", 	"args": ["dice.skill.check", ["<initiator.party>", "<initiator.idx>", "<initiator.keys>", "<initiator.check>"]]},
				// Skill check roll for defender
				{"id": "defender", 	"action": "inject", 	"args": ["dice.skill.check", ["<defender.party>", "<defender.idx>", "<defender.keys>", "<defender.check>"]]},
				// Inject resolve to figure out which roll wins
				{"id": "results", 	"action": "inject", 	"args": ["dice.skill.resolve", ["<initiator>", "<defender>"]]},
				// If no one won the roll and reroll_until_winner is true then redo the check
				{"id": "null", 		"action": "branch", 	"args": [["<reroll_until_winner>", "&" ["<results.pass>", "==", "0"]], null, {"action": "goto", "args":["id.return.next"]}]},
					{"id": "null", 		"action": "log", 			"args": ["Both parties failed their respective rolls, re-rolling."]},
					{"id": "null", 		"action": "goto", 		"args": ["id.initiator.start"]},
				// Return the roll results
				{"id": "null",		"action": "return", 	"args": ["<results>"]},
			],

			model: {
				inflate: {
					magic_to_oppose: [
						["i_party", "i_idx", "<d_check>"],
						// Use the defender skill_check to determine the outcome for the initiator
						{"id": "pass_idx",	"action": "ifelse", 		"args": ["<d_check.roll.pass>", "1", "2"]},
						{"id": "fail_idx",	"action": "ifelse", 		"args": ["<d_check.roll.pass>", "2", "1"]},
						{"id": "is_pass",	"action": "math", 			"args": ["<d_check.roll.pass>", "==", false]},
						{"id": "is_crit",	"action": "math", 			"args": [["<d_check.roll.pass>", "==", false], "&", "<d_check.roll.crit>"]},
						// Inflate the models for roll, skill check, and oppose
						{"id": "i_roll",	"action": "inject",			"args": ["dice.skill.model.roll", ["<d_check.roll.threshold>", "<d_check.roll.roll>", "<is_crit>", "<is_pass>"]]},
						{"id": "i_check", 	"action": "inject", 		"args": ["dice.skill.model.skill_check", ["<i_party>", "<i_idx>", "<i_roll>"]]},
						{"id": "oppose",	"action": "return",			"args": [{"pass": "<pass_idx>", "fail": "<fail_idx>", "1": "<i_check>", "2": "<d_check>"}]},
						{"id": "null",		"action": "return",			"args": ["<oppose>"]},
					],

					none_to_oppose: [
						["i_party", "i_idx", "d_party", "d_idx"],
						// Inflate rolls
						{"id": "i_roll",			"action": "inject",		"args": ["dice.skill.model.roll", [1, 0, false, true]]},
						{"id": "d_roll",			"action": "inject",		"args": ["dice.skill.model.roll", [0, 0, false, false]]},
						// Inflate checks
						{"id": "i_check", 			"action": "inject", 	"args": ["dice.skill.model.skill_check", ["<i_party>", "<i_idx>", "<i_roll>"]]},
						{"id": "d_check", 			"action": "inject", 	"args": ["dice.skill.model.skill_check", ["<d_party>", "<d_idx>", "<d_roll>"]]},
						// Inflate oppose
						{"id": "oppose", 			"action": "inject", 	"args": ["dice.skill.model.oppose", ["1", "2", "<e_check>", "<c_check>"]]},
						// Return model
						{"id": "null",				"action": "return",		"args": ["<oppose>"]},
					],
				},

				oppose: [
					["passing", "failing", "i", "d"],
					{"id": "oppose",	"action": "return",			"args": [{"pass": "<passing>", "fail": "<failing>", "1": "<i>", "2": "<d>"}]},
					{"id": "null",		"action": "return",			"args": ["<oppose>"]},
				],

				skill_check: [
					["party", "char_idx", "skills", "vantage", "roll"],
					{"id": "skill_check",	"action": "resolve",		"args": [{"party": "<party>", "idx": "<char_idx>", "skills": "<skills>", "vantage": "<vantage>", "roll": "<roll>"}]},
					{"id": "null",			"action": "return",			"args": ["<skill_check>"]},
				],

				roll: [
					["threshold", "roll", "crit", "pass"],
					{"id": "roll",		"action": "resolve",		"args": [{"threshold": "<threshold>", "roll": "<roll>", "crit": "<crit>", "pass": "<pass>"}]},
					{"id": "null",		"action": "return",			"args": ["<roll>"]},
				],
			}
		},
	},

	loot: {
		roll_armor: [
			{"id": "armor", 	"action": "inject", 	"args": ["dice.rolls.roll_against_table", ["game_d", "tables.items.distribution.random.armor"]]},
			{"id": "type",		"action": "branch", 	"args": [["<armor.0>", ">", 17], 
																											{"action": "inject", "args":["dice.rolls.roll_against_table", ["game_d", "tables.items.distribution.random.shield"]]}, 
																											{"action": "inject", "args":["dice.rolls.roll_against_table", ["game_d", "tables.items.distribution.random.material"]]}]},
			{"id": "armors", 	"action": "branch", 	"args": [["<armor.0>", "<", 2], 
																											{"action": "read", "args":["game_d", "tables.items.distribution.suit"]}, 
																											{"action": "resolve", "args":[["<armor.1>"]]}]},
			{"id": "gear",		"action": "loop",			"args": ["loot.suit_to_pieces", "<armors>", ["$idx$", "<type.1>"]]},
			{"id": "null", 		"action": "return", 	"args": ["<gear>"]},
		],
		
		suit_to_pieces: [
			["armor", "type"],
			{"id": "gear", 		"action": "read", 		"args": ["game_d", "tables.items.<armor>.<type>"]},
			{"id": "null", 		"action": "return", 	"args": ["<gear>"]},
		],
	},

	// ------------------------------------------------------------------------------------------------------- Character
	character: {
		creation: {
			wizard: [
				["char_idx"],
				// Wire up Context and Audiences for character events
				{"id": "null",				"action": "context",	"args": ["character_party.0", "+", ["^character_party\\.[<char_idx>\\*]"]]},
				{"id": "null",				"action": "audience",	"args": ["character_party.0:default",		"+", {"start": "character_party.[<char_idx>\\*].create", "delete": "character_party.[<char_idx>\\*].die"}]},
				{"id": "null",				"action": "audience",	"args": ["character_party.0:traverse",	"+", {"start": "character_party.[<char_idx>\\*].traverse", "stop": "character_party.[<char_idx>\\*].[camp|combat]",			"delete": "character_party.[<char_idx>\\*].die"}]},
				{"id": "null",				"action": "audience",	"args": ["character_party.0:camp", 			"+", {"start": "character_party.[<char_idx>\\*].camp", 		"stop": "character_party.[<char_idx>\\*].[traverse|combat]",	"delete": "character_party.[<char_idx>\\*].die"}]},
				{"id": "null",				"action": "event", 		"args": ["character_party.<char_idx>.create"]},
				// Generate the character from the model
				{"id": "log",				"action": "log", 		"args": ["------------- Character Creation ------------"]},
				{"id": "copy", 				"action": "copy",		"args": ["game_d", "models.character"]},
				{"id": "sheet",				"action": "write",		"args": ["save_d", "character_party.<char_idx>", "<copy>"]},
				// Set the character name
				{"id": "name",				"action": "profile",	"args": []},
				{"id": "save",				"action": "write", 		"args": ["save_d", "character_party.<char_idx>.name", "<name>"]},
				// Intro text
				{"id": "intro",				"action": "read", 		"args": ["game_d", "emersion_text.general.introduction"]},
				{"id": "intro",				"action": "format",		"args": ["<intro>", "<name>"]},
				{"id": "notify",			"action": "notify", 	"args": ["<intro>"]},
				// Roll for Crime
				{"id": "notify",			"action": "notify", 	"args": ["They were thrown into Underverse for having committed the crime of: "]},
				{"id": "inject", 			"action": "inject", 	"args": ["dice.rolls.save_roll_against_table", ["tables.crimes", "character_party.<char_idx>.biography.crime"]]},
				// Set Merits
				{"id": "log",				"action": "log", 		"args": ["---------------- Merits ---------------"]},
				{"id": "merits",			"action": "modal",		"args": ["select_multi", "Merits", [0,2], "game_d", "tables.merits"]},
				{"id": "na_flaws",			"action": "loop",		"args": ["character.biography.activate_entry", "<merits>", ["merits", "$idx$", "<char_idx>"]]},
				// Set Flaws
				{"id": "log",				"action": "log", 		"args": ["----------------- Flaws ---------------"]},
				{"id": "all_flaws",			"action": "keys", 		"args": ["game_d", "tables.flaws"]},
				{"id": "fltr_flaws",		"action": "remove", 	"args": ["<all_flaws>", "<na_flaws>"]},
				{"id": "m_count",			"action": "size", 		"args": ["<merits>"]},
				{"id": "flaws",				"action": "modal",		"args": ["select_multi", "Flaws", ["<m_count>","<m_count>"], null, "<fltr_flaws>"]},
				{"id": "null",				"action": "loop",		"args": ["character.biography.activate_entry", "<flaws>", ["flaws", "$idx$", "<char_idx>"]]},
				// Roll for Health
				{"id": "log",				"action": "log", 		"args": ["---------------- Attributes ---------------"]},
				{"id": "h_die",				"action": "event", 		"args": ["character_party.0.stats.health.roll", 6]},
				{"id": "log",				"action": "log", 		"args": ["Rolling for <name>'s Health: d<h_die> + 8"]},
				{"id": "inject", 			"action": "inject", 	"args": ["dice.rolls.roll_plus_one", ["<h_die>", "Health"]]},
				{"id": "modifier",			"action": "math", 		"args": ["<inject>", "+", 8]},
				{"id": "null",				"action": "inject", 	"args": ["character.attributes.stats.add", ["character_party.<char_idx>", "base", "health", {"base": "<modifier>", "max": "<modifier>"}]]},
				{"id": "log",				"action": "log", 		"args": ["<name>'s Health is <modifier>"]},
				// Roll for Toughness
				{"id": "t_die",				"action": "event", 		"args": ["character_party.0.stats.toughness.roll", 6]},
				{"id": "log",				"action": "log", 		"args": ["Rolling for <name>'s Toughness: 2d<t_die> + 8"]},
				{"id": "inject", 			"action": "inject", 	"args": ["dice.rolls.roll_plus_one", ["<t_die>", "Toughness"]]},
				{"id": "modifier",			"action": "math", 		"args": ["<inject>", "+", 8]},
				{"id": "inject", 			"action": "inject", 	"args": ["dice.rolls.roll_plus_one", ["<t_die>", "Toughness"]]},
				{"id": "modifier",			"action": "math", 		"args": ["<inject>", "+", "<modifier>"]},
				{"id": "null",				"action": "inject", 	"args": ["character.attributes.stats.add", ["character_party.<char_idx>", "base", "toughness", {"base": "<modifier>", "max": "<modifier>"}]]},
				{"id": "log",				"action": "log", 		"args": ["<name>'s Toughness is <modifier>"]},
				// Roll for Aether
				{"id": "a_die",				"action": "event", 		"args": ["character_party.0.stats.aether.roll", 6]},
				{"id": "log",				"action": "log", 		"args": ["Rolling for <name>'s Aether: d<a_die> + 8"]},
				{"id": "inject", 			"action": "inject", 	"args": ["dice.rolls.roll_plus_one", ["<a_die>", "Aether"]]},
				{"id": "modifier",			"action": "math", 		"args": ["<inject>", "+", 8]},
				{"id": "null",				"action": "inject", 	"args": ["character.attributes.stats.add", ["character_party.<char_idx>", "base", "aether", {"base": "<modifier>", "max": "<modifier>"}]]},
				{"id": "log",				"action": "log", 		"args": ["<name>'s Aether is <modifier>"]},
				// Roll for Sanity
				{"id": "s_die",				"action": "event", 		"args": ["character_party.0.stats.sanity.roll", 6]},
				{"id": "log",				"action": "log", 		"args": ["Rolling for <name>'s Sanity: d<s_die> + 8"]},
				{"id": "inject", 			"action": "inject", 	"args": ["dice.rolls.roll_plus_one", ["<s_die>", "Sanity"]]},
				{"id": "modifier",			"action": "math", 		"args": ["<inject>", "+", 8]},
				{"id": "null",				"action": "inject", 	"args": ["character.attributes.stats.add", ["character_party.<char_idx>", "base", "sanity", {"base": "<modifier>", "max": "<modifier>"}]]},
				{"id": "log",				"action": "log", 		"args": ["<name>'s Sanity is <modifier>"]},
				// Set Magic Resist
				{"id": "null",				"action": "inject", 	"args": ["character.attributes.stats.add", ["character_party.<char_idx>", "skill", "magic_resist", {"base": 20, "max": 20}]]},
				{"id": "log",				"action": "log", 		"args": ["<name>'s Magic Resist is 20"]},
				{"id": "log",				"action": "log", 		"args": ["------------------- Skills ------------------"]},
				// Set Primary Weapon Skill
				{"id": "null", 				"action": "inject", 	"args": ["character.creation.skill_setup", ["skills.weapon", "Pick <name>'s primary weapon skill (+60)", "character_party", "<char_idx>", "weapon", {"base": 60}, "<name>"]]},
				// Set Secondary Weapon Skill
				{"id": "null", 			 	"action": "inject", 	"args": ["character.creation.skill_setup", ["skills.weapon", "Pick <name>'s secondary weapon skill (+40)", "character_party", "<char_idx>", "weapon", {"base": 40}, "<name>"]]},
				// Set Primary Skills x3
				{"id": "s_range",			"action": "range", 		"args": [3]},
				{"id": "null", 				"action": "loop",		"args": ["character.creation.skill_setup", "<s_range>", ["skills.ability", "Pick <name>'s primary skill (+30)", "character_party", "<char_idx>", "skill", {"base": 30}, "<name>"]]},
				// Set Secondary Skills x3
				{"id": "null",				"action": "loop",		"args": ["character.creation.skill_setup", "<s_range>", ["skills.ability", "Pick <name>'s secondary skill (+20)", "character_party", "<char_idx>", "skill", {"base": 20}, "<name>"]]},
				// Set Tertiary Skills x4
				{"id": "s_range",			"action": "range", 		"args": [4]},
				{"id": "null",				"action": "loop",		"args": ["character.creation.skill_setup", "<s_range>", ["skills.ability", "Pick <name>'s tertiary skill (+10)", "character_party", "<char_idx>", "skill", {"base": 10}, "<name>"]]},
				// Set Masteries x2
				{"id": "log",				"action": "log", 		"args": ["---------------- Masteries ---------------"]},
				{"id": "choice",			"action": "modal",		"args": ["select_multi", "Masteries", [2,2], "game_d", "tables.masteries"]},
				{"id": "null",				"action": "loop",		"args": ["character.biography.masteries.add", "<choice>", ["<char_idx>", "$idx$"]]},
				{"id": "log",				"action": "log", 		"args": ["<name>'s masteries are <choice>."]},
				// Set Goals
				{"id": "log",				"action": "log", 		"args": ["------------- Personal Goals ------------"]},
				{"id": "goals",				"action": "modal",		"args": ["select_multi", "Personal Goals", [2,2], "game_d", "tables.goals"]},
				{"id": "null",				"action": "loop",		"args": ["character.biography.goals.add", "<goals>", ["<char_idx>", "$idx$"]]},
				{"id": "log",				"action": "log", 		"args": ["<name>'s personal goals are <goals>."]},
				// Roll Equipment
				{"id": "log",				"action": "log", 		"args": ["--------------- Equipment ---------------"]},
				// Select Weapon
				{"id": "weapon",			"action": "modal",		"args": ["select_multi", "Pick Weapon", [1,1], "game_d", "tables.items.weapon"]},
				{"id": "obj",				"action": "inject",		"args": ["character.inventory.item.get", ["weapon", "<weapon>"]]},
				{"id": "path",				"action": "inject",		"args": ["character.inventory.item.add", ["character_party", "<char_idx>", "<obj>"]]},
				{"id": "null",				"action": "inject",		"args": ["character.inventory.item.use", ["character_party", "<char_idx>", "<path>"]]},
				// Equip Torch
				{"id": "obj",				"action": "inject",		"args": ["character.inventory.item.get", ["common", "torch"]]},
				{"id": "path",				"action": "inject",		"args": ["character.inventory.item.add", ["character_party", "<char_idx>", "<obj>"]]},
				{"id": "null",				"action": "inject",		"args": ["character.inventory.item.use", ["character_party", "<char_idx>", "<path>"]]},
				// Roll Armor
				{"id": "obj", 				"action": "inject", 	"args": ["loot.roll_armor"]},
				{"id": "path",				"action": "loop",		"args": ["character.inventory.item.add", "<obj>",  ["character_party", "<char_idx>", "$idx$"]]},
				{"id": "null",				"action": "loop",		"args": ["character.inventory.item.use", "<path>", ["character_party", "<char_idx>", "$idx$"]]},
				// Roll Cooking Supplies
				{"id": "count", 			"action": "inject", 	"args": ["dice.rolls.roll_plus_one", [10, "Cooking Supplies"]]},
				{"id": "obj",				"action": "inject",		"args": ["character.inventory.supply.edit", ["character_party", "<char_idx>", "cooking", "<count>"]]},
				// Roll Crafting Supplies
				{"id": "count", 			"action": "inject", 	"args": ["dice.rolls.roll_plus_one", [10, "Crafting Supplies"]]},
				{"id": "count",				"action": "math", 		"args": ["<count>", "+", 5]},
				{"id": "obj",				"action": "inject",		"args": ["character.inventory.supply.edit", ["character_party", "<char_idx>", "crafting", "<count>"]]},
				// Roll Gold Supplies
				{"id": "count", 			"action": "inject", 	"args": ["dice.rolls.roll_plus_one", [20, "Gold"]]},
				{"id": "obj",				"action": "inject",		"args": ["character.inventory.supply.edit", ["character_party", "<char_idx>", "gold", "<count>"]]},
				// Add listener for player dying
				{"id": "null",				"action": "inject", 	"args": ["effects.add", ["character_party", 0, "death", "listener.death_check"]]},
			],

			skill_setup: [
				["table", "message", "party", "char_idx", "type", "modifier", "name"],
				// Disable already selected choices and present them to the player
				{"id": "disabled",		"action": "h_get", 		"args": ["selected_attrs", []]},
				{"id": "attrs",			"action": "read",		"args": ["game_d", "tables.<table>"]},
				{"id": "choice",		"action": "choice", 	"args": ["<message>", "<attrs>", "<disabled>"]},
				{"id": "disabled",		"action": "concat",		"args": ["<disabled>", "<choice.data>"]},
				{"id": "disabled",		"action": "h_put", 		"args": ["selected_attrs", "<disabled.data>"]},
				// Add the modifier to the skill base
				{"id": "null",			"action": "inject", 	"args": ["character.attributes.stats.add", ["<party>.<char_idx>", "<type>", "<choice.data>", "<modifier>"]]},
				// Log and return the choice
				{"id": "log",			"action": "log", 		"args": ["<name>'s <choice.data> skill is <modifier.base>"]},
				{"id": "null", 			"action": "return", 	"args": ["<choice.data>"]},
			],
		},

		death: [
			["party", "idx"],
			// Get character info and display it
			{"id": "name",					"action": "read", 		"args": ["save_d", "<party>.<idx>.name"]},
			{"id": "type",					"action": "read", 		"args": ["save_d", "<party>.<idx>.type"]},

			// Event deaths_door 
			{"id": "is_dead", 				"action": "resolve", 	"args": [true]},
			{"id": "null", 					"action": "event", 		"args": ["<party>.<idx>.deaths_door"]},
			// Allow a listener to override death from life saving procs
			{"id": "null", 					"action": "branch", 	"args": ["<is_dead>", null, {"action": "return"}]},

			// Event for character's death
			{"id": "null", 					"action": "event", 		"args": ["<party>.<idx>.dead"]},
			// Notify user of death
			{"id": "null", 					"action": "notify", 	"args": ["<name> has died."]},

			// Remove the character from the party
			{"id": "null", 					"action": "delete", 	"args": ["save_d", "<party>.<idx>"]},
			// If it is the player that died emit game over event
			{"id": "character", 			"action": "branch", 	"args": [["<type>", "!=", "player"], {"action": "return"}]},
				{"id": "null",					"action": "event",		"args":["<party>.<idx>.game_over"]},
				{"id": "null",					"action": "h_put",		"args":["<party>.<idx>.game_over", true]},
		],

		biography: {
			refs: {
				add: [
					["party", "char_idx", "type", "key"],
					{"id": "obj",		"action": "copy", 		"args": ["game_d", "tables.<type>.<key>"]},
					{"id": "null",		"action": "set_at", 	"args": ["save_d", "<party>.<char_idx>.biography.<type>.<key>", "<obj>"]},
					{"id": "null", 		"action": "return", 	"args": ["biography.<type>.<key>"]},
				],
	
				delete: [
					["party", "char_idx", "type", "key",],
					{"id": "null",		"action": "inject", 	"args": ["character.modifier.delete", ["<party>", "<char_idx>", "<reference>"]]},
					{"id": "obj",		"action": "delete", 	"args": ["save_d", "<party>.<char_idx>.<reference>"]},
				],
			},

			activate_entry: [
				["category", "type", "char_idx"],
				{"id": "meta",		"action": "read", 				"args": ["game_d", "tables.<category>.<type>"]},
				{"id": "results",	"action": "inject", 			"args": ["<meta.rule>", ["<char_idx>", "<meta.args>"]]},
				{"id": "null",		"action": "return", 			"args": ["<results>"]},
			],

			merits: {
				blessed: [
					["char_idx", "args"],
					{"id": "ref_key",	"action": "inject", 			"args": ["character.biography.refs.add", ["character_party", "<char_idx>", "merits", "blessed", "+10 to Magic Resist"]]},
					{"id": "null",		"action": "inject", 			"args": ["effects.add", ["character_party", "<char_idx>", "<ref_key>", "skill.magic_resist.10"]]},
					{"id": "null", 		"action": "log",				"args": [`Blessed: Magic Resist +10`]},
					{"id": "null",		"action": "return", 			"args": ["cursed"]},
				],
				eagle_eyed: [
					["char_idx", "args"],
					{"id": "ref_key",	"action": "inject", 			"args": ["character.biography.refs.add", ["character_party", "<char_idx>", "merits", "eagle_eyed", "+10 to Perception"]]},
					{"id": "null",		"action": "inject", 			"args": ["effects.add", ["character_party", "<char_idx>", "<ref_key>", "skill.perception.10"]]},
					{"id": "null", 		"action": "log",				"args": [`Eagle Eye: Perception +10`]},
					{"id": "null",		"action": "return", 			"args": ["short_sighted"]},
				],
				fearless: [
					["char_idx", "args"],
					{"id": "ref_key",	"action": "inject", 			"args": ["character.biography.refs.add", ["character_party", "<char_idx>", "merits", "fearless", "Advantage on Resolve.Fear checks"]]},
					{"id": "null",		"action": "inject", 			"args": ["effects.add", ["character_party", "<char_idx>", "<ref_key>", "skill.resolve.fear.+"]]},
					{"id": "null", 		"action": "log",				"args": [`Fearless: Gain Advantage on Resolve checks involving Fear.`]},
					{"id": "null",		"action": "return", 			"args": ["coward"]},
				],
				haggler: [
					["char_idx", "args"],
					{"id": "ref_key",	"action": "inject", 			"args": ["character.biography.refs.add", ["character_party", "<char_idx>", "merits", "haggler", "ToDo"]]},
					{"id": "null", 		"action": "log",				"args": [`Haggler: ToDo`]},
				],
				lucky: [
					["char_idx", "args"],
					{"id": "ref_key",	"action": "inject", 			"args": ["character.biography.refs.add", ["character_party", "<char_idx>", "merits", "lucky", "ToDo"]]},
					{"id": "null", 		"action": "log",				"args": [`Lucky: ToDo`]},
				],
				natural_healer: [
					["char_idx", "args"],
					{"id": "ref_key",	"action": "inject", 			"args": ["character.biography.refs.add", ["character_party", "<char_idx>", "merits", "natural_healer", "ToDo"]]},
					{"id": "null", 		"action": "log",				"args": [`Natural Healer: ToDo`]},
				],
				hearty: [
					["char_idx", "args"],
					{"id": "ref_key", "action": "inject", 				"args": ["character.biography.refs.add", ["character_party", "<char_idx>", "merits", "hearty", "Advantage on Endurance.Disease|Poison checks"]]},
					{"id": "null",		"action": "loop", 				"args": ["effects.add", ["skill.endurance.disease.+", "skill.endurance.poison.+"], ["character_party", "<char_idx>", "<ref_key>", "$idx$"]]},
					{"id": "null", 		"action": "log",				"args": [`Hearty : Gain Advantage on Endurance checks related to disease and poison.`]},
					{"id": "null",		"action": "return", 			"args": ["sickly"]},
				],
				scavenger: [
					["char_idx", "args"],
					{"id": "ref_key",	"action": "inject", 			"args": ["character.biography.refs.add", ["character_party", "<char_idx>", "merits", "scavenger", "+10 to Scavenge"]]},
					{"id": "null",		"action": "inject", 			"args": ["effects.add", ["character_party", "<char_idx>", "<ref_key>", "skill.scavenge.10"]]},
					{"id": "null", 		"action": "log",				"args": [`Scavenger: Scavenge +10`]}
				],
				tracker: [
					["char_idx", "args"],
					{"id": "ref_key",	"action": "inject", 			"args": ["character.biography.refs.add", ["character_party", "<char_idx>", "merits", "tracker", "ToDo"]]},
					{"id": "null", 		"action": "log",				"args": [`Tracker: ToDo`]},
				],
				trained: [
					["char_idx", "args"],
					{"id": "ref_key",	"action": "inject", 			"args": ["character.biography.refs.add", ["character_party", "<char_idx>", "merits", "trained", "ToDo"]]},
					{"id": "null", 		"action": "log",				"args": [`Trained: ToDo`]},
				],
			},
	
			flaws: {
				armor_averse: [
					["char_idx", "args"],
					{"id": "ref_key",	"action": "inject", 			"args": ["character.biography.refs.add", ["character_party", "<char_idx>", "flaws", "armor_averse", "ToDo"]]},
					{"id": "null", 		"action": "log",				"args": [`Armor Averse: ToDo`]},
				],
				addict: [
					["char_idx", "args"],
					{"id": "ref_key",	"action": "inject", 			"args": ["character.biography.refs.add", ["character_party", "<char_idx>", "flaws", "addict", "ToDo"]]},
					{"id": "null", 		"action": "log",				"args": [`Addict: ToDo`]},
				],
				coward: [
					["char_idx", "args"],
					{"id": "ref_key",	"action": "inject", 			"args": ["character.biography.refs.add", ["character_party", "<char_idx>", "flaws", "coward", "Disadvantage on Resolve.Fear checks"]]},
					{"id": "null",		"action": "inject", 			"args": ["effects.add", ["character_party", "<char_idx>", "<ref_key>", "skill.resolve.fear.-"]]},
					{"id": "null", 		"action": "log",				"args": [`Coward: Gain Disadvantage on Resolve checks involving Fear.`]},
				],
				cracked_soul: [
					["char_idx", "args"],
					{"id": "ref_key",	"action": "inject", 			"args": ["character.biography.refs.add", ["character_party", "<char_idx>", "flaws", "cracked_soul", "Aether Roll Die D6->D4."]]},
					{"id": "null",		"action": "inject", 			"args": ["effects.add", ["character_party", "<char_idx>", "<ref_key>", "listener.cracked_soul"]]},
					{"id": "null", 		"action": "log",				"args": [`Cracked Soul: Reduce Aether Die from d6 -> d4`]},
				],
				cracked_soul_proc: [
					["event_idx", "new_die"],
					{"id": "null", 		"action": "step_result",		"args": ["<parent_process>", "<event_idx>", "<new_die>"]},
					{"id": "null", 		"action": "log",				"args": [`Cracked Soul: Reduce Aether Die from d6 -> d4`]},
				],
				cursed: [
					["char_idx", "args"],
					{"id": "ref_key",	"action": "inject", 			"args": ["character.biography.refs.add", ["character_party", "<char_idx>", "flaws", "cursed", "-10 to Magic Resist"]]},
					{"id": "null",		"action": "inject", 			"args": ["effects.add", ["character_party", "<char_idx>", "<ref_key>", "skill.magic_resist.-10"]]},
					{"id": "null", 		"action": "log",				"args": [`Cursed: Magic Resist -10`]},
				],
				damaged_nerve: [
					["char_idx", "args"],
					{"id": "ref_key",	"action": "inject", 			"args": ["character.biography.refs.add", ["character_party", "<char_idx>", "flaws", "damaged_nerve", "-10 to Acrobatics"]]},
					{"id": "null",		"action": "inject", 			"args": ["effects.add", ["character_party", "<char_idx>", "<ref_key>", "skill.acrobatics.-10"]]},
					{"id": "null", 		"action": "log",				"args": [`Damaged Nerve: Acrobatics -10`]},
				],
				fragile_mind: [
					["char_idx", "args"],
					{"id": "ref_key",	"action": "inject", 			"args": ["character.biography.refs.add", ["character_party", "<char_idx>", "flaws", "fragile_mind", "Sanity Roll Die D6->D4."]]},
					{"id": "null",		"action": "inject", 			"args": ["effects.add", ["character_party", "<char_idx>", "<ref_key>", "listener.fragile_mind"]]},
					{"id": "null",		"action": "log",				"args": [`Fragile Mind: Reduce Sanity Die from d6 -> d4`]},
				],
				fragile_mind_proc: [
					["event_idx", "new_die"],
					{"id": "null", 		"action": "step_result",		"args": ["<parent_process>", "<event_idx>", "<new_die>"]},
					{"id": "null", 		"action": "log",				"args": [`Fragile Mind: Reduce Sanity Die from d6 -> d4`]},
				],
				queasy: [
					["char_idx", "args"],
					{"id": "ref_key",	"action": "inject", 			"args": ["character.biography.refs.add", ["character_party", "<char_idx>", "flaws", "queasy", "-10 to Medicine"]]},
					{"id": "null",		"action": "inject", 			"args": ["effects.add", ["character_party", "<char_idx>", "<ref_key>", "skill.medicine.-10"]]},
					{"id": "null", 		"action": "log",				"args": [`Queasy: Medicine -10`]},
				],
				short_sighted: [
					["char_idx", "args"],
					{"id": "ref_key",	"action": "inject", 			"args": ["character.biography.refs.add", ["character_party", "<char_idx>", "flaws", "short_sighted", "-10 to Perception"]]},
					{"id": "null",		"action": "inject", 			"args": ["effects.add", ["character_party", "<char_idx>", "<ref_key>", "skill.perception.-10"]]},
					{"id": "null", 		"action": "log",				"args": [`Short Sighted: Perception -10`]},
				],
				sickly: [
					["char_idx", "args"],
					{"id": "ref_key", 		"action": "inject", 		"args": ["character.biography.refs.add", ["character_party", "<char_idx>", "flaws", "sickly", "Disadvantage on Endurance.Disease|Poison checks"]]},
					{"id": "null",			"action": "loop", 			"args": ["effects.add", ["skill.endurance.disease.-", "skill.endurance.poison.-"], ["character_party", "<char_idx>", "<ref_key>", "$idx$"]]},
					{"id": "null", 			"action": "log",			"args": [`Sickly: Gain Disadvantage on Endurance checks related to disease and poison.`]},
				],
			},

			levels: {
				add_experience: [
					["party", "char_idx", "exp"],
					{"id": "obj",				"action": "read", 				"args": ["save_d", "<party>.<char_idx>.biography.levels"]},
					{"id": "total_exp",			"action": "math", 				"args": ["<obj.base>", "+", "<exp>"]},
					{"id": "mod_exp",			"action": "math", 				"args": ["<total_exp>", "%", "<obj.max>"]},
					// If the moded value differs it means we have hit the level threshold
					{"id": "is_level",			"action": "branch", 			"args": [["<mod_exp>", "!=", "<total_exp>"], {"action": "goto", "args":["id.base_exp.next"]}]},
					{"id": "total_exp",			"action": "math", 				"args": ["<obj.total>", "+", 1]},
					// ToDo: Inject level up call
					{"id": "base_exp",			"action": "write", 				"args": ["save_d", "<party>.<char_idx>.biography.levels.base", "<mod_exp>"]},
				],

				level_up: [],
			},
			
			masteries: {
				add: [
					["char_idx", "mastery_id"],
					{"id": "mastery",		"action": "copy", 			"args": ["game_d", "tables.masteries.<mastery_id>"]},
					{"id": "obj",			"action": "set_at", 		"args": ["save_d", "character_party.<char_idx>.biography.masteries.<mastery_id>", "<mastery>"]},
				],
	
				level_up: [],
				swap: [],
			},
	
			goals: {
				add: [
					["char_idx", "goal_id"],
					{"id": "goal",		"action": "copy", 			"args": ["game_d", "tables.goals.<goal_id>"]},
					{"id": "obj",		"action": "set_at", 		"args": ["save_d", "character_party.<char_idx>.biography.goals.<goal_id>", "<goal>"]},
				],
	
				update: [],
				finish: [],
				remove: [],
			},

			perks: {},
			madness: {},
			domain: {},
		},

		attributes: {
			references: {
				add: [
					["party", "char_idx", "source_ref", "effect_id"],
					// Make sure the paths exist
					{"id": "key_path",		"action": "touch",		"args": ["save_d", "<party>:[].<char_idx>:{}.modifiers:{}./<source_ref>/:[]"]},
					// Set the keys to the data 
					{"id": "m_ref",			"action": "concat", 	"args": ["save_d", "<party>.<char_idx>.modifiers./<source_ref>/", "<effect_id>"]},
					// Return the path to the key and the data
					{"id": "null",			"action": "return", 	"args": ["<party>.<char_idx>.modifiers.<source_ref>", "<effect_id>"]},
				],

				delete: [
					["party", "char_idx", "source_ref", "effect_id"],
					// Remove the reference
					{"id": "effects",		"action": "read", 		"args": ["save_d", "<party>.<char_idx>.modifiers./<source_ref>/"]},
					{"id": "effects",		"action": "remove", 	"args": ["<effects>", "<effect_id>"]},
					{"id": "null",			"action": "write", 		"args": ["save_d", "<party>.<char_idx>.modifiers./<source_ref>/", "<effects>"]},
					// Return the path to the key and the data
					{"id": "null",			"action": "return", 	"args": ["<party>.<char_idx>.modifiers.<source_ref>", "<effect_id>"]},
				],
			},

			modifiers: {
				add: [
					["party", "char_idx", "category", "type", "sub_type", "source_ref", "effect_id", "obj"],
					// Make sure the paths exist
					{"id": "key_path",		"action": "touch",		"args": ["save_d", "<party>:[].<char_idx>:{}.modifiers:{}./<source_ref>/:[]"]},
					// Set the keys to the data 
					{"id": "m_ref",			"action": "concat", 	"args": ["save_d", "<party>.<char_idx>.modifiers./<source_ref>/", "<effect_id>"]},
					// Call the category add for the modifier
					{"id": "result",		"action": "inject", 	"args": ["character.attributes.<category>.add", ["<party>.<char_idx>", "<type>", "<sub_type>", "<obj>"]]},
					// Return the path to the key and the data
					{"id": "null",			"action": "return", 	"args": ["<party>.<char_idx>.modifiers.<source_ref>", "<effect_id>"]},
				],
			
				delete: [
					["party", "char_idx", "category", "type", "sub_type", "source_ref", "effect_id", "obj"],
					// Call the category delete for the modifier
					{"id": "null",			"action": "inject", 	"args": ["character.attributes.<category>.delete", ["<party>.<char_idx>", "<type>", "<sub_type>", "<obj>"]]},
					{"id": "effects",		"action": "read", 		"args": ["save_d", "<party>.<char_idx>.modifiers./<source_ref>/"]},
					{"id": "effects",		"action": "remove", 	"args": ["<effects>", "<effect_id>"]},
					{"id": "null",			"action": "write", 		"args": ["save_d", "<party>.<char_idx>.modifiers./<source_ref>/", "<effects>"]},
					// Return the path to the key and the data
					{"id": "null",			"action": "return", 	"args": ["<party>.<char_idx>.modifiers.<source_ref>", "<effect_id>"]},
				],
			},

			actions: {
				add: [
					["char_path", "type", "sub_type", "delta"],
					{"id": "value",		"action": "read",					"args": ["game_d", "tables.actions.<type>.<sub_type>./<delta>/"]},
					{"id": "null",		"action": "set_at",				"args": ["save_d", "<char_path>.actions.<type>.<sub_type>./<delta>/", "<value>"]},
				],
	
				delete: [
					["char_path", "type", "sub_type", "delta"],
					{"id": "null",		"action": "delete", 			"args": ["save_d", "<char_path>.actions.<type>.<sub_type>./<delta>/"]},
				],
			},
		
			checks: {
				add: [
					["char_path", "type", "sub_type", "delta"],
					{"id": "value",		"action": "at_t",					"args": ["save_d", "<char_path>.checks<sub_type>", "<type>", 0]},
					{"id": "check",		"action": "math", 				"args": ["<value>", "+", "<delta>"]},
					{"id": "null",		"action": "write_t",			"args": ["save_d", "<char_path>.checks<sub_type>", "<type>", "<check>"]},
				],

				get: [
					["char_path", "type", "sub_type"],
					{"id": "values",	"action": "resolve_t",		"args": ["save_d", "<char_path>.checks<sub_type>", "<type>", 0]},
					{"id": "clamped",	"action": "math", 				"args": ["<values>", "clmp", {"min":-1,"max":1}]},
					{"id": "check",		"action": "reduce", 			"args": ["<values>", "+"]},
					{"id": "null",		"action": "return",				"args": ["<check.1>"]},
				],

				delete: [
					["char_path", "type", "sub_type", "delta"],
					{"id": "value",		"action": "at_t",					"args": ["save_d", "<char_path>.checks<sub_type>", "<type>", 0]},
					{"id": "check",		"action": "math", 				"args": ["<value>", "-", "<delta>"]},
					{"id": "null",		"action": "write_t",			"args": ["save_d", "<char_path>.checks<sub_type>", "<type>", "<check>"]},
				],
			},
		
			enums: {
				add: [
					["char_path", "type", "sub_type", "delta"],
					// Read the existing modifiers for the character
					{"id": "value",		"action": "read",					"args": ["save_d", "<char_path>.enums.<type>.<sub_type>"]},
					// Calculate the new type's total
					{"id": "enum",		"action": "math", 				"args": ["<value>", "+", "<delta>"]},
					// Save the edits to the character sheet
					{"id": "null",		"action": "write", 				"args": ["save_d", "<char_path>.enums.<type>.<sub_type>", "<enum>"]},
					{"id": "null",		"action": "return", 			"args": ["<enum>"]},
				],

				get: [
					["char_path", "type", "sub_type"],
					{"id": "value",		"action": "read", 		"args": ["save_d", "<char_path>.enums.<type>.<sub_type>"]},
					{"id": "null",		"action": "return", 	"args": ["<value>"]},
				],

				delete: [
					["char_path", "type", "sub_type", "delta"],
					// Read the existing modifiers for the character
					{"id": "value",		"action": "read", 		"args": ["save_d", "<char_path>.enums.<type>.<sub_type>"]},
					// Calculate the new type's total
					{"id": "enum",		"action": "math", 		"args": ["<value>", "-", "<delta>"]},
					// Save the edits to the character sheet
					{"id": "null",		"action": "write", 		"args": ["save_d", "<char_path>.enums.<type>.<sub_type>", "<enum>"]},
					{"id": "null",		"action": "return", 	"args": ["<enum>"]},
				],
			},
		
			stats: {
				add: [
					["char_path", "type", "sub_type", "delta"],
					// Read the existing modifiers for the character
					{"id": "obj",			"action": "read", 		"args": ["save_d",  "<char_path>.stats.<type>.<sub_type>"]},
					{"id": "adjust",		"action": "resolve", 	"args": [0]},

					// Update the max if it has a delta
					{"id": "d_max",			"action": "ifelse", 	"args": [["<delta>", ".", "max"], "<delta.max>", 0]},
					{"id": "null",			"action": "branch", 	"args": [["<d_max>", "==", 0], {"action": "goto", "args":["id.d_base.next"]}]},
						{"id": "max",			"action": "math", 		"args": ["<obj.max>", "+", "<d_max>"]},
						{"id": "obj",			"action": "set", 		"args": ["<obj>", "max", "<max>"]},
						// If the max is lower than the base clamp the base to the max
						{"id": "adjust",		"action": "math", 		"args": [["<obj.base>", "min", "<obj.max>"], "-", "<obj.base>"]},
						{"id": "base",			"action": "math", 		"args": ["<obj.base>", "-", "<adjust>"]},
						{"id": "obj",			"action": "set", 		"args": ["<obj>", "base", "<base>"]},

					// Update the base if it has a delta
					{"id": "d_base",		"action": "ifelse", 	"args": [["<delta>", ".", "base"], "<delta.base>", 0]},
					{"id": "null",			"action": "branch", 	"args": [["<d_base>", "==", 0], {"action": "goto", "args":["id.d_total.next"]}]},
						// Adjust the delta base value if it exceeds the max
						{"id": "d_base",		"action": "math", 		"args": [[["<obj.base>", "+", "<d_base>"], "min", "<obj.max>"], "-", "<obj.base>"]},
						{"id": "base",			"action": "math", 		"args": ["<obj.base>", "+", "<d_base>"]},
						{"id": "obj",			"action": "set", 		"args": ["<obj>", "base", "<base>"]},
					
					// Update the total if it has a delta or if base value changed
					{"id": "d_total",		"action": "ifelse", 	"args": [["<delta>", ".", "total"], "<delta.total>", 0]},
					// Adjust the total if it would have been affected by a previous change in base or max
					{"id": "total",			"action": "math", 		"args": ["<obj.total>", "+", "<adjust>"]},
					{"id": "obj",			"action": "set", 		"args": ["<obj>", "total", "<total>"]},
					{"id": "null",			"action": "branch", 	"args": [[["<d_total>", "==", 0], "&", ["<d_base>", "==", 0]], {"action": "goto", "args":["id.d_write.next"]}]},
						{"id": "total",			"action": "math", 		"args": [["<obj.total>", "+", "<d_total>"], "+", "<d_base>"]},
						{"id": "obj",			"action": "set", 		"args": ["<obj>", "total", "<total>"]},

					// Write the updates back to the stat
					{"id": "d_write",		"action": "write", 		"args": ["save_d", "<char_path>.stats.<type>.<sub_type>", "<obj>"]},
					{"id": "null",			"action": "return", 	"args": ["<obj>"]},
				],

				get: {
					base: [
						["party", "char_idx", "type", "sub_type"],
						{"id": "stat",		"action": "branch", 	"args": [["<sub_type>", "==", null],
																				{"action": "read", 		"args": ["save_d", "<party>.<char_idx>.stats.<type>.base"]},
																				{"action": "read", 		"args": ["save_d", "<party>.<char_idx>.stats.<type>.<sub_type>.base"]}]},
						{"id": "stat",		"action": "branch", 	"args": [["<sub_type>", "==", null], 
																				{"action": "return", 	"args": [{"type": "<type>", "value": "<stat>"}]},
																				{"action": "return", 	"args": [{"type": "<type>", "sub_type": "<sub_type>", "value": "<stat>"}]}]},
					],

					max: [
						["party", "char_idx", "type", "sub_type"],
						{"id": "stat",		"action": "branch", 	"args": [["<sub_type>", "==", null],
																				{"action": "read", 		"args": ["save_d", "<party>.<char_idx>.stats.<type>.max"]},
																				{"action": "read", 		"args": ["save_d", "<party>.<char_idx>.stats.<type>.<sub_type>.max"]}]},
						{"id": "stat",		"action": "branch", 	"args": [["<sub_type>", "==", null], 
																				{"action": "return", 	"args": [{"type": "<type>", "value": "<stat>"}]},
																				{"action": "return", 	"args": [{"type": "<type>", "sub_type": "<sub_type>", "value": "<stat>"}]}]},
					],

					total: [
						["party", "char_idx", "type", "sub_type"],
						{"id": "stat",		"action": "branch", 	"args": [["<sub_type>", "==", null],
																				{"action": "read", 		"args": ["save_d", "<party>.<char_idx>.stats.<type>.total"]},
																				{"action": "read", 		"args": ["save_d", "<party>.<char_idx>.stats.<type>.<sub_type>.total"]}]},
						{"id": "stat",		"action": "branch", 	"args": [["<sub_type>", "==", null], 
																				{"action": "return", 	"args": [{"type": "<type>", "value": "<stat>"}]},
																				{"action": "return", 	"args": [{"type": "<type>", "sub_type": "<sub_type>", "value": "<stat>"}]}]},
					],
				},

				delete: [
					["char_path", "type", "sub_type", "delta"],
					// Read the existing modifiers for the character
					{"id": "obj",			"action": "read", 			"args": ["save_d",  "<char_path>.stats.<type>.<sub_type>"]},
					{"id": "adjust",		"action": "resolve", 		"args": [0]},

					// Update the max if it has a delta
					{"id": "d_max",			"action": "ifelse", 		"args": [["delta", ".", "max"], "<delta.max>", 0]},
					{"id": "null",			"action": "branch", 		"args": [["<d_max>", "==", 0], {"action": "goto", "args":["id.d_base.next"]}]},
						{"id": "max",			"action": "math", 			"args": [["<obj.max>", "-", "<d_max>"], "max", 0]},
						{"id": "obj",			"action": "set", 			"args": ["<obj>", "max", "<max>"]},
						// If the max is lower than the base clamp the base to the max
						{"id": "adjust",		"action": "math", 			"args": [[["<obj.base>", "min", "<obj.max>"]], "-", "<obj.base>"]},
						{"id": "base",			"action": "math", 			"args": ["<obj.base>", "-", "<adjust>"]},
						{"id": "obj",			"action": "set", 			"args": ["<obj.base>", "base", "<base>"]},

					// Update the base if it has a delta
					{"id": "d_base",		"action": "ifelse", 		"args": [["delta", ".", "base"], "<delta.base>", 0]},
					{"id": "null",			"action": "branch", 		"args": [["<d_base>", "==", 0], {"action": "goto", "args":["id.d_total.next"]}]},
						// Adjust the delta base value if it goes below 0
						{"id": "d_base",		"action": "math", 			"args": [["<d_base>", "+", [["<obj.base>", "-", "<d_base>"], "min", 0]]]},
						{"id": "base",			"action": "math", 			"args": ["<obj.base>", "-", "<d_base>"]},
						{"id": "obj",			"action": "set", 			"args": ["<obj>", "base", "<base>"]},
						{"id": "adjust",		"action": "math", 			"args": ["<adjust>", "-", "<d_base>"]},
					
					// Update the total if it has a delta or if base value changed
					{"id": "d_total",		"action": "ifelse", 		"args": [["<delta>", ".", "total"], "<delta.total>", 0]},
					// Adjust the total if it would have been affected by a previous change in base or max, (adjust is negative)
					{"id": "total",			"action": "math", 			"args": ["<obj.total>", "+", "<adjust>"]},
					{"id": "obj",			"action": "set", 			"args": ["<obj>", "total", "<total>"]},
					{"id": "null",			"action": "branch", 		"args": [["<d_total>", "==", 0], {"action": "goto", "args":["id.d_write.next"]}]},
						{"id": "total",			"action": "math", 			"args": [["<obj.total>", "-", "<d_total>"], "max", 0]},
						{"id": "obj",			"action": "set", 			"args": ["<obj>", "total", "<total>"]},

					// Write the updates back to the stat
					{"id": "d_write",		"action": "write", 			"args": ["save_d", "<char_path>.stats.<type>.<sub_type>", "<obj>"]},
					{"id": "null",			"action": "return", 		"args": ["<obj>"]},
				],

				points: {
					plus: [
						["char_path", "type", "sub_type", "amount"],
						// Read the existing values for the character
						{"id": "obj",			"action": "read", 		"args": ["save_d",  "<char_path>.stats.<type>.<sub_type>"]},
						// Get the amount ot fill by and any left over amount
						{"id": "diff_gap",		"action": "math", 		"args": [["<obj.max>", "-", "<obj.total>"], "max", 0]},
						{"id": "fill_by",		"action": "ifelse", 	"args": [["<diff_gap>", "<=", "<amount>"], "<amount>", "<diff_gap>"]},
						{"id": "left_over",		"action": "branch", 	"args": [["<diff_gap>", "<=", "<amount>"], {"action":"resolve", "args":[0]}, {"action":"math", "args":["<amount>", "-", "<diff_gap>"]}]},
						// Add it back to the attribute
						{"id": "total",			"action": "math", 		"args": ["<obj.total>", "+", "<fill_by>"]},
						{"id": "obj",			"action": "set", 		"args": ["<obj>", "total", "<total>"]},
						// Write the updates back to the stat
						{"id": "d_write",		"action": "write", 		"args": ["save_d", "<char_path>.stats.<type>.<sub_type>", "<obj>"]},
						{"id": "null",			"action": "return", 	"args": [{"used": "<fill_by>", "unused": "<left_over>"}]},
					],
	
					minus: [
						["char_path", "type", "sub_type", "amount"],
						// Read the existing values for the character
						{"id": "obj",			"action": "read", 		"args": ["save_d",  "<char_path>.stats.<type>.<sub_type>"]},
						// Get the amount to empty by and any left over amount
						{"id": "use_by",		"action": "ifelse", 	"args": [["<obj.total>", ">=", "<amount>"], "<amount>", "<obj.total>"]},
						{"id": "left_over",		"action": "branch", 	"args": [["<obj.total>", ">=", "<amount>"], {"action":"resolve", "args":[0]}, {"action":"math", "args":["<amount>", "-", "<obj.total>"]}]},
						// Add it back to the attribute
						{"id": "total",			"action": "math", 		"args": ["<obj.total>", "-", "<use_by>"]},
						{"id": "obj",			"action": "set", 		"args": ["<obj>", "total", "<total>"]},
						// Write the updates back to the stat
						{"id": "d_write",		"action": "write", 		"args": ["save_d", "<char_path>.stats.<type>.<sub_type>", "<obj>"]},
						{"id": "null", 			"action": "event", 		"args": ["<char_path>.stats.<type>.<sub_type>.<total>"]},
						{"id": "null",			"action": "return", 	"args": [{"used": "<use_by>", "unused": "<left_over>"}]},
					],
				}
			},
		},

		inventory: {
			item: {
				add: [
					["party", "char_idx", "item"],
					{"id": "item_at",	"action": "concat", 	"args": ["save_d", "<party>.<char_idx>.inventory.items", "<item>"]},
					{"id": "null",		"action": "return", 	"args": ["inventory.items.<item_at.idx>"]},
				],

				get: [
					["type", "item"],
					{"id": "item", 		"action": "copy", 		"args": ["game_d", "tables.items.<type>.<item>"]},
					{"id": "null",		"action": "return", 	"args": ["<item>"]},
				],
	
				use: [
					["party", "char_idx", "item_path"],
					{"id": "item", 			"action": "read", 		"args": ["save_d", "<party>.<char_idx>.<item_path>"]},

					// Get and run the reference effect and store the key in the heap
					{"id": "meta",			"action": "get", 		"args": ["<item>", "item"]},
					{"id": "results",		"action": "loop", 		"args": ["effects.add", "<meta>", ["<party>", "<char_idx>", "<item_path>", "$idx$"]]},

					// If an equipped.* is in the meta retrieve the path to return
					{"id": "path",			"action": "filter", 	"args": ["<results>", "equipped", "~", "1:*"]},
					{"id": "item_path",		"action": "ifelse", 	"args": [["<path>", "!=", undefined], "<path>", "<item_path>"]},

					// Trigger the rest of the effects with the reference in the heap
					{"id": "effects",		"action": "get", 		"args": ["<item>", "effects"]},
					{"id": "item",			"action": "loop", 		"args": ["effects.add", "<effects>", ["<party>", "<char_idx>", "<item_path>", "$idx$"]]},
					{"id": "null",			"action": "return", 	"args": ["<item_path>"]},
				],

				drop: [],
			},

			supply: {
				edit: [
					["party", "char_idx", "type", "amount"],
					{"id": "supply",		"action": "read", 		"args": ["save_d", "<party>.<char_idx>.inventory.supplies.<type>"]},
					{"id": "supply",		"action": "math", 		"args": ["<supply>", "+", "<amount>"]},
					{"id": "supply",		"action": "clamp", 		"args": ["<supply>", 0, 100]},
					{"id": "supply",		"action": "write", 		"args": ["save_d", "<party>.<char_idx>.inventory.supplies.<type>", "<supply>"]},
					// Log delta
					{"id": "name",			"action": "read",		"args": ["save_d", "<party>.<char_idx>.name"]},
					{"id": "log",			"action": "log", 		"args": ["<name> gained <amount> supplies.<type>."]},
				],
	
				check: [
					["char_idx", "type", "amount"],
					{"id": "supply",		"action": "read", 		"args": ["save_d", "<party>.<char_idx>.inventory.supplies.<type>"]},
					{"id": "is_enough",		"action": "math", 		"args": ["<supply>", ">=", "<amount>"]},
					{"id": "null",			"action": "return", 	"args": ["<is_enough>"]},
				],
			},

			equipment: {
				equip: [
					["party", "char_idx", "source_ref", "equip_slot"],
					// Read the equipment slot value and the inventory slot value
					{"id": "equipped",		"action": "read", 		"args": ["save_d", "<party>.<char_idx>.<equip_slot>"]},
					{"id": "item",			"action": "read", 		"args": ["save_d", "<party>.<char_idx>.<source_ref>"]},
					// If the equipment slot is not empty then remove all modifiers given by the equipment slot item
					{"id": "keys",			"action": "read", 		"args": ["save_d", "<party>.<char_idx>.modifiers./<equip_slot>/:[]"]},
					{"id": "null",			"action": "loop", 		"args": ["effects.delete", "<keys>", ["<party>", "<char_idx>", "<equip_slot>", "$idx$"]]},
					// Swap the items places in memory
					{"id": "null",			"action": "write", 		"args": ["save_d", "<party>.<char_idx>.<equip_slot>", "<item>"]},
					{"id": "null",			"action": "branch", 	"args": [["<equipped>", "==", null],
																				{"action": "delete", 	"args": ["save_d", "<party>.<char_idx>.<source_ref>"]},
																				{"action": "write",		"args":	["save_d", "<party>.<char_idx>.<source_ref>", "<equipped>"]}]},
					// Log equipping
					{"id": "name",			"action": "read", 		"args": ["save_d", "<party>.<char_idx>.name"]},
					{"id": "log",			"action": "notify", 	"args": ["<name> equipped a <item.name> to <equip_slot>"]},
					// Event equips
					{"id": "null", 			"action": "event", 		"args": ["<party>.<char_idx>.<equip_slot>.<item.name>", ["<party>.<char_idx>.<equip_slot>.<item.name>", "<item>"]]},
					{"id": "null",			"action": "return", 	"args": ["<equip_slot>"]},
				],
	
				unequip: [
					["party", "char_idx", "source_ref", "equip_slot"],
					{"id": "equipped",		"action": "read", 		"args": ["save_d", "<party>.<char_idx>.<equip_slot>"]},
					//Clean up all the effects
					{"id": "keys",			"action": "read", 		"args": ["save_d", "<party>.<char_idx>.modifiers./<equip_slot>/:[]"]},
					{"id": "null",			"action": "loop", 		"args": ["effects.delete", "<keys>", ["<party>", "<char_idx>", "<equip_slot>", "$idx$"]]},
					{"id": "null",			"action": "delete", 	"args": ["save_d", "<party>.<char_idx>.modifiers./<equip_slot>/"]},
					// Move the item to the inventory
					{"id": "item_at",		"action": "concat", 	"args": ["save_d", "<party>.<char_idx>.inventory.items", "<equipped>"]},
					{"id": "null",			"action": "write", 		"args": ["save_d", "<party>.<char_idx>.<equip_slot>", "null"]},
					// Notify about the changes
					{"id": "null", 			"action": "event", 		"args": ["<party>.<char_idx>.<equip_slot>", ["<party>.<char_idx>.<equip_slot>", null]]},
					{"id": "name",			"action": "read", 		"args": ["save_d", "<party>.<char_idx>.name"]},
					{"id": "log",			"action": "notify", 	"args": ["<name> unequipped a <equipped.name> from <equip_slot>"]},
				],
				
				repair: [],
			},
		},

		light_sources: {
			add: [
				["party", "char_idx", "source_ref", "effect_id"],
				// Add a reference to the effect
				{"id": "result", 			"action": "inject",		"args": ["character.attributes.references.add", ["<party>", "<char_idx>", "<source_ref>", "<effect_id>"]]},
				// Set the light_source
				{"id": "null",				"action": "write", 		"args": ["save_d", "<party>.<char_idx>.light_source", "<source_ref.0>"]},
			],

			delete: [
				["party", "char_idx", "source_ref", "effect_id"],
				// Delete the reference to the effect
				{"id": "result", 			"action": "inject",		"args": ["character.attributes.references.delete", ["<party>", "<char_idx>", "<source_ref>", "<effect_id>"]]},
				// Delete the light_source
				{"id": "null",				"action": "write", 		"args": ["save_d", "<party>.<char_idx>.light_source", "null"]},
			],

			use: {
				party: [
					["party"],
					{"id": "party_size",	"action": "size", 		"args": ["save_d", "<party>"]},
					{"id": "p_range",		"action": "range", 		"args": ["<party_size>"]},
					{"id": "loop",			"action": "loop",		"args": ["character.light_sources.use.tick", "<p_range>", ["<party>", "$idx$"]]},
				],

				tick: [
					["party", "char_idx"],
					{"id": "source_ref",		"action": "read", 		"args": ["save_d", "<party>.<char_idx>.light_source"]},
					// If the light source is null then return
					{"id": "null",				"action": "branch", 	"args": [["<source_ref>", "==", undefined], {"action": "return"}]},
					// Decrement the use counter
					{"id": "uses",				"action": "read", 		"args": ["save_d", "<party>.<char_idx>.<source_ref>.meta.use"]},
					{"id": "light",				"action": "math", 		"args": [["<uses.at>", "-", "<uses.by>"], "max", 0]},
					{"id": "light",				"action": "write", 		"args": ["save_d", "<party>.<char_idx>.<source_ref>.meta.use.at", "<light>"]},
					// Log light source stats
					{"id": "name",				"action": "read", 		"args": ["save_d", "<party>.<char_idx>.name"]},
					{"id": "null",				"action": "log", 		"args": ["<name>'s used light source: (<uses.at>/<uses.max>)"]},
					// If 0 and a consumable item then delete it
					{"id": "null",				"action": "branch", 	"args": [["<uses.at>", "==", 0], {"action": "inject", "args":["character.light_sources.use.consumed", ["<party>", "<char_idx>", "<source_ref>"]]}]},
				],

				by: [
					["party", "char_idx", "by_amount"],
					{"id": "source_ref",		"action": "read", 		"args": ["save_d", "<party>.<char_idx>.light_source"]},
					// If the light source is null then return
					{"id": "null",				"action": "branch", 	"args": [["<source_ref>", "==", undefined], {"action": "return"}]},
					// Decrement the use counter
					{"id": "uses",				"action": "read", 		"args": ["save_d", "<party>.<char_idx>.<source_ref>.meta.use"]},
					{"id": "light",				"action": "math", 		"args": [["<uses.at>", "-", "<by_amount>"], "max", 0]},
					{"id": "light",				"action": "write", 		"args": ["save_d", "<party>.<char_idx>.<source_ref>.meta.use.at", "<light>"]},
					// Log light source stats
					{"id": "name",				"action": "read", 		"args": ["save_d", "<party>.<char_idx>.name"]},
					{"id": "null",				"action": "log", 		"args": ["<name>'s used light source: (<uses.at>/<uses.max>)"]},
					// If 0 and a consumable item then delete it
					{"id": "null",				"action": "branch", 	"args": [["<uses.at>", "==", 0], {"action": "inject", "args":["character.light_sources.use.consumed", ["<party>", "<char_idx>", "<source_ref>"]]}]},
				],

				consumed: [
					["party", "char_idx", "source_ref"],
					// Log the light source being consumed
					{"id": "name",				"action": "read", 		"args":["save_d", "<party>.<char_idx>.name"]},
					{"id": "source",			"action": "read", 		"args":["save_d", "<party>.<char_idx>.<source_ref>.name"]},
					{"id": "type",				"action": "read", 		"args": ["save_d", "<party>.<char_idx>.<source_ref>.type"]},
					{"id": "null",				"action": "log", 		"args":["<name>'s <source> has run out"]},
					// Is if a consumable
					{"id": "null",				"action": "branch", 	"args": [["<type>", "!=", "light_use"], {"action": "return"}]},
						// Delete the item
						{"id": "null",				"action": "write", 		"args":["save_d", "<party>.<char_idx>.<source_ref>", "null"]},
						{"id": "null",				"action": "inject", 	"args":["character.light_sources.delete", ["<party>", "<char_idx>", "<source_ref>", "light_source"]]},
				],
			}
		},

		listener: {
			add: [
				["party", "char_idx", "audience", "listener", "limit", "events"],
				{"id": "log",			"action": "log", 					"args": ["<party>.<char_idx>:<audience>:<listener>"]},
				{"id": "null",		"action": "listen", 			"args": ["<party>.<char_idx>:<audience>:<listener>", "+", "<events>", "<limit>"]}
			],
	
			delete: [
				["party", "char_idx", "audience", "listener", "limit", "events"],
				{"id": "log",			"action": "log", 					"args": ["<party>.<char_idx>:<audience>:<listener>"]},
				{"id": "null",		"action": "listen", 			"args": ["<party>.<char_idx>:<audience>:<listener>", "-", "<events>", "<limit>"]}
			],
		},
	},

	// ------------------------------------------------------------------------------------------------------- Effects
	effects: {
		add: [
			["party", "char_idx", "source_ref", "effect_id"],
			{"id": "effect", 		"action": "copy", 		"args": ["game_d", "tables.effects.<effect_id>"]},
			{"id": "e_rule", 		"action": "get", 		"args": ["<effect>", "rule"]},
			{"id": "e_args", 		"action": "get", 		"args": ["<effect>", "args"]},
			{"id": "e_args", 		"action": "var_sub", 	"args": [0, "<e_args>"]},
			{"id": "result", 		"action": "inject",		"args": ["<e_rule.0>.<e_rule.1>", "<e_args>"]},
			{"id": "null",			"action": "return", 	"args": ["<result>"]},
		],

		add_to_party: [
			["party", "source_ref", "effect_id"],
			{"id": "party_size",	"action": "size", 		"args": ["save_d", "<party>"]},
			{"id": "p_range",		"action": "range", 		"args": ["<party_size>"]},
			{"id": "effects", 		"action": "loop", 		"args": ["effects.add", "<p_range>", ["<party>", "$idx$", "<source_ref>", "<effect_id>"]]},
			{"id": "null",			"action": "return", 	"args": ["<effects>"]},
		],

		add_many: [
			["party", "char_idx", "source_ref", "effect_ids"],
			{"id": "effects", 		"action": "loop", 		"args": ["effects.add", "<effect_ids>", ["<party>", "<char_idx>", "<source_ref>", "$idx$"]]},
			{"id": "null",			"action": "return", 	"args": ["<effects>"]},
		],

		add_many_to_party: [
			["party", "source_ref", "effect_ids"],
			{"id": "party_size",	"action": "size", 		"args": ["save_d", "<party>"]},
			{"id": "p_range",		"action": "range", 		"args": ["<party_size>"]},
			{"id": "effects", 		"action": "loop", 		"args": ["effects.add_many", "<p_range>", ["<party>", "$idx$", "<source_ref>", "<effect_ids>"]]},
			{"id": "null",			"action": "return", 	"args": ["<effects>"]},
		],

		delete: [
			["party", "char_idx", "source_ref", "effect_id"],
			{"id": "effect", 		"action": "copy", 		"args": ["game_d", "tables.effects.<effect_id>"]},
			{"id": "e_rule", 		"action": "get", 		"args": ["<effect>", "rule"]},
			{"id": "e_args", 		"action": "get", 		"args": ["<effect>", "args"]},
			{"id": "e_args", 		"action": "var_sub", 	"args": [0, "<e_args>"]},
			{"id": "result", 		"action": "branch",		"args": ["<e_rule.2>", {"action": "inject",	"args": ["<e_rule.0>.<e_rule.2>", "<e_args>"]}]},
			{"id": "null",			"action": "return", 	"args": ["<result>"]},
		],
		
		counters: {
			add: [
				["party", "char_idx", "source_ref", "type", "counter"],
				{"id": "counter",		"action": "set", 		"args": ["<counter>", "max", "<counter.at>"]},
				{"id": "null",			"action": "write", 		"args": ["save_d", "<party>.<char_idx>.<source_ref>.meta:{}.<type>", "<counter>"]},
			],

			reduce: [
				["party", "char_idx", "source_ref", "type"],
				{"id": "counter",		"action": "read", 		"args": ["save_d", "<party>.<char_idx>.<source_ref>.meta:{}.<type>"]},
				{"id": "delta",			"action": "math", 		"args": ["<counter.at>", "-", "<counter.by>"]},
				{"id": "counter",		"action": "set", 		"args": ["<counter>", "at", "<delta>"]},
				{"id": "null",			"action": "write", 		"args": ["save_d", "<party>.<char_idx>.<source_ref>.meta:{}.<type>", "<counter>"]},
			],

			reset: [
				["party", "char_idx", "source_ref", "type"],
				{"id": "counter",		"action": "read", 		"args": ["save_d", "<party>.<char_idx>.<source_ref>.meta:{}.<type>"]},
				{"id": "counter",		"action": "set", 		"args": ["<counter>", "at", "<counter.max>"]},
				{"id": "null",			"action": "write", 		"args": ["save_d", "<party>.<char_idx>.<source_ref>.meta:{}.<type>", "<counter>"]},
			],
		},

		surprise_companion_penalty: {
			add: [
				["party", "char_idx", "source_ref", "effect_id"],
				// Determine surprise penalty and subtract it from the stealth check: (n - 1) * 10
				{"id": "attack_s",		"action": "size", 		"args": ["save_d", "<party>"]},
				{"id": "penalty", 		"action": "math", 		"args": [[["<attack_s>", "-", 1], "*", 10]]},
				{"id": "null", 				"action": "branch", 	"args": [["<penalty>", "==", 0], {"action":"return"}]},
				{"id": "null",				"action": "inject", 	"args": ["effects.add", ["<party>", "<char_idx>", "<source_ref>.proc", "skill.stealth.-<penalty>"]]},
			],

			delete: [
				["party", "char_idx", "source_ref", "effect_id"],
				{"id": "attack_s",		"action": "size", 		"args": ["save_d", "<party>"]},
				{"id": "penalty", 		"action": "math", 		"args": [[["<attack_s>", "-", 1], "*", 10]]},
				{"id": "null", 			"action": "branch", 	"args": [["<penalty>", "==", 0], {"action":"return"}]},
				{"id": "null",			"action": "inject", 	"args": ["effects.delete", ["<party>", "<char_idx>", "<source_ref>.proc", "skill.stealth.-<penalty>"]]},
			],
		},

		surprise_fail_penalty: {
			add: [
				["party", "char_idx", "source_ref", "effect_id"],
				{"id": "null",			"action": "inject", 	"args": ["effects.add", ["<party>", "<char_idx>", "<source_ref>.proc", "skill.stealth.-10"]]},
			],

			delete: [
				["party", "char_idx", "source_ref", "effect_id"],
				{"id": "null",			"action": "inject", 	"args": ["effects.delete", ["<party>", "<char_idx>", "<source_ref>.proc", "skill.stealth.-10"]]},
			],
		},
	},

	// ------------------------------------------------------------------------------------------------------- Actions
	actions: {
		flow: {
			damage: {
				resolve: [
					["results", "body_idx", "action"],
					// Is the initiator first in move order: for piercing damage
					{"id": "is_first",		"action": "read", 		"args": ["save_d", "combat_order"]},
					{"id": "is_first",		"action": "math", 		"args": ["<is_first.0>", "==", "<results.1.party>"]},
					// Is the defender armored: for slash/bludgeon damage
					{"id": "armor",			"action": "inject", 	"args": ["character.attributes.enums.get", "<results.2.party>.<results.2.idx>", "defense", "armor"]},
					{"id": "armor",			"action": "math", 		"args": ["<armor>", ".", "<body_idx>"]},
					{"id": "is_armor",		"action": "math", 		"args": ["<armor>", ">", 0]},
					// Create var with armor and first
					{"id": "meta",			"action": "resolve", 	"args": [{"is_first": "<is_first>", "is_armor": "<is_armor>", "armor": "<armor>"}]},

					// Store values in the heap so that other events can add to it
					{"id": "name",			"action": "read", 		"args": ["save_d", "<results.1.party>.<results.1.idx>.name"]},
					{"id": "null",			"action": "h_put", 		"args": ["<results.1.party>.<results.1.idx>.<name>", "<action>"]},
					{"id": "null",			"action": "event",		"args": ["<results.1.party>.<results.1.idx>.combat.action.damage", {"path": "<results.1.party>.<results.1.idx>", "name": "<name>"}]},
					{"id": "actions",		"action": "h_get", 		"args": ["<results.1.party>.<results.1.idx>.<name>"]},

					// Critical count for determining how many times to apply the action (aka some perks x3 crit)
					{"id": "crit_itr",		"action": "resolve", 	"args": [{"idx": 0, "limit": 0}]},
					{"id": "null",			"action": "branch",		"args": ["<results.1.roll.crit>", null, {"action": "goto", "args": ["id.rolls.next"]}]},
						{"id": "tribe",			"action": "event", 		"args": ["save_d", "<results.2.party>.<results.2.idx>.biography.tribe"]},
						{"id": "crit_itr",		"action": "resolve", 	"args": [{"idx": 0, "limit": 1}]},
						{"id": "null",			"action": "event",		"args": ["<results.1.party>.<results.1.idx>.combat.action.damage.critical", {"id": "<results.2.party>.<results.2.idx>", "tribe": "<tribe>"}]},
					
					// Determine how many damage rolls need to happen based off action and crit
					{"id": "rolls",			"action": "resolve", 	"args": [["<actions>"]]},
					{"id": "add_rolls",		"action": "branch",		"args": [["<crit_itr.idx>", "<", "<crit_itr.limit>"], null, {"action": "goto", "args": ["id.dmg_sets.next"]}]},
						{"id": "rolls",			"action": "concat", 	"args": ["<actions>"]},
						{"id": "incr",			"action": "math",		 "args": ["<crit_itr.idx>", "+", 1]},
						{"id": "crit_itr",		"action": "set", 		"args": ["<crit_iter>", "idx", "<incr>"]},
						{"id": "rolls",			"action": "goto", 		"args": ["id.add_rolls.prev"]},

					// Put the armor value into the heap
					{"id": "null",			"action": "h_put", 			"args": ["<results.2.party>.<results.2.idx>.armor", "<meta.armor>"]},
					// Loop over all initiator attack die and calculate the damage sets
					{"id": "dmg_sets", 		"action": "loop",			"args": ["actions.flow.damage.initiator", "<rolls>", ["<results>", "$idx$", "<meta>"]]},
					// Handle Modifiers
					{"id": "dmg_sets", 		"action": "inject",			"args": ["actions.flow.damage.modifiers", ["<results>", "<dmg_sets>", "<meta>"]]},
					// Loop over all the damage sets and apply them to the defender
					{"id": "null",			"action": "event",			"args": ["<results.2.party>.<results.2.idx>.combat.action.damage.amount", "dmg_sets"]},
					{"id": "hrt_sets", 		"action": "loop",			"args": ["actions.flow.damage.defender", "<dmg_sets>", ["<results>", "$idx$", "<meta>"]]},
				],

			initiator: [
				["results", "action", "meta"],
				// Get damage roll
				{"id": "damage", 			"action": "inject", 	"args": ["roll_plus_one", ["<action.1>"]]},
				{"id": "pierce",			"action": "ifelse",		"args": [["meta.is_first", "==",  true], "&", ["<action.0>", "==", "piercing"], 1, 0]},
				{"id": "slash",				"action": "ifelse",		"args": [["meta.is_armor", "==", false], "&", ["<action.0>", "==", "slashing"], 1, 0]},
				{"id": "damage", 			"action": "math", 		"args": [["<damage>", "+", "<pierce>"], "+", "<slash>"]},
				{"id": "dealt", 			"action": "inject", 	"args": ["lookup_against_table", ["tables.damage_dealt", "<damage>"]]},
				// Return Attacker Rolled Damage set
				{"id": "return",			"action": "return", 	"args": [{"roll": "<damage>", "amount": "<dealt>", "type": "<action.0>", "modifier": "<action.2>"}]},
			],

			modifiers: [
				["results", "damage", "meta"],
				// Find the lowest roll among them
				{"id": "lowest",			"action": "reduce",		"args": ["<damage.0>", "<"]},
				{"id": "mod_dmg",			"action": "reduce",		"args": ["<lowest.1.3>", "+"]},
				// Update the lowest roll with the modifiers
				{"id": "mod_dmg",			"action": "reduce",		"args": ["<lowest.1.0>", "+", "<mod_dmg>"]},
				{"id": "mod_dealt", 		"action": "inject", 	"args": ["lookup_against_table", ["tables.damage_dealt", "<mod_dmg>"]]},
				{"id": "mod", 				"action": "resolve", 	"args": [{"roll": "<mod_dmg>", "amount": "<mod_dealt>", "type": "<lowest.1.2>", "modifier": "<lowest.1.3>"}]},
				// Update the damage list at the lowest idx
				{"id": "updated",			"action": "set",		"args": ["<results>", "<lowest.0>", "<mod>"]},
				{"id": "return",			"action": "return", 	"args": ["<updated>"]},
			],

			defender: [
				["results", "damage", "meta"],
					// Handle armor and Bludgeoning
					{"id": "armor",			"action": "h_get", 		"args": ["<results.2.party>.<results.2.idx>.armor"]},
					{"id": "bludge",		"action": "ifelse",		"args": [[["<armor>", ">",  0], "&", ["<damage.type>", "==", "bludgeoning"], "&", ["<damage.amount>", ">", 0]], 1, 0]},
					{"id": "armor", 		"action": "math", 		"args": ["<armor>", "-", "<bludge>"]},
					{"id": "armor", 		"action": "branch", 	"args": [["<armor>", ">", "<damage.amount>"], {"action": "math", "args": ["<armor>", "-", "<damage.amount>"]}, {"action": "resolve", "args": [0]}]},
					{"id": "dmg_dlt", 		"action": "branch", 	"args": [["<damage.amount>", ">", "<armor>"], {"action": "math", "args": ["<damage.amount>", "-", "<armor>"]}, {"action": "resolve", "args": [0]}]},
					{"id": "armor",			"action": "h_put", 		"args": ["<results.2.party>.<results.2.idx>.armor", "<armor>"]},

					// Get defense modifiers
					{"id": "dmg_table", 	"action": "read", 		"args": ["game_d", "tables.damage_types"]},
					{"id": "dmg_idx", 		"action": "reduce", 	"args": ["<dmg_table>", "==", "<damage.type>"]},
					{"id": "affinity", 		"action": "read", 		"args": ["save_d", "<results.2.party>.<results.2.idx>.enums.defence.affinity"]},
					{"id": "affinity", 		"action": "get", 		"args": ["<affinity>", "<dmg_idx.0>"]},
					{"id": "reduction", 	"action": "read", 		"args": ["save_d", "<results.2.party>.<results.2.idx>.enums.defence.reduction"]},
					{"id": "reduction", 	"action": "get", 		"args": ["<reduction>", "<dmg_idx.0>"]},

					// Adjust damage by Affinity/Reduction
					{"id": "dmg_dlt", 		"action": "math", 		"args": ["<dmg_dlt>", "*", "<affinity>"]},
					{"id": "dmg_dlt", 		"action": "math", 		"args": ["<dmg_dlt>", "-", "<reduction>"]},
					{"id": "all_dealt", 	"action": "resolve", 	"args": ["<dmg_dlt>"]},
					
					// Apply Damage to Toughness
					{"id": "remainder",		"action": "inject", 	"args": ["character.attributes.stats.points.minus", ["<results.2.party>", "<results.2.idx>", "base", "toughness", "<all_dealt>"]]},
					// Apply Damage to Health
					{"id": "remainder",		"action": "inject", 	"args": ["character.attributes.stats.points.minus", ["<results.2.party>", "<results.2.idx>", "base", "health", "<remainder.unused>"]]},
					// Return received damage
					{"id": "return",		"action": "return", 	"args": ["<all_dealt>"]},
				]
			},

			recover: {
				resolve: [
					["results", "body_idx", "action"],
					// Store values in the heap so that other events can add to it
					{"id": "name",				"action": "read", 		"args": ["save_d", "<results.1.party>.<results.1.idx>.name"]},
					{"id": "null",				"action": "h_put", 		"args": ["<results.1.party>.<results.1.idx>.<name>", "<action>"]},
					{"id": "null",				"action": "event",		"args": ["<results.1.party>.<results.1.idx>.combat.action.recover", {"path": "<results.1.party>.<results.1.idx>", "name": "<name>"}]},
					{"id": "actions",			"action": "h_get", 		"args": ["<results.1.party>.<results.1.idx>.<name>"]},

					// Critical count for determining how many times to apply the action (aka some perks x3 crit)
					{"id": "crit_itr",			"action": "resolve", 	"args": [{"idx": 0, "limit": 0}]},
					{"id": "null",				"action": "branch",		"args": ["<results.1.roll.crit>", null, {"action": "goto", "args": ["id.rolls.next"]}]},
						{"id": "tribe",			"action": "event", 		"args": ["save_d", "<results.2.party>.<results.2.idx>.biography.tribe"]},
						{"id": "crit_itr",		"action": "resolve", 	"args": [{"idx": 0, "limit": 1}]},
						{"id": "null",			"action": "event",		"args": ["<results.1.party>.<results.1.idx>.combat.action.recover.critical", {"id": "<results.2.party>.<results.2.idx>", "tribe": "<tribe>"}]},
					
					// Determine how many damage rolls need to happen based off action and crit
					{"id": "rolls",				"action": "resolve", 	"args": [["<actions>"]]},
					{"id": "add_rolls",			"action": "branch",		"args": [["<crit_itr.idx>", "<", "<crit_itr.limit>"], null, {"action": "goto", "args": ["id.dmg_sets.next"]}]},
						{"id": "rolls",			"action": "concat", 	"args": ["<actions>"]},
						{"id": "incr",			"action": "math",		"args": ["<crit_itr.idx>", "+", 1]},
						{"id": "crit_itr",		"action": "set", 		"args": ["<crit_iter>", "idx", "<incr>"]},
						{"id": "rolls",			"action": "goto", 		"args": ["id.add_rolls.prev"]},

					// Loop over all initiator attack die and calculate the damage sets
					{"id": "rcvr_sets", 		"action": "loop",		"args": ["actions.flow.recover.initiator", "<rolls>", ["<results>", "$idx$"]]},
					// Handle Modifiers
					{"id": "rcvr_sets", 		"action": "inject",		"args": ["actions.flow.recover.modifiers", ["<results>", "<rcvr_sets>"]]},
					// Loop over all the damage sets and apply them to the defender
					{"id": "null",				"action": "event",		"args": ["<results.2.party>.<results.2.idx>.combat.recover.amount", "rcvr_sets"]},
					{"id": "heal_sets", 		"action": "loop",		"args": ["actions.flow.recover.defender", "<rcvr_sets>", ["<results>", "$idx$"]]},
				],

			initiator: [
				["results", "action"],
				// Get damage roll
				{"id": "recover", 		"action": "inject", 	"args": ["roll_plus_one", ["<action.1>"]]},
				// Return Initiator Rolled Recovery
				{"id": "return",		"action": "return", 	"args": [{"roll": "<recover>", "amount": "<recover>", "type": "<action.0>", "modifier": "<action.2>"}]},
			],

			modifiers: [
				["results", "recover"],
				// Find the lowest roll among them
				{"id": "lowest",		"action": "reduce",		"args": ["<recover.roll>", "<"]},
				{"id": "mod_rcvr",		"action": "math",		"args": ["<recover>", ".", "roll"]},
				{"id": "mod_rcvr",		"action": "reduce",		"args": ["<mod_rcvr>", "+"]},
				// Update the lowest roll with the modifiers
				{"id": "mod_rcvr",		"action": "reduce",		"args": ["<lowest.1.roll>", "+", "<mod_rcvr>"]},
				{"id": "mod", 			"action": "resolve", 	"args": [{"roll": "<mod_rcvr>", "amount": "<mod_rcvr>", "type": "<lowest.1.type>", "modifier": "<lowest.1.modifier>"}]},
				// Update the damage list at the lowest idx
				{"id": "updated",		"action": "set",		"args": ["<results>", "<lowest.0>", "<mod>"]},
				{"id": "return",		"action": "return", 	"args": ["<updated>"]},
			],

			defender: [
				["results", "recover", "meta"],
					// Apply Recovery to Toughness
					{"id": "remainder",		"action": "inject", 	"args": ["character.attributes.stats.fill", ["<results.2.party>", "<results.2.idx>", "base", "toughness", "<recover>"]]},
					// Apply Recovery to Health
					{"id": "remainder",		"action": "inject", 	"args": ["character.attributes.stats.fill", ["<results.2.party>", "<results.2.idx>", "base", "health", "<remainder.unused>"]]},
					// Return received damage
					{"id": "return",		"action": "return", 	"args": ["<recover>"]},
				]
			},

			effect: {
				resolve: [
					["results", "body_idx", "status"],
					// Roll for saving throw
					{"id": "results",				"action": "inject", 	"args": ["dice.skill.check", ["<results.2.party>", "<results.2.idx>", "<status.type>", "<status.sub_type>"]]},
					// If failed apply effect
					{"id": "check",					"action": "branch",		"args": ["<results.pass>", {"action": "return"}]},
						{"id": "effect",				"action": "loop", 		"args": ["effects.add", "<status.effects>", ["<results.2.party>", "<results.2.idx>", "combat.$idx$", "$idx$"]]},
				],
			}
		},

		basic: {
			roll: {
				damage: [
					["results", "body_part", "action"],
					{"id": "null",		"action": "inject", 	"args": ["actions.flow.damage.resolve", ["<results>", "<body_part>", "<action>"]]},
				],

				recover: [
					["results", "body_part", "action"],
					{"id": "null",		"action": "inject", 	"args": ["actions.flow.recover.resolve", ["<results>", "<body_part>", "<action>"]]},
				],

				effect: [
					["results", "body_part", "action"],
					{"id": "null",		"action": "inject", 	"args": ["actions.flow.effect.resolve", ["<results>", "<body_part>", "<action>"]]},
				],
			}
		},

		masteries: {

		},

		// ------------------------------------------------------------------------------------------------------- Enemies
		enemies: {
			skeletal_horror: {
				ethereal_grasp: [
					["initiator_party", "initiator_idx", "defender_party", "defender_idx", "action"],
					// Roll skill check
					{"id": "is_failed",		"action": "inject", 	"args": ["dice.damage.magical_effect_roll", ["__0__", "__1__", "__2__", "__3__", "__4__"]]},
					{"id": "extra_mods",	"action": "ifelse", 	"args": ["<is_failed.0>", ["/", 2], ["+", 0]]},
					// Roll Damage
					{"id": "attacks", 		"action": "inject",		"args": ["handle_damage_rolls", ["__0__", "__1__", "<attack_die>", "<is_armor>"]]},
					{"id": "defended",		"action": "loop", 		"args": ["resolve_defender_damaged", "<dmg_sets>", ["__2__.__3__", "$idx$", "<is_armor>", "<extra_mods>"]]},
					{"id": "sum_dmg_1", 	"action": "reduce",		"args": ["<defended>", "+"]},
					// Roll Crit Damage
					{"id": "attacks", 		"action": "branch", 	"args": [["<is_failed.1>", "==", 1], {"action":"inject", "args":["handle_damage_rolls", ["__0__", "__1__", "<attacks>", "<is_armor>"]]}, null]},
					{"id": "defended", 		"action": "branch", 	"args": [["<is_failed.1>", "==", 1], {"action":"loop", "args":["resolve_defender_damaged", "<attacks>", ["__2__.__3__", "$idx$", "<is_armor>"]]}, null]},
					{"id": "sum_dmg_2", 	"action": "branch", 	"args": [["<is_failed.1>", "==", 1], {"action":"reduce","args":["<defended>", "+"]}, null]},
					{"id": "dummy", 			"action": "branch", 	"args": ["<is_failed.0>", {"action":"return"}]},
					// If is_successful
					{"id": "healing",			"action": "math", 		"args": [["<sum_dmg_1>", "+", "<sum_dmg_2>"], "/", 2]},
					{"id": "health",			"action": "read", 		"args": ["<save_d>", "__0__.__1__.stats.health"]},
					{"id": "healing",			"action": "math", 		"args": ["<healing>", "+", "<health>"]},
					{"id": "healing",			"action": "clamp", 		"args": ["<healing>", 0, "<health.1>"]},
					{"id": "healed",			"action": "write", 		"args": ["save_d", "__0__.__1__.stats.health.0", "<healing>"]},
				],

				haunting_wail: [
					["initiator_party", "initiator_idx", "defender_party", "defender_idx", "action"],
					// Roll skill check
					{"id": "is_failed",		"action": "inject", 	"args": ["dice.damage.magical_effect_roll", ["__0__", "__1__", "__2__", "__3__", "__4__"]]},
					{"id": "dummy", 		"action": "branch", 	"args": ["<is_failed.0>", {"action":"return"}]},
					// Get effects on Char
					{"id": "def_effect",	"action": "read", 		"args": ["save_d", "__0__.__1__.effects.turn"]},
					{"id": "effect_ids",	"action": "filter", 	"args": ["id", "<def_effect>", ".", "1:*"]},
					{"id": "effect_idx",	"action": "reduce", 	"args": ["<effect_ids>", "==", "stun"]},
					{"id": "stun",				"action": "branch", 	"args": [["<effect_idx.0>", ">=", -1], {"action":"get", "args":["<def_effect>", "<effect_idx.0>"]}, {"id":"stun","#":1}]},
					{"id": "stun",				"action": "branch", 	"args": [["<effect_idx.0>", ">=", 0], {"action":"save", "args":["save_d", "__0__.__1__.effects.turn.<effect_idx>", "<stun>"]},{"action":"concat", "args":["save_d", "__0__.__1__.effects.turn", "<stun>"]}]},
				],

				vengeful_onslaught: [
					["initiator_party", "initiator_idx", "defender_party", "defender_idx", "action"],
					// Roll skill check
					{"id": "is_failed",		"action": "inject", 	"args": ["physical_attack_roll", ["__0__", "__1__", "__2__", "__3__", "__4__"]]},
					{"id": "dummy", 		"action": "branch", 	"args": ["<is_failed.0>", {"action":"return"}]},
					{"id": "free_action",	"action": "inject", 	"args": ["save_d", ["__0__.__1__.combat.standard.actions.1"]]},
				],
			},
		},
	},
})
