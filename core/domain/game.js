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
		// TODO: provide player color in all turn_objects, check it here!
		var turn_type = turn_object.turn_type;
		switch( turn_type ) {
			case "Placement":
				var possible_placement = game.possible_turns["Placement"];
				if( !possible_placement )
					throw "Invalid Placement (none allowed)";
				var piece_type = turn_object.piece_type;
				var destination = Position.force_encoded_string( turn_object.destination );
				if( !_.contains( possible_placement.piece_types, piece_type ))
					throw "Invalid Placement (piece_type)"
						+ "\n  sought " + piece_type
						+ "\n  allowed " + JSON.stringify( possible_placement.piece_types );
				if( !_.contains( possible_placement.positions, destination ))
					throw "Invalid Placement (destination)"
						+ "\n  sought " + destination
						+ "\n  allowed " + JSON.stringify( possible_placement.positions );
				break;
			case "Movement":
				var possible_movement = game.possible_turns["Movement"];
				if( !possible_movement )
					throw "Invalid Movement (none allowed)";
				var source = Position.force_encoded_string( turn_object.source );
				if( !possible_movement[ source ])
					throw "Invalid Movement (source)"
						+ "\n  sought " + source
						+ "\n  allowed " + JSON.stringify( _.keys( possible_movement ));
				var destination = Position.force_encoded_string( turn_object.destination );
				if( !_.contains( possible_movement[ source ], destination ))
					throw "Invalid Movement (destination)"
						+ "\n  sought " + destination
						+ "\n  allowed " + JSON.stringify( possible_movement[ source ]);
				break;
			case "Special Ability":
				var possible_special_abilities = game.possible_turns["Special Ability"];
				if( !possible_special_abilities )
					throw "Invalid Special Ability (none allowed)";
				var ability_user = Position.force_encoded_string( turn_object.ability_user );
				if( !possible_special_abilities[ ability_user ])
					throw "Invalid Special Ability (ability_user)"
						+ "\n  sought " + ability_user
						+ "\n  allowed " + JSON.stringify( _.keys( possible_special_abilities ));
				var source = Position.force_encoded_string( turn_object.source );
				if( !possible_special_abilities[ ability_user ][ source ])
					throw "Invalid Special Ability (source)"
						+ "\n  sought " + source
						+ "\n  allowed " + JSON.stringify( _.keys( possible_special_abilities[ ability_user ]));
				var destination = Position.force_encoded_string( turn_object.destination );
				if( !_.contains( possible_special_abilities[ ability_user ][ source ], destination ))
					throw "Invalid Special Ability (destination)"
						+ "\n  sought " + destination
						+ "\n  allowed " + JSON.stringify( possible_special_abilities[ ability_user ][ source ]);
			case "Forfeit":
				var possible_forfeiture = game.possible_turns["Forfeit"];
				if( !possible_forfeiture )
					throw "Invalid Forfeit (not allowed)";
				break;
			case "Error":
				throw "Invalid Turn (Error)";
				break;
			case "Unknown":
				throw "Invalid Turn (Unknown)";
				break;
			default:
				throw "Invalid turn_type " + turn_type;
		}
	}
	game.perform_turn = function( turn_object, skip_self_evaluation, skip_validity_check ) {
		if( !skip_validity_check )
			game.check_if_turn_valid( turn_object ); // throws exception if invalid
		//
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
				throw "Invalid turn_type " + turn_type;
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

function load( saved_game, skip_all_validity_checks ) {
	var game = create( saved_game.creation_parameters );
	var skip_self_evaluation = skip_all_validity_checks; // if validity checks should be performed, self evaluation must also be performed
	_.forEach( saved_game.turn_history, function( turn_object ) {
		game.perform_turn( turn_object, skip_self_evaluation, skip_all_validity_checks );
	});
	if( skip_self_evaluation )
		game.self_evaluation(); // if self evaluations were skipped for performance reasons, they must now be performed
	return game;
}

// exports

exports.create = create;
exports.load = load;

