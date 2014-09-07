"use strict";

var Piece = require("../../../core/domain/piece");
var Position = require("../../../core/domain/position");
var Turn = require("../../../core/domain/turn");

// cheater test

var normal_turn_types = _.filter( Turn.turn_types_enum, function( turn_type ) {
	return turn_type != "Error" && turn_type != "Unknown";
});

function process_message( message ) {
	var response = {
		response_type: message.request_type,
		response_id: message.request_id
	};
	switch( message.request_type ) {
		
		case "Greetings":
			var package_json = require("./package.json");
			for( var key in package_json )
				response[key] = package_json[key];
			break;
		
		case "Choose Turn":
			_.extend( response, {
				game_id: message.game_id,
				turn_type: random_array_item( normal_turn_types ),
				piece_type: random_array_item( Piece.types_enum ),
				ability_user: Position.create( random_int( -10, 10 ), random_int( -10, 10 )).encode(),
				source: Position.create( random_int( -10, 10 ), random_int( -10, 10 )).encode(),
				destination: Position.create( random_int( -10, 10 ), random_int( -10, 10 )).encode(),
			});
			switch( response.turn_type ) {
				case "Placement":
					response.piece_type = random_array_item( possible_turns[ response.turn_type ].piece_types );
					response.destination = random_array_item( possible_turns[ response.turn_type ].positions );
					break;
				case "Movement":
					response.source = random_object_key( possible_turns[ response.turn_type ]);
					response.destination = random_array_item( possible_turns[ response.turn_type ][ response.source ]);
					break;
				case "Special Ability":
					response.ability_user = random_object_key( possible_turns[ response.turn_type ]);
					response.source = random_object_key( possible_turns[ response.turn_type ][ response.ability_user ]);
					response.destination = random_array_item( possible_turns[ response.turn_type ][ response.ability_user ][ response.source ]);
					break;
				case "Forfeit":
					break;
			}
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

