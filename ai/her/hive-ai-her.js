"use strict";

var _ = require("lodash");
_(global).extend(require("../../core/domain/util"));
var Game = require("../../core/domain/game");
var Player = require("../../core/domain/player");
var Piece = require("../../core/domain/piece");
var Position = require("../../core/domain/position");
var Board = require("../../core/domain/board");
var Rules = require("../../core/domain/rules");
var Turn = require("../../core/domain/turn");

/*
hive-ai-her.js
  "He[u]r[istic]"
  This AI module utilizes a basic (one-move lookahead) board-scoring heuristic to decide on a move.
*/

function process_message( message ) {
	var response;
	switch( message.request_type ) {
		case "GREETINGS":
			response = {
				response_type: message.request_type
			};
			var package_json = require("./package.json");
			for( var key in package_json )
				response[key] = package_json[key];
			break;
		case "CHOOSE_TURN":
			response = {
				response_type: message.request_type,
				game_id: message.game_id
			};

			break;
	}
	return response;
}

function enumerate_turns( possible_turns ) {
	return [];
}

function score_turn( game, turn ) {
	return 0;
}

// exports

exports.process_message = process_message;

