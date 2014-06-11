"use strict";

var _ = require("lodash");
var uuid = require("uuid-v4");
var async = require("async");

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
	core.start_game = function( white_player, black_player, use_mosquito, use_ladybug, use_pillbug ) {
		var game = Game.create( use_mosquito, use_ladybug, use_pillbug );
		var game_id = uuid();
		var game_instance = {
			game: game,
			game_id: game_id,
			players: {
				"White": white_player,
				"Black": black_player
			}
		};
		core.game_instances[ game_id ] = game_instance;
		// -----------
		white_player.greetings();
		black_player.greetings();
		async.whilst(
			function() { // test
				return !game.game_over;
			},
			function( iteration_complete ) { // function (body)
				var game_state = {};
				var possible_turns = {};
				// send data (to somewhere)
				game_instance.players[ game.player_turn ]
					.choose_turn(
						game_id, 
						game_state, 
						possible_turns, 
						function( turn_choice ) { 
							// receive response (from somewhere)
							switch( turn_choice.turn_type ) {
								case: "Placement":
									game.perform_placement(
										game.player_turn,
										turn_choice.piece_type,
										turn_choice.destination );
									break;
								case: "Movement":
									game.perform_movement(
										turn_choice.source,
										turn_choice.destination );
									break;
							}
							iteration_complete();
						});
			},
			function( err ) { // callback (when all done)
				core.end_game( game_id );
			}
		);
		return game_id;
	}
	core.end_game = function( game_id ) {
		// TODO: save game to archive
		//   html + embedded game history as JSON + auto playback + turn navigation
		//delete games[ game_id ];
	}
	core.set_player = function( game_id, color, player ) {
		games[ game_id ].players[ color ] = player;
		player.greetings();
	}
	return core;
}

// exports

exports.create = create;

