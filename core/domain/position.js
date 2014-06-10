"use strict";

var _ = require("lodash");
_(global).extend(require("./util"));

/*
position.js
represents a hive board position
*/

// data

var directions_enum = [
	"12 o'clock",
	"2 o'clock",
	"4 o'clock",
	"6 o'clock",
	"8 o'clock",
	"10 o'clock"
];

// functions

// row: integer
// col: integer
function create( row, col ) {
	var position = {
		row: row,
		col: col
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
	return position.row + "," + position.col;
}

function decode( position_key ) {
	var parts = position_key.split( "," );
	return create( parseInt( parts[0] ), parseInt( parts[1] ));
}

function translation( position, direction ) {
	switch( direction ) {
		case "12 o'clock": return create( position.row - 2, position.col     ); break;
		case "2 o'clock":  return create( position.row - 1, position.col + 1 ); break;
		case "4 o'clock":  return create( position.row + 1, position.col + 1 ); break;
		case "6 o'clock":  return create( position.row + 2, position.col     ); break;
		case "8 o'clock":  return create( position.row + 1, position.col - 1 ); break;
		case "10 o'clock": return create( position.row - 1, position.col - 1 ); break;
		default:           return create( position.row    , position.col     ); break;
	}
}

// exports

exports.directions_enum = directions_enum;

exports.create = create;
exports.encode = encode;
exports.decode = decode;
exports.translation = translation;

