open_modal = function() {
  let args =  Array(...arguments);
  let template = args.shift();

  let template_input = document.getElementById("modal_template_id");
  template_input.innerHTML = template;
  
  window[`get_${template}_ref`]().initialize(...args);
  document.getElementById("modal").style.display = "flex";
}

close_modal = function() {
  let template_input = document.getElementById("modal_template_id");
	template_input.innerHTML = "";
  document.getElementById("modal").style.display = "none";
}