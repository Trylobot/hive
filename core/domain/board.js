"use strict";

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
		// map: position_key => piece_stack
		//   position_key is of the form "row,col"
		//   piece_stack: [ bottom_piece, middle_piece, ..., topmost_piece ]
		//   there are no empty piece_stacks defined here; positions with no pieces will be undefined
		pieces: {}
	}
	// add a new piece to the board at a specific position, at the top of the stack at that position
	board.place_piece = function( piece, position ) {
		var position_key = position.encode();
		if( board.pieces[ position_key ])
			board.pieces[ position_key ].push( piece )
		else // new stack
			board.pieces[ position_key ] = [ piece ];
	}
	// move the piece at the top of the stack of position_0 to the top of the stack at position_1
	board.move_piece = function( position_0, position_1 ) {
		board.place_piece( board.remove_piece( position_0 ), position_1 );
	}
	// remove and return a piece from the board at a specific position, from the top of the stack at that position
	board.remove_piece = function( position ) {
		var piece = undefined;
		var position_key = position.encode();
		if( board.pieces[ position_key ]) {
			piece = board.pieces[ position_key ].pop();
			if( board.pieces[ position_key ].length == 0 )
				delete board.pieces[ position_key ];
		}
		return piece;
	}
	// return count of pieces
	// optionally filter by type and/or color
	board.count_pieces = function( piece_color, piece_type ) {
		return _.reduce( board.pieces, function( piece_stack, sum ) {
			return sum + _.reduce( piece_stack, function( piece, sum ) {
				if( (piece.type == piece_type   || typeof piece_type === "undefined")
				&&  (piece.color == piece_color || typeof piece_color === "undefined") )
					return sum + 1;
				else
					return sum;
			}, 0 );
		}, 0 );
	}
	// return list of search results
	// optionally filter by type and/or color
	board.search_pieces = function( piece_color, piece_type ) {
		var results = [];
		_.forEach( board.pieces, function( piece_stack, position_key ) {
			_.forEach( piece_stack, function( piece, layer ) {
				if( (piece.type == piece_type   || typeof piece_type === "undefined")
				&&  (piece.color == piece_color || typeof piece_color === "undefined") ) {
					results.push({
						position_key: position_key,
						position: Position.decode( position_key ),
						layer: layer,
						piece: piece
					});
				}
			});
		});
		return results;
	}
	// 
	board.lookup_occupied_position_keys = function() {
		return _.keys( board.pieces );
	}
	// 
	board.lookup_occupied_positions = function() {
		return Position.decode_all( board.lookup_occupied_position_keys );
	}
	// return the entire piece-stack at position (or undefined if not found)
	board.lookup_piece_stack = function( position ) {
		var position_key = position.encode();
		var piece_stack = board.pieces[ position_key ];
		return piece_stack;
	}
	// return the height of the piece-stack
	board.lookup_piece_stack_height = function( position ) {
		var position_key = position.encode();
		return board.pieces[ position_key ].length;
	}
	// return the piece at the top of the piece-stack at position (or undefined if not found)
	board.lookup_piece = function( position ) {
		var position_key = position.encode();
		return board.lookup_piece_by_key( position_key );
	}
	// return the piece at the top of the piece-stack at position (or undefined if not found)
	board.lookup_piece_by_key = function( position_key ) {
		var piece_stack = board.pieces[ position_key ];
		var piece = undefined;
		if( piece_stack )
			piece = piece_stack[ piece_stack.length - 1 ];
		return piece;
	}
	// return the contents of the six positions adjacent to a given position, on the same layer
	// the resulting map will contain the six keys of the cardinal directions mapped to result objects
	// containing the fields: "position", "position_key"; 
	// the "contents" field will contain the piece at the associated position, or undefined if there is no piece there
	board.lookup_adjacent_positions = function( position ) {
		return _.mapValues( Position.directions_enum, function( direction ) {
			var translated_position = position.translation( direction );
			var translated_position_key = translated_position.encode();
			return {
				position: translated_position,
				position_key: translated_position_key,
				contents: board.pieces[ translated_position_key ] // piece_stack
			}
		});
	}
	// return a list of positions valid to slide into, using the can_slide_lookup_table
	// optionally, treat a specific position as empty
	board.lookup_adjacent_slide_positions = function( position, assuming_empty_position ) {
		var assuming_empty_position_key = (typeof assuming_empty_position !== "undefined") ? assuming_empty_position.encode() : undefined;
		var occupied_adjacencies_lookup_key_array = [], i;
		for( i = 0; i < 6; ++i ) {
			var direction = Position.directions_enum[i];
			var translated_position = position.translation( direction );
			var translated_position_key = translated_position.encode();
			if( translated_position_key != assuming_empty_position_key 
			&&  board.pieces[ translated_position_key ])
				occupied_adjacencies_lookup_key_array.push( "1" );
			else
				occupied_adjacencies_lookup_key_array.push( "." );
		}
		var occupied_adjacencies_lookup_key = occupied_adjacencies_lookup_key_array.join( "" );
		var valid_directions_result_key = can_slide_lookup_table[ occupied_adjacencies_lookup_key ];
		var position_list = [];
		for( i = 0; i < 6; ++i ) {
			if( valid_directions_result_key[i] === "1" ) {
				var direction = Position.directions_enum[i];
				var translated_position = position.translation( direction );
				position_list.push( translated_position );
			}
		}
		return position_list;
	}
	// return a list of positions occupied by one or more stacked pieces
	board.lookup_occupied_adjacencies = function( position ) {
		var position_list = [];
		_.forEach( Position.directions_enum, function( direction ) {
			var adjacent_position = position.translation( direction );
			var adjacent_position_key = translated_position.encode();
			if( board.pieces[ translated_position_key ])
				position_list.push( adjacent_position );
		});
		return position_list;
	}
	// return a map of free spaces that are within a specific range from a start position
	//   default min_distance is 0
	//   default max_distance is Infinity
	board.lookup_slide_destinations_within_range = function( start_position, min_distance, max_distance ) {
		min_distance = (typeof min_distance !== "undefined") ? min_distance : 1;
		max_distance = (typeof max_distance !== "undefined") ? max_distance : Infinity;
		var result = {};
		var visited = {};
		var distance = 1;
		var to_visit = [ start_position ];
		// travel outwards from the origin (start_position) until the specified max_distance is reached
		// if max_distance is infinity, the loop will execute until no new adjacencies can be found
		while( to_visit.length > 0 && distance <= max_distance ) {
			var to_visit_next = [];
			_.forEach( to_visit, function( position ) {
				var position_key = position.encode();
				visited[ position_key ] = true;
				var adjacencies = board.lookup_adjacent_slide_positions( position, start_position );
				_.forEach( adjacencies, function( adjacent_position ) {
					var adjacent_position_key = adjacent_position.encode();
					if( !(adjacent_position_key in visited) ) {
						if( distance >= min_distance )
							result[ adjacent_position_key ] = adjacent_position;
						to_visit_next.push( adjacent_position );
					}
				});
			});
			to_visit = to_visit_next;
			distance++;
		}
		return result;
	}
	// return a map containing the positions of free spaces adjacent to pieces already placed on the board
	//   key is the position key, value is the position object representing that space
	// optionally pass a color name to find free spaces that are adjacent to ONLY that color and no other color
	board.lookup_free_spaces = function( color_filter ) {
		var free_spaces = {};
		var filtered_free_spaces = {};
		// for each occupied position ...
		_.forEach( board.pieces, function( piece_stack, position_key ) {
			var position = Position.decode( position_key );
			// scan the positions adjacent to it
			var adjacent_positions = board.lookup_adjacent_positions( position );
			// for each adjacent position ...
			_.forEach( adjacent_positions, function( adjacency, direction ) {
				if( typeof adjacency.contents === "undefined" ) {
					// retain each space not occupied by a piece
					free_spaces[ adjacency.position_key ] = adjacency.position;
					// mark free spaces adjacent to piece-stacks not matching the color filter for later exclusion
					if( typeof color_filter !== "undefined" ) {
						var effective_stack_color = piece_stack[ piece_stack.length - 1 ].color;
						if( color_filter != effective_stack_color )
							filtered_free_spaces[ adjacency.position_key ] = true;
					}
				}
			});
		});
		// peform filtered_free_spaces exclusion
		free_spaces = _.omit( free_spaces, function( free_position, free_position_key ) {
			return (free_position_key in filtered_free_spaces);
		});
		return free_spaces;
	}
	// return the first free space found, tracing a line from an origin extending outward in a specified direction
	// note: includes position immediately adjacent
	board.find_free_space_in_direction = function( position, direction ) {
		var cursor = position.translation( direction );
		while( typeof board.pieces[ cursor.encode() ] !== "undefined" )
			cursor = cursor.translation( direction );
		return cursor;
	}
	// check whether a board is contiguous
	//   returns true if contiguous
	// optionally, treat a specific position as empty
	board.check_contiguity = function( assuming_empty_position ) {
		var assuming_empty_position_key = (typeof assuming_empty_position !== "undefined") ? assuming_empty_position.encode() : undefined;
		var piece_position_keys = _.keys( board.pieces );
		var occupied_space_count = piece_position_keys.length;
		if( occupied_space_count == 0 )
			return true;
		// starting an arbitrary occupied position ...
		var pieces_to_visit = [ Position.decode( piece_position_keys[0] ) ];
		var visited_pieces = {};
		visited_pieces[ piece_position_keys[0] ] = true;
		// traverse adjacency graph until no more linked pieces could be found
		while( pieces_to_visit.length > 0 ) {
			var position = pieces_to_visit.pop();
			// scan the positions adjacent to it
			var adjacent_positions = board.lookup_adjacent_positions( position );
			// for each adjacent position ...
			_.forEach( adjacent_positions, function( adjacency, direction_name ) {
				// if the position is occupied
				// and the position is not being filtered via function argument
				if( typeof adjacency.contents !== "undefined" 
				&&  !(adjacency.position_key in visited_pieces) 
				&&  assuming_empty_position_key !== adjacency.position_key ) {
					// add it to the pieces_to_visit stack, if it is not already visited
					pieces_to_visit.push( adjacency.position );
					visited_pieces[ adjacency.position_key ] = true;
				}
			});
		}
		// the number of visited pieces should equal the number of piece-stacks on the board
		var visited_pieces_count = _.keys( visited_pieces ).length;
		return (visited_pieces_count == occupied_space_count);
	}
	// -------------
	return board;
}

