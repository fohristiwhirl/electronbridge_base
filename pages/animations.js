"use strict";

// The animators here use absolute "real world" grid coordinates
// as their internal that.x and that.y coordinates. We can convert
// these to screen coordinates based on renderer.camerax and .cameray.

const canvas = document.getElementById("canvas");
const virtue = canvas.getContext("2d");

const in_canvas = (x, y) => {
	if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
		return false;
	}
	return true;
};

const NULL_ANIMATOR = {		// This is sort of a reference object.
	x: 0,
	y: 0,
	finished: true,
	step: () => null,
};

exports.make_shot = (opts, renderer) => {

	if (opts.x1 === opts.x2 && opts.y1 === opts.y2) {
		return NULL_ANIMATOR;
	}

	let frame = 0;

	if (opts.duration <= 0) {
		opts.duration = 1;
	}

	let frame_dx = (opts.x2 - opts.x1) / opts.duration;
	let frame_dy = (opts.y2 - opts.y1) / opts.duration;

	let that = Object.create(null);
	that.x = opts.x1 + frame_dx / 2;
	that.y = opts.y1 + frame_dy / 2;
	that.finished = false;

	that.step = () => {

		frame++;

		if (frame > opts.duration) {
			that.finished = true;
			return;
		}

		let next_x = that.x + frame_dx;
		let next_y = that.y + frame_dy;

		let [x1p, y1p] = renderer.pixel_xy_from_grid(that.x, that.y);
		let [x2p, y2p] = renderer.pixel_xy_from_grid(next_x, next_y);

		if (in_canvas(x1p, y1p) && in_canvas(x2p, y2p)) {
			virtue.strokeStyle = opts.colour;
			virtue.beginPath();
			virtue.moveTo(x1p, y1p);
			virtue.lineTo(x2p, y2p);
			virtue.stroke();
		}

		that.x = next_x;
		that.y = next_y;
	};

	return that;
};

exports.make_flash = (opts, renderer) => {

	const duration = 20;
	const max_opacity = 0.5;

	let r = opts.r;
	let g = opts.g;
	let b = opts.b;

	let frame = 0;

	let that = Object.create(null);
	that.x = opts.x;
	that.y = opts.y;
	that.finished = false;

	that.step = () => {

		frame++;

		if (frame > duration) {
			that.finished = true;
			return;
		}

		let [x, y] = renderer.pixel_xy_from_grid(that.x, that.y);

		if (in_canvas(x, y)) {
			let a = ((duration - frame) / duration) * max_opacity;
			virtue.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
			virtue.fillRect(x - renderer.true_boxwidth / 2, y - renderer.true_boxheight / 2, renderer.true_boxwidth, renderer.true_boxheight);
		}
	};

	return that;
};