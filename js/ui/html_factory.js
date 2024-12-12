const html_factory = Object({
	root_elements: {
		"button_group": document.getElementById("button_group"),
		"session_log": document.getElementById("log"),
	},

	get_log: function(_data) {
		return `<div class="left-justify">${_data}</div>`
	},

	get_button: function(_id, _data, _disabled, _css) {
		return `<button id=${_id} type="button" class="button ${_css}" ${(_disabled) ? "disabled" : ""}><p class="center capitalize">${_data}</p></button>`;
	},

	get_button_css: function(_idx, _count) {
		_idx += 1
		if (_count < 4) {
			return (_idx == 1) ? "btn-1" : `btn-${_idx}`;
		} else if (_count < 9) {
			return `btn-${_idx}`; 
		} else {
			return `btn-${_idx}`; 
		}
	},

	set_button_group_css: function(_count) {
		let group = this.root_elements["button_group"];
		group_css = group.className.split("-");

		let grid_css = parseInt(group_css.pop());
		if (grid_css == _count) { return }

		group_css.push(ops.clamp(_count, 0, 9));
		group.className = group_css.join("-");
	},

	event_handler: function(_elements, _resolve=null, _reject=null) {
		logger.func("html_factory", "html_factory.event_handler", arguments);

		let button_idx = 0;
		let button_count = _elements.filter((ele) => ele[0] == "button_group").length;
		
		if (button_count > 0) {
			let button_root = this.root_elements["button_group"];
			while(button_root.firstChild) { button_root.removeChild(button_root.firstChild); };
			this.set_button_group_css(button_count);
		}

		for(let element of _elements) {
			let root_node = this.root_elements[element.shift()];
			let type = element.shift();
			let elem_attrs = element.shift();

			switch (type) {
				case("log"):
					root_node.insertAdjacentHTML('beforeend', this.get_log(elem_attrs.data));
					root_node.scrollTop = root_node.scrollHeight; //Auto scroll
					break;
				case("button"):
					var html = this.get_button(elem_attrs.id, elem_attrs.data, elem_attrs.disabled, this.get_button_css(button_idx, button_count));
					root_node.insertAdjacentHTML('beforeend', html);
					document.getElementById(elem_attrs.id).addEventListener("click", elem_attrs.click)
					button_idx += 1;
					break;
			}
		}

		if (_resolve != null) {
			_resolve(true)
		}
	},

	build: function(_template_id, _root_id, _data) {
    let template = document.getElementById(_template_id);
		if (template == null) { throw new Error(`Could not find the template for id: ${_template_id}`) }
		let root = this.get_and_clear_element(_root_id);

		template = template.innerHTML;
		if (_data instanceof Array) {
			_data.forEach(function (_v, _i, _d) {
				template = template.replace(new RegExp(`##${_i}##`, 'g'), _v);
			});
		} else if(_data instanceof Map) {
			_data.forEach(function (_v, _k, _d) {
				template = template.replace(new RegExp(`##${_k.toUpperCase()}##`, 'g'), _v);
			});
		} else {
			throw new Error(`${_template_id}._data has to be of type Array or Map not ${_data} to be used for templates`);
		}

		root.insertAdjacentHTML('beforeend', template);
	},

	get_and_clear_element: function(_root_id) {
		let root = document.getElementById(_root_id);
		if (root == null)  	{ throw new Error(`Cannot root: ${_root_id} in page.`) }
		while(root.firstChild) { root.removeChild(root.firstChild); };
		return root;
	}
});