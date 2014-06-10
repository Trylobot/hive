"use strict";

var _ = require("lodash");
_(global).extend(require("./util"));

/* 
piece.js
this module is used to represent a single hive piece.
	in real life, these are the actual hexagonal playing pieces, 
	labelled with hive bug pictures.
*/

// data

var colors_enum = [
	"White",
	"Black"
];

var types_enum = [
	"Queen Bee",
	"Beetle",
	"Grasshopper",
	"Spider",
	"Soldier Ant",
	"Mosquito",
	"Ladybug",
	"Pillbug"
];

// functions

function create( color, type ) {
	var piece = {
		color: color,
		type: type
	}
	return piece;
}

// exports

exports.types_enum = types_enum;
exports.colors_enum = colors_enum;

exports.create = create;

