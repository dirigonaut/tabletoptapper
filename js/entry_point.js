publisher.subscribe(new EventTarget(), "ops",				publisher.pass_through(ops));
publisher.subscribe(new EventTarget(), "stack",			publisher.pass_through(stack));
publisher.subscribe(new EventTarget(), "io", 				publisher.pass_through(io));
publisher.subscribe(new EventTarget(), "heap", 			publisher.pass_through(heap));
publisher.subscribe(new EventTarget(), "input",			publisher.pass_through(input));
publisher.subscribe(new EventTarget(), "html", 			publisher.pass_through(html_factory));
publisher.subscribe(new EventTarget(), "publisher", publisher.pass_through(publisher));
publisher.subscribe(new EventTarget(), "game_loop", publisher.pass_through(game_loop));

publisher.subscribe(new EventTarget(), "state", 		publisher.pass_through(heap, "on_state"));
publisher.subscribe(new EventTarget(), "state", 		publisher.pass_through(map_controller));
publisher.subscribe(new EventTarget(), "state", 		publisher.pass_through(profile.on_state.bind(profile)));

publisher.subscribe(new EventTarget(), "profile", 	publisher.pass_through(io, "refresh_data_set"));
publisher.subscribe(new EventTarget(), "profile", 	publisher.pass_through(map_controller, "refresh"));

publisher.subscribe(new EventTarget(), "game_loop.finished", 	heap.purge.bind(heap));

profile.register("save_data", save_data.get.bind(save_data), save_data.set.bind(save_data));
profile.register("heap", 			heap.get.bind(heap), heap.set.bind(heap));
profile.register("publisher", publisher.get.bind(publisher), publisher.set.bind(publisher));

ops.actions.reduce((acc, entry) 			=> 	{acc[`${entry}`] = "ops"; 				return acc}, Action_Targets);
stack.actions.reduce((acc, entry) 		=> 	{acc[`${entry}`] = "stack"; 			return acc}, Action_Targets);
io.actions.reduce((acc, entry) 				=> 	{acc[`${entry}`] = "io"; 					return acc}, Action_Targets);
heap.actions.reduce((acc, entry) 			=> 	{acc[`${entry}`] = "heap"; 				return acc}, Action_Targets);
input.actions.reduce((acc, entry) 		=> 	{acc[`${entry}`] = "input"; 			return acc}, Action_Targets);
game_loop.actions.reduce((acc, entry)	=> 	{acc[`${entry}`] = "game_loop"; 	return acc}, Action_Targets);
publisher.actions.reduce((acc, entry)	=> 	{acc[`${entry}`] = "publisher"; 	return acc}, Action_Targets);

let entry_point = async function(e) {
	if (profile.name != null) {
		while(game_loop.state == State.None) {
			await game_loop.run();
		}
	} else {
		open_sidebar('sidebar_load');
	}
};
document.getElementById("start").addEventListener("click", entry_point);
