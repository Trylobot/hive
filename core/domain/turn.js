"use strict";

var _ = require("lodash");
_(global).extend(require("./util"));
var Position = require("./position");

/*
turn.js
represents a hive turn (movement, placement)
*/

// data

var turn_types_enum = [
	"Placement",
	"Movement"
];

// functions

function create_placement( piece_type, destination ) {
	var turn = {
		turn_type: "Placement",
		piece_type: piece_type,
		destination: destination.encode()
	}
	return turn;
}

function create_movement( source, destination ) {
	var turn = {
		turn_type: "Movement",
		source: source.encode(),
		destination: destination.encode()
	}
	return turn;
}

// exports

exports.create_placement = create_placement;
exports.create_movement = create_movement;
