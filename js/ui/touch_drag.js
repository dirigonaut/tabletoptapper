touch_drag = function(_element) {
	const STATES = { "Idle": 0, "Drag": 1 };
	let scope = {
		"state": STATES.Idle,
		"element": _element,
		"target": null,
		"data": null,
	};

	let dispatch = function(_target, _event, _payload=null) {
		if(_target != null) {
			_target.dispatchEvent(
				new CustomEvent(_event, { bubbles: true, detail: _payload }));
		};
	};

	let drop = function(_event) {
		if (this.state != STATES.Drag) { return };
		this.state = STATES.Idle;

		dispatch(this.target, "drop", this);
		this.element.style.position = "";
		this.element.style.left = "";
		this.element.style.top = "";

	}.bind(scope);
		
	let drag = function(_event) {
		if (this.state != STATES.Drag) { return };
		let coordinates = null;

		if (_event instanceof TouchEvent) {
    	coordinates = _event.touches[0];
		} else if  (_event instanceof MouseEvent) {
			coordinates = { "clientX": _event.clientX, "clientY": _event.clientY };
		} else {
			return
		}

    this.element.style.position = "absolute";
    this.element.style.left = `${coordinates.clientX}px`;
    this.element.style.top = `${coordinates.clientY}px`;

    this.target = document.elementFromPoint(coordinates.clientX, coordinates.clientY);
	}.bind(scope);

	let start = function(_event) {
		if (this.state != STATES.Idle) { return };

		this.state = STATES.Drag;
		this.target = null;

		dispatch(this.element, "dragstart", this);
	}.bind(scope);

	_element.addEventListener("touchstart", start);
	_element.addEventListener("touchmove", drag);
	_element.addEventListener("touchend", drop);
};