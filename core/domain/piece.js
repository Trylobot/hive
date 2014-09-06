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
	if( !_.contains( colors_enum, color ))
		throw "Invalid hive piece color: " + color;
	if( !_.contains( types_enum, type ))
		throw "Invalid hive piece type: " + type;
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

function encode( piece ) {
	return piece.color + "," + piece.type;
}

function decode( piece_key ) {
	var parts = piece_key.split( "," );
	if( parts.length != 2 )
		throw "Invalid encoded piece: " + piece_key;
	return create( parts[0], parts[1] );
}

function force_encoded_string( piece_var ) {
	if( typeof piece_var === "object" )
		return encode( piece_var );
	else if( typeof piece_var === "string" )
		return piece_var;
}

function force_decoded_object( piece_var ) {
	if( typeof piece_var === "object" )
		return piece_var;
	else if( typeof piece_var === "string" )
		return decode( piece_var );
}

// exports

exports.colors_enum = colors_enum;
exports.types_enum = types_enum;

exports.create = create;
exports.opposite_color = opposite_color;
exports.encode = encode;
exports.decode = decode;
exports.force_encoded_string = force_encoded_string;
exports.force_decoded_object = force_decoded_object;

