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

// where row, col, layer are all integer numbers
function create( row, col, layer ) {
	var position = {
		row: row,
		col: col,
		layer: layer
	}
	position.encode = function() {
		return encode( position );
	}
	position.translation = function( direction ) {
		return translation( position, direction );
	}
	return position;
}

function encode( position ) {
	return position.row + "," + position.col + "," + position.layer;
}

function decode( position_key ) {
	var parts = position_key.split(",");
	return create( _.parseInt(parts[0]), _.parseInt(parts[1]),  _.parseInt(parts[2]) );
}

function translation( position, direction ) {
	switch( direction ) {
		case "-row":     return create( position.row - 2, position.col    , position.layer     ); break;
		case "-row+col": return create( position.row - 1, position.col + 1, position.layer     ); break;
		case "+row+col": return create( position.row + 1, position.col + 1, position.layer     ); break;
		case "+col":     return create( position.row    , position.col + 2, position.layer     ); break;
		case "+row-col": return create( position.row + 1, position.col - 1, position.layer     ); break;
		case "-row-col": return create( position.row - 1, position.col - 1, position.layer     ); break;
		case "+layer":   return create( position.row    , position.col    , position.layer + 1 ); break;
		case "-layer":   return create( position.row    , position.col    , position.layer - 1 ); break;
		default:         return create( position.row    , position.col    , position.layer     ); break;
	}
}

// exports

exports.coplanar_directions_list = coplanar_directions_list;
exports.coplanar_directions_map = coplanar_directions_map;
exports.layer_directions_list = layer_directions_list;
exports.layer_directions_map = layer_directions_map;

exports.create = create;
exports.encode = encode;
exports.decode = decode;
exports.translation = translation;

