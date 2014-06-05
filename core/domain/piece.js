/* 
piece.js
this module is used to represent a single hive piece.
	in real life, these are the actual hexagonal playing pieces, 
	labelled with hive bug pictures.
*/

var colors_list = [
	"White",
	"Black"
];

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

var colors_map = {};
for( var i = 0; i < colors_list.length; ++i ) {
	colors_map[colors_list[i]] = i;
}

var types_map = {};
for( var i = 0; i < types_list.length; ++i ) {
	types_map[types_list[i]] = i;
}

exports.types_list = types_list;
exports.types_map = types_map;
exports.colors_list = colors_list;
exports.colors_map = colors_map;

exports.create_piece = function( type, color ) {
	var piece = {
		type: types_map[type],
		color: color_map[color]
	}
	return piece;
}

exports.type_name = function( type_id ) {
	return types_list[type_id];
}

exports.color_name = function( color_id ) {
	return colors_list[color_id];
}

