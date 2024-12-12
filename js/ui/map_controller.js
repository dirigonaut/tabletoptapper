const map_controller = Object({
	area_lookup: {
		"1,0,0,0": ["end",	"rot-270"],
		"0,1,0,0": ["end",	"rot-180"],
		"0,0,1,0": ["end",	"rot-90"],
		"0,0,0,1": ["end",	"rot-0"],
		"1,0,1,0": ["bar",	"rot-90"],
		"0,1,0,1": ["bar",	"rot-0"],
		"1,1,0,0": ["turn", "rot-180"],
		"1,0,0,1": ["turn", "rot-270"],
		"0,1,1,0": ["turn", "rot-90"],
		"0,0,1,1": ["turn", "rot-0"],
		"1,1,1,0": ["tee",	"rot-90"],
		"1,1,0,1": ["tee",	"rot-180"],
		"0,1,1,1": ["tee",	"rot-0"],
		"1,0,1,1": ["tee",	"rot-270"],
		"1,1,1,1": ["plus", "rot-0"],
	},

	refresh: function() {
		let doors = document.getElementById("doors")
		Array.from(doors.getElementsByClassName("trapped-icon")).forEach(ele => ele.className = ele.className.replace("trapped-icon", ""));
		Array.from(doors.getElementsByClassName("locked-icon")).forEach(ele => ele.className = ele.className.replace("locked-icon", ""));
		this.update();
	},

	event_handler: function(_data_set, _path, _delta) {
		//logger.func("map_controller", "map_controller.event_handler", arguments);

		if (_data_set != "save_d") { return };
		if (_path.includes(".map")) {
			this.update();
		} else if (_path.includes(".party_coord")) {
			let doors = document.getElementById("doors")
			Array.from(doors.getElementsByClassName("trapped-icon")).forEach(ele => ele.className = ele.className.replace("trapped-icon", ""));
			Array.from(doors.getElementsByClassName("locked-icon")).forEach(ele => ele.className = ele.className.replace("locked-icon", ""));

			this.update();
		}
	},

	_rendered_range: function(_axis, _max) {
		let rendered = [0,0];
		rendered[0] = _axis - 2;
		rendered[1] = _axis + 2;
	
		let delta = [0,0]
		delta[0] = Math.max(rendered[0], 0) 	 - rendered[0];
		delta[1] = Math.min(rendered[1], _max) - rendered[1];

		rendered[0] = Math.max(rendered[0] - Math.abs(delta[1]), 0);
		rendered[1] = Math.min(rendered[1] + Math.abs(delta[0]), _max)

		return rendered;
	},

	update: function() {
		if (save_data.data.domains[save_data.data.domain_idx] == undefined) { return; }
		
		let coord = save_data.data.domains[save_data.data.domain_idx].party_coord
		let map = save_data.data.domains[save_data.data.domain_idx].map

		if (coord == null || coord == undefined) { return; }
		if (map == null || map == undefined) { return; }

		let areas = document.getElementById("areas");
		let doors = document.getElementById("doors").getElementsByClassName("cell-mini")

		let rendered_y = this._rendered_range(coord[1], map.length - 1);
		let rendered_x = this._rendered_range(coord[0], map.length - 1);

		for(let y=rendered_y[0]; y <= rendered_y[1]; ++y) {
			for(let x=rendered_x[0]; x <= rendered_x[1]; ++x) {
				let r_idx = ((y - rendered_y[0]) * 5) + (x - rendered_x[0]);
				let area_ele = areas.getElementsByClassName("cell")[r_idx];
				if (area_ele == null) { continue; }

				let area_data = map[y][x];
				let is_current = (coord[0] == x) && (coord[1] == y)

				if (area_data == null) {
					while(area_ele.firstChild) { area_ele.removeChild(area_ele.firstChild); };
					continue;
					
				} else {
					while(area_ele.firstChild) { area_ele.removeChild(area_ele.firstChild); };
					
					let tile = this.get_area_icon(area_data.type, Vector.clamp(area_data.doors, 0, 1), is_current);
					if (tile) { 
						area_ele.appendChild(tile); 
					
						let icon = this.get_contain_icon(area_data.flags, tile);
						if (icon) { tile.appendChild(icon); }

						//Handle doors
						let delta = Vector.transform(coord, "-", coord);
						delta = Vector.transform(delta, "*", [2, 18]);
		
						let d_idx = [(x - rendered_x[0]), (y - rendered_y[0])];
						d_idx = Vector.transform(d_idx, "*", [2, 18]);
						d_idx = Vector.transform(d_idx, "+", delta);
						d_idx = d_idx[0] + d_idx[1];
		
						if (d_idx < doors.length) {
							this.update_doors(d_idx, doors, area_data.doors);
						}
					}
				}

				if (is_current && (area_ele.firstChild == null)) {
					if (!area_ele.className.includes("current")) {
						area_ele.className += "current";
					}
				} else {
					area_ele.className = area_ele.className.replace("current", "");
				}
			}
		}
	},

	update_doors: function(_d_idx, _doors, _data) {
		let row_id = parseInt(_doors[_d_idx].className.split(" ")[0].split("-")[1]);
		let filters = [`row-${row_id - 1}`, `row-${row_id}`, `row-${row_id + 1}`, `row-${row_id}`];
		let r_doors = [_doors[_d_idx - 9], _doors[_d_idx - 1], _doors[_d_idx + 9], _doors[_d_idx + 1]];

		for (let idx = 0; idx < r_doors.length; ++idx) {
			r_doors[idx] = (r_doors[idx] && r_doors[idx].className.indexOf(filters[idx]) > -1) ? r_doors[idx] : undefined
		}

		for(let idx = 0; idx < r_doors.length; ++idx) {
			if (r_doors[idx] != null) {
				if (_data != null && _data[idx]) {
					r_doors[idx].className += this.get_door_icon(_data[idx], r_doors[idx].className);
				}
			}
		}
	},

	get_area_icon: function(_area_type, _doors, _is_current=false) {
		if (_doors.toString() != "0,0,0,0") {
			let area_icon_css = this.area_lookup[_doors.toString()];
			let div = document.createElement("div")
			div.className = `${_area_type}-${area_icon_css[0]}-fill-icon ${area_icon_css[1]} ${(_is_current) ? "current" : ""}`;
			return div;
		}
	},

	get_door_icon: function(_door, _css) {
		let door_css = ""
		if (!(_door & 8)) {
			if (_door & 1) {
				//door_css += "door-icon ";
				door_css += ((_door & 2) && !_css.includes("locked-icon")) ? " locked-icon " : "";
				door_css += ((_door & 4) && !_css.includes("trapped-icon")) ? " trapped-icon " : "";
			}
		}

		return door_css;
	},

	area_flags: {"is_event": 1, "is_encounter": 2, "is_exit_up": 4, "is_exit_down": 8, "is_layer": 16, "is_scavenge": 32, "is_trader": 64, "is_items": 128 },
	get_contain_icon: function(_flags, _parent) {
		let icon_css = null;

		if (_flags & this.area_flags.is_layer) {
			icon_css = "boss-icon"
		} else if (_flags & this.area_flags.is_encounter) {
			icon_css = "encounter-icon"
		} else if (_flags & this.area_flags.is_event) {
			icon_css = "event-icon"
		} else if (_flags & this.area_flags.is_exit_up) {
			icon_css = "stairs-up-icon"
		} else if (_flags & this.area_flags.is_exit_down) {
			icon_css = "stairs-down-icon"
		}

		if (icon_css) {
			let rotation_css = _parent.className.split(" ")[1];
			let degrees = (360 - parseInt(rotation_css.split("-")[1])) % 360;

			let div = document.createElement("div");
			div.className = `${icon_css} rot-${degrees}`;
			return div;
		}
	},
});