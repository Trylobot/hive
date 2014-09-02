"use strict";

var _ = require("lodash");
_(global).extend(require("./util"));
var Piece = require("./piece");
var Position = require("./position");
var Board = require("./board");
var Rules = require("./rules");
var Turn = require("./turn");

/*
game.js
this class is used to represent a hive game.
it encapsulates all of the hive rules, and allows for
	progression from one board state to the next.
	it can list all the possible moves.
	it also evaluates end states and determines the game winner, 
	or if there is a draw.
*/

// functions

// creates a new game board and initializes player hands, with optional add-on pieces
function create( creation_parameters ) {
	var game = {
		board: Board.create(),
		hands: {
			"White": {},
			"Black": {}
		},
		player_turn: "White",
		turn_number: 0,
		game_over: false,
		winner: null,
		is_draw: false,
		creation_parameters: creation_parameters,
		turn_history: [],
		possible_turns: null
	}
	game.lookup_possible_turns = function() {
		return Rules.lookup_possible_turns( 
			game.player_turn, 
			game.board, 
			game.hands[ game.player_turn ], 
			game.turn_number,
			game.turn_history );
	}
	game.check_if_turn_valid = function( turn_object ) {
		return true; // TODO
	}
	game.perform_turn = function( turn_object, skip_self_evaluation ) {
		// TODO: add checks on validity of turn object structure and references, and validity of turn itself against known rules; return false if error?
		var turn_type = turn_object.turn_type;
		switch( turn_type ) {
			case "Placement": 
				var piece_color = game.player_turn;
				var piece_type = turn_object.piece_type;
				var piece = Piece.create( piece_color, piece_type );
				var position = Position.force_decoded_object( turn_object.destination );
				var hand = game.hands[ piece_color ];
				hand[ turn_object.piece_type ]--;
				if( hand[ turn_object.piece_type ] <= 0 )
					delete hand[ turn_object.piece_type ];
				game.board.place_piece( piece, position );
				break;
			case "Movement":
				var position_0 = Position.force_decoded_object( turn_object.source );
				var position_1 = Position.force_decoded_object( turn_object.destination );
				game.board.move_piece( position_0, position_1 );
				break;
			case "Special Ability":
				// TODO: do something with the ability_user field?
				var position_0 = Position.force_decoded_object( turn_object.source );
				var position_1 = Position.force_decoded_object( turn_object.destination );
				game.board.move_piece( position_0, position_1 );
			case "Forfeit":
				break;
			case "Error":
				skip_self_evaluation = true;
				game.game_over = true;
				game.winner = Piece.opposite_color( game.player_turn );
				game.is_draw = false;
				game.possible_turns = null;
				break;
			case "Unknown":
				// ..?
				break;
			default:
				throw "invalid turn type: " + turn_type;
		}
		game.turn_number++;
		game.player_turn = Piece.opposite_color( game.player_turn );
		game.turn_history.push( _.clone( turn_object ));
		if( !skip_self_evaluation )
			game.self_evaluation();
	}
	game.undo_last_turn = function( skip_self_evaluation ) {
		if( game.turn_history.length == 0 )
			return; // cannot undo
		game.player_turn = Piece.opposite_color( game.player_turn );
		game.turn_number--;
		var turn_object = game.turn_history.pop();
		var turn_type = turn_object.turn_type;
		switch( turn_type ) {
			case "Placement": // remove piece from board and return to player's hand
				var piece_color = game.player_turn;
				var piece_type = turn_object.piece_type;
				var position = Position.force_decoded_object( turn_object.destination );
				var hand = game.hands[ piece_color ];
				if( !hand[ turn_object.piece_type ])
					hand[ turn_object.piece_type ] = 0;
				hand[ turn_object.piece_type ]++;
				game.board.remove_piece( position );
				break;
			case "Movement": // move piece back to its original position
				var position_0 = Position.force_decoded_object( turn_object.source );
				var position_1 = Position.force_decoded_object( turn_object.destination );
				game.board.move_piece( position_1, position_0 );
				break;
			case "Special Ability": // move piece back to its original position
				// TODO: do something with the ability_user field?
				var position_0 = Position.force_decoded_object( turn_object.source );
				var position_1 = Position.force_decoded_object( turn_object.destination );
				game.board.move_piece( position_1, position_0 );
			case "Forfeit":
				break;
			case "Error":
				break;
			case "Unknown":
				// ..?
				break;
			default:
				throw "invalid turn type: " + turn_type;
		}
		if( !skip_self_evaluation )
			game.self_evaluation();
	}
	game.self_evaluation = function() {
		game.possible_turns = game.lookup_possible_turns();
		var game_over_state = Rules.check_if_game_over( game.board );
		_.assign( game, game_over_state );
	}
	game.save = function() {
		return game;
	}
	// -------------------
	if( !creation_parameters.custom ) {
		// default hands (no addons)
		game.hands["White"]["Queen Bee"] = 1;
		game.hands["White"]["Beetle"] = 2;
		game.hands["White"]["Grasshopper"] = 3;
		game.hands["White"]["Spider"] = 2;
		game.hands["White"]["Soldier Ant"] = 3;
		// ---
		game.hands["Black"]["Queen Bee"] = 1;
		game.hands["Black"]["Beetle"] = 2;
		game.hands["Black"]["Grasshopper"] = 3;
		game.hands["Black"]["Spider"] = 2;
		game.hands["Black"]["Soldier Ant"] = 3;
		// optional addon pieces
		if( creation_parameters.use_mosquito ) {
			game.hands["White"]["Mosquito"] = 1;
			game.hands["Black"]["Mosquito"] = 1;
		}
		if( creation_parameters.use_ladybug ) {
			game.hands["White"]["Ladybug"] = 1;
			game.hands["Black"]["Ladybug"] = 1;
		}
		if( creation_parameters.use_pillbug ) {
			game.hands["White"]["Pillbug"] = 1;
			game.hands["Black"]["Pillbug"] = 1;
		}
	}
	else {
		game.hands = creation_parameters.custom.hands
	}
	// ---
	game.possible_turns = game.lookup_possible_turns();
	return game;
}

function load( saved_game ) {
	var game = create( saved_game.creation_parameters );
	var skip_self_evaluation = true;
	_.forEach( saved_game.turn_history, function( turn_object ) {
		game.perform_turn( turn_object, skip_self_evaluation );
	});
	game.self_evaluation();
	return game;
}

// exports

exports.create = create;
exports.load = load;

