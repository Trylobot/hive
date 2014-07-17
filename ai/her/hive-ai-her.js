"use strict";

var Game = require("../../core/domain/game");

/*
hive-ai-her.js
  "He[u]r[istic]"
  This AI module utilizes a basic board-scoring heuristic to decide on a move.
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

