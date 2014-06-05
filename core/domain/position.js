var _ = require("lodash");
_(global).extend(require("./util"));

/*
position.js
represents a hive board position
*/

// data

var coplanar_directions_list = [
	"-row",     // straight up
	"-row+col", // diagonally up & right
	"+row+col", // diagonally down & right
	"+col",     // straight down
	"+row-col", // diagonally down & left
	"-row-col"  // diagonally up & left
];
var coplanar_directions_map = invert_list( coplanar_directions_list );

var layer_directions_list = [
	"+layer",   // directly above
	"-layer"    // directly below
];
var layer_directions_map = invert_list( layer_directions_list );

// functions

function create_position( row, col, layer ) {
	var position = {
		row: row,
		col: col,
		layer: layer
	}
	position.encode = function() {
		return encode_position( position );
	}
	position.translate = function( direction ) {
		translate_position( position, direction );
	}
}

function encode_position( position ) {
	return position.row + "," + position.col + "," + position.layer;
}

function decode_position( encoded_position ) {
	var parts = encoded_position.split(",");
	return create_position( _.parseInt(parts[0]), _.parseInt(parts[1]),  _.parseInt(parts[2]) );
}

function translate_position( position, direction ) {
	switch( direction ) {
		case "-row":     return create_position( position.row - 2, position.col    , position.layer     ); break;
		case "-row+col": return create_position( position.row - 1, position.col + 1, position.layer     ); break;
		case "+row+col": return create_position( position.row + 1, position.col + 1, position.layer     ); break;
		case "+col":     return create_position( position.row    , position.col + 2, position.layer     ); break;
		case "+row-col": return create_position( position.row + 1, position.col - 1, position.layer     ); break;
		case "-row-col": return create_position( position.row - 1, position.col - 1, position.layer     ); break;
		case "+layer":   return create_position( position.row    , position.col    , position.layer + 1 ); break;
		case "-layer":   return create_position( position.row    , position.col    , position.layer + 1 ); break;
		default:         return create_position( position.row    , position.col    , position.layer     ); break;
	}
}

// exports

exports.coplanar_directions_list = coplanar_directions_list;
exports.coplanar_directions_map = coplanar_directions_map;
exports.layer_directions_list = layer_directions_list;
exports.layer_directions_map = layer_directions_map;

exports.create_position = create_position;
exports.encode_position = encode_position;
exports.decode_position = decode_position;
exports.translate_position = translate_position;

