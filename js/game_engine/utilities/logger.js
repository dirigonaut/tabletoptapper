const Level_Enum = Object.freeze({ "Error": 0, "Warn": 1, "Log": 2, "Func": 3, "Debug": 4 });
const Levels = Object.freeze(["Error", "Warn", "Log", "Log", "Debug"]);
const logger = Object({
	enabled: true,
	filters: {
		context: [],
		level: Level_Enum.Debug,
	},

	_main: function(_level, _caller, _text, _args, _pretty, _template_id) {
		if (this.enabled) {
			let args = [];

			if (_args) {
				if (typeof _args == "object") {
					for(let arg of _args){
						if(typeof arg == "object") {
							args.push((_pretty) ? JSON.stringify(arg,null,2) : JSON.stringify(arg));
						} else if (typeof arg == "function") {
							args.push(`${arg.name}()`);
						} else {
							args.push(arg);
						}
					}
				} else {
					args = [_args];
				}
			}

			let passed_filter = (
				(this.filters.context.length == 0 || 
					this.filters.context.includes(_caller)) &&
					(this.filters.level >= _level)
			)

			if (passed_filter) {
				let method = console[(Levels[_level]).toLowerCase()];
				switch(_template_id) {
					case("func"):
						method(`${_text}(${args})`);
						break;
					default:
						method((args) ? `${_text}: ${args}` : `${_text}`);
				}
			}
		}
	},

	error:	function(_caller, _text, _args=null, _pretty=false, _template_id="default") { this._main(Level_Enum.Error,	_caller, _text, _args, _pretty, _template_id) },
	warn: 	function(_caller, _text, _args=null, _pretty=false, _template_id="default") { this._main(Level_Enum.Warn,	_caller, _text, _args, _pretty, _template_id) },
	func: 	function(_caller, _text, _args=null, _pretty=false, _template_id="func") 	 { this._main(Level_Enum.Func, 	_caller, _text, _args, _pretty, _template_id) },
	log: 	function(_caller, _text, _args=null, _pretty=false, _template_id="default") { this._main(Level_Enum.Log,	_caller, _text, _args, _pretty, _template_id) },
	debug: 	function(_caller, _text, _args=null, _pretty=false, _template_id="default") { this._main(Level_Enum.Debug,	_caller, _text, _args, _pretty, _template_id) },
});