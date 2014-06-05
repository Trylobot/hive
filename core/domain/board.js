var _ = require("lodash");
_(global).extend(require("./util"));
var piece = require("./piece");
var position = require("./position");

/* 
board.js
this module is used to represent a hive board. 
	it implements a method of storage for a single board state,
	and functions for querying and manipulating boards.
this module does not contain any game rules, and does
	not itself do any checking on move validity
	or provide any insight into board value or other heuristics.
naturally, in real life, the board itself is imaginary, and really just
	the collection of pieces on whatever surface the players are putting them on.
*/

// functions

// creates a new, empty board
function create_board() {
	var board = {
		// map: position_key_str => piece_object
		//   location hash is of the form "row,col,layer"
		pieces: {}
	}
	// add a new piece to the board at a specific location
	board.place_piece = function( piece, position ) {
		board.pieces[ position.encode() ] = piece;
	}
	// move an existing piece to a new position
	board.move_piece = function( position_0, position_1 ) {
		var position_key_0 = position_0.encode();
		var position_key_1 = position_1.encode();
		board.pieces[position_key_1] = board.pieces[position_key_0];
		board.pieces[position_key_0] = undefined;
	}
	board.lookup_piece = function( position ) {
		return board.pieces[ position.encode() ];
	}
	board.lookup_coplanar_adjacent_pieces = function( position ) {
		return _(position.coplanar_directions_map).mapValues( 
			function( key, value, object ) {
				return board.pieces[ position.translate( value ).encode() ];
			});
	}
	board.lookup_piece_atop = function( position ) {
		return board.pieces[ position.translate( "+layer" ).encode() ];
	}
	return board;
}

// exports

exports.create_board = create_board;

