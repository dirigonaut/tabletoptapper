const game_loop = Object({
	actions: ["action"],

	action: "start",
	state: State.None,

	event_handler: function(_action, _args, _resolve, _reject) {
		logger.func("game_loop", "game_loop.event_handler", arguments);

		switch(_action) {
			case("action"):
				if (rule_data.get(_args[0]) == undefined) {	throw new Error(`There is no rule set for action: ${_args[0]}`) }
				this.action = _args[0];
				return (_resolve) ? _resolve(this.action) : this.action;
			default:
				_reject(new Error(`game_loop.${_action} is not a valid command`));
		}
	},

	run: async function() {
		if (this.state == State.Waiting) {
			logger.log("game_loop", "The game loop has already been started.");
			logger.log("game_loop", "stack.processes", stack.processes, true);
			return;
		}

		let process = stack.get_process();
		let rule = (process != null) ? process.get_rule() : null;
		this.state = State.Waiting;

		while (rule && this.state) {
			await Promise.resolve(rule.next())
			.catch(function(_rejected) {
				if (_rejected instanceof Error) {
					this.state = State.Failed;
					logger.error("game_loop", _rejected);
					return
				}

				logger.log("game_loop", `game_loop has been interrupted to run action: ${_rejected}.`);
				return new Promise(function (_resolve, _reject) {
					publisher.publish("stack", ["process", [stack.get_process().right_idx], _resolve, _reject]);
				})
				.then(new Promise(function (_resolve, _reject) {
					publisher.publish("stack", ["inject", _rejected, _resolve, _reject]);
				}))
				.catch(function() { 
					this.state = State.Failed;
					logger.error("game_loop", arguments);
				}.bind(this));

			}.bind(this))
			.finally(
				new Promise(function(_resolve, _reject) {
					publisher.publish("game_loop.processed", [_resolve, _reject]);
				})
				.catch(function(_rejected) {
					this.state = State.Failed;
					logger.error("game_loop", arguments);
				}.bind(this))
			);

			process = stack.get_process();
			rule = (process != null) ? process.get_rule() : null;
		}

		this.state = (this.state == State.Waiting) ? State.Finished : this.state;
		if (this.state == State.Finished) {
			await profile.save_data();
			this.state = State.None;

			publisher.publish("game_loop.finished");
			logger.log("game_loop", `game_loop has finished all actions, restarting with action: ${this.action}.`);

			await new Promise(function (_resolve, _reject) {
				publisher.publish("stack", ["process", [-Math.min(stack.processes.length, 1)], _resolve, _reject]);
			})
			.then(new Promise(function (_resolve, _reject) {
				publisher.publish("stack", ["inject", [this.action], _resolve, _reject]);
			}.bind(this)))
			.catch(function() { 
				this.state = State.Failed;
				logger.error("game_loop", arguments);
			}.bind(this))
		}
	},
});