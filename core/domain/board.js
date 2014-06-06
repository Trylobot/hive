var _ = require("lodash");
_(global).extend(require("./util"));
var Piece = require("./piece");
var Position = require("./position");

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
function create() {
	var board = {
		// map: position_key => piece_object
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
	// return piece at position
	board.lookup_piece = function( position ) {
		return board.pieces[ position.encode() ];
	}
	// return the contents of the six positions adjacent to a given position, on the same layer
	// the resulting map will contain the six keys of the cardinal directions mapped to result objects
	// containing the fields: "position", "position_key", "contents"
	board.lookup_coplanar_adjacent_pieces = function( position ) {
		return _.mapValues( Position.coplanar_directions_map, function( direction_id, direction_name ) {
			var translated_position = position.translation( direction_name );
			var translated_position_key = translated_position.encode();
			return {
				position: translated_position,
				position_key: translated_position_key,
				contents: board.pieces[ translated_position_key ]
			}
		});
	}
	// return the contents of the position directly above the given position
	board.lookup_piece_atop = function( position ) {
		return board.pieces[ position.translation( "+layer" ).encode() ];
	}
	// return a map containing the positions of free spaces adjacent to pieces already placed on the board
	//   key is the position key, value is the position object representing that space
	board.lookup_free_spaces = function() {
		var free_spaces = {};
		// for each piece currently on the board ...
		_.forEach( board.pieces, function( piece_object, piece_position_key ) {
			var position = Position.decode( piece_position_key );
			// ignoring pieces higher up than layer 0
			if( position.layer != 0 )
				return;
			// find the pieces adjacent to it
			var adjacent_pieces = board.lookup_coplanar_adjacent_pieces( position );
			// retain each space not occupied by a piece
			_.forEach( Position.coplanar_directions_map, function( direction_id, direction_name ) {
				var adjacency = adjacent_pieces[direction_name];
				if( typeof adjacency.contents === "undefined" )
					free_spaces[ adjacency.position_key ] = adjacency.position;
			});
		});
		return free_spaces;
	}
	return board;
}

// exports

exports.create = create;

