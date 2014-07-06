"use strict";

var _ = require("lodash");
var async = require("async");
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
	players can be humans or AIs.
	human players use the web app.
	AIs implement the ZeroMQ interface and wait to be called upon.
*/

// functions

function create() {
	var core = {
		game_instances: {},
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
	core.end_game = function( game_id ) {
		// TODO: save game to archive
		//   html + embedded game history as JSON + auto playback + turn navigation
		delete core.game_instances[ game_id ];
	}
	core.start_game_Human_vs_Human = function( game_id ) {
		// not really much to do, here
	}
	core.start_game_AI_vs_AI = function( game_id ) {
		var game_instance = core.lookup_game( game_id );
		if( !game_instance )
			return;
		white_player.greetings();
		black_player.greetings();
		async.whilst(
			function() { // test
				_.assign( game, Rules.check_if_game_over( game.board ));
				return !game.game_over;
			},
			function( iteration_complete ) { // function (body)
				// TODO
				var game_state = {};
				var possible_turns = {};
				// send data (to somewhere)
				game_instance.players[ game.player_turn ]
					.choose_turn(
						game_id, 
						game_state, 
						possible_turns, 
						function( turn ) { 
							game.perform_turn( turn );
							iteration_complete();
						});
			},
			function( err ) { // callback (when all done)
				core.end_game( game_id );
			}
		);
		return game_id;
	}
	core.set_AI_player = function( game_id, color, player ) {
		core.game_instances[ game_id ].players[ color ] = player;
		player.greetings();
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
	return core;
}

// exports

exports.create = create;

