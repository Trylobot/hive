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
	"Movement",
	"Special Ability",
	"Forfeit"
];

// functions

function create_placement( piece_type, destination ) {
	var turn = {
		turn_type: "Placement",
		piece_type: piece_type,
		destination: Position.force_encoded_string( destination )
	};
	return turn;
}

function create_movement( source, destination ) {
	var turn = {
		turn_type: "Movement",
		source: Position.force_encoded_string( source ),
		destination: Position.force_encoded_string( destination )
	};
	return turn;
}

function create_special_ability( ability_user, source, destination ) {
	var turn = {
		turn_type: "Special Ability",
		ability_user: Position.force_encoded_string( ability_user ),
		source: Position.force_encoded_string( source ),
		destination: Position.force_encoded_string( destination )
	};
	return turn;
}

function create_forfeit() {
	var turn = {
		turn_type: "Forfeit"
	};
	return turn;
}

// exports

exports.create_placement = create_placement;
exports.create_movement = create_movement;
exports.create_special_ability = create_special_ability;
exports.create_forfeit = create_forfeit;

