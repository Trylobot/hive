var piece = require("./piece");

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

// creates a new, empty board
exports.create_board = function() {
	var board = {
		// map: location hash (str) -> piece object
		//   location hash is of the form "row,col,layer"
		pieces: {}
	}
	// add a new piece to the board at a specific location
	board.place_piece = function( row, col, layer, piece ) {
		var position_key = board.encode_position_key( row, col, layer ); 
		pieces[position_key] = piece;
	}
	// move an existing piece to a new position
	board.move_piece = function( row_0, col_0, layer_0, row_1, col_1, layer_1 ) {
		var position_key_0 = board.encode_position_key( row_0, col_0, layer_0 );
		var position_key_1 = board.encode_position_key( row_1, col_1, layer_1 );
		pieces[position_key_1] = pieces[position_key_0];
		pieces[position_key_0] = undefined;
	}
	// create a hash for a location, used for storage of piece objects
	board.encode_position_key = function( row, col, layer ) {
		return row + "," + col + "," + layer;
	}
	board.decode_position_key = function( position_key ) {
		var parts = position_key.split(",");
		return {
			row: parts[0].
		}
	}
	return board;
}
