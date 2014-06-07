var _ = require("lodash");
_(global).extend(require("./util"));
var Piece = require("./piece");
var Position = require("./position");
var Board = require("./board");

/*
rules.js
this module is used to represent the rules of hive.
	it can provide a list of valid end positions for a piece, 
	given a board state (for a placement check)
	or a board state and a current position (for a movement check)
*/

// functions

function find_valid_placement( piece, board ) {
	return board.lookup_free_spaces( Piece.color_name( piece.color ));
}

function find_valid_movement( piece, board, position ) {
	var piece_type = Piece.type_name( piece.type );
	var piece_color = Piece.color_name( piece.color );
	switch( piece_type )
	{
		case "Queen Bee":
			return find_valid_movement__Queen_Bee( piece_color, board, position );
			break;

		case "Beetle":
			return find_valid_movement__Beetle( piece_color, board, position );			
			break;

		case "Grasshopper":
			return find_valid_movement__Grasshopper( piece_color, board, position );			
			break;

		case "Spider":
			return find_valid_movement__Spider( piece_color, board, position );			
			break;

		case "Soldier Ant":
			return find_valid_movement__Soldier_Ant( piece_color, board, position );			
			break;

		case "Mosquito":
			return find_valid_movement__Mosquito( piece_color, board, position );			
			break;

		case "Ladybug":
			return find_valid_movement__Ladybug( piece_color, board, position );			
			break;

		case "Pillbug":
			return find_valid_movement__Pillbug( piece_color, board, position );			
			break;
	}
	throw "invalid piece type: " + piece_type;
}

// private functions

function find_valid_movement__Queen_Bee( color, board, position ) {
	throw "not yet implemented";
}

function find_valid_movement__Beetle( color, board, position ) {
	throw "not yet implemented";
}

function find_valid_movement__Grasshopper( color, board, position ) {
	throw "not yet implemented";
}

function find_valid_movement__Spider( color, board, position ) {
	throw "not yet implemented";
}

function find_valid_movement__Soldier_Ant( color, board, position ) {
	throw "not yet implemented";
}

function find_valid_movement__Mosquito( color, board, position ) {
	throw "not yet implemented";
}

function find_valid_movement__Ladybug( color, board, position ) {
	throw "not yet implemented";
}

function find_valid_movement__Pillbug( color, board, position ) {
	throw "not yet implemented";
}

function check_one_hive_rule( board, newly_empty_position ) {
	throw "not yet implemented";
}

function check_freedom_to_move_rule( board, start_position, end_position, sliding_moves_position_chain ) {
	throw "not yet implemented";
}

// exports

exports.find_valid_placement = find_valid_placement;
exports.find_valid_movement = find_valid_movement;
