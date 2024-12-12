const input = Object({
	actions: ["notify", "confirm", "choice", "log", "modal"],

	event_handler: function(_action, _args, _resolve, _reject) {
		logger.func("input", "input.event_handler", arguments);
		let result = null;

		switch(_action) {
			case("notify"):
				result = [this.notify(_resolve, ..._args)];
				break;
			case("confirm"):
				result = [this.confirm(_resolve, _reject, ..._args)];
				break;
			case("choice"):
				result = [this.choice(_resolve, _reject, ..._args)];
				break;
			case("log"):
				result = [this.log(..._args), _resolve, _reject];
				break;
			case("modal"):
				result = [this.modal(_resolve, _reject, _args)]
				break;
			default:
				return _reject(new Error(`input.${_action} is not a valid command`));
		}

		if (result) {
			publisher.publish("html", result);
		}
	},

	notify: function(_resolve, _log_text, _btn_text_1="Next") {
		return [
			["session_log", "log", {"data": _log_text}],
			["button_group", "button", { "id": "resolve", "data": _btn_text_1, "click": () => _resolve(true) }],
		];
	},

	confirm: function() {
		let args =  Array(...arguments);
		let resolve = args.shift();
		let reject	= args.shift();

		return [
			["session_log", "log", {"data": args[0]}],
			["button_group", "button", { "id": "resolve", 	"data": args[1][0], "click": () => resolve(args[1].slice(1)) }],
			["button_group", "button", { "id": "reject_to", "data": args[2][0], "click": () => open_modal("modal_roll", null, reject, args[2].slice())}],
			["button_group", "button", { "id": "reject", 		"data": args[3][0], "click": () => reject([args[3][1], [args[3][2]]])}]
		];
	},

	choice: function() {
		let args 			=  Array(...arguments);
		let resolve 	= args.shift();
		let reject		= args.shift();
		let message		= args.shift();
		let options 	= args.shift();
		let disabled 	= (args[0]) ? args.shift() : [];

		let element_data = [
			["session_log", "log", { "data": `${message}` }]
		]

		options = (typeof options == "object" && !Array.isArray(options) && options) ? Object.entries(options) : options;
		for (let idx = 0; idx < options.length; ++idx) {
			let choice = !Array.isArray(options[idx]) ? [options[idx]] : options[idx];

			element_data.push([
				"button_group", 
				"button", 
				{
					"id": `option_${idx}`, 
					"data": `${choice[0]}`,
					"disabled": (disabled.indexOf(choice[0]) > -1),
					"click": () => resolve({"idx": idx, "name": choice[0], "data": choice.at(-1)})
				}
			]);
		}

		return element_data;
	},

	modal: function(_resolve, _reject, _args) {
		let template = `modal_${_args.shift()}`;
		open_modal(template, _resolve, _reject, _args)

		return [
			["button_group", "button", { "id": "option_0", "data": _args[0], "click": () => open_modal(template, _resolve, _reject, _args)}],
		]
	},

	log: function(_log_text) {
		return [
			["session_log", "log", {"data": _log_text}],
		];
	},
});