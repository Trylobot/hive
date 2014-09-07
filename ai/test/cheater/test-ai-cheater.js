"use strict";

var Piece = require("../../../core/domain/piece");
var Position = require("../../../core/domain/position");
var Turn = require("../../../core/domain/turn");

// cheater test

var normal_turn_types = [
	"Placement",
	"Movement",
	"Special Ability",
	"Forfeit"
];

function process_message( message ) {
	var response;
	switch( message.request_type ) {
		
		case "Greetings":
			response = {
				response_type: message.request_type,
				response_id: message.request_id
			};
			var package_json = require("./package.json");
			for( var key in package_json )
				response[key] = package_json[key];
			break;
		
		case "Choose Turn":
			response = {
				response_type: message.request_type,
				response_id: message.request_id,
				game_id: message.game_id,
				turn_type: random_array_item( normal_turn_types ),
				piece_type: random_array_item( Piece.types_enum ),
				ability_user: Position.create( random_int( -10, 10 ), random_int( -10, 10 )).encode(),
				source: Position.create( random_int( -10, 10 ), random_int( -10, 10 )).encode(),
				destination: Position.create( random_int( -10, 10 ), random_int( -10, 10 )).encode()
			};
			break;
	}
	return response;
}

function random_array_item( array ) {
	return array[ random_int( 0, array.length - 1 )];
}

function random_int( min, max ) {
	return Math.floor( Math.random() * (max - min + 1) ) + min;
}

// exports

exports.process_message = process_message;