// data

// keys in this lookup table are specified as follows:
//   keys have one character for each of six directions
//   the sequence begins with 12 o'clock and proceeds clockwise
//   the characters represent the contents of the position one unit of distance away from an origin piece in the associated direction
//   the character will be "1" if that direction is occupied
//   the character will be "." if that direction is not occupied
// values in this lookup table are specified in precisely the same way as the lookup keys
//   except that they mean which directions are valid to slide into, instead of which ones are occupied
var can_slide_lookup_table = {
	"......": "......", // island cannot move
	".....1": "1...1.", // slide around single piece
	"....1.": "...1.1", // slide around single piece
	"....11": "1..1..", // slide alongside pair of adjacent pieces
	"...1..": "..1.1.", // slide around single piece
	"...1.1": "1.1...", // slide up and out of crater
	"...11.": "..1..1", // slide alongside pair of adjacent pieces
	"...111": "1.1...", // slide up and out of crater
	"..1...": ".1.1..", // slide around single piece
	"..1..1": "11.11.", // slide between friends
	"..1.1.": ".1...1", // slide up and out of crater
	"..1.11": "11....", // slide out of corner
	"..11..": ".1..1.", // slide alongside pair of adjacent pieces
	"..11.1": "11....", // slide out of corner
	"..111.": ".1...1", // slide up and out of crater
	"..1111": "11....", // slide to escape from pit
	".1....": "1.1...", // slide around single piece
	".1...1": "..1.1.", // slide up and out of crater
	".1..1.": "1.11.1", // slide between friends
	".1..11": "..11..", // slide out of corner
	".1.1..": "1...1.", // slide up and out of crater
	".1.1.1": "......", // nearly-surrounded piece cannot move
	".1.11.": "1....1", // slide out of corner
	".1.111": "......", // nearly-surrounded piece cannot move
	".11...": "1..1..", // slide alongside pair of adjacent pieces
	".11..1": "...11.", // slide out of corner
	".11.1.": "1....1", // slide out of corner
	".11.11": "......", // nearly-surrounded piece cannot move
	".111..": "1...1.", // slide up and out of crater
	".111.1": "......", // nearly-surrounded piece cannot move
	".1111.": "1....1", // slide to escape from pit
	".11111": "......", // nearly-surrounded piece cannot move
	"1.....": ".1...1", // slide around single piece
	"1....1": ".1..1.", // slide alongside pair of adjacent pieces
	"1...1.": ".1.1..", // slide up and out of crater
	"1...11": ".1.1..", // slide up and out of crater
	"1..1..": ".11.11", // slide between friends
	"1..1.1": ".11...", // slide out of corner
	"1..11.": ".11...", // slide out of corner
	"1..111": ".11...", // slide to escape from pit
	"1.1...": "...1.1", // slide up and out of crater
	"1.1..1": "...11.", // slide out of corner
	"1.1.1.": "......", // nearly-surrounded piece cannot move
	"1.1.11": "......", // nearly-surrounded piece cannot move
	"1.11..": "....11", // slide out of corner
	"1.11.1": "......", // nearly-surrounded piece cannot move
	"1.111.": "......", // nearly-surrounded piece cannot move
	"1.1111": "......", // nearly-surrounded piece cannot move
	"11....": "..1..1", // slide alongside pair of adjacent pieces
	"11...1": "..1.1.", // slide up and out of crater
	"11..1.": "..11..", // slide out of corner
	"11..11": "..11..", // slide to escape from pit
	"11.1..": "....11", // slide out of corner
	"11.1.1": "......", // nearly-surrounded piece cannot move
	"11.11.": "......", // nearly-surrounded piece cannot move
	"11.111": "......", // nearly-surrounded piece cannot move
	"111...": "...1.1", // slide up and out of crater
	"111..1": "...11.", // slide to escape from pit
	"111.1.": "......", // nearly-surrounded piece cannot move
	"111.11": "......", // nearly-surrounded piece cannot move
	"1111..": "....11", // slide to escape from pit
	"1111.1": "......", // nearly-surrounded piece cannot move
	"11111.": "......", // nearly-surrounded piece cannot move
	"111111": "......"  // completely surrounded piece cannot move
};

// exports

exports.create = create;
exports.can_slide_lookup_table = can_slide_lookup_table;

