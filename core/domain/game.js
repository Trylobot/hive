"use strict";

var _ = require("lodash");
_(global).extend(require("./util"));
var Piece = require("./piece");
var Board = require("./board");
var Rules = require("./rules");

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
function create( use_mosquito, use_ladybug, use_pillbug ) {
	if( use_mosquito )
		throw "not yet implemented";
	if( use_ladybug )
		throw "not yet implemented";
	if( use_pillbug )
		throw "not yet implemented";
	var game = {
		board: Board.create(),
		hands: {  // initialize every piece_counter with a value of 0
			"White": _.mapValues( Piece.types_enum, function() { return 0 }),
			"Black": _.mapValues( Piece.types_enum, function() { return 0 })
		},
		player_turn: "White",
		turn_number: 0,
		game_over: false,
		winner: null,
		is_draw: false,
		state_history: []
	}
	game.get_next_player_turn = function( player_turn ) {
		if( player_turn === "White" )
			return "Black";
		else if( player_turn === "Black" )
			return "White";
	}
	game.record_current_state = function() {
		// serialize everything except the state_history, since this data will be copied into the state_history
		var serialized_game_state = JSON.stringify({
			board: game.board,
			hands: game.hands,
			player_turn: game.player_turn,
			turn_number: game.turn_number,
			game_over: game.game_over,
			winner: game.winner,
			is_draw: game.is_draw
		});
		game.state_history.push( serialized_game_state );
	}
	game.advance_state = function() {
		game.turn_number++;
		game.player_turn = game.get_next_player_turn( game.player_turn );
		game.record_current_state();
	}
	game.perform_placement = function( piece_color, piece_type, position ) {
		var hand = board.hands[ piece_color ];
		hand[ piece_type ]--;
		if( hand[ piece_type ] <= 0 )
			delete hand[ piece_type ];
		var piece = Piece.create( piece_color, piece_type );
		board.place_piece( piece, position );
		game.advance_state();
	}
	game.perform_movement = function( position_0, position_1 ) {
		board.move_piece( position_0, position_1 );
		game.turn_number++;
		game.player_turn = game.get_next_player_turn( game.player_turn );
		game.advance_state();
	}
	// -------------------
	// default hands (no addons)
	game.hands["White"]["Queen Bee"] += 1;
	game.hands["White"]["Queen Bee"] += 1;
	game.hands["White"]["Beetle"] += 1;
	game.hands["White"]["Beetle"] += 1;
	game.hands["White"]["Grasshopper"] += 1;
	game.hands["White"]["Grasshopper"] += 1;
	game.hands["White"]["Grasshopper"] += 1;
	game.hands["White"]["Spider"] += 1;
	game.hands["White"]["Spider"] += 1;
	game.hands["White"]["Soldier Ant"] += 1;
	game.hands["White"]["Soldier Ant"] += 1;
	game.hands["White"]["Soldier Ant"] += 1;
	// ---
	game.hands["Black"]["Queen Bee"] += 1;
	game.hands["Black"]["Queen Bee"] += 1;
	game.hands["Black"]["Beetle"] += 1;
	game.hands["Black"]["Beetle"] += 1;
	game.hands["Black"]["Grasshopper"] += 1;
	game.hands["Black"]["Grasshopper"] += 1;
	game.hands["Black"]["Grasshopper"] += 1;
	game.hands["Black"]["Spider"] += 1;
	game.hands["Black"]["Spider"] += 1;
	game.hands["Black"]["Soldier Ant"] += 1;
	game.hands["Black"]["Soldier Ant"] += 1;
	game.hands["Black"]["Soldier Ant"] += 1;
	// optional addon pieces
	if( use_mosquito ) {
		game.hands["White"]["Mosquito"] += 1;
		game.hands["Black"]["Mosquito"] += 1;
	}
	if( use_ladybug ) {
		game.hands["White"]["Ladybug"] += 1;
		game.hands["Black"]["Ladybug"] += 1;
	}
	if( use_pillbug ) {
		game.hands["White"]["Pillbug"] += 1;
		game.hands["Black"]["Pillbug"] += 1;
	}
	// remove any piece_counter keys that are still 0, for brevity during serialization and recording of game states
	game.hands["White"] = _.compact( game.hands["White"] );
	game.hands["Black"] = _.compact( game.hands["Black"] );
	// initialize history with initial game state
	game.record_current_state();
	return game;
}

// exports

exports.create = create;

