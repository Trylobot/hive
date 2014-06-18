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

function opposite_color( color ) {
	switch( color ) {
		case "White": return "Black";
		case "Black": return "White";
	}
}

// exports

exports.colors_enum = colors_enum;
exports.types_enum = types_enum;

exports.create = create;
exports.opposite_color = opposite_color;

