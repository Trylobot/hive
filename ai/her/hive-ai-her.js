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
		
		case "Greetings":
			response = {
				response_type: message.request_type,
				response_id: message.request_id
			};
			var package_json = require("./package.json");
			for( var key in package_json )
				response[key] = package_json[key];
			break;
		
		case "Choose Turn":
			var game = Game.load( message.game_state );
			var possible_turns = game.possible_turns;
			var player_turn = game.player_turn;
			if( !has_nonzero_key_set_length( possible_turns ))
				throw "Cannot choose from empty object possible_turns";
			response = {
				response_type: message.request_type,
				response_id: message.request_id,
				game_id: message.game_id
			};
			var enumerated_turns = [];
			if( possible_turns["Placement"] )
				_.forEach( possible_turns["Placement"].piece_types, function( piece_type ) {
					_.forEach( possible_turns["Placement"].positions, function( position ) {
						enumerated_turns.push( Turn.create_placement( piece_type, position ));
					});
				});
			if( possible_turns["Movement"] )
				_.forEach( possible_turns["Movement"], function( destinations, source ) {
					_.forEach( destinations, function( destination ) {
						enumerated_turns.push( Turn.create_movement( source, destination ));
					})
				});
			if( possible_turns["Special Ability"] )
				_.forEach( possible_turns["Special Ability"], function( sources, ability_user ) {
					_.forEach( sources, function( destinations, source ) {
						_.forEach( destinations, function( destination ) {
							enumerated_turns.push( Turn.create_special_ability( ability_user, source, destination ));
						});
					});
				});
			if( possible_turns["Forfeit"] )
				enumerated_turns.push( Turn.create_forfeit() );
			var skip_self_evaluation = true; 
			// when skip_self_evaluation is used, the following properties are undefined and should not be used:
			//   game.<possible_turns,game_over,winner,is_draw>
			var turn_scores = _.map( enumerated_turns, function( turn ) {
				game.perform_turn( turn, skip_self_evaluation );
				var score = score_heuristic( game, player_turn );
				game.undo_last_turn( skip_self_evaluation );
				return score;
			});
			var max_score = _.max( turn_scores );
			var potential_turns = _.filter( enumerated_turns, function( turn, idx ) {
				return turn_scores[ idx ] == max_score;
			});
			var chosen_turn = random_array_item( potential_turns );
			_.extend( response, chosen_turn );
			break;
	}
	return response;
}

function score_heuristic( game, player_color ) {
	var board = game.board;
	var score = 0;
	var enemy_queen = board.search_pieces( Piece.opposite_color( player_color ), "Queen Bee" )[0];
	if( enemy_queen )
		score += 10 * board.lookup_occupied_adjacencies( enemy_queen.position ).length;
	var own_queen = board.search_pieces( player_color, "Queen Bee" )[0];
	if( own_queen )
		score -= 1 * board.lookup_occupied_adjacencies( own_queen.position ).length;
	return score;
}

function has_nonzero_key_set_length( object ) {
	return( typeof object != "undefined" && object != null && Object.keys( object ).length > 0 );
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

