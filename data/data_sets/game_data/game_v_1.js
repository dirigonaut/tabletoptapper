const game_data = Object({
	data: {
		"enums": {
			"die": { "d100": 7, "d20": 6, "d12": 5, "d10": 4, "d8": 3, "d6": 2, "d4": 1, "d2": 0 },
		},
		"tables": {
			"criticals": [100, 11, 22, 33, 44, 55, 66, 77, 88, 99],
			"difficulty": [30, 20, 10, 0, -10, -20, -30],
			"damage_modifier": [0, 0.5, 1.0, 2.0, -1.0],
			"damage_dealt": [0, 1, 1, 1, 2, 2, 2, 3, 3, 4],
			"area_type": ["corridor", "room", "room", "room"],
			"doors": [[1,0,0,0],[1,1,0,0],[1,0,1,0],[1,0,0,1],[1,1,1,0],[1,0,1,1],[1,1,1,1],[1,1,1,1]],
			"locked": [[0,0,0,0],[0,0,0,0],[0,2,0,0],[0,0,2,0],[0,0,0,2],[0,2,2,0],[0,2,0,2],[0,2,2,2]],
			"trapped": [[0,0,0,0],[0,0,0,0],[0,4,0,0],[0,0,4,0],[0,0,0,4],[0,4,4,0],[0,4,0,4],[0,4,4,4]],
			"damage_types": ["acid", "air", "arcane", "bludgeon", "charm", "cold", "disease", "earth", "fire", "holy", "infernal", "necrotic", "pierce", "poison", "psychic", "slash", "water", "all"],
			"conditions": ["bleed", "blind", "burn", "charm", "conceal", "cursed", "daze", "disease", "entangle", "ethereal", "fear", "paralyze", "poison", "prone", "sleep", "stun", "belt_damage"],
			"madness": [],
			"perks": [],
			"stats": ["health", "toughness", "aether", "sanity", "magic_resist"],
			"skills": {
				"weapon":		["blade", "bludgeon",	"pole", "fist"],
				"ability":	["acrobatics", "athletics", "dodge", "endurance", "medicine", "perception", "resolve", "reason", "scavenge", "stealth", "thievery"],
				"all":			["acrobatics", "athletics", "blade", "bludgeon","dodge", "endurance", "fist", "medicine", "perception", "pole", "resolve", "reason", "scavenge", "stealth", "thievery"]
			},
			"darkness": [
				"hell_bats"
			],
			"bodies": {
				"distribution": {
					"arachnid":			["right_rear_leg","right_rear_leg","left_rear_leg","left_rear_leg","mid_right_leg","mid_right_leg","mid_left_leg","mid_left_leg","fore_right_leg","fore_right_leg","fore_left_leg","fore_left_leg","abdomen","abdomen","front_right_leg","front_right_leg","front_left_leg","front_left_leg","cephalothorax","cephalothorax"],
					"insectoid":		["right_rear_leg","left_rear_leg","right_middle_leg","left_middle_leg","abdomen","abdomen","abdomen","abdomen","abdomen","thorax","thorax","thorax","thorax","thorax","right_front_leg","left_front_leg","head","head","head","head"],
					"quadruped":		["right_hind_leg","right_hind_leg","right_hind_leg","left_hind_leg","left_hind_leg","left_hind_leg","hindquarters","hindquarters","hindquarters","forequarters","forequarters","forequarters","right_front_leg","right_front_leg","right_front_leg","left_front_leg","left_front_leg","left_front_leg","head","head"],
					"humanoid":			["right_leg","right_leg","right_leg","left_leg","left_leg","left_leg","abdomen","abdomen","abdomen","chest","chest","chest","left_arm","left_arm","left_arm","right_arm","right_arm","right_arm","head","head"],
					"serpentoid":		["body","body","body","body","body","body","body","body","body","body","body","body","body","body","body","body","body","body","head","head"],
					"winged_biped":	["right_leg","left_leg","chest","chest","chest","right_wing","right_wing","right_wing","right_wing","left_wing","left_wing","left_wing","left_wing","right_arm","left_arm","head","head","head","head","head"],
				},
				"unique": {
					"arachnid":			["right_rear_leg","left_rear_leg","mid_right_leg","mid_left_leg","fore_right_leg","fore_left_leg","abdomen","front_right_leg","front_left_leg","cephalothorax"],
					"insectoid":		["right_rear_leg","left_middle_leg","abdomen","thorax","right_front_leg","left_front_leg","head"],
					"quadruped":		["right_hind_leg","left_hind_leg","hindquarters","forequarters","right_front_leg","left_front_leg","head"],
					"humanoid":			["right_leg","left_leg","abdomen","chest","left_arm","right_arm","head"],
					"serpentoid":		["body","head"],
					"winged_biped":	["right_leg","left_leg","chest","right_wing","left_wing","right_arm","left_arm","head"],					
				},
			},
			"enemies": [
				"blightfang_rats", 
				"amalgam", 
				"corpse_ant", 
				"skeletal_horror"],
			"overseers": [
				"infernal_tormentor"
			],
			"events": [
				"trader", 
				"magical_item"],
			"scavenge": [
				"You uncover some grisly remains. Make a successful Resolve check or lose 1 Sanity", 
				"You find nothing of interest", 
				"You discover D20₵", 
				"You find D4 Crafting Supplies", 
				"You discover 2D20₵", 
				"You find D4 Cooking Supplies", 
				"You discover D100₵", 
				"Roll on the Spoils table"],
			"masteries":[
				"abyssal_reaver",
				"arcanist",
				"brawler",
				"bulwark",
				"duskblade",
				"emissary",
				"flamecaster",
				"frostcaster",
				"gravecaller",
				"hexmancer",
				"icon_caller",
				"mindbinder",
				"ritualist",
				"stormbrand",
				"tracker",
				"umber_phantom",
				"weapon_master",
				"wraith",
				"wraith_spawn",
				"zealot"
			],
			"actions": {
				"combat":{
					"standard": {
						// ----------------------------------------------------------------------------------------------------- Weapons
						"slash.blade": 				{"name": "slash.blade",						"type": "standard",		"check": {"type": "oppose",	"skills": ["weapon.blade", "combat.attack", "combat.initiative"],			"vantage": "+combat+attack"				},	"target": {"party": 1, "count": 1},		"rule": ["actions.basic.attack_roll",	["<roll_results>", "<body_part>", [{"type":"slashing", 		"roll": 6, "modifier": 0}]]]},
						"slash.fist": 				{"name": "slash.fist",						"type": "standard",		"check": {"type": "oppose",	"skills": ["weapon.fist", "combat.attack", "combat.initiative"],			"vantage": "+combat+attack"				},	"target": {"party": 1, "count": 1},		"rule": ["actions.basic.attack_roll",	["<roll_results>", "<body_part>", [{"type":"slashing", 		"roll": 6, "modifier": 0}]]]},
						"slash.pole": 				{"name": "slash.pole",						"type": "standard",		"check": {"type": "oppose",	"skills": ["weapon.pole", "combat.attack", "combat.initiative"],			"vantage": "+combat+attack"				},	"target": {"party": 1, "count": 1},		"rule": ["actions.basic.attack_roll",	["<roll_results>", "<body_part>", [{"type":"slashing", 		"roll": 6, "modifier": 0}]]]},
						"stab.blade": 				{"name": "stab.blade",						"type": "standard",		"check": {"type": "oppose",	"skills": ["weapon.blade", "combat.attack", "combat.initiative"],			"vantage": "+combat+attack"				},	"target": {"party": 1, "count": 1},		"rule": ["actions.basic.attack_roll",	["<roll_results>", "<body_part>", [{"type":"piercing", 		"roll": 6, "modifier": 0}]]]},
						"stab.bludgeon":			{"name": "stab.bludgeon",					"type": "standard",		"check": {"type": "oppose",	"skills": ["weapon.bludgeon", "combat.attack", "combat.initiative"],	"vantage": "+combat+attack"				},	"target": {"party": 1, "count": 1},		"rule": ["actions.basic.attack_roll",	["<roll_results>", "<body_part>", [{"type":"piercing", 		"roll": 6, "modifier": 0}]]]},
						"stab.fist":					{"name": "stab.fist",							"type": "standard",		"check": {"type": "oppose",	"skills": ["weapon.fist", "combat.attack", "combat.initiative"],			"vantage": "+combat+attack"				},	"target": {"party": 1, "count": 1},		"rule": ["actions.basic.attack_roll",	["<roll_results>", "<body_part>", [{"type":"piercing", 		"roll": 6, "modifier": 0}]]]},
						"stab.pole":					{"name": "stab.pole",							"type": "standard",		"check": {"type": "oppose",	"skills": ["weapon.pole", "combat.attack", "combat.initiative"],			"vantage": "+combat+attack"				},	"target": {"party": 1, "count": 1},		"rule": ["actions.basic.attack_roll",	["<roll_results>", "<body_part>", [{"type":"piercing", 		"roll": 6, "modifier": 0}]]]},
						"smash.bludgeon":			{"name": "smash.bludgeon",				"type": "standard",		"check": {"type": "oppose",	"skills": ["weapon.bludgeon", "combat.attack", "combat.initiative"],	"vantage": "+combat+attack"				},	"target": {"party": 1, "count": 1},		"rule": ["actions.basic.attack_roll",	["<roll_results>", "<body_part>", [{"type":"bludgeoning", "roll": 6, "modifier": 0}]]]},
						"smash.fist":					{"name": "smash.fist",						"type": "standard",		"check": {"type": "oppose",	"skills": ["weapon.fist", "combat.attack", "combat.initiative"],			"vantage": "+combat+attack"				},	"target": {"party": 1, "count": 1},		"rule": ["actions.basic.attack_roll",	["<roll_results>", "<body_part>", [{"type":"bludgeoning", "roll": 6, "modifier": 0}]]]},
						"smash.pole":					{"name": "smash.pole",						"type": "standard",		"check": {"type": "oppose",	"skills": ["weapon.pole", "combat.attack", "combat.initiative"],			"vantage": "+combat+attack"				},	"target": {"party": 1, "count": 1},		"rule": ["actions.basic.attack_roll",	["<roll_results>", "<body_part>", [{"type":"bludgeoning", "roll": 6, "modifier": 0}]]]},
						// ----------------------------------------------------------------------------------------------------- Skeletal_Horror
						"cursed_slash":				{"name": "cursed_slash",					"type": "standard",		"check": {"type": "oppose",	"skills": ["weapon.blade", "combat.attack", "combat.initiative"],			"vantage": "+combat+attack"				},	"target": {"party": 1, "count": 1 },	"rule": ["actions.basic.attack_roll",									["<roll_results>", "<body_part>", [{"type": "slashing",	"roll": 8, "modifier": 0}]]]},
						"ethereal_grasp":			{"name": "ethereal_grasp",				"type": "standard",		"check": {"type": "skill",	"skills": ["skill.magic_resist"],																			"vantage": "+skill+magic_resist"	},	"target": {"party": 1, "count": 1 },	"rule": ["actions.skeletal_horror.ethereal_grasp",		["<roll_results>", "<body_part>", [{"type": "necrotic",	"roll": 6, "modifier": 0}]]]},
						"haunting_wail":			{"name": "haunting_wail",					"type": "standard",		"check": {"type": "skill",	"skills": ["skill.magic_resist"],																			"vantage": "+skill+magic_resist"	},	"target": {"party": 1, "count": -1},	"rule": ["actions.skeletal_horror.haunting_wail",			["<roll_results>", "<body_part>",	[{"type": "skill", "sub_type": "resolve", "effects": ["conditions.stunned"]}]]]},
						"vengeful_onslaught":	{"name": "vengeful_onslaught",		"type": "standard",		"check": {"type": "oppose",	"skills": ["weapon.blade", "combat.attack", "combat.initiative"],			"vantage": "+combat+attack"				},	"target": {"party": 1, "count": 1 },	"rule": ["actions.skeletal_horror.vengeful_onslaught",["<roll_results>", "<body_part>", [{"type": "piercing",	"roll": 10, "modifier": 0}]]]},
					}
				},
				"monsters": {
					"skeletal_horrors": {

							"cursed_slash": { "name": "cursed_slash",
								"rule": "physical_attack_roll",
								"die": [[8, ["Slash"], 0]],
								"check": { "attack": "combat", "defend": null },
								"desc": "swings its weapon with an eerie precision, dealing D8 Slashing damage." },
							"ethereal_grasp": { "name": "ethereal_grasp",
								"rule": "ethereal_grasp",
								"die": [[6, ["Necrotic"], 0]],
								"check": { "attack": "combat", "defend": "endurance" },
								"desc": "reaches out with its hand, attempting to touch the essence of a target's life force. The target must make an Endurance check. On a failed check, they take D6 Necrotic damage, and the Skeletal Horror regains Health equal to half the damage dealt (rounding up). On a successful roll, the target takes half damage (rounding up), and the Skeletal Horror doesn't regain Health." },		
							"haunting_wail": { "name": "haunting_wail",
								"rule": "haunting_wail",
								"die": null,
								"check": { "attack": "combat", "defend": "resolve" },
								"desc": "lets out a haunting wail that reverberates through the air. All creatures must make a successful Resolve check to avoid becoming Stunned for 1 round." },
							"vengeful_onslaught": { "name": "vengeful_onslaught",
								"rule": "vengeful_onslaught",
								"die": [[10, ["Pierce"], 0]],
								"check": { "attack": "combat", "defend": null},
								"desc": "charges forward with relentless determination, targeting one creature. It makes a melee attack against the target, dealing D10 Piercing damage on a hit. If the attack hits, the Skeletal Horror immediately uses its Ethereal Grasp ability as a Free Action." },
					}
				},
			},
			"effects": {
				"aged": {
					"poisoned": {},
					"explosive": {},
					"impotent": {},
					"normal": {},
					"refined": {},
					"enhanced": {}
				},
				"counter": {
					"use": {
						"1":				{	"desc": "The item has 1 uses.",									"rule": ["effects.counters", "add"],		"args": ["<party>", "<char_idx>", "<source_ref>", "use", {"at": 1,		"by": 1}]},
						"6":				{	"desc": "The item has 6 uses.",									"rule": ["effects.counters", "add"],		"args": ["<party>", "<char_idx>", "<source_ref>", "use", {"at": 6,		"by": 1}]},
						"8":				{	"desc": "The item has 8 uses.",									"rule": ["effects.counters", "add"],		"args": ["<party>", "<char_idx>", "<source_ref>", "use", {"at": 8,		"by": 1}]},
						"10":				{	"desc": "The item has 10 uses.",								"rule": ["effects.counters", "add"],		"args": ["<party>", "<char_idx>", "<source_ref>", "use", {"at": 10,		"by": 1}]},
						"12":				{	"desc": "The item has 12 uses.",								"rule": ["effects.counters", "add"],		"args": ["<party>", "<char_idx>", "<source_ref>", "use", {"at": 12,		"by": 1}]},
						"20":				{	"desc": "The item has 20 uses.",								"rule": ["effects.counters", "add"],		"args": ["<party>", "<char_idx>", "<source_ref>", "use", {"at": 20,		"by": 1}]},
					},
					"integrity": {
						"1":				{	"desc": "The item has 1 integrity.",						"rule": ["effects.counters", "add"], 		"args": ["<party>", "<char_idx>", "<source_ref>", "integrity", {"at": 1,		"by": 1}]},
						"6":				{	"desc": "The item has 6 integrity.",						"rule": ["effects.counters", "add"], 		"args": ["<party>", "<char_idx>", "<source_ref>", "integrity", {"at": 6,		"by": 2}]},
						"8":				{	"desc": "The item has 8 integrity.",						"rule": ["effects.counters", "add"], 		"args": ["<party>", "<char_idx>", "<source_ref>", "integrity", {"at": 8,		"by": 2}]},
						"10":				{	"desc": "The item has 10 integrity.",						"rule": ["effects.counters", "add"], 		"args": ["<party>", "<char_idx>", "<source_ref>", "integrity", {"at": 10,		"by": 2}]},
						"12":				{	"desc": "The item has 12 integrity.",						"rule": ["effects.counters", "add"], 		"args": ["<party>", "<char_idx>", "<source_ref>", "integrity", {"at": 12,		"by": 2}]},
					},
				},
				"light_source": {	"desc": "Set character's light source.",				"rule": ["character.light_sources", "add", "delete"], 	"args": ["<party>", "<char_idx>", "<source_ref>", "<effect_id>"]},
				"equip_to": {
					"amulet":			{	"desc": "Equipped to amulet.",									"rule": ["character.inventory.equipment", "equip", "unequip"], 	"args": ["<party>", "<char_idx>", "<source_ref>", "equipped.amulet"]},
					"hand":				{	"desc": "Equipped to either hand.",							"rule": ["character.inventory.equipment", "equip", "unequip"], 	"args": ["<party>", "<char_idx>", "<source_ref>", "equipped.hand"]},
					"main_hand":	{	"desc": "Equipped to main_hand.",								"rule": ["character.inventory.equipment", "equip", "unequip"], 	"args": ["<party>", "<char_idx>", "<source_ref>", "equipped.main_hand"]},
					"off_hand":		{	"desc": "Equipped to off_hand.",								"rule": ["character.inventory.equipment", "equip", "unequip"], 	"args": ["<party>", "<char_idx>", "<source_ref>", "equipped.off_hand"]},
					"helmet":			{	"desc": "Equipped to helmet.",									"rule": ["character.inventory.equipment", "equip", "unequip"], 	"args": ["<party>", "<char_idx>", "<source_ref>", "equipped.helmet"]},
					"torso":			{	"desc": "Equipped to torso.",										"rule": ["character.inventory.equipment", "equip", "unequip"], 	"args": ["<party>", "<char_idx>", "<source_ref>", "equipped.torso"]},
					"vambrace":		{	"desc": "Equipped to vambrace.",								"rule": ["character.inventory.equipment", "equip", "unequip"], 	"args": ["<party>", "<char_idx>", "<source_ref>", "equipped.vambrace"]},
					"greave":			{	"desc": "Equipped to greave.",									"rule": ["character.inventory.equipment", "equip", "unequip"], 	"args": ["<party>", "<char_idx>", "<source_ref>", "equipped.greave"]},
					"gloves":			{	"desc": "Equipped to gloves.",									"rule": ["character.inventory.equipment", "equip", "unequip"], 	"args": ["<party>", "<char_idx>", "<source_ref>", "equipped.gloves"]},
					"boots":			{	"desc": "Equipped to boots.",										"rule": ["character.inventory.equipment", "equip", "unequip"], 	"args": ["<party>", "<char_idx>", "<source_ref>", "equipped.boots"]},
					"ring":				{	"desc": "Equipped to ring.",										"rule": ["character.inventory.equipment", "equip", "unequip"], 	"args": ["<party>", "<char_idx>", "<source_ref>", "equipped.ring"]},
					"belt":				{	"desc": "Equipped to belt.",										"rule": ["character.inventory.equipment", "equip", "unequip"], 	"args": ["<party>", "<char_idx>", "<source_ref>", "equipped.belt"]},
					"pouch":			{	"desc": "Equipped to pouch.",										"rule": ["character.inventory.equipment", "equip", "unequip"], 	"args": ["<party>", "<char_idx>", "<source_ref>", "equipped.pouch"]},
					"belt_lamp":	{	"desc": "Equipped to belt_lamp.",								"rule": ["character.inventory.equipment", "equip", "unequip"], 	"args": ["<party>", "<char_idx>", "<source_ref>", "equipped.belt_lamp"]},
				},
				"actions": {
					"disarm":				{	"desc": "Disarm trap action.",								"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "actions", "traversal", "standard", "<source_ref>", "<effect_id>",  ["disarm", ["door.actions", "container.actions"]]]},
					"slash": {
						"blade":			{	"desc": "A slashing blade attack.",						"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "actions", "combat", "standard", "<source_ref>", "<effect_id>", "slash.blade"]},
						"fist":				{	"desc": "A slashing fist attack.",						"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "actions", "combat", "standard", "<source_ref>", "<effect_id>", "slash.fist"]},
						"pole":				{	"desc": "A slashing pole attack.",						"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "actions", "combat", "standard", "<source_ref>", "<effect_id>", "slash.pole"]},
					},
					"stab": {
						"blade":			{	"desc": "A stabbing blade attack.",						"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "actions", "combat", "standard", "<source_ref>", "<effect_id>", "stab.blade"]},
						"bludgeon":		{	"desc": "A stabbing bludgeon attack.",				"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "actions", "combat", "standard", "<source_ref>", "<effect_id>", "stab.bludgeon"]},
						"fist":				{	"desc": "A stabbing fist attack.",						"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "actions", "combat", "standard", "<source_ref>", "<effect_id>", "stab.fist"]},
						"pole":				{	"desc": "A stabbing pole attack.",						"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "actions", "combat", "standard", "<source_ref>", "<effect_id>", "stab.pole"]},
					},
					"smash": {
						"bludgeon":	{	"desc": "A smashing bludgeon attack.",					"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "actions", "combat", "standard", "<source_ref>", "<effect_id>", "smash.bludgeon"]},
						"fist":			{	"desc": "A smashing fist attack.",							"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "actions", "combat", "standard", "<source_ref>", "<effect_id>", "smash.fist"]},
						"pole":			{	"desc": "A smashing pole attack.",							"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "actions", "combat", "standard", "<source_ref>", "<effect_id>", "smash.pole"]},
					},
				},
				"passives": {

				},
				"conditions": {
					"stunned": {
						"desc": "The character loses their next turn.", 												
						"rule": ["character.listener", "add"], 
						"args": ["<party>", "<char_idx>", "default", "condition.stunned", 1, {
							"trigger":	["<party>.<char_idx>.combat.turn", "character.conditions.stunned",	["<party>", "<char_idx>"]],
							"delete":		["$limit$"]}],
					},
				},
				"armor": {
					"helmet": {
						"1":				{ "desc": "+1 armor to the head.",								"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "enums", "defense", "armor", "<source_ref>", "<effect_id>", [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1]]},
						"2":				{ "desc": "+2 armor to the head.",								"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "enums", "defense", "armor", "<source_ref>", "<effect_id>", [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2]]},
						"3":				{ "desc": "+3 armor to the head.",								"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "enums", "defense", "armor", "<source_ref>", "<effect_id>", [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3]]},
					},
					"vambrace": {
						"1":				{ "desc": "+1 armor to the arms.",								"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "enums", "defense", "armor", "<source_ref>", "<effect_id>", [0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0]]},
						"2":				{ "desc": "+2 armor to the arms.",								"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "enums", "defense", "armor", "<source_ref>", "<effect_id>", [0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,0,0]]},
						"3":				{ "desc": "+3 armor to the arms.",								"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "enums", "defense", "armor", "<source_ref>", "<effect_id>", [0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,0,0]]},
					},
					"torso": {
						"1":				{ "desc": "+1 armor to the chest.",								"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "enums", "defense", "armor", "<source_ref>", "<effect_id>", [0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0]]},
						"2":				{ "desc": "+2 armor to the chest.",								"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "enums", "defense", "armor", "<source_ref>", "<effect_id>", [0,0,0,0,0,0,2,2,2,2,2,2,0,0,0,0,0,0,0,0]]},
						"3":				{ "desc": "+3 armor to the chest.",								"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "enums", "defense", "armor", "<source_ref>", "<effect_id>", [0,0,0,0,0,0,3,3,3,3,3,3,0,0,0,0,0,0,0,0]]},
					},
					"greave": {
						"1":				{ "desc": "+1 armor to the legs.",								"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "enums", "defense", "armor", "<source_ref>", "<effect_id>", [1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0]]},
						"2":				{ "desc": "+2 armor to the legs.",								"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "enums", "defense", "armor", "<source_ref>", "<effect_id>", [2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0]]},
						"3":				{ "desc": "+3 armor to the legs.",								"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "enums", "defense", "armor", "<source_ref>", "<effect_id>", [3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0]]},
					}
				},
				"reduction": {
					"acid": 			{ "desc": "Reduce damage of type acid",						"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "enums", "defense", "reduction", "<source_ref>", "<effect_id>", [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]]},
					"air":				{ "desc": "Reduce damage of type air",						"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "enums", "defense", "reduction", "<source_ref>", "<effect_id>", [0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]]}, 
					"arcane":			{ "desc": "Reduce damage of type arcane",					"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "enums", "defense", "reduction", "<source_ref>", "<effect_id>", [0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]]}, 
					"bludgeon":		{ "desc": "Reduce damage of type bludgeon",				"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "enums", "defense", "reduction", "<source_ref>", "<effect_id>", [0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0]]}, 
					"charm":			{ "desc": "Reduce damage of type charm",					"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "enums", "defense", "reduction", "<source_ref>", "<effect_id>", [0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0]]}, 
					"cold":				{ "desc": "Reduce damage of type cold",						"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "enums", "defense", "reduction", "<source_ref>", "<effect_id>", [0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0]]},
					"disease":		{ "desc": "Reduce damage of type earth",					"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "enums", "defense", "reduction", "<source_ref>", "<effect_id>", [0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0]]},
					"earth":			{ "desc": "Reduce damage of type earth",					"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "enums", "defense", "reduction", "<source_ref>", "<effect_id>", [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0]]}, 
					"fire":				{ "desc": "Reduce damage of type fire",						"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "enums", "defense", "reduction", "<source_ref>", "<effect_id>", [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0]]}, 
					"holy":				{ "desc": "Reduce damage of type holy",						"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "enums", "defense", "reduction", "<source_ref>", "<effect_id>", [0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0]]}, 
					"infernal":		{ "desc": "Reduce damage of type infernal",				"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "enums", "defense", "reduction", "<source_ref>", "<effect_id>", [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]]}, 
					"necrotic":		{ "desc": "Reduce damage of type necrotic",				"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "enums", "defense", "reduction", "<source_ref>", "<effect_id>", [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0]]}, 
					"pierce":			{ "desc": "Reduce damage of type pierce",					"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "enums", "defense", "reduction", "<source_ref>", "<effect_id>", [0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0]]}, 
					"poison":			{ "desc": "Reduce damage of type poison",					"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "enums", "defense", "reduction", "<source_ref>", "<effect_id>", [0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0]]}, 
					"psychic":		{ "desc": "Reduce damage of type psychic",				"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "enums", "defense", "reduction", "<source_ref>", "<effect_id>", [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0]]}, 
					"slash":			{ "desc": "Reduce damage of type slash",					"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "enums", "defense", "reduction", "<source_ref>", "<effect_id>", [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0]]}, 
					"water":			{ "desc": "Reduce damage of type water",					"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "enums", "defense", "reduction", "<source_ref>", "<effect_id>", [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0]]}, 
					"all":				{ "desc": "Reduce damage of type all",						"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "enums", "defense", "reduction", "<source_ref>", "<effect_id>", [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]]},
				},
				"stats": {
					"action": {
						"free": {
							"1":	{ "desc": "1 to free actions.", 											"rule": ["character.attributes.modifiers", "add", "delete"],		"args": ["<party>", "<char_idx>", "stats", "action", "free", "<source_ref>", "<effect_id>", {"total": 1}]},
							"-1": { "desc": "-1 to free actions.", 											"rule": ["character.attributes.modifiers", "add", "delete"],		"args": ["<party>", "<char_idx>", "stats", "action", "free", "<source_ref>", "<effect_id>", {"total": -1}]},
						},
						"standard": {
							"1":	{ "desc": "1 to standard actions.", 									"rule": ["character.attributes.modifiers", "add", "delete"],		"args": ["<party>", "<char_idx>", "stats", "action", "standard", "<source_ref>", "<effect_id>", {"total": 1}]},
							"-1": { "desc": "-1 to standard actions.", 									"rule": ["character.attributes.modifiers", "add", "delete"],		"args": ["<party>", "<char_idx>", "stats", "action", "standard", "<source_ref>", "<effect_id>", {"total": -1}]},
						},
						"reaction": {
							"1":	{ "desc": "1 to reaction actions.", 									"rule": ["character.attributes.modifiers", "add", "delete"],		"args": ["<party>", "<char_idx>", "stats", "action", "reaction", "<source_ref>", "<effect_id>", {"total": 1}]},
							"-1": { "desc": "-1 to reaction actions.", 									"rule": ["character.attributes.modifiers", "add", "delete"],		"args": ["<party>", "<char_idx>", "stats", "action", "reaction", "<source_ref>", "<effect_id>", {"total": -1}]},
						}
					},
					"combat": {
						"attack": {
							"10":				{ "desc": "+10 to attack.",											"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "stats", "combat", "attack", "<source_ref>", "<effect_id>", {"total": 10}]},
							"-10":			{ "desc": "-10 to attack.",											"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "stats", "combat", "attack", "<source_ref>", "<effect_id>", {"total": -10}]},
							"-20":			{ "desc": "-20 to attack.",											"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "stats", "combat", "attack", "<source_ref>", "<effect_id>", {"total": -20}]},
							"-30":			{ "desc": "-30 to attack.",											"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "stats", "combat", "attack", "<source_ref>", "<effect_id>", {"total": -30}]},
						},
					},
				},
				"skill": {
					"acrobatics": {
						"-2":				{ "desc": "-2 to acrobatics.", 										"rule": ["character.attributes.modifiers", "add", "delete"],		"args": ["<party>", "<char_idx>", "stats", "skill", "acrobatics", "<source_ref>", "<effect_id>", {"total": -2}]},
						"-3":				{ "desc": "-3 to acrobatics.", 										"rule": ["character.attributes.modifiers", "add", "delete"],		"args": ["<party>", "<char_idx>", "stats", "skill", "acrobatics", "<source_ref>", "<effect_id>", {"total": -3}]},
						"-4":				{ "desc": "-4 to acrobatics.", 										"rule": ["character.attributes.modifiers", "add", "delete"],		"args": ["<party>", "<char_idx>", "stats", "skill", "acrobatics", "<source_ref>", "<effect_id>", {"total": -4}]},
						"-5":				{ "desc": "-5 to acrobatics.", 										"rule": ["character.attributes.modifiers", "add", "delete"],		"args": ["<party>", "<char_idx>", "stats", "skill", "acrobatics", "<source_ref>", "<effect_id>", {"total": -5}]},
						"-6":				{ "desc": "-6 to acrobatics.", 										"rule": ["character.attributes.modifiers", "add", "delete"],		"args": ["<party>", "<char_idx>", "stats", "skill", "acrobatics", "<source_ref>", "<effect_id>", {"total": -6}]},
						"-7":				{ "desc": "-7 to acrobatics.", 										"rule": ["character.attributes.modifiers", "add", "delete"],		"args": ["<party>", "<char_idx>", "stats", "skill", "acrobatics", "<source_ref>", "<effect_id>", {"total": -7}]},
						"-8":				{ "desc": "-8 to acrobatics.", 										"rule": ["character.attributes.modifiers", "add", "delete"],		"args": ["<party>", "<char_idx>", "stats", "skill", "acrobatics", "<source_ref>", "<effect_id>", {"total": -8}]},
						"-9":				{ "desc": "-9 to acrobatics.", 										"rule": ["character.attributes.modifiers", "add", "delete"],		"args": ["<party>", "<char_idx>", "stats", "skill", "acrobatics", "<source_ref>", "<effect_id>", {"total": -9}]},
						"-10":			{ "desc": "-10 to acrobatics.", 									"rule": ["character.attributes.modifiers", "add", "delete"],		"args": ["<party>", "<char_idx>", "stats", "skill", "acrobatics", "<source_ref>", "<effect_id>", {"total": -10}]},
					},
					"athletics": {
						"10":				{ "desc": "+10 to skill athletics.",							"rule": ["character.attributes.modifiers", "add", "delete"],		"args": ["<party>", "<char_idx>", "stats", "combat", "parry", "<source_ref>", "<effect_id>", {"total": 10} ]},
					},
					"dodge": {
						"-2":				{ "desc": "-2 to dodge.", 												"rule": ["character.attributes.modifiers", "add", "delete"],		"args": ["<party>", "<char_idx>", "stats", "skill", "dodge", "<source_ref>", "<effect_id>", {"total": -2}]},
						"-3":				{ "desc": "-3 to dodge.", 												"rule": ["character.attributes.modifiers", "add", "delete"],		"args": ["<party>", "<char_idx>", "stats", "skill", "dodge", "<source_ref>", "<effect_id>", {"total": -3}]},
						"-4":				{ "desc": "-4 to dodge.", 												"rule": ["character.attributes.modifiers", "add", "delete"],		"args": ["<party>", "<char_idx>", "stats", "skill", "dodge", "<source_ref>", "<effect_id>", {"total": -4}]},
						"-5":				{ "desc": "-5 to dodge.", 												"rule": ["character.attributes.modifiers", "add", "delete"],		"args": ["<party>", "<char_idx>", "stats", "skill", "dodge", "<source_ref>", "<effect_id>", {"total": -5}]},
						"-6":				{ "desc": "-6 to dodge.", 												"rule": ["character.attributes.modifiers", "add", "delete"],		"args": ["<party>", "<char_idx>", "stats", "skill", "dodge", "<source_ref>", "<effect_id>", {"total": -6}]},
						"-7":				{ "desc": "-7 to dodge.", 												"rule": ["character.attributes.modifiers", "add", "delete"],		"args": ["<party>", "<char_idx>", "stats", "skill", "dodge", "<source_ref>", "<effect_id>", {"total": -7}]},
						"-8":				{ "desc": "-8 to dodge.", 												"rule": ["character.attributes.modifiers", "add", "delete"],		"args": ["<party>", "<char_idx>", "stats", "skill", "dodge", "<source_ref>", "<effect_id>", {"total": -8}]},
						"-9":				{ "desc": "-9 to dodge.", 												"rule": ["character.attributes.modifiers", "add", "delete"],		"args": ["<party>", "<char_idx>", "stats", "skill", "dodge", "<source_ref>", "<effect_id>", {"total": -9}]},
						"-10":			{ "desc": "-10 to dodge.", 												"rule": ["character.attributes.modifiers", "add", "delete"],		"args": ["<party>", "<char_idx>", "stats", "skill", "dodge", "<source_ref>", "<effect_id>", {"total": -10}]},
					},
					"endurance": {
						"disease": {
							"+":				{ "desc": "Advantage on disease",								"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "checks", "vantage", "+skill+endurance+disease", "<source_ref>", "<effect_id>", 1]},
							"-":				{ "desc": "Disadvantage on disease",						"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "checks", "vantage", "+skill+endurance+disease", "<source_ref>", "<effect_id>", -1]},
						},
						"poison": {
							"+":				{ "desc": "Advantage on poison",								"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "checks", "vantage", "+skill+endurance+poison", "<source_ref>", "<effect_id>", 1]},
							"-":				{ "desc": "Disadvantage on poison",							"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "checks", "vantage", "+skill+endurance+poison", "<source_ref>", "<effect_id>", -1]},
						},
					},
					"perception": {
						"10":				{ "desc": "-10 perception.",											"rule": ["character.attributes.modifiers", "add", "delete"],		"args": ["<party>", "<char_idx>", "stats", "skill", "perception", "<source_ref>", "<effect_id>", {"total": 10}]},
						"-5":				{ "desc": "-5 perception.",												"rule": ["character.attributes.modifiers", "add", "delete"],		"args": ["<party>", "<char_idx>", "stats", "skill", "perception", "<source_ref>", "<effect_id>", {"total": -5} ]},
						"-10":			{ "desc": "-10 perception.",											"rule": ["character.attributes.modifiers", "add", "delete"],		"args": ["<party>", "<char_idx>", "stats", "skill", "perception", "<source_ref>", "<effect_id>", {"total": -10}]},
						"-15":			{ "desc": "-15 perception.",											"rule": ["character.attributes.modifiers", "add", "delete"],		"args": ["<party>", "<char_idx>", "stats", "skill", "perception", "<source_ref>", "<effect_id>", {"total": -15}]},
					},
					"magic_resist": {
						"+":				{ "desc": "Advantage on magic resist",						"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "checks", "vantage", "+skill+magic_resist", "<source_ref>", "<effect_id>", 1]},
						"-":				{ "desc": "Disadvantage on magic resist",					"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "checks", "vantage", "+skill+magic_resist", "<source_ref>", "<effect_id>", -1]},
						"-10":			{ "desc": "-10 to magic resist.",									"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "stats", "skill", "magic_resist", "<source_ref>", "<effect_id>", {"total": -10}]},
						"10":				{ "desc": "+10 to magic resist.",									"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "stats", "skill", "magic_resist", "<source_ref>", "<effect_id>", {"total": 10}]},
					},
					"medicine": {
						"-10":			{ "desc": "-10 to medicine.",											"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "stats", "skill", "medicine", "<source_ref>", "<effect_id>", {"total": -10}]},
						"10":				{ "desc": "+10 to medicine.",											"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "stats", "skill", "medicine", "<source_ref>", "<effect_id>", {"total": 10}]},
					},
					"resolve": {
						"fear": {
							"+":			{ "desc": "Advantage on magic resist",						"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "checks", "vantage", "+skill+resolve+fear", "<source_ref>", "<effect_id>", 1]},
							"-":			{ "desc": "Disadvantage on magic resist",					"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "checks", "vantage", "+skill+resolve+fear", "<source_ref>", "<effect_id>", -1]},
						}
					},
					"scavenge": {
						"10": 			{ "desc": "+10 to scavenge.",											"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "stats", "skill", "scavenge", "<source_ref>", "<effect_id>", {"total": 10}]},
					},
					"stealth": {
						"10":				{ "desc": "+10 to stealth.",											"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "stats", "skill", "stealth", "<source_ref>", "<effect_id>", {"total": 10}]},
						"-2":				{ "desc": "-2 to stealth.", 											"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "stats", "skill", "stealth", "<source_ref>", "<effect_id>", {"total": -2}]},
						"-3":				{ "desc": "-3 to stealth.", 											"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "stats", "skill", "stealth", "<source_ref>", "<effect_id>", {"total": -3}]},
						"-4":				{ "desc": "-4 to stealth.", 											"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "stats", "skill", "stealth", "<source_ref>", "<effect_id>", {"total": -4}]},
						"-5":				{ "desc": "-5 to stealth.", 											"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "stats", "skill", "stealth", "<source_ref>", "<effect_id>", {"total": -5}]},
						"-6":				{ "desc": "-6 to stealth.", 											"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "stats", "skill", "stealth", "<source_ref>", "<effect_id>", {"total": -6}]},
						"-7":				{ "desc": "-7 to stealth.", 											"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "stats", "skill", "stealth", "<source_ref>", "<effect_id>", {"total": -7}]},
						"-8":				{ "desc": "-8 to stealth.", 											"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "stats", "skill", "stealth", "<source_ref>", "<effect_id>", {"total": -8}]},
						"-9":				{ "desc": "-9 to stealth.",												"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "stats", "skill", "stealth", "<source_ref>", "<effect_id>", {"total": -9}]},
						"-10":			{ "desc": "-10 to stealth.",											"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "stats", "skill", "stealth", "<source_ref>", "<effect_id>", {"total": -10}]},
						"-20":			{ "desc": "-20 to stealth.",											"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "stats", "skill", "stealth", "<source_ref>", "<effect_id>", {"total": -20}]},
						"-30":			{ "desc": "-30 to stealth.",											"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "stats", "skill", "stealth", "<source_ref>", "<effect_id>", {"total": -30}]},
						"-40":			{ "desc": "-40 to stealth.",											"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "stats", "skill", "stealth", "<source_ref>", "<effect_id>", {"total": -40}]},
						"-50":			{ "desc": "-50 to stealth.",											"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "stats", "skill", "stealth", "<source_ref>", "<effect_id>", {"total": -50}]},
						"-60":			{ "desc": "-60 to stealth.",											"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "stats", "skill", "stealth", "<source_ref>", "<effect_id>", {"total": -60}]},
					},
				},
				"combat": {
					"attack": {
						"-10":			{ "desc": "-10 to combat attack.",								"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "stats", "combat", "attack", "<source_ref>", "<effect_id>", {"total": -10}]},
						"-5":				{ "desc": "-5 to combat attack.",									"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "stats", "combat", "attack", "<source_ref>", "<effect_id>", {"total": -5}]},
						"5":				{ "desc": "+5 to combat attack.",									"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "stats", "combat", "attack", "<source_ref>", "<effect_id>", {"total": 5}]},
						"10":				{ "desc": "+10 to combat attack.",								"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "stats", "combat", "attack", "<source_ref>", "<effect_id>", {"total": 10}]},
					},
					"parry": {
						"+":				{ "desc": "Advantage on parry",										"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "checks", "vantage", "+combat+defend+parry", "<source_ref>", "<effect_id>", 1]},
						"-":				{ "desc": "Disadvantage on parry",								"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "checks", "vantage", "+combat+defend+parry", "<source_ref>", "<effect_id>", -1]},
						"-10":			{ "desc": "-10 to combat parry.",									"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "stats", "combat", "parry", "<source_ref>", "<effect_id>", {"total": -10}]},
						"-5":				{ "desc": "-5 to combat parry.",									"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "stats", "combat", "parry", "<source_ref>", "<effect_id>", {"total": -5}]},
						"5":				{ "desc": "+5 to combat parry.",									"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "stats", "combat", "parry", "<source_ref>", "<effect_id>", {"total": 5}]},
						"10":				{ "desc": "+10 to combat parry.",									"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "stats", "combat", "parry", "<source_ref>", "<effect_id>", {"total": 10}]},
						"15":				{ "desc": "+15 to combat parry.",									"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "stats", "combat", "parry", "<source_ref>", "<effect_id>", {"total": 5}]},
						"20":				{ "desc": "+20 to combat parry.",									"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "stats", "combat", "parry", "<source_ref>", "<effect_id>", {"total": 10}]},
					},
					"initiative": {
						"10":				{ "desc": "+10 to combat initiative.",						"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "stats", "combat", "initiative", "<source_ref>", "<effect_id>", {"total": 10}]},
					},
					"damage": {
						"1":				{ "desc": "+1 to combat damage.",									"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "stats", "combat", "damage", "<source_ref>", "<effect_id>", {"total": 1}]},
					},
					"dealt": {
						"1":				{ "desc": "+1 to combat dealt.",									"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "stats", "combat", "dealt", "<source_ref>", "<effect_id>", {"total": 1}]},
					},
				},
				"traverse": {
					"break": {
						"10": 			{ "desc": "+10 to traverse break.",								"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "stats", "traverse", "break", "<source_ref>", "<effect_id>", {"total": 10}]},
					},
					"disarm": {
						"10":				{ "desc": "+10 to traverse disarm.",							"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "stats", "traverse", "disarm", "<source_ref>", "<effect_id>", {"total": 10}]},
					},
					"inventory": {
						"5":				{ "desc": "+5 inventory size.",										"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "stats", "traversal", "inventory", "<source_ref>", "<effect_id>", {"total": 0}]},
						"10":				{ "desc": "+10 inventory size.",									"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "stats", "traversal", "inventory", "<source_ref>", "<effect_id>", {"total": 0}]},
						"20":				{ "desc": "+20 inventory size.",									"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "stats", "traversal", "inventory", "<source_ref>", "<effect_id>", {"total": 0}]},
					},
				},
				"camp": {
					"check": {
						"1": 				{ "desc": "+1 to camp check.",										"rule": ["character.attributes.modifiers", "add", "delete"], 	"args": ["<party>", "<char_idx>", "stats", "camp", "check", "<source_ref>", "<effect_id>", {"total": 1}]},
					}
				},
				"listener": {
					"cracked_soul": {
						"desc": "Reduce aether roll die: D6 -> D4",
						"rule": ["character.listener", "add"], 
						"args": ["<party>", "<char_idx>", "default", "<source_ref>", 1, {
							"trigger": 	["<party>.<char_idx>.stats.aether.roll", 									"character.biography.flaws.cracked_soul_proc",["$event_idx$", 4]], 
							"delete": 	["$limit$"]}]	
					},
					"defensive": 		{ 
						"desc": "If shield, +10 combat parry.",
						"rule": ["character.listener", "add"], 
						"args": ["<party>", "<char_idx>", "default", "equipped.main_hand.defensive", 1, {
							"trigger": 	["<party>.<char_idx>.equipped.off_hand.shield", 					"character.attributes.modifiers.add", 						["<party>", "<char_idx>", "stats", "combat", "parry", "<source_ref>.defensive", "<effect_id>", {"max": 0, "total": 10}]], 
							"delete": 	["<party>.<char_idx>.equipped.main_hand.", 								"character.attributes.modifiers.delete",					["<party>", "<char_idx>", "stats", "combat", "parry", "<source_ref>.defensive", "<effect_id>"]],
							"reset":		["<party>.<char_idx>.equipped.off_hand.((?!shield)\\w+)",	"character.attributes.modifiers.delete",					["<party>", "<char_idx>", "stats", "combat", "parry", "<source_ref>.defensive", "<effect_id>"]]}]
					},
					"death_check": 		{ 
						"desc": "If health reaches 0.",
						"rule": ["character.listener", "add"], 
						"args": ["<party>", "<char_idx>", "default", "on_death", 1, {
							"trigger": 	["<party>.<char_idx>.stats.base.health.0", 					"character.death", 						["<party>", "<char_idx>"]], 
							"delete": 	["$limit$"]}]
					},
					"fragile_mind": {
						"desc": "Reduce sanity roll die: D6 -> D4",
						"rule": ["character.listener", "add"], 
						"args": ["<party>", "<char_idx>", "default", "<source_ref>", 1, {
							"trigger": 	["<party>.<char_idx>.stats.sanity.roll", 									"character.biography.flaws.fragile_mind_proc",		["$event_idx$", 4]], 
							"delete": 	["$limit$"]}]	
					},
					"surprise_bonus": {
						"desc": "+20 to first combat roll",
						"rule": ["character.listener", "add"], 
						"args": ["<party>", "<char_idx>", "default", "<source_ref>", 1, {
							"trigger": 	["<party>.<char_idx>.combat.roll", 												"character.attributes.modifiers.add", 						["<party>", "<char_idx>", "stats", "combat", "attack", "<source_ref>", "<effect_id>", {"max": 0, "total": 20}]], 
							"delete": 	["$limit$", 																							"character.attributes.modifiers.delete",					["<party>", "<char_idx>", "stats", "combat", "attack", "<source_ref>", "<effect_id>"]],
						}]
					},
					"surprise_companion_penalty": {
						"desc": "-10 per entity in the party past 1.",
						"rule": ["character.listener", "add"], 
						"args": ["<party>", "<char_idx>", "default", "<source_ref>", 1, {
							"trigger": 	["<party>.<char_idx>.surprise.roll", 											"effects.surprise_companion_penalty.add",					["<party>", "<char_idx>"]],
							"delete": 	["$limit$", 																							"effects.surprise_companion_penalty.delete",			["<party>", "<char_idx>"]],
						}]
					},
					"surprise_fail_penalty": {
						"desc": "-10 on initiative.",
						"rule": ["character.listener", "add"], 
						"args": ["<party>", "<char_idx>", "default", "<source_ref>", 1, {
							"trigger": 	["<party>.<char_idx>.initiative.roll", 										"effects.surprise_fail_penalty.add",							["<party>", "<char_idx>"]],
							"delete": 	["$limit$", 																							"effects.surprise_fail_penalty.delete",						["<party>", "<char_idx>"]],
						}]
					},
					"target_attack_penalty": {
						"desc": "-30 for using a targeted attack.",
						"rule": ["character.listener", "add"], 
						"args": ["<party>", "<char_idx>", "default", "<source_ref>", 1, {
							"trigger": 	["<party>.<char_idx>.combat.roll.attack.check", 					"character.attributes.modifiers.add",							["<party>", "<char_idx>", "<source_ref>", "stats.combat.attack.-30"]],
							"delete": 	["$limit$", 																							"character.attributes.modifiers.delete",					["<party>", "<char_idx>", "<source_ref>"]],
						}]
					},
					"two_handed": 	{ 
						"desc": "Unequip if equip to off_hand.", 												
						"rule": ["character.listener", "add"], 
						"args": ["<party>", "<char_idx>", "default", "equipped.main_hand.two_handed", 1, {
							"trigger":	["<party>.<char_idx>.equipped.off_hand.((?!null|undefined)\\w+)", "character.inventory.equipment.unequip",	["<party>", "<char_idx>", "<source_ref>", "equipped.main_hand"]],
							"delete":		["<party>.<char_idx>.equipped.main_hand"]}],
					},
					"standard_action": {
						"desc": "-1 to standard actions.",
						"rule": ["character.listener", "add"], 
						"args": ["<party>", "<char_idx>", "default", "<source_ref>", "*", {
							"trigger": 	["<party>.<char_idx>.combat.turn.standard", 							"character.attributes.modifiers.add",							["<party>", "<char_idx>", "<source_ref>.standard", "stats.actions.standard.-1"]],
							"delete": 	["combat.round.end",																			"character.attributes.modifiers.delete",					["<party>", "<char_idx>", "<source_ref>.standard"]],
						}]
					},
					"free_action": {
						"desc": "-1 to free actions.",
						"rule": ["character.listener", "add"], 
						"args": ["<party>", "<char_idx>", "default", "<source_ref>", "*", {
							"trigger": 	["<party>.<char_idx>.combat.turn.free", 									"character.attributes.modifiers.add",							["<party>", "<char_idx>", "<source_ref>.free", "stats.actions.free.-1"]],
							"delete": 	["combat.round.end",																			"character.attributes.modifiers.delete",					["<party>", "<char_idx>", "<source_ref>.free"]],
						}]
					},
					"re_action": {
						"desc": "-1 to re-actions.",
						"rule": ["character.listener", "add"], 
						"args": ["<party>", "<char_idx>", "default", "<source_ref>", "*", {
							"trigger": 	["<party>.<char_idx>.combat.turn.reaction", 							"character.attributes.modifiers.add",							["<party>", "<char_idx>", "<source_ref>.reaction", "stats.actions.reaction.-1"]],
							"delete": 	["<party>.<char_idx>.combat.turn.start",									"character.attributes.modifiers.delete",					["<party>", "<char_idx>", "<source_ref>.reaction"]],
						}]
					},
					"versatile": 		{
						"desc": "If two handed, +1 damage.",
						"rule": ["character.attributes.modifiers", "add", "delete"], 
						"args": ["<party>", "<char_idx>", "default", "equipped.main_hand.versatile", 1, {
							"trigger":	["equipped.off_hand.((?!null|undefined)\\w+)",						"character.attributes.modifiers.add", 						["<party>", "<char_idx>", "<to_item>.versatile", "combat.damage.1"]],
							"delete":		["<party>.<char_idx>.equipped.main_hand",									"character.attributes.modifiers.delete",					["<party>", "<char_idx>", "<to_item>.versatile"]],
							"reset":		["<party>.<char_idx>.equipped.off_hand.(null|undefined)", "character.attributes.modifiers.delete",					["<party>", "<char_idx>", "<to_item>.versatile"]]}],
					},
					// ---------------------------
					"on_death": 		{
						"desc": "If character has died for encounters.",
						"rule": ["character.attributes.listeners", "add", "delete"], 
						"args": ["<party>", "<char_idx>", "default", "is_dead", 1, {
							"trigger": 	["<party>.<char_idx>.died", 															"character.death",		[]], 
							"delete": 	["$limit$"]}],
					},
				},

				"todo": {
					"damage_reduction":			{"rule": ["roll_damage_type_reduction_by_rarity", [1,2,3]]},
					"magic_resist":					{"rule": ["roll_magic_resist_by_rarity", [10,20,30]]},
					"aether_for_toughness":	{"rule": ["add_modifiers", [{"stats.aether":{"max":-5}}, {"stats.toughness":{"max":10}}]]},
					"toughness_for_aether":	{"rule": ["add_modifiers", [{"stats.toughness":{"max":-5}}, {"stats.aether":{"max":10}}]]},
					"damage_resistance":		{"rule": ["damage_type_resistance"]},
					"intimidate":						{"rule": ["add_modifiers", [{"traits.intimidation":{"base":10}}]]},
					"light_source":					{"rule": ["add_light_source"]},
					"carry_capacity":				{"rule": ["add_modifiers", [{"inventory.size":{"max":10}}]]},
					"daily_reroll":					{"rule": ["reroll_once_per_camp"]},
					"heal_wounds":					{"rule": ["add_heal_wounds_action_by_rarity", [[10,2], [10,3], [10,4]]]},
					"heal_wounds":					{"rule": ["add_heal_wounds_action", [[10,0]]]},
					"recover_toughness":		{"rule": ["enchanted_toughness_recovery"]},
					"stun_immunity":				{"rule": ["add_modifiers", [{"defense.effects":{"stun":0}}]]},
					"fear_immunity":				{"rule": ["add_modifiers", [{"defense.effects":{"fear":0}}]]},
					"belt_check_immunity":	{"rule": []},
					"entangle_immunity":		{"rule": ["add_modifiers", [{"defense.effects":{"entangle":0}}]]},
					"paralysis_immunity":		{"rule": ["add_modifiers", [{"defense.effects":{"paralyze":0}}]]},
					"entangle":							{"rule": ["add_entangle_action"]},
					"shadow_phase":					{"rule": ["add_shadow_phase_action"]},
					"ignore_madness":				{"rule": []},
					"skill_increase":				{"rule": ["choose_skill_to_boost", [20]]},
					"master_lockpick":			{"rule": ["add_lockpick_reroll_on_fail"]},
					"master_trapper":				{"rule": ["add_disarm_reroll_on_fail"]},
					"improved_camp_health":	{"rule": ["camp_healing_roll", [4]]},
					"improved_camp_sanity":	{"rule": ["camp_sanity_roll", [4]]},
					"improved_fist":				{"rule": ["add_modifiers", [{"skills.fist":{"base":30}}]]},
					"improved_stamina":			{"rule": ["add_exhaustion_resist_by_rarity", [1,2,3]]},
					"improved_acrobatics":	{"rule": ["add_modifiers", [{"skills.acrobatics":{"roll":1}}]]},
					"improved_athletics":		{"rule": ["add_modifiers", [{"skills.athletics":{"roll":1}}]]},
					"improved_scavenge":		{"rule": ["add_modifiers", [{"skills.scavenge":{"roll":1}}]]},
					"improved_stealth":			{"rule": ["add_modifiers", [{"skills.stealth":{"roll":1}}]]},
					"roll_with_it":					{"rule": ["ignore_fumble_daily"]},
					"crafty":								{"rule": ["double_found_crafting_supplies"]},
					"collector":						{"rule": ["augment_scavenge_roll", [4]]},
					"sturdy_boots":					{"rule": ["add_modifiers", [{"defense.armor":{"legs":1}}]]},
					"sturdy_gloves":				{"rule": ["add_modifiers", [{"defense.armor":{"arms":1}}]]},
					"just_do_it":						{"rule": ["reroll_failed_dodge_per_room"]},
					"spartan_kick":					{"rule": ["add_spartan_kick_action"]},
					"light_on_your_feet":		{"rule": []},
					"one_punch":						{"rule": ["add_one_punch_action"]},
					"deflection":						{"rule": ["add_modifiers", [{"traits.parry":{"base":10}}]]},
					"aether_well":					{"rule": ["roll_for_modifier", ["stats.aether", "max", 10]]},
					"free_cast":						{"rule": ["cast_spell_for_free"]},
					"imbue_damage":					{"rule": ["roll_for_optional_attack_damage_type"]},
					"extra_damage":					{"rule": ["add_modifiers", [{"traits.damage":{"base":10}}]]},
					"vampiric":							{"rule": ["heal_on_kill", [1]]},
					"reinforced":						{"rule": ["roll_for_modifier", ["stats.toughness", "max", 10]]},
					//Fragments
					"ritual_dagger":				{"rule": ["summon_skeleton"]},
					"tattered_cloak": 			{"rule": ["invisibility_for_x_rooms", [5]]},
					"refracting_mirror": 		{"rule": ["add_modifiers", [{"defensive.checks":{"base":30}}]]},
					"grounding_chain": 			{"rule": ["add_temporary_modifiers", [{"traits.sanity":{"base":10}}]]},
					/*"black_heart_babble":		{"rule": ["rule_id"]},
					"cracked_monocle": 			{"rule": ["rule_id"]},
					"green_vial":						{"rule": ["rule_id"]},
					"enchanted_skull":			{"rule": ["rule_id"]},
					"cursed_bandages":			{"rule": ["rule_id"]}, //removing negative effect for equipped for too long.
					"blood_potion":					{"rule": ["rule_id"]},
					"ravens_trinket":				{"rule": ["rule_id"]},
					"spiked_gauntlets":			{"rule": ["rule_id"]},
					"black_vial":						{"rule": ["rule_id"]},
					"spider_locket":				{"rule": ["rule_id"]},
					"obsidian_whistle":			{"rule": ["rule_id"]},
					"miasma_flask":					{"rule": ["rule_id"]},
					"broken_harp":					{"rule": ["rule_id"]},
					"ancient_grimoire":			{"rule": ["rule_id"]},
					"amethyst_ring":				{"rule": ["rule_id"]},
					"frozen_hourglass":			{"rule": ["rule_id"]},*/
					// Usables
					"use_bandage":					["dice.roll_clamp_and_add_to",	[4, "stats.toughness.max", "stats.toughness.base"]],
					"refill_lamp":					["static.clamp_and_add_to", 		[1, "light_source.max", "light_source.base"]],
				},
			},
			"enums": {
				"legend": {"vulnerable": 1, "resist": 0.5, "immune": 0, "healed": -1},
				"armor":	{
					"helmet": 	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
					"vambrace": [0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0],
					"torso": 		[0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0],
					"greave": 	[1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
				},
				"conditions":			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
				"affinity":				[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
				"reduction":			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
				"imbued":					[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			},
			"items": {
				"prices": {
					"rarity":	{"uncommon": 200, "rare": 400, "epic": 600},
					"gems": 	{"ornamental": [1,100], "semi_precious": [2,100], "precious": [3,100], "lavish": [4,100],	"sumptuous": [5,100],	"extravagant": [6,100]},
				},
				"distribution": {
					"random": {
						"armor": 		["tables.suit","tables.suit","torso","torso","torso","torso","torso","vambrace","vambrace","vambrace","vambrace","vambrace","greave","greave","greave","greave","greave","helmet","shield","shield",],
						"material":	["cloth","rawhide","studded","laminar","leather","mail","scale","brigandine","plate",],
						"shield": 	["target", "normal", "full", "wall"],
						"weapon": 	["bardiche","bastard_sword","billhook","claw","club","dagger","flail","glaive","great_axe","great_club","great_sword","halberd","hatchet","harpoon","improvised","knuckles","light_hammer","long_sword","maul","mace","morningstar","pike","pilum","quarterstaff","rapier","saber","scimitar","shiv","short_sword","spear","warhammer","war_pick"],
						"item":			["random.weapon", "random.armor", "gear.belt", "gear.boots", "gear.amulet", "gear.ring", "gear.ring"],
						"potion":		["aether", "antidote", "coagulant", "courage", "flaming", "frenzy", "health", "health", "regeneration", "poison", "cleanse", "vigor", "vigor", "satiation", "calmness", "haste", "haste", "stoneskin", "strength", "vitality"],
						"spoils":		["tables.random.mundane","tables.random.mundane","tables.random.mundane","tables.random.valuable","tables.random.valuable","tables.random.precious"],
						"mundane":	["tables.supplies.crafting_s","tables.supplies.crafting_s","tables.supplies.crafting_s","tables.supplies.crafting_s","tables.supplies.crafting_s","tables.supplies.cooking_s","tables.supplies.cooking_s","tables.supplies.cooking_s","tables.supplies.cooking_s","tables.supplies.cooking_s","gear.backpack"],
						"valuable":	["tables.random.potion","tables.random.potion","tables.random.potion","tables.random.potion","tables.random.potion","crystal","crystal","crystal","crystal","crystal","crystal","crystal","tables.random.fragment","tables.random.fragment","tables.random.fragment","tables.random.fragment","tables.random.item","tables.random.item","tables.random.item","tables.random.item"],
						"precious":	["tables.random.item","tables.random.item","tables.random.item","tables.random.relic"],
						"gems": 		["ornamental","ornamental","semi_precious","semi_precious","semi_precious","precious","precious","precious","precious","precious","lavish","lavish","lavish","lavish","sumptuous","sumptuous","sumptuous","extravagant","extravagant"],
						"fragment":	["ritual_dagger","tattered_cloak","refracting_mirror","grounding_chain","black_heart_babble","cracked_monocle","green_vial","enchanted_skull","cursed_bandages","blood_potion","ravens_trinket","spiked_gauntlets","black_vial","spider_locket","obsidian_whistle","miasma_flask","broken_harp","ancient_grimoire","amethyst_ring","frozen_hourglass",],
						"relic":		[],
						"rarity":		["uncommon", "uncommon", "uncommon", "uncommon", "uncommon", "rare", "rare", "rare", "epic", "epic"],
						"resource":	["nothing", "nothing", "cooking_s", "cooking_s", "cooking_s", "cooking_s", "crafting_s", "crafting_s", "crafting_s", "crafting_s"],
						"book":			["shadows_of_devotion", "aetheric_tailoring", "mysteries_of_death", "contemplations_on_the_tapestry_of_realms", "the_battle_of_curum", "the_midnight_throne", "a_thousand_years_of_glory", "rising_shadows", "the_third_path", "the_ganeus_rebellion"]
					},
					"effects": {
						"armor": 		["damage_reduction","damage_reduction","damage_reduction","damage_reduction","magic_resist","aether_for_toughness","toughness_for_aether","damage_resistance","intimidate","light_source","carry_capacity","daily_reroll","heal_wounds","recover_toughness","stun_immunity","fear_immunity","entangle","shadow_phase",],
						"belt": 		["damage_reduction","magic_resist","damage_resistance","carry_capacity","daily_reroll","belt_check_immunity","recover_toughness","stun_immunity","fear_immunity","skill_increase","improved_camp_health","improved_camp_sanity","ignore_madness","improved_stamina","master_lockpick","master_trapper","light_source","heal_wounds",],
						"boots": 		["damage_reduction","magic_resist","daily_reroll","stun_immunity","entangle_immunity","skill_increase","improved_stamina","master_lockpick","master_trapper","improved_acrobatics","improved_stealth","roll_with_it","crafty","improved_scavenge","collector","sturdy_boots","just_do_it","spartan_kick","light_on_your_feet","paralysis_immunity",],
						"gloves": 	["damage_reduction","magic_resist","daily_reroll","skill_increase","improved_stamina","improved_athletics","improved_fist","master_lockpick","master_trapper","one_punch","improved_scavenge","collector","sturdy_gloves","deflection","aether_well","free_cast","imbue_damage","extra_damage","vampiric","reinforced"],
						"ring": 		[],
						"weapon": 	[],
					},
					"enchanted": {
						"armor": 		[true,false,false,false,false,false,false,false,false,false],
						"weapon": 	[true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],
						"valuable": [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,true,true,true,true],
						"precious": [true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,false,false,false,false,false],
					},
					"traits": {
						"potion":  	["poisoned", "poisoned", "explosive", "explosive", "impotent", "impotent", "normal", "normal", "normal", "refined", "refined", "enhanced"],
					},
					"supplies": {
						"crafting_s": [1,2,3,4],
						"cooking_s": 	[1,2,3,4],
						"ritual_s": 	[1,2,3,4],
					},
					"suit": 			["torso", "vambrace", "greave"],
				},
				"weapon": {
					"bardiche": 		{"name": "bardiche", 						"type": "weapon", 	"cost": [8,15], 	"size": 2,			"item": ["equip_to.main_hand", "counter.integrity.1"],		"effects": ["listener.two_handed",	"combat.dealt.1",					"actions.slash.pole",	"actions.stab.pole"]},
					"bastard_sword":{"name": "bastard_sword", 			"type": "weapon", 	"cost": [15,30],	"size": 1, 			"item": ["equip_to.main_hand", "counter.integrity.1"],		"effects": ["listener.versatile",		"combat.parry.10",				"combat.attack.5",		"actions.slash.blade", "actions.stab.blade"]},	
					"billhook": 		{"name": "billhook", 						"type": "weapon", 	"cost": [5,10], 	"size": 1, 			"item": ["equip_to.main_hand", "counter.integrity.1"],		"effects": ["listener.two_handed",	"combat.dealt.1",					"actions.slash.pole"]},
					"claw": 				{"name": "claw", 								"type": "weapon", 	"cost": [10,20],	"size": 1, 			"item": ["equip_to.main_hand", "counter.integrity.1"],		"effects": ["combat.initiative.10",	"combat.attack.10",				"combat.parry.20",		"actions.slash.fist"]},
					"club": 				{"name": "club", 								"type": "weapon", 	"cost": [3,5],		"size": 1, 			"item": ["equip_to.main_hand", "counter.integrity.1"],		"effects": ["combat.attack.15",			"combat.parry.15",				"smash.bludgeon"]},
					"dagger":				{"name": "dagger", 							"type": "weapon", 	"cost": [3,5],		"size": 1, 			"item": ["equip_to.main_hand", "counter.integrity.1"],		"effects": ["combat.initiative.10",	"combat.attack.10", 			"combat.parry.20",		"actions.slash.blade", "actions.stab.blade"]},
					"flail": 				{"name": "flail", 							"type": "weapon", 	"cost": [15,30],	"size": 1, 			"item": ["equip_to.main_hand", "counter.integrity.1"],		"effects": ["combat.attack.5", 			"combat.parry.5", 				"actions.smash.bludgeon"]},
					"glaive": 			{"name": "glaive", 							"type": "weapon", 	"cost": [8,15],		"size": 2, 			"item": ["equip_to.main_hand", "counter.integrity.1"],		"effects": ["listener.two_handed", 	"combat.dealt.1", 				"actions.slash.pole"]},
					"great_axe": 		{"name": "great_axe", 					"type": "weapon", 	"cost": [25,50],	"size": 2, 			"item": ["equip_to.main_hand", "counter.integrity.1"],		"effects": ["listener.two_handed", 	"combat.dealt.1", 				"combat.damage.1",		"combat.attack.-10",	"combat.parry.-10", "actions.slash.blade"]},
					"great_club": 	{"name": "great_club", 					"type": "weapon", 	"cost": [10,20],	"size": 2, 			"item": ["equip_to.main_hand", "counter.integrity.1"],		"effects": ["listener.two_handed", 	"combat.dealt.1", 				"combat.damage.1",		"combat.attack.-10",	"combat.parry.-10", "actions.smash.bludgeon"]},
					"great_sword": 	{"name": "great_sword", 				"type": "weapon", 	"cost": [40,80],	"size": 2, 			"item": ["equip_to.main_hand", "counter.integrity.1"],		"effects": ["listener.two_handed", 	"combat.dealt.1", 				"combat.damage.1",		"combat.attack.-5",		"combat.parry.-5",	"actions.slash.blade"]},
					"halberd": 			{"name": "halberd", 						"type": "weapon", 	"cost": [8,15], 	"size": 2, 			"item": ["equip_to.main_hand", "counter.integrity.1"],		"effects": ["listener.two_handed", 	"combat.dealt.1",					"actions.slash.pole",	"actions.stab.pole"]},
					"hatchet":			{"name": "hatchet", 						"type": "weapon", 	"cost": [3,5],		"size": 1, 			"item": ["equip_to.main_hand", "counter.integrity.1"],		"effects": ["combat.attack.15",			"combat.parry.15",				"actions.slash.blade"]},
					"harpoon": 			{"name": "harpoon", 						"type": "weapon", 	"cost": [5,10], 	"size": 1, 			"item": ["equip_to.main_hand", "counter.integrity.1"],		"effects": ["combat.attack.5", 			"combat.parry.5", 				"actions.stab.pole"]},
					"improvised": 	{"name": "improvised", 					"type": "weapon", 	"cost": [1,1],		"size": 1, 			"item": ["equip_to.main_hand", "counter.integrity.1"],		"effects": ["listener.two_handed", 	"combat.dealt.1",					"combat.attack.-10",	"combat.parry.-10",		"actions.smash.bludgeon"]},
					"knuckles": 		{"name": "knuckles", 						"type": "weapon", 	"cost": [3,5],		"size": 1, 			"item": ["equip_to.main_hand", "counter.integrity.1"],		"effects": ["combat.initiative.10",	"combat.attack.20",				"combat.parry.20",		"actions.smash.bludgeon"]},
					"light_hammer": {"name": "light_hammer", 				"type": "weapon", 	"cost": [3,5],		"size": 1, 			"item": ["equip_to.main_hand", "counter.integrity.1"],		"effects": ["combat.initiative.10",	"combat.attack.5",				"combat.parry.5",			"actions.smash.bludgeon"]},
					"long_sword":		{"name": "long_sword", 					"type": "weapon", 	"cost": [10,20],	"size": 1, 			"item": ["equip_to.main_hand", "counter.integrity.1"],		"effects": ["listener.versatile",		"combat.parry.10",				"actions.slash.blade",	"actions.stab.blade"]},
					"maul": 				{"name": "maul", 								"type": "weapon", 	"cost": [10,20],	"size": 1, 			"item": ["equip_to.main_hand", "counter.integrity.1"],		"effects": ["actions.smash.bludgeon"]},
					"mace": 				{"name": "maul", 								"type": "weapon", 	"cost": [8,15],		"size": 1, 			"item": ["equip_to.main_hand", "counter.integrity.1"],		"effects": ["actions.smash.bludgeon"]},
					"morningstar": 	{"name": "morningstar", 				"type": "weapon", 	"cost": [8,15],		"size": 1, 			"item": ["equip_to.main_hand", "counter.integrity.1"],		"effects": ["combat.damage.1", 			"smash.bludgeon",					"actions.stab.bludgeon"]},
					"pike": 				{"name": "pike", 								"type": "weapon", 	"cost": [5,10], 	"size": 1, 			"item": ["equip_to.main_hand", "counter.integrity.1"],		"effects": ["listener.two_handed", 	"combat.dealt.1",					"actions.stab.pole"]},
					"pilum": 				{"name": "pilum", 							"type": "weapon", 	"cost": [5,10], 	"size": 1, 			"item": ["equip_to.main_hand", "counter.integrity.1"],		"effects": ["listener.defensive",		"actions.stab.pole"]},
					"quarterstaff": {"name": "quarterstaff", 				"type": "weapon", 	"cost": [3,5],		"size": 2, 			"item": ["equip_to.main_hand", "counter.integrity.1"],		"effects": ["listener.two_handed",	"combat.dealt.1",					"combat.attack.5",	"combat.parry.5",				"actions.smash.pole"]},
					"rapier":				{"name": "rapier", 							"type": "weapon", 	"cost": [15,30],	"size": 1, 			"item": ["equip_to.main_hand", "counter.integrity.1"],		"effects": ["combat.initiative.10",	"combat.attack.10",				"combat.parry.10",	"actions.stab.blade"]},
					"saber":				{"name": "saber", 							"type": "weapon", 	"cost": [10,20],	"size": 1, 			"item": ["equip_to.main_hand", "counter.integrity.1"],		"effects": ["combat.parry.10",			"combat.attack.5",				"combat.parry.5",		"actions.slash.blade"]},
					"scimitar":			{"name": "scimitar", 						"type": "weapon", 	"cost": [8,15],		"size": 1, 			"item": ["equip_to.main_hand", "counter.integrity.1"],		"effects": ["combat.parry.10",			"combat.attack.5",				"combat.parry.5",		"actions.slash.blade"]},
					"shiv":					{"name": "shiv", 								"type": "weapon", 	"cost": [3,5],		"size": 1, 			"item": ["equip_to.main_hand", "counter.integrity.1"],		"effects": ["combat.initiative.10",	"combat.attack.20",				"combat.parry.20",	"actions.stab.blade"]},
					"short_sword":	{"name": "short_sword", 				"type": "weapon", 	"cost": [8,15],		"size": 1, 			"item": ["equip_to.main_hand", "counter.integrity.1"],		"effects": ["listener.defensive",		"combat.attack.5",				"combat.parry.5",		"actions.slash.blade",	"actions.stab.blade"]},
					"spear": 				{"name": "spear", 							"type": "weapon", 	"cost": [5,10],		"size": 1, 			"item": ["equip_to.main_hand", "counter.integrity.1"],		"effects": ["listener.defensive",		"listener.versatile",			"combat.attack.5",	"combat.parry.5",				"actions.stab.pole"]},
					"warhammer": 		{"name": "warhammer", 					"type": "weapon", 	"cost": [13,25],	"size": 2, 			"item": ["equip_to.main_hand", "counter.integrity.1"],		"effects": ["listener.two_handed",	"combat.dealt.1", 				"combat.damage.1",	"combat.attack.-10",		"combat.parry.-10",	"actions.smash.bludgeon"]},
					"war_pick": 		{"name": "war_pick", 						"type": "weapon", 	"cost": [8,15],		"size": 1, 			"item": ["equip_to.main_hand", "counter.integrity.1"],		"effects": ["combat.damage.1",			"actions.smash.bludgeon",	"actions.stab.bludgeon"]},
				},
				"helmet": {
					"cloth": 				{"name":"cloth_helmet", 				"type": "helmet", 	"cost": [10,20], 	"size": 1,			"item": ["equip_to.helmet", "counter.integrity.6"	],			"effects": ["skill.perception.-1", "armor.helmet.1"]},
					"rawhide": 			{"name":"rawhide_helmet", 			"type": "helmet", 	"cost": [15,30], 	"size": 1,			"item": ["equip_to.helmet", "counter.integrity.8"	],			"effects": ["skill.perception.-1", "armor.helmet.1"]},
					"studded": 			{"name":"studded_helmet", 			"type": "helmet", 	"cost": [20,40], 	"size": 1,			"item": ["equip_to.helmet", "counter.integrity.10"],			"effects": ["skill.perception.-1", "armor.helmet.1"]},
					"laminar": 			{"name":"laminar_helmet", 			"type": "helmet", 	"cost": [25,50], 	"size": 1,			"item": ["equip_to.helmet", "counter.integrity.6"	],			"effects": ["skill.perception.-2", "armor.helmet.2"]},
					"leather": 			{"name":"leather_helmet", 			"type": "helmet", 	"cost": [30,60], 	"size": 1,			"item": ["equip_to.helmet", "counter.integrity.8"	],			"effects": ["skill.perception.-2", "armor.helmet.2"]},
					"mail": 				{"name":"mail_helmet", 					"type": "helmet", 	"cost": [35,70], 	"size": 1,			"item": ["equip_to.helmet", "counter.integrity.10"],			"effects": ["skill.perception.-2", "armor.helmet.2"]},
					"scale": 				{"name":"scale_helmet", 				"type": "helmet", 	"cost": [40,80], 	"size": 1,			"item": ["equip_to.helmet", "counter.integrity.8"	],			"effects": ["skill.perception.-3", "armor.helmet.3"]},
					"brigandine": 	{"name":"brigandine_helmet",		"type": "helmet", 	"cost": [45,90], 	"size": 1,			"item": ["equip_to.helmet", "counter.integrity.10"],			"effects": ["skill.perception.-3", "armor.helmet.3"]},
					"plate": 				{"name":"plate_helmet", 				"type": "helmet", 	"cost": [50,100],	"size": 1,			"item": ["equip_to.helmet", "counter.integrity.12"],			"effects": ["skill.perception.-3", "armor.helmet.3"]},
				},
				"torso": {
					"cloth": 				{"name":"cloth_armor", 					"type": "torso", 		"cost": [20,40],		"size": 1, 		"item": ["equip_to.torso", "counter.integrity.6"	],			"effects": ["skill.acrobatics.-4",	"skill.dodge.-4",		"skill.stealth.-4",		"armor.torso.1"]},
					"rawhide": 			{"name":"rawhide_armor", 				"type": "torso", 		"cost": [30,60],		"size": 1, 		"item": ["equip_to.torso", "counter.integrity.8"	],			"effects": ["skill.acrobatics.-4",	"skill.dodge.-4",		"skill.stealth.-4",		"armor.torso.1"]},
					"studded": 			{"name":"studded_armor", 				"type": "torso", 		"cost": [40,80],		"size": 1, 		"item": ["equip_to.torso", "counter.integrity.10"	],			"effects": ["skill.acrobatics.-5",	"skill.dodge.-5",		"skill.stealth.-5",		"armor.torso.1"]},
					"laminar": 			{"name":"laminar_armor", 				"type": "torso", 		"cost": [50,100],		"size": 1, 		"item": ["equip_to.torso", "counter.integrity.6"	],			"effects": ["skill.acrobatics.-6",	"skill.dodge.-6",		"skill.stealth.-6",		"armor.torso.2"]},
					"leather": 			{"name":"leather_armor", 				"type": "torso", 		"cost": [60,120],		"size": 1, 		"item": ["equip_to.torso", "counter.integrity.8"	],			"effects": ["skill.acrobatics.-6",	"skill.dodge.-6",		"skill.stealth.-6",		"armor.torso.2"]},
					"mail": 				{"name":"mail_armor", 					"type": "torso", 		"cost": [70,140],		"size": 1, 		"item": ["equip_to.torso", "counter.integrity.10"	],			"effects": ["skill.acrobatics.-7",	"skill.dodge.-7",		"skill.stealth.-7",		"armor.torso.2"]},
					"scale": 				{"name":"scale_armor", 					"type": "torso", 		"cost": [80,160],		"size": 1, 		"item": ["equip_to.torso", "counter.integrity.8"	],			"effects": ["skill.acrobatics.-8",	"skill.dodge.-8",		"skill.stealth.-8",		"armor.torso.3"]},
					"brigandine": 	{"name":"brigandine_armor", 		"type": "torso", 		"cost": [90,180],		"size": 1, 		"item": ["equip_to.torso", "counter.integrity.10"	],			"effects": ["skill.acrobatics.-9",	"skill.dodge.-9",		"skill.stealth.-9",		"armor.torso.3"]},
					"plate": 				{"name":"plate_armor", 					"type": "torso", 		"cost": [100,200],	"size": 1, 		"item": ["equip_to.torso", "counter.integrity.12"	],			"effects": ["skill.acrobatics.-10",	"skill.dodge.-10",	"skill.stealth.-10",	"armor.torso.3"]},
				},	
				"vambrace": {	
					"cloth": 				{"name":"cloth_vambraces",			"type": "vambrace", "cost": [10,20],		"size": 1, 		"item": ["equip_to.vambrace", "counter.integrity.6"	],		"effects": ["skill.acrobatics.-2",	"skill.dodge.-2",		"skill.stealth.-2",		"armor.vambrace.1"]}, 
					"rawhide": 			{"name":"rawhide_vambraces", 		"type": "vambrace", "cost": [15,30],		"size": 1, 		"item": ["equip_to.vambrace", "counter.integrity.8"	],		"effects": ["skill.acrobatics.-3",	"skill.dodge.-3",		"skill.stealth.-3",		"armor.vambrace.1"]}, 
					"studded": 			{"name":"studded_vambraces", 		"type": "vambrace", "cost": [20,40],		"size": 1, 		"item": ["equip_to.vambrace", "counter.integrity.10"],		"effects": ["skill.acrobatics.-3",	"skill.dodge.-3",		"skill.stealth.-3",		"armor.vambrace.1"]}, 
					"laminar": 			{"name":"laminar_vambraces", 		"type": "vambrace", "cost": [25,50],		"size": 1, 		"item": ["equip_to.vambrace", "counter.integrity.6"	],		"effects": ["skill.acrobatics.-4",	"skill.dodge.-4",		"skill.stealth.-4",		"armor.vambrace.2"]}, 
					"leather": 			{"name":"leather_vambraces", 		"type": "vambrace", "cost": [30,60],		"size": 1, 		"item": ["equip_to.vambrace", "counter.integrity.8"	],		"effects": ["skill.acrobatics.-5",	"skill.dodge.-5",		"skill.stealth.-5",		"armor.vambrace.2"]}, 
					"mail": 				{"name":"mail_vambraces", 			"type": "vambrace", "cost": [35,70],		"size": 1, 		"item": ["equip_to.vambrace", "counter.integrity.10"],		"effects": ["skill.acrobatics.-5",	"skill.dodge.-5",		"skill.stealth.-5",		"armor.vambrace.2"]}, 
					"scale": 				{"name":"scale_vambraces", 			"type": "vambrace", "cost": [40,80],		"size": 1, 		"item": ["equip_to.vambrace", "counter.integrity.8"	],		"effects": ["skill.acrobatics.-8",	"skill.dodge.-8",		"skill.stealth.-8",		"armor.vambrace.3"]}, 
					"brigandine": 	{"name":"brigandine_vambraces",	"type": "vambrace", "cost": [45,90],		"size": 1, 		"item": ["equip_to.vambrace", "counter.integrity.10"],		"effects": ["skill.acrobatics.-9",	"skill.dodge.-9",		"skill.stealth.-9",		"armor.vambrace.3"]}, 
					"plate": 				{"name":"plate_vambraces", 			"type": "vambrace", "cost": [50,100],		"size": 1, 		"item": ["equip_to.vambrace", "counter.integrity.12"],		"effects": ["skill.acrobatics.-10", "skill.dodge.-10",	"skill.stealth.-10",	"armor.vambrace.3"]},
				},	
				"greave": {	
					"cloth": 				{"name":"cloth_greaves", 				"type": "greave", 	"cost": [10,20],		"size": 1, 		"item": ["equip_to.greave", "counter.integrity.6"	],			"effects": ["skill.acrobatics.-2",	"skill.dodge.-2",		"skill.stealth.-2",	 "armor.greave.1"]},
					"rawhide": 			{"name":"rawhide_greaves", 			"type": "greave", 	"cost": [15,30],		"size": 1, 		"item": ["equip_to.greave", "counter.integrity.8"	],			"effects": ["skill.acrobatics.-3",	"skill.dodge.-3",		"skill.stealth.-3",	 "armor.greave.1"]}, 
					"studded": 			{"name":"studded_greaves", 			"type": "greave", 	"cost": [20,40],		"size": 1, 		"item": ["equip_to.greave", "counter.integrity.10"],			"effects": ["skill.acrobatics.-4",	"skill.dodge.-4",		"skill.stealth.-4",	 "armor.greave.1"]}, 
					"laminar": 			{"name":"laminar_greaves", 			"type": "greave", 	"cost": [25,50],		"size": 1, 		"item": ["equip_to.greave", "counter.integrity.6"	],			"effects": ["skill.acrobatics.-4",	"skill.dodge.-4",		"skill.stealth.-4",	 "armor.greave.2"]}, 
					"leather": 			{"name":"leather_greaves", 			"type": "greave", 	"cost": [30,60],		"size": 1, 		"item": ["equip_to.greave", "counter.integrity.8"	],			"effects": ["skill.acrobatics.-5",	"skill.dodge.-5",		"skill.stealth.-5",	 "armor.greave.2"]}, 
					"mail": 				{"name":"mail_greaves", 				"type": "greave", 	"cost": [35,70],		"size": 1, 		"item": ["equip_to.greave", "counter.integrity.10"],			"effects": ["skill.acrobatics.-6",	"skill.dodge.-6",		"skill.stealth.-6",	 "armor.greave.2"]}, 
					"scale": 				{"name":"scale_greaves", 				"type": "greave", 	"cost": [40,80],		"size": 1, 		"item": ["equip_to.greave", "counter.integrity.8"	],			"effects": ["skill.acrobatics.-8",	"skill.dodge.-8",		"skill.stealth.-8",	 "armor.greave.3"]}, 
					"brigandine": 	{"name":"brigandine_greaves", 	"type": "greave", 	"cost": [45,90],		"size": 1, 		"item": ["equip_to.greave", "counter.integrity.10"],			"effects": ["skill.acrobatics.-9",	"skill.dodge.-9",		"skill.stealth.-9",	 "armor.greave.3"]}, 
					"plate": 				{"name":"plate_greaves", 				"type": "greave", 	"cost": [50,100],		"size": 1, 		"item": ["equip_to.greave", "counter.integrity.12"],			"effects": ["skill.acrobatics.-10", "skill.dodge.-10",	"skill.stealth.-10", "armor.greave.3"]},
				},
				"shield": {	
					"target": 			{"name":"target_shield", 				"type": "shield", 	"cost": [10,20],		"size": 1,		"item": ["equip_to.off_hand", "counter.integrity.8"],			"effects": ["combat.parry.+",	"combat.parry.5"]},
					"normal": 			{"name":"normal_shield",				"type": "shield", 	"cost": [20,40], 		"size": 1,		"item": ["equip_to.off_hand", "counter.integrity.8"],			"effects": ["combat.parry.+",	"combat.parry.10"]},
					"full": 				{"name":"full_shield", 	 				"type": "shield", 	"cost": [30,60], 		"size": 1,		"item": ["equip_to.off_hand", "counter.integrity.8"],			"effects": ["combat.parry.+",	"combat.parry.15"]},
					"wall": 				{"name":"wall_shield", 	 				"type": "shield", 	"cost": [50,100],		"size": 2,		"item": ["equip_to.off_hand", "counter.integrity.8"],			"effects": ["combat.parry.+",	"combat.parry.20"]},
				},
				"common": {	
					"backpack": 		{"name": "backpack",						"type": "backpack",	"cost": [250,500],	"size": 1,		"item": ["equip_to.backpack",	],													"effects": ["traverse.inventory.20"]},
					"belt": 				{"name": "belt", 								"type": "belt",			"cost": [500,1000],	"size": 1,		"item": ["equip_to.belt",			],													"effects": ["traverse.inventory.5"]},
					"boots": 				{"name": "boots", 							"type": "boots",		"cost": [25,50],		"size": 1,		"item": ["equip_to.boots",		],													"effects": []},
					"gloves":				{"name": "gloves", 							"type": "gloves",		"cost": [25,50],		"size": 1,		"item": ["equip_to.gloves",		],													"effects": []},
					"circlet":			{"name": "circlet",							"type": "helmet",		"cost": [100,200], 	"size": 1,		"item": ["equip_to.helmet",		],													"effects": []},
					"pouch":				{"name": "pouch", 							"type": "pouch",		"cost": [50,100],		"size": 1,		"item": ["equip_to.pouch",		],													"effects": ["traverse.inventory.5"]},
					"ring": 				{"name": "ring", 								"type": "ring",			"cost": [50,100],		"size": 0,		"item": ["equip_to.ring",			],													"effects": []},
					"bedroll": 			{"name": "backpack",						"type": "gear",			"cost": [100,200],	"size": 2,		"item": ["inventory.passive",	],													"effects": ["camp.check.1"]},
					"crow_bar":			{"name": "crow_bar", 						"type": "gear",			"cost": [25,50],		"size": 1,		"item": ["inventory.passive",	],													"effects": ["traverse.break.10"]},
					"toolkit":			{"name": "toolkit",							"type": "gear",			"cost": [5,10],			"size": 0,		"item": ["inventory.passive",	],													"effects": ["actions.disarm", "traverse.disarm.5"]},
					"belt_lamp":		{"name": "belt_lamp", 					"type": "light",		"cost": [750,1500],	"size": 1,		"item": ["equip_to.belt_slot","counter.use.20"],					"effects": ["light_source"]},
					"lamp": 				{"name": "lamp", 								"type": "light",		"cost": [100,200],	"size": 1,		"item": ["equip_to.off_hand",	"counter.use.20"],					"effects": ["light_source"]},			
					"torch": 				{"name": "torch", 							"type": "light_use","cost": [5,10],			"size": 1,		"item": ["equip_to.off_hand",	"counter.use.20"],					"effects": ["light_source"]},			
					"candle": 			{"name": "candle", 							"type": "light_use","cost": [5,10],			"size": 1,		"item": ["equip_to.off_hand",	"counter.use.10"],					"effects": ["light_source"]},
					"flare": 				{"name": "flare", 							"type": "light_use","cost": [10,20],		"size": 1,		"item": ["equip_to.off_hand",	"counter.use.1"],						"effects": ["light_source"]},		
				},
				"supplies": {
					"bandage": 			{"name": "bandage", 						"type": "supplies", 	"cost": [5,10], 		"size": 0},
					"cooking":			{"name": "cooking", 						"type": "supplies", 	"cost": [3,5], 			"size": 0},
					"crafting":			{"name": "crafting",						"type": "supplies", 	"cost": [3,5], 			"size": 0},
					"crystal":			{"name": "crystal", 						"type": "supplies", 	"cost": [25,50],		"size": 0},
					"lockpick":			{"name": "lockpick",						"type": "supplies", 	"cost": [3,5],			"size": 0},
					"oil":					{"name": "oil",									"type": "supplies", 	"cost": [3,5],			"size": 0},
					"ration":				{"name": "ration",							"type": "supplies", 	"cost": [3,5],			"size": 0},
					"ritual":				{"name": "ritual",							"type": "supplies", 	"cost": [5,10],			"size": 0},
				},
				"potion": {
					"aether": 			{"name": "aether",							"type":"potion", 		"cost": [25,50], 		"size": 0, 	"item": "consume.potion",	"effects": ["dice.roll_aging", "aether_potion", "counter.1"]},
					"antidote": 		{"name": "antidote",						"type":"potion", 		"cost": [25,50], 		"size": 0, 	"effects": ["dice.roll_aging", "antidote_potion", "counter.1"]},
					"coagulant": 		{"name": "coagulant",						"type":"potion", 		"cost": [25,50], 		"size": 0, 	"effects": ["dice.roll_aging", "coagulant_potion", "counter.1"]},
					"courage":			{"name": "courage",							"type":"potion", 		"cost": [25,50], 		"size": 0, 	"effects": ["dice.roll_aging", "courage_potion", "counter.1"]},
					"flaming":			{"name": "flaming",							"type":"potion", 		"cost": [25,50], 		"size": 0, 	"effects": ["dice.roll_aging", "flaming_potion", "counter.1"]},
					"frenzy":				{"name": "frenzy",							"type":"potion", 		"cost": [25,50], 		"size": 0, 	"effects": ["dice.roll_aging", "frenzy_potion", "counter.1"]},
					"health":				{"name": "health",							"type":"potion", 		"cost": [25,50], 		"size": 0, 	"effects": ["dice.roll_aging", "health_potion", "counter.1"]},
					"regeneration":	{"name": "regeneration",				"type":"potion", 		"cost": [25,50], 		"size": 0, 	"effects": ["dice.roll_aging", "regeneration_potion", "counter.1"]},
					"poison":				{"name": "poison",							"type":"potion", 		"cost": [25,50], 		"size": 0, 	"effects": ["dice.roll_aging", "poison_potion", "counter.1"]},
					"cleanse":			{"name": "cleanse",							"type":"potion", 		"cost": [25,50], 		"size": 0, 	"effects": ["dice.roll_aging", "cleanse_potion", "counter.1"]},
					"vigor":				{"name": "vigor",								"type":"potion", 		"cost": [25,50], 		"size": 0, 	"effects": ["dice.roll_aging", "vigor_potion", "counter.1"]},
					"satiation":		{"name": "satiation",						"type":"potion", 		"cost": [25,50], 		"size": 0, 	"effects": ["dice.roll_aging", "satiation_potion", "counter.1"]},
					"calmness":			{"name": "calmness",						"type":"potion", 		"cost": [25,50], 		"size": 0, 	"effects": ["dice.roll_aging", "calmness_potion", "counter.1"]},
					"haste":				{"name": "haste",								"type":"potion", 		"cost": [25,50], 		"size": 0, 	"effects": ["dice.roll_aging", "haste_potion", "counter.1"]},
					"stoneskin":		{"name": "stoneskin",						"type":"potion", 		"cost": [25,50], 		"size": 0, 	"effects": ["dice.roll_aging", "stoneskin_potion", "counter.1"]},
					"strength":			{"name": "strength",						"type":"potion", 		"cost": [25,50], 		"size": 0, 	"effects": ["dice.roll_aging", "strength_potion", "counter.1"]},
					"vitality":			{"name": "vitality",						"type":"potion", 		"cost": [25,50], 		"size": 0, 	"effects": ["dice.roll_aging", "vitality_potion", "counter.1"]},
				},
				"fragment": {
					"ritual_dagger": 								{"name":"ritual_dagger",							"type": "fragment",		"cost": [750,750],		"size": 0,	"effects": ["ritual_dagger.action", "counter.1"]},
					"tattered_cloak": 							{"name":"tattered_cloak",							"type": "fragment",		"cost": [750,750],		"size": 0,	"effects": ["tattered_cloak.action", "counter.1"]},
					"refracting_mirror": 						{"name":"refracting_mirror",					"type": "fragment",		"cost": [750,750],		"size": 0,	"effects": ["refracting_mirror.action", "counter.1"]},
					"grounding_chain": 							{"name":"grounding_chain",						"type": "fragment",		"cost": [750,750],		"size": 0,	"effects": ["grounding_chain.action", "counter.1"]},
					"black_heart_babble": 					{"name":"black_heart_babble",					"type": "fragment",		"cost": [750,750],		"size": 0,	"effects": ["black_heart_babble.action", "counter.1"]},
					"cracked_monocle": 							{"name":"cracked_monocle",						"type": "fragment",		"cost": [750,750],		"size": 0,	"effects": ["cracked_monocle.action", "counter.1"]},
					"green_vial":										{"name":"green_vial",									"type": "fragment",		"cost": [750,750],		"size": 0,	"effects": ["green_vial.action", "counter.1"]},
					"enchanted_skull":							{"name":"enchanted_skull",						"type": "fragment",		"cost": [750,750],		"size": 0,	"effects": ["enchanted_skull.action", "counter.1"]},
					"cursed_bandages":							{"name":"cursed_bandages",						"type": "fragment",		"cost": [750,750],		"size": 0,	"effects": ["cursed_bandages.action", "counter.1"]},
					"blood_potion":									{"name":"blood_potion",								"type": "fragment",		"cost": [750,750],		"size": 0,	"effects": ["blood_potion.action", "counter.1"]},
					"ravens_trinket":								{"name":"ravens_trinket",							"type": "fragment",		"cost": [750,750],		"size": 0,	"effects": ["ravens_trinket.action", "counter.1"]},
					"spiked_gauntlets":							{"name":"spiked_gauntlets",						"type": "fragment",		"cost": [750,750],		"size": 0,	"effects": ["spiked_gauntlets.action", "counter.1"]},
					"black_vial":										{"name":"black_vial",									"type": "fragment",		"cost": [750,750],		"size": 0,	"effects": ["black_vial.action", "counter.1"]},
					"spider_locket":								{"name":"spider_locket",							"type": "fragment",		"cost": [750,750],		"size": 0,	"effects": ["spider_locket.action", "counter.1"]},
					"obsidian_whistle":							{"name":"obsidian_whistle",						"type": "fragment",		"cost": [750,750],		"size": 0,	"effects": ["obsidian_whistle.action", "counter.1"]},
					"miasma_flask":									{"name":"miasma_flask",								"type": "fragment",		"cost": [750,750],		"size": 0,	"effects": ["miasma_flask.action", "counter.1"]},
					"broken_harp":									{"name":"broken_harp",								"type": "fragment",		"cost": [750,750],		"size": 0,	"effects": ["broken_harp.action", "counter.1"]},
					"ancient_grimoire":							{"name":"ancient_grimoire",						"type": "fragment",		"cost": [750,750],		"size": 0,	"effects": ["ancient_grimoire.action", "counter.1"]},
					"amethyst_ring":								{"name":"amethyst_ring",							"type": "fragment",		"cost": [750,750],		"size": 0,	"effects": ["amethyst_ring.action", "counter.1"]},
					"frozen_hourglass":							{"name":"frozen_hourglass",						"type": "fragment",		"cost": [750,750],		"size": 0,	"effects": ["frozen_hourglass.action", "counter.1"]},
				},
				"relic": {
					"eternal_sentinel_aegis": 			{"name":"eternal_sentinel_aegis", 	 	"type": "armor", 			"cost": [1000,1000],	"size": 2,	"effects":["combat.parry.20", "ignore_damage.action"]},
					"band_of_knowledge": 						{"name":"band_of_knowledge", 					"type": "ring", 			"cost": [1000,1000],	"size": 1,	"effects":["camp_boost_skill.action.50"]},
					"diadem_of_aetheric_power":			{"name":"diadem_of_aetheric_power",		"type": "helmet",			"cost": [1000,1000],	"size": 1,	"effects":["aether.max.10", "spells.extra_die.6"]},
					"draught_of_vitality":					{"name":"draught_of_vitality",				"type": "potion",			"cost": [1000,1000],	"size": 1,	"effects":["health.max.roll.4"]},
					"echo_of_resurgence":						{"name":"echo_of_resurgence",					"type": "trinket",		"cost": [1000,1000],	"size": 1,	"effects":["resurrect"]},
					"elixir_of_ascendence":					{"name":"elixir_of_ascendence",				"type": "potion",			"cost": [1000,1000],	"size": 1,	"effects":["aether.max.roll.4"]},
					"ethereal_requiem_blade":				{"name":"ethereal_requiem_blade",			"type": "weapon",			"cost": [1000,1000],	"size": 1,	"effects":[""]},
					"gloomheart_seed":							{"name":"gloomheart_seed",						"type": "usable",			"cost": [1000,1000],	"size": 1,	"effects":[""]},
					"blazing_phoenix_gloves":				{"name":"blazing_phoenix_gloves",			"type": "gloves",			"cost": [1000,1000],	"size": 1,	"effects":[""]},
					"inferno_plate":								{"name":"inferno_plate",							"type": "torso",			"cost": [1000,1000],	"size": 1,	"effects":[""]},
					"eclipse_mace":									{"name":"eclipse_mace",								"type": "weapon",			"cost": [1000,1000],	"size": 1,	"effects":[""]},
					"mindward_elixir":							{"name":"mindward_elixir",						"type": "potion",			"cost": [1000,1000],	"size": 1,	"effects":[""]},
					"rebirth_potion":								{"name":"rebirth_potion",							"type": "potion",			"cost": [1000,1000],	"size": 1,	"effects":[""]},
					"arcane_tempest_ring":					{"name":"arcane_tempest_ring",				"type": "ring",				"cost": [1000,1000],	"size": 1,	"effects":[""]},
					"ethereal_grasp_ring":					{"name":"ethereal_grasp_ring",				"type": "ring",				"cost": [1000,1000],	"size": 1,	"effects":[""]},
					"ring_of_servitude":						{"name":"ring_of_servitude",					"type": "ring",				"cost": [1000,1000],	"size": 1,	"effects":[""]},
					"third_eye_of_emaricus":				{"name":"third_eye_of_emaricus",			"type": "trinket",		"cost": [1000,1000],	"size": 1,	"effects":[""]},
					"vitalbane_cinch":							{"name":"vitalbane_cinch",						"type": "belt",				"cost": [1000,1000],	"size": 1,	"effects":[""]},
					"voidclasp_gauntlets":					{"name":"voidclasp_gauntlets",				"type": "gloves",			"cost": [1000,1000],	"size": 1,	"effects":[""]},
					"wyrmfang":											{"name":"wyrmfang",										"type": "weapon",			"cost": [1000,1000],	"size": 1,	"effects":[""]},
				},
			},
			"criticals": {
				"character_party": {
					"acrobatics": {
						"success": [{"name": "Daring Maneuver", "desc": "The character performs a daring acrobatic maneuver. They gain a +30 bonus to their next action due to the momentum and adrenaline rush from the successful maneuver. This bonus lasts for one round.", "rule": ["test", ["__0__"]]}],
						"failure": [{"name": "Catastrophic Tumble", "desc": "The character loses control during an acrobatic attempt and suffers a severe fall, taking D10+1 Bludgeoning damage from the fall. Additionally, they are considered Prone.", "rule": null}]
					},
					"athletics": {
						"success": [{"name": "Herculean Feat", "desc": "The character performs an incredible display of physical prowess, exceeding all expectations. Their next successful attack deals double damage, or the next door/container they encounter is smashed open automatically (whichever happens first).", "rule": null}],
						"failure": [{"name": "Overexertion", "desc": "The character pushes themselves too hard during an athletic endeavor, resulting in a mishap. They have Disadvantage in their next Athletics check due to fatigue.", "rule": null}]
					},
					"dodge": {
						"success": [{"name": "Elusive Maneuver", "desc": "The character displays exceptional agility and awareness, narrowly avoiding an attack. They gain a +20 bonus to their Dodge skill for the next round.", "rule": null}],
						"failure": [{"name": "Clumsy Misstep", "desc": "The character loses their footing or makes a critical error in judgment, making them an easier target. They receive double damage from the source they're trying to avoid.", "rule": null}]
					},
					"endurance": {
						"success": [{"name": "Unwavering Resilience", "desc": "The character demonstrates exceptional fortitude and resilience in the face of hardship. They recover 1 Health and are Resistant to Poison damage for the next 5 rooms.", "rule": null}],
						"failure": [{"name": "Overwhelmed by Strain", "desc": "The character succumbs to the physical stress of the situation, suffering a temporary setback. They have Disadvantage on the next Athletics and Acrobatics checks.", "rule": null}]
					},
					"initiative": {
						"success": [{"name": "Snap Reaction", "desc": "You act at lighting speed, allowing you to take advantage of your opponent. Perform your first attack with Advantage.", "rule": null}],
						"failure": [{"name": "Taken by Surprise", "desc": "You are unaware of your surroundings and lose your first turn as a result.", "rule": null}]
					},
					"magic_resist": {
						"success": [{"name": "Unbreakable Will", "desc": "The character demonstrates exceptional resistance to magical influence, defying the effects of the spell or magical attack. They become Resistant to the spell's damage for the next D4+1 rounds.", "rule": null}],
						"failure": [{"name": "Magical Vulnerability", "desc": "The character succumbs to the full force of the magical influence, experiencing the worst possible outcome of the spell or attack. They receive double damage from the spell, or its consequences last twice as long.", "rule": null}]
					},
					"medicine": {
						"success": [{"name": "Miraculous Recovery", "desc": "The character demonstrates exceptional medical skill and knowledge, achieving an improbable outcome. They recover D10 Toughness.", "rule": null}],
						"failure": [{"name": "Harmful Treatment", "desc": "The character makes a critical error in diagnosis or treatment, potentially worsening the patient's condition. They suffer 2D6 damage.", "rule": null}],
					},
					"perception": {
						"success": [{"name": "Heightened Awareness", "desc": "The character notices hidden details or gains exceptional situational awareness. They gain Advantage on their next Perception check.", "rule": null}],
						"failure": [{"name": "Blind Spot", "desc": "The character completely misses a crucial detail or misinterprets a situation. They have Disadvantage on their next Perception check.", "rule": null}]
					},
					"resolve": {
						"success": [{"name": "Unwavering Will", "desc": "The character displays exceptional mental fortitude and resilience, resisting the pressures of the situation. They recover D4+1 Sanity.", "rule": null}],
						"failure": [{"name": "Mental Lapse", "desc": "The character succumbs to the mental pressure of the situation, making them vulnerable to further influence or manipulation. They lose D4 Sanity.", "rule": null}]
					},
					"reason": {
						"success": [{"name": "Brilliant Deduction", "desc": "The character demonstrates exceptional logic and critical thinking, making a breakthrough in their understanding. They immediately identify a magic item in their possession, without spending an Attunement Crystal.", "rule": null}],
						"failure": [{"name": "Mental Block", "desc": "The character suffers a temporary lapse in logic or reasoning, hindering their ability to think clearly. They have Disadvantage on their next Reason check.", "rule": null}]
					},
					"stealth": {
						"success": [{"name": "Ghost in the Shadows", "desc": "The character moves with exceptional stealth, becoming nearly invisible to anyone in the vicinity. If they perform an attack in the next round, it strikes automatically.", "rule": null}],
						"failure": [{"name": "Flimsy Footing", "desc": "The character makes a critical error in their movement or actions, alerting their pursuers. They have Disadvantage on any action they perform in the next round, due to being surprised.", "rule": null}]
					},
					"thievery": {
						"success": [{"name": "Masterful Thief", "desc": "The character executes their thieving act with exceptional skill and precision, exceeding expectations. They receive Advantage on their next Thievery check.", "rule": null}],
						"failure": [{"name": "Bungled Attempt", "desc": "The character makes a critical error during their thieving attempt, leading to complications. They accidentally have triggered a trap they had somehow missed. Roll on the Traps table.", "rule": null}]
					},
					"combat": {
						"success": [],
						"failure": [
							{"name": "Drop Weapon", "desc": "You drop your weapon and must spend your next turn recovering it. If you are not wielding a weapon, your next attack suffers -20.", "rule": null},
							{"name": "Embedded Weapon", "desc": "You hurl your weapon with such strength that it gets stuck very deep in a wall or ground. As a Standard Action, you must perform a successful Athletics check to retrieve it. If you are not wielding a weapon, your next attack suffers -20.", "rule": null},
							{"name": "Shatter Weapon", "desc": "You hurl your weapon with such strength that it smashes against a stone, breaking in half. You must repair it before you can wield it again. If you are not wielding a weapon, your next attack suffers -20.", "rule": null},
							{"name": "Crush Belt", "desc": "A random item from your belt breaks: make a belt check. If you don't have a belt, you receive 1 direct damage.", "rule": null},
							{"name": "Aether Sickness", "desc": "You are suddenly feeling drained and lose D8 Aether. If you don't have any Aether, you receive 1 direct damage.", "rule": null},
							{"name": "Trip", "desc": "You trip and fall, wasting this action. You are Prone and must use a Standard Action to get back up next round.", "rule": null},
							{"name": "Miscalculated Attack", "desc": "In the process of executing your attack you trip and slam your head. You are Dazed for 2 rounds.", "rule": null},
							{"name": "Friendly Fire", "desc": "Your attack hits a random ally instead of the intended target. If there are no allies, you strike yourself.", "rule": null},
							{"name": "Stop Hitting Yourself", "desc": "You manage to strike yourself with a normal attack.", "rule": null},
							{"name": "Self Own", "desc": "You somehow manage to hurt yourself badly with your own weapon. You receive a critical hit.", "rule": null},
						]
					}
				},
				"enemy_party": {
					"combat": {
						"success": [],
						"failure": [
							{"name": "Weakened Front", "desc": "The creature's next attack suffers -20, If it's a magical action, the PC receives +20 to its Magic Resistance.", "rule": null},
							{"name": "Incompetent Swing", "desc": "The creature becomes confused by their own inability to strike the PC, becoming Stunned for the next round.", "rule": null},
							{"name": "Entangled", "desc": "The creature is Entangled for the next D4 rounds due to some vegetation or refuse in its vicinity.", "rule": null},
							{"name": "Fixed Pattern", "desc": "The creature exposes a weakness in its attack pattern, granting the PC Advantage on their defensive rolls for the next 2 rounds.", "rule": null},
							{"name": "Floor Sand", "desc": "The attack creates a huge cloud of lifted dust, causing the PC to be Concealed for D4 rounds.", "rule": null},
							{"name": "Help I've Fallen", "desc": "The creature trips and falls, wasting their action. It is Prone and must use its next turn to get back up.", "rule": null},
							{"name": "Discombobulated", "desc": "In the process of executing its attack, the creature trips and slams its head. It is Stunned for 2 rounds.", "rule": null},
							{"name": "Spooked", "desc": "The creature becomes Frightened for D4 rounds. They can attempt a Magic Resistance check at the start of each of its turn to remove the condition.", "rule": null},
							{"name": "Stop Hitting Yourself", "desc": "The creature manages to strike itself, receiving D8 Slashing damage.", "rule": null},
							{"name": "Trip", "desc": "The creature falls in an awkward position, becoming Prone and receiving 2D6 Bludgeoning damage. It must use its next turn to get back up.", "rule": null}
						]
					}
				}
			},
			"defensive_maneuvers": [
				{ "desc": "Their next attack receives an additional +10", "rule": null },
				{ "desc": "Reduce their opponent's Armor by 1 in one random location until the end of combat", "rule": null },
				{ "desc": "Their opponent receives the Bleeding (1) condition", "rule": null },
				{ "desc": "If they were Prone, Paralyzed, Stunned, or some other similar condition, they automatically recover. Otherwise, their next attack receives an additional +10", "rule": null },
				{ "desc": "Their opponent immediately suffers D4 damage that ignores armor", "rule": null },
				{ "desc": "Their next attack deals +D10 damage", "rule": null },
				{ "desc": "They gain Advantage on their next attack", "rule": null },
				{ "desc": "They press their advantage, reducing their opponent's next defensive roll by -20", "rule": null },
				{ "desc": "They get a moment of respite after fending off their opponent's attack. Recover 2 Toughness (2 Health in case of NPCs and opponents)", "rule": null },
				{ "desc": "Their next attack doesn't suffer the usual -30 modifier to their attack skill when targeting a specific body part.", "rule": null },
			],
			"masteries":{
				"abyssal_reaver":						{	"name": "abyssal_reaver",				"desc": null, 	"level": {"base": 0, "max": 5, "total": 0	},	"effects":["actions.abyssal_reaver.passive", "actions.abyssal_reaver.infernal_flame", "actions.abyssal_reaver.hellish_weapon", "actions.abyssal_reaver.demonic_pact", "actions.abyssal_reaver.demon_shroud", "actions.abyssal_reaver.soul_harvest"]},
				"arcanist":									{	"name": "arcanist",							"desc": null, 	"level": {"base": 0, "max": 5, "total": 0	},	"effects":["actions.arcanist.passive", "actions.arcanist.arcane_missiles", "actions.arcanist.arcane_shield", "actions.arcanist.create_light", "actions.arcanist.arcane_companion", "actions.arcanist.arcane_bolt"]},
				"brawler":									{	"name": "brawler",							"desc": null, 	"level": {"base": 0, "max": 5, "total": 0	},	"effects":["actions.brawler.passive", "actions.brawler.feint", "actions.brawler.uppercut", "actions.brawler.overwhelm", "actions.brawler.kidney_shot", "actions.brawler.perfect_blocking"]},
				"bulwark":									{	"name": "bulwark",							"desc": null, 	"level": {"base": 0, "max": 5, "total": 0	},	"effects":["actions.bulwark.passive", "actions.bulwark.brace", "actions.bulwark.shield_bash", "actions.bulwark.sword_&_board", "actions.bulwark.battle_form", "actions.bulwark.bastion"]},
				"duskblade":								{	"name": "duskblade",						"desc": null, 	"level": {"base": 0, "max": 5, "total": 0	},	"effects":["actions.duskblade.passive", "actions.duskblade.poisoned_blade", "actions.duskblade.weaken", "actions.duskblade.sap", "actions.duskblade.ruthless_strike", "actions.duskblade.invisibility"]},
				"emissary":									{	"name": "emissary",							"desc": null, 	"level": {"base": 0, "max": 5, "total": 0	},	"effects":["actions.emissary.passive", "actions.emissary.heal_wounds", "actions.emissary.unbreakable_faith", "actions.emissary.remove_condition", "actions.emissary.divine_justice", "actions.emissary.holy_flames"]},
				"flamecaster":							null,
				"frostcaster":							null,
				"gravecaller":							null,
				"hexmancer":								null,
				"icon_caller":							null,
				"mindbinder":								null,
				"ritualist":								null,
				"stormbrand":								null,
				"tracker":									null,
				"umber_phantom":						null,
				"weapon_master":						null,
				"wraith":										null,
				"wraith_spawn":							null,
				"zealot":										null,
			},
			"goals": {
				"acid_damage_expert":					{	"name": "acid_damage_expert",				"tally": { "event": "",	"at": 0, "goal": 200	},	"rule": "reduction.acid",						"goal":"Deal 200 Acid damage",																								"reward":"Gain 1 Acid damage reduction"}, 
				"air_damage_expert":					{	"name": "air_damage_expert",				"tally": { "event": "",	"at": 0, "goal": 200	},	"rule": "reduction.air",						"goal":"Deal 200 Air damage",																									"reward":"Gain 1 Air damage reduction"}, 
				"annihilator":								{	"name": "annihilator",							"tally": { "event": "",	"at": 0, "goal": 1000	},	"rule": null,												"goal":"Defeat 1,000 opponents",																							"reward":"+D4 Psychic damage to all attacks"}, 
				"arcane_damage_expert":				{	"name": "arcane_damage_expert",			"tally": { "event": "",	"at": 0, "goal": 200	},	"rule": "reduction.arcane",					"goal":"Deal 200 Arcane damage",																							"reward":"Gain 1 Arcane damage reduction"}, 
				"astral_bane":								{	"name": "astral_bane",							"tally": { "event": "",	"at": 0, "goal": 100	},	"rule": null,												"goal":"Defeat 100 Astral opponents",																					"reward":"Triple the damage dealt with a critical hit against Astral opponents"}, 
				"beast_hunter":								{	"name": "beast_hunter",							"tally": { "event": "",	"at": 0, "goal": 100	},	"rule": null,												"goal":"Defeat 100 Animal opponents",																					"reward":"Triple the damage dealt with a critical hit against Animal opponents"}, 
				"bladed_weapon_master":				{	"name": "bladed_weapon_master",			"tally": { "event": "",	"at": 0, "goal": 50		},	"rule": null,												"goal":"Defeat 50 opponents with the Bladed Weapons skill",										"reward":"+1 damage while wielding a bladed weapon"}, 
				"bludgeoning_damage_expert":	{	"name": "bludgeoning_damage_expert","tally": { "event": "",	"at": 0, "goal": 200	},	"rule": "reduction.bludgeoning",		"goal":"Deal 200 Bludgeoning damage",																					"reward":"Gain 1 Bludgeoning damage reduction"}, 
				"bludgeoning_weapon_master":	{	"name": "bludgeoning_weapon_master","tally": { "event": "",	"at": 0, "goal": 50		},	"rule": null,												"goal":"Defeat 50 opponents with the Bludgeoning Weapons skill",							"reward":"+1 damage while wielding a bludgeoning weapon"}, 
				"botanical_exterminator":			{	"name": "botanical_exterminator",		"tally": { "event": "",	"at": 0, "goal": 100	},	"rule": null,												"goal":"Defeat 100 Plant opponents",																					"reward":"Triple the damage dealt with a critical hit against Plant opponents"}, 
				"brawler":										{	"name": "brawler",									"tally": { "event": "",	"at": 0, "goal": 50		},	"rule": null,												"goal":"Defeat 50 opponents with the Unarmed Combat & Fist Weapons skill",		"reward":"+1 damage while wielding a fist weapon or completely unarmed"}, 
				"cold_damage_expert":					{	"name": "cold_damage_expert",				"tally": { "event": "",	"at": 0, "goal": 200	},	"rule": null,												"goal":"Deal 200 Cold damage",																								"reward":"Gain 1 Cold damage reduction"}, 
				"decapitate_the_leadership":	{	"name": "decapitate_the_leadership","tally": { "event": "",	"at": 0, "goal": 20		},	"rule": null,												"goal":"Defeat 20 Overseers",																									"reward":"When facing an Overseer, they are Stunned during the first combat round"}, 
				"demon_bane":									{	"name": "demon_bane",								"tally": { "event": "",	"at": 0, "goal": 100	},	"rule": null,												"goal":"Defeat 100 Demon opponents",																					"reward":"Triple the damage dealt with a critical hit against Demon opponents"}, 
				"earth_damage_expert":				{	"name": "earth_damage_expert",			"tally": { "event": "",	"at": 0, "goal": 200	},	"rule": null,												"goal":"Deal 200 Earth damage",																								"reward":"Gain 1 Earth damage reduction"}, 
				"elemental_vanquisher":				{	"name": "elemental_vanquisher",			"tally": { "event": "",	"at": 0, "goal": 100	},	"rule": null,												"goal":"Defeat 100 Elemental opponents",																			"reward":"Triple the damage dealt with a critical hit against Elemental opponents"}, 
				"fire_damage_expert":					{	"name": "fire_damage_expert",				"tally": { "event": "",	"at": 0, "goal": 200	},	"rule": null,												"goal":"Deal 200 Fire damage",																								"reward":"Gain 1 Fire damage reduction"}, 
				"hoarder":										{	"name": "hoarder",									"tally": { "event": "",	"at": 0, "goal": 10000},	"rule": null,												"goal":"Obtain 10,000₵. (You do not need to hold this amount all at once)",		"reward":"Traders will buy up to 5 items from you at full price"}, 
				"holy_damage_expert":					{	"name": "holy_damage_expert",				"tally": { "event": "",	"at": 0, "goal": 200	},	"rule": null,												"goal":"Deal 200 Holy damage",																								"reward":"Gain 1 Holy damage reduction"}, 
				"infernal_damage_expert":			{	"name": "infernal_damage_expert",		"tally": { "event": "",	"at": 0, "goal": 200	},	"rule": null,												"goal":"Deal 200 Infernal damage",																						"reward":"Gain 1 Infernal damage reduction"}, 
				"living_shadow":							{	"name": "living_shadow",						"tally": { "event": "",	"at": 0, "goal": 50		},	"rule": null,												"goal":"Surprise 50 opponents",																								"reward":"You gain the Living Shadow Perk"}, 
				"marauder":										{	"name": "marauder",									"tally": { "event": "",	"at": 0, "goal": 100	},	"rule": null,												"goal":"Defeat 100 Humanoid opponents",																				"reward":"Triple the damage dealt with a critical hit against Humanoid opponents"}, 
				"master_thief":								{	"name": "master_thief",							"tally": { "event": "",	"at": 0, "goal": 100	},	"rule": null,												"goal":"Open 100 doors or containers with the help of your Thievery skill",		"reward":"You gain the Lucky Find Perk"}, 
				"necrotic_damage_expert":			{	"name": "necrotic_damage_expert",		"tally": { "event": "",	"at": 0, "goal": 200	},	"rule": null,												"goal":"Deal 200 Necrotic damage",																						"reward":"Gain 1 Necrotic damage reduction"}, 
				"overseer_overthrown":				{	"name": "overseer_overthrown",			"tally": { "event": "",	"at": 0, "goal": 1		},	"rule": null,												"goal":"Defeat an Overseer",																									"reward":"You obtain an Amulet"}, 
				"piercing_damage_expert":			{	"name": "piercing_damage_expert",		"tally": { "event": "",	"at": 0, "goal": 200	},	"rule": null,												"goal":"Deal 200 Piercing damage",																						"reward":"Gain 1 Piercing damage reduction"}, 
				"poison_damage_expert":				{	"name": "poison_damage_expert",			"tally": { "event": "",	"at": 0, "goal": 200	},	"rule": null,												"goal":"Deal 200 Poison damage",																							"reward":"Gain 1 Poison damage reduction"}, 
				"precision_striker":					{	"name": "precision_striker",				"tally": { "event": "",	"at": 0, "goal": 50		},	"rule": null,												"goal":"Deal 50 critical hits in combat",																			"reward":"You gain the Precision Striker Perk"}, 
				"psychic_damage_expert":			{	"name": "psychic_damage_expert",		"tally": { "event": "",	"at": 0, "goal": 200	},	"rule": null,												"goal":"Deal 200 Psychic damage",																							"reward":"Gain 1 Psychic damage reduction"}, 
				"relic_hunter":								{	"name": "relic_hunter",							"tally": { "event": "",	"at": 0, "goal": 1		},	"rule": null,												"goal":"Find a Relic",																												"reward":"100 XP"}, 
				"scavenger":									{	"name": "scavenger",								"tally": { "event": "",	"at": 0, "goal": 100	},	"rule": null,												"goal":"Successfully scavenge 100 rooms",																			"reward":"You gain the Scavenger Perk"}, 
				"scholar":										{	"name": "scholar",									"tally": { "event": "",	"at": 0, "goal": 100	},	"rule": null,												"goal":"Successfully use the Reason skill 100 times to solve Events",					"reward":"You gain the Scholar Perk"}, 
				"sentinel_smasher":						{	"name": "sentinel_smasher",					"tally": { "event": "",	"at": 0, "goal": 100	},	"rule": null,												"goal":"Defeat 100 Construct opponents",																			"reward":"Triple the damage dealt with a critical hit against Construct opponents"},
				"shafted_weapon_master":			{	"name": "shafted_weapon_master",		"tally": { "event": "",	"at": 0, "goal": 50		},	"rule": null,												"goal":"Defeat 50 opponents with the Shafted Weapons skill",									"reward":"+1 damage while wielding a shafted weapon"},
				"slashing_damage_expert":			{	"name": "slashing_damage_expert",		"tally": { "event": "",	"at": 0, "goal": 200	},	"rule": null,												"goal":"Deal 200 Slashing damage",																						"reward":"Gain 1 Slashing damage reduction"},
				"trap_buster":								{	"name": "trap_buster",							"tally": { "event": "",	"at": 0, "goal": 50		},	"rule": null,												"goal":"Successfully dismantle 50 traps",																			"reward":"You gain the Trap Buster Perk"},
				"thrill_seeker":							{	"name": "thrill_seeker",						"tally": { "event": "",	"at": 0, "goal": 20		},	"rule": null,												"goal":"Trigger 20 Growing Darkness events",																	"reward":"Each time you must roll on the Growing Darkness table, you can choose to roll a second time and choose the result you prefer"},
				"vaelorian_erudite":					{	"name": "vaelorian_erudite",				"tally": { "event": "",	"at": 0, "goal": 10		},	"rule": null,												"goal":"Loot 10 Lore Books",																									"reward":"Increase your goalimum Aether by D4"},
				"water_damage_expert":				{	"name": "water_damage_expert",			"tally": { "event": "",	"at": 0, "goal": 200	},	"rule": null,												"goal":"Deal 200 Water damage",																								"reward":"Gain 1 Water damage reduction"},
				"wraithstalker":							{	"name": "wraithstalker",						"tally": { "event": "",	"at": 0, "goal": 100	},	"rule": null,												"goal":"Defeat 100 Undead opponents",																					"reward":"Triple the damage dealt with a critical hit against Undead opponents"},
			},
			"influence": {
				"Tough": 			"Immune to critical hits", 
				"Vital": 			"+D4 Health/5L",
				"Frenzied": 	"+2 damage",
				"Skilled": 		"+10 Combat Skill",
				"Magebane": 	"+10 Magic Resistance",
				"Resistant": 	"Resistant to 1 random type of damage. Roll on the Damage Type table on page 206",
				"Corrupting": "Each time the creature deals 3+ damage on a single attack, the target must make a Resolve check or lose 1 Sanity",
				"Unstable": 	"Deals D8 Arcane damage when killed",
				"Alert": 			"+20 Awareness",
				"Piercing": 	"Gains the Penetrating (1) Trait. This can stack with other instances of the same trait",
			},
			"crimes": {
				"Highway Robbery": 			"Armed individuals ambush travelers on highways, robbing them of their belongings and sometimes resorting to violence.",
				"Witchcraft": 					"Accusations of practicing witchcraft are common in Veldonia, and those accused often face trials and punishment, such as imprisonment or execution.",
				"Poaching": 						"People illegally hunt game on private land, often to supplement their diet or sell the animals for profit, disregarding the landowner's rights.",
				"Smuggling": 						"Illicit trade involving the import or export of goods without paying customs duties, usually through hidden routes to avoid detection.",
				"Piracy": 							"Seafaring individuals that attack ships, plundering their cargo and often resorting to violence against the crew. Pirates are a significant concern for Veldonia due to the importance of its maritime trade.",
				"Murder": 							"The intentional killing of another person, which could be motivated by various factors such as revenge, personal disputes, or criminal activities.",
				"Sedition": 						"Engaging in activities that undermine or seek to overthrow the established authority, such as inciting rebellion or spreading dissent.",
				"Treason": 							"Engaging in activities that betray or threaten the monarchy, such as plotting against the king.",
				"Counterfeiting": 			"Producing fake currency or counterfeit goods, which undermine the economy and defraud individuals.",
				"Housebreaking": 				"Breaking into homes to steal valuable items or money, often resulting in damage to property and sometimes violence against occupants.",
				"Vagrancy": 						"Being homeless and unemployed, wandering from place to place without a clear means of support.",
				"Dueling": 							"Engaging in private combat with deadly weapons to resolve personal disputes.",
				"Rioting": 							"Participating in violent public disturbances or protests, often with groups of people causing damage to property or attacking others.",
				"Blasphemy": 						"Uttering or promoting sacrilegious or disrespectful statements or actions against any of the sanctioned churches.",
				"Grave Robbery": 				"The profanation of sepulchers to rob the dead of their valuables is seen with utmost disgust by Veldonian society, especially by the followers of Sothos, God of Death.",
				"Fraud": 								"Pretending to be something you are not to gain sympathy, regard or money. This might include pretending to be a veteran of the Eskalian wars, selling phony cures or masquerading as a priest, noble, or similar person of station.",
				"Trespassing": 					"Entering or remaining on someone else's property without permission, often resulting in disputes or damage.",
				"Clandestine Marriage": "Secretly marrying without the consent or approval of family members or authorities.",
				"Child Theft":					"Kidnapping or abducting children for various reasons, including ransom, forced labor, or adoption without consent.",
				"Sodomy": 							"Committing any unnatural sexual act, including those among members of the same sex, but not limited to it."
			},
			"merits": {
				"blessed": 							{ "name": "blessed",					"rule": "character.biography.merits.blessed",					"desc": "The day you were born, a god took pity on your human condition and blessed you. +10 Magic Resistance. This Merit cannot be taken in conjunction with the Cursed Flaw."}, 
				"eagle_eyed": 					{ "name": "eagle_eyed",				"rule": "character.biography.merits.eagle_eyed",			"desc": "You have improved chances of spotting hidden objects or enemies. +10 Perception."}, 
				"fearless": 						{ "name": "fearless",					"rule": "character.biography.merits.fearless",				"desc": "You have Advantage on all Resolve checks involving fear. This Merit cannot be taken if in possession of the Coward Flaw."}, 
				"haggler": 							{ "name": "haggler",					"rule": "character.biography.merits.haggler",					"desc": "When you find a trader, make a Reason check. If you pass it, you can sell all items in your possession for 100% of their price, instead of the usual 50%."}, 
				"lucky": 								{ "name": "lucky",						"rule": "character.biography.merits.lucky",						"desc": "Once per Domain, you can choose the most optimal result for you as a result of any roll, be it yours or an opponent's. This means that you don't need to make a roll: whichever the best option would be for that particular check, it happens. The only exception to this is rolls on the Precious Items table, which cannot be affected by Lucky."}, 
				"natural_healer": 			{ "name": "natural_healer",		"rule": "character.biography.merits.natural_healer",	"desc": "Your injuries seem to heal faster, recovering D6 Toughness after combat, instead of D4."},
				"hearty":								{ "name": "hearty",						"rule": "character.biography.merits.hearty",					"desc": "You have Advantage on all Endurance checks involving diseases and poisons. This Merit cannot be taken if in possession of the Sickly Flaw."},
				"scavenger": 						{ "name": "scavenger",				"rule": "character.biography.merits.scavenger",				"desc": "You have a good eye for finding things of value among heaps of trash. +10 Scavenging."},
				"tracker": 							{ "name": "tracker",					"rule": "character.biography.merits.tracker",					"desc": "Once per Domain, you can track down a trader. They will appear in a room you've just cleared. Unfortunately, they seem to be angry at you for following them, and all their prices are doubled."},
				"trained": 							{ "name": "trained",					"rule": "character.biography.merits.trained",					"desc": "You have obsessively trained with one particular weapon, granting you +10 to your weapon skill when wielding that type of weapon."}
			},
			"flaws": {
				"addict": 							{ "name": "addict", 					"rule": "character.biography.flaws.addict",					"desc": "You are addicted to the rush and carefree feeling that narcotics provide, more so since you were cast into the Underverse. Each time you ind Cooking Supplies, you spend some of them for recreational purposes, resulting in you finding 1 less."},
				"coward": 							{ "name": "coward", 					"rule": "character.biography.flaws.coward",					"desc": "You have Disadvantage on all Resolve checks involving fear. This Flaw cannot be taken if in possession of the Fearless Merit."},
				"cracked_soul": 				{ "name": "cracked_soul", 		"rule": "character.biography.flaws.cracked_soul",		"desc": "You start the game with D4+8 Aether, instead of D6+8."},
				"cursed": 							{ "name": "cursed", 					"rule": "character.biography.flaws.cursed",					"desc": "You offended a deity or some powerful sorcerer, who cursed you. -10 Magic Resistance. This Flaw cannot be taken in conjunction with the Blessed Merit."},
				"damaged_nerve": 				{ "name": "damaged_nerve",		"rule": "character.biography.flaws.damaged_nerve",	"desc": "One of your legs was injured a while back, and you never fully recovered. -10 Acrobatics."},
				"fragile_mind": 				{ "name": "fragile_mind", 		"rule": "character.biography.flaws.fragile_mind",		"desc": "You roll D4+8 for your starting Sanity, instead of D6+8."},
				"queasy": 							{ "name": "queasy", 					"rule": "character.biography.flaws.queasy",					"desc": "The sight of blood and poking at your own wounds makes you sick. -10 Medicine."},
				"short_sighted": 				{ "name": "short_sighted",		"rule": "character.biography.flaws.short_sighted",	"desc": "Your eyesight isn't your greatest asset. -10 Perception."},
				"sickly": 							{ "name": "sickly", 					"rule": "character.biography.flaws.sickly",					"desc": "You have Disadvantage on all Endurance checks involving diseases and poisons. This Flaw cannot be taken if in possession of the Resilient Constitution Merit."},
				"armor_averse": 				{ "name": "armor_averse", 		"rule": "character.biography.flaws.armor_averse",		"desc": "Whenever you wear a piece of heavy armor (excluding helmets) your Dodge skill is reduced by 5. If you're wearing a full suit of heavy armor your Dodge skill is reduced by 20"},
			},
			"actions_old": {
				"combat": {
					"standard": {
						"get_up_from_prone":	{"rule": "get_up_from_prone", "args":[]},
						"flee":								{"rule": "flee", "args":[]},
						"targeted_attack":		{"rule": "targeted_attack", "args":[]},
						"slash_attack": 			{"rule": "slash_attack", "args":[]},
						"pierce_attack":			{"rule": "pierce_attack", "args":[]},
						"blunt_attack":				{"rule": "bludgeon_attack", "args":[]},
						"disabling_strike":		{"rule": "disabling_strike", "args":[]},
					},
					"free": {
						"drop_held": 					{"rule": "drop_held", "args":[]},
						"use_belt_item": 			{"rule": "use_belt_item", "args":[]},
						"stop_concentrating": {"rule": "stop_concentrating", "args":[]},
						"violent_swing":			{"rule": "violent_swing", "args":[]},
					},
					"reactions": {
						"combat_check":				{"rule": "combat_check", "args":[]},
						"dodge_check":				{"rule": "dodge_check", "args":[]},
						"blunt_crit":					{"rule": "blunt_crit", "args":[]},
					}
				},
				"traversal": {
					"move": 					{"rule": "move", "args":[]},
					"scavenge": 			{"rule": "scavenge", "args":[]},
					"take_breather":	{"rule": "take_breather", "args": []},
					"camp":						{"rule": "camp", "args": []},
					"inventory": 			{"rule": "inventory", "args": []},
					"pickup_item": 		{"rule": "pickup_item", "args": []},
				},
			"camp_actions": {
				"attune": 					{"rule": "camp_atune", "args":[]},
				"barricade": 				{"rule": "camp_barricade", "args":[]},
				"cook": 						{"rule": "camp_cook", "args":[]},
				"ritual_components":{"rule": "camp_craft", "args":[["crafting_supplies", -5], ["ritual_components", 1], ["exhaustion", 1], ["camp_check", -2]]},
				"bandages": 				{"rule": "camp_craft", "args":[["crafting_supplies", -1], ["bandages", 1], ["exhaustion", 1], ["camp_check", -1]]},
				"lamp_oil": 				{"rule": "camp_craft", "args":[["crafting_supplies", -2], ["lamp_oil", 1], ["exhaustion", 1], ["camp_check", -2]]},
				"torches": 					{"rule": "camp_craft", "args":[["crafting_supplies", -1], ["torches", 1], ["exhaustion", 1], ["camp_check", -2]]},
				"heal_condition": 	{"rule": "camp_heal", "args":[]},
				"repair": 					{"rule": "camp_repair", "args":[]},
				"repair": 					{"rule": "camp_rest", "args":[]},
				"swap_amulet": 			{"rule": "camp_swap_amulet", "args":[]},
				}
			},
		},
		"enemies": {
			"skeletal_horror": {
				"id": "skeletal_horror",
				"type": "Undead", 
				"number": 2,
				"stats": {"health": [3, 3]},
				"skills": {"perception": 20,"endurance": 20,"athletics": 25,"combat": 30,"magic_resist": 20,},
				"body": {"type": "humanoid","armor": [0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0],"weak_spot": "head"},
				"loot": "tables.spoils",
				"modifiers": {
					"defense": {"Acid":1, "Air":1, "Arcane":1, "Bludgeon":1, "Charm": 0, "Cold":1, "Disease":0, "Earth":1, "Fire":1, "Holy":2, "Infernal":1, "Necrotic":-1, "Pierce":1, "Poison":0, "Psychic":1, "Slash":1, "Water":1},
					"reduction": {"Acid":0, "Air":0, "Arcane":0, "Bludgeon":0, "Charm": 0, "Cold":0, "Disease":0, "Earth":0, "Fire":0, "Holy":0, "Infernal":0, "Necrotic":0, "Pierce":0, "Poison":0, "Psychic":0, "Slash":0, "Water":0},
				},
				"traits": ["undead", "frightening"],
				"adaptions": [],
				"passives":[
					{ "name": "frightening",
						"rule": "apply_condition_roll",
						"args": ["frightened", "resolve"]},
				],
				"combat": {
					"standard": {
						"idx": [0,1],
						"distribution": ["cursed_slash", "cursed_slash", "ethereal_grasp", "ethereal_grasp", "haunting_wail", "vengeful_onslaught"],
						"actions": [
							{ "name": "cursed_slash",
								"rule": "physical_attack_roll",
								"die": [[8, ["Slash"], 0]],
								"check": { "attack": "combat", "defend": null },
								"desc": "swings its weapon with an eerie precision, dealing D8 Slashing damage." },
							{ "name": "ethereal_grasp",
								"rule": "ethereal_grasp",
								"die": [[6, ["Necrotic"], 0]],
								"check": { "attack": "combat", "defend": "endurance" },
								"desc": "reaches out with its hand, attempting to touch the essence of a target's life force. The target must make an Endurance check. On a failed check, they take D6 Necrotic damage, and the Skeletal Horror regains Health equal to half the damage dealt (rounding up). On a successful roll, the target takes half damage (rounding up), and the Skeletal Horror doesn't regain Health." },		
							{ "name": "haunting_wail",
								"rule": "haunting_wail",
								"die": null,
								"check": { "attack": "combat", "defend": "resolve" },
								"desc": "lets out a haunting wail that reverberates through the air. All creatures must make a successful Resolve check to avoid becoming Stunned for 1 round." },
							{ "name": "vengeful_onslaught",
								"rule": "vengeful_onslaught",
								"die": [[10, ["Pierce"], 0]],
								"check": { "attack": "combat", "defend": null},
								"desc": "charges forward with relentless determination, targeting one creature. It makes a melee attack against the target, dealing D10 Piercing damage on a hit. If the attack hits, the Skeletal Horror immediately uses its Ethereal Grasp ability as a Free Action." },
						]
					}
				}
			}
		},
		"overseers": {
			"infernal_tormentor": {
				"id": "infernal_tormentor",
				"type": "Demon", 
				"number": 1,
				"stats": {"health": [15, 15]},
				"skills": {"perception": 70,"endurance": 50,"athletics": 60,"combat": 60,"magic_resist": 50,},
				"body": {"type": "humanoid","armor": [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],"weak_spot": "head"},
				"loot": ["tables.valuable", "table.precious"],
				"modifiers": {
					"defense": {"Acid":1, "Air":1, "Arcane":1, "Bludgeon":1, "Charm": 0, "Cold":1, "Disease":0, "Earth":1, "Fire":1, "Holy":2, "Infernal":1, "Necrotic":-1, "Pierce":1, "Poison":0, "Psychic":1, "Slash":1, "Water":1},
					"reduction": {"Acid":0, "Air":0, "Arcane":0, "Bludgeon":0, "Charm": 0, "Cold":0, "Disease":0, "Earth":0, "Fire":0, "Holy":0, "Infernal":0, "Necrotic":0, "Pierce":0, "Poison":0, "Psychic":0, "Slash":0, "Water":0},
				},
				"traits": [["penetrating", 2], ["frightening", 1], ["ruthlessness", 1], ["swift", 1]],
				"adaptions": {
					"5": [["extra_die", 6], ["armor", 1]],
					"10": [["extra_die", 6], ["combat", 10]],
				},
				"passives":[],
				"combat": {
					"standard": {
						"idx": [0,1],
						"distribution": [],
						"actions": [
						]
					}
				}
			}
		},
		"models": {
			"domain": {
				"overseer": null,
				"influence": null,
				"tension_die": [8, 8],
				"layer_die": [10, 10],
				"exit_die": [10, 10],
				"darkness": [],
				"enemy_pool": ["skeletal_horror"],
				"map": Array(11).fill(Array(11)),
				"party_coord": [5, 5],
			},
			"area_flags":{
				"is_event": 1, 
				"is_encounter": 2, 
				"is_exit_up": 4, 
				"is_exit_down": 8, 
				"is_layer": 16,
				"is_scavenge": 32,
				"is_trader": 64,
				"is_items": 128, 
			},
			"door_flags": {
				"door": 1,
				"locked": 2,
				"trapped": 4,
				"opened": 8
			},
			"area": {
				"floor_plan": {
					"type": null,
					"shift_by": 0,
					"doors": [0,0,0,0],
					"flags": 0,
					"data": {}
				},
				"contents": {
					"scavenge": 	{"tries": [0,1]},
					"encounter": 	{
						"id": undefined,
						"order": {"idx": 0, "parties": []},
						"enemies": [],
						"reset": false,
						"ambush": false,
						"outcome": null
					},
					"event": 			{"id": 0},
					"exit": 			{"direction": -1},
					"items": 			[],
					"trader": 		{"unique_items":[], "bargains":[0,0], "buy_sell": [.5, 1]},
				},
				"flags": {
					"door": {
						"door": 1,
						"locked": 2,
						"trapped": 4,
						"opened": 8
					},
					"contents": {
						"is_event": 1, 
						"is_encounter": 2, 
						"is_exit_up": 4, 
						"is_exit_down": 8, 
						"is_layer": 16,
						"is_scavenge": 32,
						"is_trader": 64,
						"is_items": 128, 
					}
				}
			},
			"directions": {
				"north": 0,
				"west": 1,
				"south": 2,
				"east": 3
			},
			"character": {
				"type": 				"player",
				"name": 				"Anonymous",
				"biography":		{
					"body": 			{ "type": "humanoid", "weak_spot": "head" },
					"levels":			{ "base": 0,	"max": 1000,"total": 0 },
					"masteries":	{},
					"merits":			{},
					"flaws":			{},
					"madness":		{},
					"goals":			{},
					"perks": 			{},
					"domain":			{},
				},
				"stats": {
					"base": {
						"health": 				{ "base": 0,	"max": 0,		"total": 0 },
						"toughness": 			{ "base": 0,	"max": 0,		"total": 0 },
						"aether": 				{ "base": 0,	"max": 0,		"total": 0 },
						"sanity": 				{ "base": 0,	"max": 0,		"total": 0 },
						"exhaustion": 		{ "base": 0,	"max": 20,	"total": 0 },
					},
					"weapon": {
						"blade":					{ "base": 0, 	"max": 80,	"total": 0 },
						"bludgeon":				{ "base": 0, 	"max": 80,	"total": 0 },
						"fist":						{ "base": 20, "max": 80,	"total": 20},
						"pole":						{ "base": 0, 	"max": 80,	"total": 0 },
					},
					"skill": {
						"acrobatics":			{ "base": 10, "max": 80,	"total": 10}, 
						"athletics":			{ "base": 10, "max": 80,	"total": 10}, 
						"dodge":					{ "base": 10, "max": 80,	"total": 10}, 
						"endurance":			{ "base": 0, 	"max": 80,	"total": 0 }, 
						"medicine":				{ "base": 0, 	"max": 80,	"total": 0 },
						"magic_resist": 	{ "base": 0,	"max": 80,	"total": 0 },
						"perception":			{ "base": 20, "max": 80,	"total": 20}, 
						"resolve":				{ "base": 10, "max": 80,	"total": 10}, 
						"reason":					{ "base": 0, 	"max": 80,	"total": 0 }, 
						"scavenge":				{ "base": 0, 	"max": 80,	"total": 0 }, 
						"stealth":				{ "base": 0, 	"max": 80,	"total": 0 }, 
						"thievery":				{ "base": 0, 	"max": 80,	"total": 0 },
					},
					"action": {
						"free":						{ "base": 1,	"max": 1,		"total": 1 },
						"reaction":				{ "base": 1,	"max": 1,		"total": 1 },
						"standard":				{ "base": 1,	"max": 1,		"total": 1 },
					},
					"combat": {
						"attack": 				{ "base": 0, 	"max": 0,		"total": 0 },
						"parry":					{ "base": 0, 	"max": 0,		"total": 0 },
						"initiative":			{ "base": 0, 	"max": 0,		"total": 0 },
						"damage": 				{ "base": 0, 	"max": 0,		"total": 0 },
						"dealt": 					{ "base": 0, 	"max": 0,		"total": 0 },
					},
					"traversal": {
						"break":					{ "base": 0,	"max": 0,		"total": 0 },
						"disarm":					{ "base": 0,	"max": 0,		"total": 0 },
						"lockpick": 			{ "base": 0,	"max": 20,	"total": 0 },
						"inventory":			{ "base": 0,	"max": 20,	"total": 0 },
					},
					"camp": {
						"hidden": 				{ "base": 0, 	"max": 20,	"total": 0 },
					}
				},
				"modifiers": {
				},
				"enums": {
					"defense": {
						"armor":			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
						"affinity":		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
						"reduction":	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
					},
					"offense": {
						"imbued":			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
					},
					"status": {
						"effects": 		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
					},
				},
				"+checks": {},
				"light_source": "equipped.off_hand",
				"equipped": { 
					"main_hand":	null,
					"off_hand":		null,
					"belt": 			null,
					"belt_lamp":	null,
					"helmet":			null,
					"torso":			null,
					"vambrace":		null,
					"greave":			null,
					"gloves":			null,
					"boots":			null,
					"amulet":			null,
					"ring_l":			null,
					"ring_r":			null,
					"backpack":		null,
					"pouch_1":		null,
					"pouch_2":		null,
					"pouch_3":		null,
				},
				"inventory": {
					"supplies": { "gold": 0, "jewelry": 0, "bandage": 0, "cooking": 0, "crafting": 0, "crystal": 0, "lockpick": 0, "oil": 0, "ration": 0, "ritual": 0, },
					"items": 		[],
				},
				"actions": {
					"combat": {
						"standard": 	{},
						"free": 			{},
						"reactions": 	{},
					},
					"traversal": {
						"standard": {}
					},
					"camp": {
						"standard": {}
					},
				},
			},

			"combat": {
				"enemy_idx": 0,
				"enemy_party": [],
				"party_order": ["character_party", "enemy_party"],
			},

			"session": 	{	},
		},
		"encounters": {
			"enemy": {
				"skeletal_horror": {
					"type": 				"enemy",
					"name": 				"skeletal_horror",
					"biography":		{
						"tribe":				"undead",
						"body": 				{ "type": "humanoid", "weak_spot": "head" },
						"levels":				{ "base": 1,	"max": 3,"total": 1 },
						"number": 			2,
						"adaptations":	{},
						"loot_table":		"tables.spoils",
						"distribution": ["cursed_slash", "cursed_slash", "ethereal_grasp", "ethereal_grasp", "haunting_wail", "vengeful_onslaught"],
					},
					"stats.base.health": 					{ "base": 3,	"max": 3,		"total": 3	},
					"stats.weapon.blade": 				{ "base": 30,	"max": 80,	"total": 30 },
					"stats.skill.magic_resist": 	{ "base": 20,	"max": 80,	"total": 20	},
					"stats.skill.perception":			{ "base": 20, "max": 80,	"total": 20	},
					"stats.skill.endurance":			{ "base": 20, "max": 80,	"total": 20 }, 
					"stats.skill.resolve":				{ "base": 20, "max": 80,	"total": 20 },
					"stats.skill.acrobatics":			{ "base": 25, "max": 80,	"total": 25 }, 
					"stats.skill.athletics":			{ "base": 25, "max": 80,	"total": 25 },
					"enums.defense.armor":				[0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0],
					"enums.defense.affinity":			[1,1,1,1,0,1,0,1,1,2,1,-1,1,0,1,1,1],
					"actions.combat.standard": 		["cursed_slash", "ethereal_grasp", "haunting_wail", "vengeful_onslaught"],
				},
			},
			"overseer": {

			},
		},
		"emersion_text": {
			"general": {
				"introduction": "When __0__ first awakens among rotting corpses, confused and in pain, they have nothing but some rags on, and the knowledge they accumulated all those years spent on the surface. Underverse is an unforgivable place, and they'll need to find their footing quickly if they want to survive."
			}
		},
	},
})


