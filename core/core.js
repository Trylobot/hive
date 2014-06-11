"use strict";

var package_json = require("../package.json");

var _ = require("lodash");
var zmq = require("zmq");
var requester = zmq.socket("req");

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
		game_sequence: 0
	}
	core.start_game = function( game, player0, player1 ) {
		var sequence = core.game_sequence++;
		core.games[ sequence ] = {
			game: game,
			players: {
				"White": player0,
				"Black": player1
			}
		};
		// TODO: call players in an async-loop for moves until game.game_over
	}
	return core;
}

// exports

exports.create = create;

