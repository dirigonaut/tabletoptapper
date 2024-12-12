class Process {
	parent_idx = undefined;
	right_idx  = undefined;

	state = State.None;
	rules = undefined;
	at_rule = undefined;

	constructor(parent_idx, right_idx) {
		this.parent_idx  = (parent_idx != null) ? parent_idx : -1;
		this.right_idx   = right_idx;

		this.rules 	= [];
		this.target = new EventTarget();

		publisher.subscribe(this.target, "game_loop.processed", publisher.pass_through(this.on_processed()));
	};

	on_processed = function() {
		return function(_resolve, _reject) {
			if (this.state == State.Waiting) {
				this.state = State.None;
				_resolve(true);

				if ([State.Failed, State.Skipped, State.Finished].includes(this.at_rule.state)) {
					if (this.at_rule.state == State.Failed) {
						this.state = State.Failed;
					}

					this.remove();
				}

				if (this.rules.length == 0) {
					this.state = State.Finished;
				}
			}
		}.bind(this);
	};

	get_rule = function(_at=0) {
		if (this.state == State.None) {
			this.at_rule = (this.rules.length > _at) ? this.rules[_at] : null;
			this.state = (this.at_rule != null) ? State.Waiting : State.Finished;
		}

		return this.at_rule;
	};

	cancel = function() {
		this.state = State.Skipped;
	};

	insert = function(_rule, _at=0) {
		this.rules.splice(_at, 0, _rule);
	};

	remove = function(_at=0) {
		if (this.rules[_at].state == State.Waiting) {
			this.rules[_at].return();
		}

		this.rules.splice(_at, 1);
	};

	destructor = function() {
		publisher.unsubscribe(this.target, "game_loop.processed");
	};
}