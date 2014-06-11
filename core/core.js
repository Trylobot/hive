"use strict";

var package_json = require("../package.json");

var _ = require("lodash");
var zmq = require("zmq");
var requester = zmq.socket("req");
var uuid = require('uuid-v4');

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
		games: {},
	}
	core.start_game = function( game, white_player, black_player ) {
		var game_id = uuid();
		core.games[ game_id ] = {
			game: game,
			game_id: game_id,
			players: {
				"White": white_player,
				"Black": black_player
			}
		};
		// TODO: call players in an async-loop for moves until game.game_over
	}
	return core;
}

// exports

exports.create = create;

