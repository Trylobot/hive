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
	position.copy = function() {
		return create( position.row, position.col );
	}
	position.encode = function() {
		return encode( position );
	}
	position.translation = function( direction ) {
		return translation( position, direction );
	}
	// clockwise_increments represents the integer rotation factor, in direction-wise increments
	// clockwise_increments can be positive or negative
	position.rotation_about_position = function( anchor_position, clockwise_increments ) {
		throw "not implemented: position.rotation_about_position";
	}
	position.adjacencies = function() {
		return _.map( directions_enum, function( direction ) {
			return translation( position, direction );
		});
	}
	position.is_equal = function( other ) {
		return other && position.row == other.row && position.col == other.col;
	}
	return position;
}

function copy( position ) {
	return position.copy();
}

function encode( position ) {
	return position.row + "," + position.col;
}

function encode_all( array_of_positions ) {
	return _.map( array_of_positions, function( position ) {
		return position.encode();
	});
}

function decode( position_key ) {
	var parts = position_key.split( "," );
	if( parts.length != 2 )
		throw "Invalid encoded position: " + position_key;
	return create( parseInt( parts[0] ), parseInt( parts[1] ));
}

function decode_all( array_of_position_keys ) {
	return _.map( array_of_position_keys, function( position_key ) {
		return decode( position_key );
	});
}

function is_equal( position0, position1 ) {
	return position0 && position1 && position0.row == position1.row && position0.col == position1.col;
}

function translation( position, direction ) {
	switch( direction ) {
		case "12 o'clock": return create( position.row - 2, position.col     ); break;
		case "2 o'clock":  return create( position.row - 1, position.col + 1 ); break;
		case "4 o'clock":  return create( position.row + 1, position.col + 1 ); break;
		case "6 o'clock":  return create( position.row + 2, position.col     ); break;
		case "8 o'clock":  return create( position.row + 1, position.col - 1 ); break;
		case "10 o'clock": return create( position.row - 1, position.col - 1 ); break;
		default:           throw "unrecognized direction " + direction; break;
	}
}

function rotation( direction, clockwise ) {
	switch( direction ) {
		case "12 o'clock": return clockwise ?  "2 o'clock" : "10 o'clock"; break;
		case "2 o'clock":  return clockwise ?  "4 o'clock" : "12 o'clock"; break;
		case "4 o'clock":  return clockwise ?  "6 o'clock" :  "2 o'clock"; break;
		case "6 o'clock":  return clockwise ?  "8 o'clock" :  "4 o'clock"; break;
		case "8 o'clock":  return clockwise ? "10 o'clock" :  "6 o'clock"; break;
		case "10 o'clock": return clockwise ? "12 o'clock" :  "8 o'clock"; break;
		default:           throw "unrecognized direction " + direction; break;
	}
}

function force_encoded_string( position_var ) {
	if( typeof position_var === "object" )
		return encode( position_var );
	else if( typeof position_var === "string" )
		return position_var;
}

function force_decoded_object( position_var ) {
	if( typeof position_var === "object" )
		return position_var;
	else if( typeof position_var === "string" )
		return decode( position_var );
}



// exports

exports.directions_enum = directions_enum;

exports.create = create;
exports.copy = copy;
exports.encode = encode;
exports.encode_all = encode_all;
exports.decode = decode;
exports.decode_all = decode_all;
exports.is_equal = is_equal;
exports.translation = translation;
exports.rotation = rotation;
exports.force_encoded_string = force_encoded_string;
exports.force_decoded_object = force_decoded_object;

