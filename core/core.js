"use strict";

var events = require("events");
var async = require("async");
var _ = require("lodash");
var mt = new (require('mersenne').MersenneTwister19937);

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
*/

// functions

function create() {
	var core = {
		game_instances: {},
		events: new events.EventEmitter
	}
	core.create_game = function( white_player, black_player, use_mosquito, use_ladybug, use_pillbug ) {
		var game = Game.create( use_mosquito, use_ladybug, use_pillbug );
		return core.register_game( white_player, black_player, game );
	}
	core.load_game = function( white_player, black_player, save_data ) {
		var game = Game.load( save_data.creation_parameters, save_data.turn_history );
		return core.register_game( white_player, black_player, game );
	}
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
	core.start_game = function( game_id ) {
		if( !(game_id in core.game_instances) )
			return; // invalid game_id
		var game_event = {
			game_id: game_id
		};
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
		// TODO: save game to archive
		//   html + embedded game history as JSON + auto playback + turn navigation
		delete core.game_instances[ game_id ];
	}
	core.generate_game_id = function() {
		var id;
		do {
			mt.init_genrand( (new Date()).getTime() % 1000000000 );
			var num = Math.floor( mt.genrand_real2()*(62*62*62*62*62) );
			var id = pad( base62_encode( num ), 5 );
		} while( id in core.game_instances );
		return id;
	}
	core.prepare_choose_turn_request_message = function( game_id ) {
		var game_instance = core.lookup_game( game_id );
		// TODO: possible_turns should already be using position keys, and this should not be necessary
		var possible_turns = core.possible_turns__encode_positions( 
			game_instance.game.possible_turns );
		// TODO: game_state and possible turns should just use the native structure, this restructuring shouldn't be necessary
		var message = {
			request_type: "CHOOSE_TURN",
			game_id: game_id,
			possible_turns: possible_turns,
			game_state: {
				board: game_instance.game.board,
				hands: game_instance.game.hands,
				player_turn: game_instance.game.player_turn,
				turn_number: game_instance.game.turn_number,
				game_over: game_instance.game.game_over,
				winner: game_instance.game.winner,
				is_draw: game_instance.game.is_draw
			}
		};
		return message;
	}
	core.prepare_turn_response_message = function( turn, game_id ) {
		return _.extend( turn, {
			response_type: "CHOOSE_TURN",
			game_id: game_id
		});
	}
	core.parse_response_message = function( response_message ) {
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
		}
		return turn;
	}
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
	// ---------------
	core.events.on( "turn", core.handle_turn_event );

	return core;
}

// exports

exports.create = create;

