"use strict";

var events = require("events");
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
		return core.game_instances[ game_id ];
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
		if( game_instance ) {
			game_instance.game.perform_turn( turn_event ); // duck-typing
			var game_event = {
				game_id: game_id
			};
			core.events.emit( "game", game_event );
		}
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
	// ---------------
	core.events.on( "turn", core.handle_turn_event );

	return core;
}

// exports

exports.create = create;

