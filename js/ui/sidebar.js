async function open_sidebar() {
	let args =  Array(...arguments);
	let template = args.shift();

	let template_input = document.getElementById("sidebar_template_id");
	template_input.innerHTML = template;
	
	let html_template = `${template}_template`;
	let object_ref = `get_${template}_ref`;

	html_factory.build(html_template, "sidebar_content", args.slice());

	let result = window[object_ref]().initialize(args.slice());
	if (result instanceof Promise) {
		await result;
	}

	document.getElementById("sidebar").style.display = "block";
}

function close_sidebar() {
	document.getElementById("sidebar").style.display = "none";
	html_factory.get_and_clear_element("sidebar_body");
}