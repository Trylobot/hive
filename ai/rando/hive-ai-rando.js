"use strict";

/* 
hive-ai-rando.js
"Rando"
	this is a simple ai that chooses a move at rando[m]
	for api reference look in api/
*/

function process_message( message ) {
	var response;
	switch( message.request_type ) {
		case "GREETINGS":
			response = {
				response_type: message.request_type,
				name: "Rando[m]",
				version: "0.0.1",
				author: "T.W.R. Cole",
				project_url: "https://github.com/Trylobot/hive/tree/master/ai/rando",
				language: "Javascript"
			};
			break;
		case "CHOOSE_TURN":
			response = {
				response_type: message.request_type,
				game_id: message.game_id,
				turn_type: random_object_key( message.possible_turns )
			};
			switch( response.turn_type ) {
				case "Placement":
					response.piece_type = random_array_item( message.possible_turns[ response.turn_type ].piece_types );
					response.destination = random_array_item( message.possible_turns[ response.turn_type ].positions );
					break;
				case "Movement":
					response.source = random_object_key( message.possible_turns[ response.turn_type ]);
					response.destination = random_array_item( message.possible_turns[ response.turn_type ][ response.source ]);
					break;
				case "Special Ability":
					response.ability_user = random_object_key( message.possible_turns[ response.turn_type ]);
					response.source = random_object_key( message.possible_turns[ response.turn_type ][ response.ability_user ]);
					response.destination = random_array_item( message.possible_turns[ response.turn_type ][ response.ability_user ][ response.source ]);
					break;
				case "Forfeit":
					break;
			}
			break;
	}
	return response;
}

function random_object_key( object ) {
	var keys = Object.keys( object );
	return keys[ random_int( 0, keys.length - 1 )];
}

function random_array_item( array ) {
	return array[ random_int( 0, array.length - 1 )];
}

function random_int( min, max ) {
	return Math.floor( Math.random() * (max - min + 1) ) + min;
}


// exports

exports.process_message = process_message;

