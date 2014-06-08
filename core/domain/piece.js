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

var colors_list = [
	"White",
	"Black"
];
var colors_map = invert_list( colors_list );

var types_list = [
	"Queen Bee",
	"Beetle",
	"Grasshopper",
	"Spider",
	"Soldier Ant",
	"Mosquito",
	"Ladybug",
	"Pillbug"
];
var types_map = invert_list( types_list );

// functions

function create( color, type ) {
	var piece = {
		color: colors_map[color],
		type: types_map[type]
	}
	return piece;
}

function type_name( type_id ) {
	return types_list[type_id];
}

function type_id( type_name ) {
	return types_map[type_name];
}

function color_name( color_id ) {
	return colors_list[color_id];
}

function color_id( color_name ) {
	return colors_map[color_name];
}

// exports

exports.types_list = types_list;
exports.types_map = types_map;
exports.colors_list = colors_list;
exports.colors_map = colors_map;

exports.create = create;
exports.type_name = type_name;
exports.type_id = type_id;
exports.color_name = color_name;
exports.color_id = color_id;

