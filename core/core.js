"use strict";

// dependencies
//   node (built-in)
var events = require("events");
var net = require("net");
var child_process = require("child_process");
//   3rd-party modules
var _ = require("lodash");
var mersenne_twister = new (require('mersenne').MersenneTwister19937);
//   user-defined modules
_(global).extend(require("./domain/util"));
var Piece = require("./domain/piece");
var Position = require("./domain/position");
var Turn = require("./domain/turn");
var Board = require("./domain/board");
var Rules = require("./domain/rules");
var Game = require("./domain/game");
var Player = require("./domain/player");

/*

core.js
this module manages game instances, and handles communications between players and games.

local AI are completely managed.
  they are stopped and started as needed, as forked child processes

remote AI are not managed at all.
  it is up to the remote AI's owner to start and stop it

*/


// functions

function create( system_version ) {
	var core = {
		game_instances: {},
		events: new events.EventEmitter
	}
	// ---
	core.create_game = function( white_player, black_player, use_mosquito, use_ladybug, use_pillbug ) {
		var game = Game.create( use_mosquito, use_ladybug, use_pillbug );
		return core.register_game( white_player, black_player, game );
	}
	core.load_game = function( white_player, black_player, save_data ) {
		var game = Game.load( save_data.creation_parameters, save_data.turn_history );
		return core.register_game( white_player, black_player, game );
	}
	// ---
	core.register_game = function( white_player, black_player, game ) {
		var game_id = core.generate_game_id();
		var game_instance = {
			game: game,
			game_id: game_id,
			players: {
				"White": white_player,
				"Black": black_player
			}
		};
		core.game_instances[ game_id ] = game_instance;
		return game_id;
	}
	core.lookup_game = function( game_id ) {
		var game_instance = core.game_instances[ game_id ];
		if( !game_instance )
			throw "game_id not found: "+game_id;
		return game_instance;
	}
	core.list_games = function() {
		return _.keys( core.game_instances );
	}
	// ---
	core.start_game = function( game_id ) {
		if( !(game_id in core.game_instances) )
			return; // invalid game_id
		var game_event = {
			game_id: game_id
		};
		// TODO: instruct player objects for this game to start listening for events 
		//   related to this game ID
		// emit an event indicating that the game with the given ID has changed.
		//   event listener would then use core.lookup_game with the given ID
		//   and update her internal model or user interface as appropriate.
		core.events.emit( "game", game_event );
	}
	core.handle_turn_event = function( turn_event ) {
		var game_id = turn_event.game_id;
		var game_instance = core.lookup_game( game_id );
		game_instance.game.perform_turn( turn_event ); // duck-typing
		var game_event = {
			game_id: game_id
		};
		core.events.emit( "game", game_event );
	}
	core.end_game = function( game_id ) {
		// TODO: instruct players associated with game id to stop listening for events
		//   related to that game id.
		// TODO: save game to archive
		//   html + embedded game history as JSON + auto playback + turn navigation
		delete core.game_instances[ game_id ];
	}
	// ---
	core.generate_game_id = function() {
		var id;
		do {
			id = generate_id();
		} while( id in core.game_instances ); // collisions unacceptable
		return id;
	}
	core.generate_request_id = function() {
		return generate_id(); // do not care about collisions, only non-sequentiality
	}
	// ---
	core.prepare_greetings_request_message = function() {
		return {
			request_type: "Greetings",
			request_id: core.generate_request_id(),
			system_version: system_version
		}
	}
	core.prepare_choose_turn_request_message = function( game_id, turn_time_ms ) {
		var game_instance = core.lookup_game( game_id );
		var now = (new Date()).getTime();
		return {
			request_type: "Choose Turn",
			request_id: core.generate_request_id(),
			game_id: game_id,
			request_timestamp: now,
			response_deadline: ((typeof turn_time_ms != "undefined") ? now + turn_time_ms : null),
			game_state: game_instance.game // represents entire game state
		};
	}
	// ---
	core.send_message_to_local_ai = function( message, local_path, callback_fn ) {
		try {
			var local_ai = child_process.fork( __dirname + "/../ai/ai-local-fork.js", [ local_path ]);
			local_ai.on( "message", function( message ) {
				_.defer( callback_fn, message );
				local_ai.kill();
			});
			local_ai.send( message );
		} catch( err ) {
			_.defer( callback_fn, { error: err });
		}
	}
	core.send_message_to_remote_ai = function( message, host, port, callback_fn ) {
		// you can use ../ai/ai-tcp-server.js to simulate/test this
		try {
			var socket = new net.Socket();
			socket.connect( port, host, function() {
				// connected
				socket.on( "data", function( data ) {
					var response_message = JSON.parse( data );
					_.defer( callback_fn, response_message );
				});
				//
				socket.write( JSON.stringify( message ));
			});
		} catch( err ) {
			_.defer( callback_fn, { error: err });
		}
	}
	// ---
	core.parse_response_message_as_turn_object = function( response_message ) {
		var turn;
		switch( response_message.turn_type ) {
			case "Placement":
				turn = Turn.create_placement( 
					response_message.piece_type, 
					response_message.destination );
				break;
			case "Movement":
				turn = Turn.create_movement(
					response_message.source,
					response_message.destination );
				break;
			case "Special Ability":
				turn = Turn.create_special_ability(
					response_message.ability_user,
					response_message.source,
					response_message.destination );
				break;
			case "Forfeit":
				turn = Turn.create_forfeit();
				break;
			case "Error":
				turn = Turn.create_error( 
					response_message.error );
				break;
			case "Unknown":
				turn = Turn.create_unknown();
				break;
		}
		return turn;
	}
	// ---
	core.prepare_turn_response_message = function( turn, game_id ) {
		return _.extend( turn, {
			response_type: "Choose Turn",
			game_id: game_id
		});
	}
	// ---
	core.possible_turns__encode_positions = function( possible_turns_with_decoded_positions ) {
		// TODO: possible_turns should already be using position keys, and this should not be necessary
		return core.possible_turns__Xcode_positions(
			possible_turns_with_decoded_positions, Position.encode_all );
	}
	core.possible_turns__decode_positions = function( possible_turns_with_encoded_positions ) {
		return core.possible_turns__Xcode_positions(
			possible_turns_with_encoded_positions, Position.decode_all );
	}
	core.possible_turns__Xcode_positions = function( possible_turns, position_collection_fn ) {
		if( possible_turns ) {
			possible_turns = _.cloneDeep( possible_turns );
			if( possible_turns["Placement"] ) {
				possible_turns["Placement"].positions = position_collection_fn( possible_turns["Placement"].positions );
			}
			if( possible_turns["Movement"] ) {
				possible_turns["Movement"] = _.mapValues( possible_turns["Movement"], function( destination_position_array, source_position_key ) {
					return position_collection_fn( destination_position_array );
				});
			}
			if( possible_turns["Special Ability"] ) {
				possible_turns["Special Ability"] = _.mapValues( possible_turns["Special Ability"], function( movement_map, ability_user_position_key ) {
					return _.mapValues( movement_map, function( destination_position_array, source_position_key ) {
						return position_collection_fn( destination_position_array );
					});
				});
			}
		}
		return possible_turns;
	}
	// ------------------------------
	core.events.on( "turn", core.handle_turn_event );
	mersenne_twister.init_genrand( (new Date()).getTime() % 1000000000 );
	//
	return core;
}

function generate_id() {
	return pad( base62_encode( Math.floor( mersenne_twister.genrand_real2()*(62*62*62*62*62) )), 5 );
}

// exports

exports.create = create;

