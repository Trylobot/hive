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

// data

var origin = Position.create( 0, 0 );

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
		return _.reduce( board.pieces, function( sum, piece_stack ) {
			return sum + _.reduce( piece_stack, function( sum, piece ) {
				if( (piece.type == piece_type   || typeof piece_type === "undefined")
				&&  (piece.color == piece_color || typeof piece_color === "undefined") )
					return sum + 1;
				else
					return sum;
			}, 0 );
		}, 0 );
	}
	// return list of search results
	//   optionally filter by type and/or color
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
	// return list of search results, scanning only pieces on topmost layers of each piece-stack
	//   optionally filter by type and/or color
	board.search_top_pieces = function( piece_color, piece_type ) {
		var results = [];
		_.forEach( board.pieces, function( piece_stack, position_key ) {
			var piece = board.lookup_piece_by_key( position_key );
			if( (piece.type == piece_type   || typeof piece_type === "undefined")
			&&  (piece.color == piece_color || typeof piece_color === "undefined") ) {
				results.push({
					position_key: position_key,
					position: Position.decode( position_key ),
					layer: board.lookup_piece_stack_height_by_key( position_key ) - 1,
					piece: piece
				});
			}
		});
		return results;
	}
	// 
	board.lookup_occupied_positions = function() {
		return Position.decode_all( board.lookup_occupied_position_keys );
	}
	// 
	board.lookup_occupied_position_keys = function() {
		return _.keys( board.pieces );
	}
	// return the entire piece-stack at position (or undefined if not found)
	board.lookup_piece_stack = function( position ) {
		return board.lookup_piece_stack_by_key( position.encode() );
	}
	// return the entire piece-stack at position (or undefined if not found)
	board.lookup_piece_stack_by_key = function( position_key ) {
		var piece_stack = board.pieces[ position_key ];
		return piece_stack;
	}
	// return the number of pieces stacked at the given position;
	board.lookup_piece_stack_height = function( position ) {
		return board.lookup_piece_stack_height_by_key( position.encode() );
	}
	// return the number of pieces stacked at the given position;
	board.lookup_piece_stack_height_by_key = function( position_key ) {
		var stack = board.lookup_piece_stack_by_key( position_key );
		if( stack )
			return stack.length;
		return 0;
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
	// return the piece in a specific stack at a specific height, or undefined
	board.lookup_piece_at_height = function( position, height ) {
		var stack = board.lookup_piece_stack( position );
		if( stack && height < stack.length )
			return stack[ height ];
		return undefined;
	}
	// return the contents of the six positions adjacent to a given position, on the same layer
	// the resulting map will contain the six keys of the cardinal directions mapped to result objects
	// containing the fields: "position", "position_key"; 
	// the "contents" field will contain the piece at the associated position, or undefined if there is no piece there
	board.lookup_adjacent_positions = function( position ) {
		var result = {};
		_.forEach( Position.directions_enum, function( direction ) {
			var translated_position = position.translation( direction );
			var translated_position_key = translated_position.encode();
			result[ direction ] = {
				direction: direction,
				position: translated_position,
				position_key: translated_position_key,
				contents: board.pieces[ translated_position_key ] // piece_stack
			};
		});
		return result;
	}
	// return a list of positions valid to slide into, using the can_slide_lookup_table
	//   a slide is defined as a movement from one position to another where the stack_height of both positions is zero
	//   optionally, treat a specific position as empty
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
	// return a list of positions valid to climb onto
	//   a climb is a movement from one position to another where one or both of the positions are occupied (height > 0)
	//   optionally, treat a specific position as empty (not used yet)
	board.lookup_adjacent_climb_positions = function( position, assuming_empty_position ) {
		var assuming_empty_position_key = (typeof assuming_empty_position !== "undefined") ? assuming_empty_position.encode() : undefined;
		var position_list = [];
		var self_height = board.lookup_piece_stack_height( position ) - 1;
		var adjacencies = {};
		_.forEach( Position.directions_enum, function( direction ) {
			var translated_position = position.translation( direction );
			adjacencies[ direction ] = {
				position: translated_position,
				height: board.lookup_piece_stack_height( translated_position )
			};
		});
		_.forEach( Position.directions_enum, function( direction ) {
			var cursor = adjacencies[ direction ];
			if( cursor.height == 0 && self_height == 0 )
				return; // moving from height=0 to height=0 is considered a "slide" and is subjected to different constraints
			var slide_height = Math.max( self_height, cursor.height );
			if( adjacencies[ Position.rotation( direction, false )].height <= slide_height
			||  adjacencies[ Position.rotation( direction, true )].height  <= slide_height )
				position_list.push( cursor.position );
		});
		return position_list;
	}
	// return a list of positions occupied by one or more stacked pieces
	board.lookup_occupied_adjacencies = function( position ) {
		var position_list = [];
		_.forEach( Position.directions_enum, function( direction ) {
			var adjacent_position = position.translation( direction );
			var adjacent_position_key = adjacent_position.encode();
			if( board.pieces[ adjacent_position_key ])
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
	// return a map of free spaces that match a highly specific [min,max] height sequential specifier from a start position
	board.lookup_climb_destinations_matching_height_requirements = function( start_position, height_min_max_array ) {
		var result = {};
		var visited = {};
		var distance = 1;
		var to_visit = [ start_position ];
		while( to_visit.length > 0 && distance <= height_min_max_array.length ) {
			var to_visit_next = [];
			_.forEach( to_visit, function( position ) {
				var position_key = position.encode();
				visited[ position_key ] = true;
				var adjacencies = board.lookup_adjacent_climb_positions( position, start_position );
				_.forEach( adjacencies, function( adjacent_position ) {
					var adjacent_position_key = adjacent_position.encode();
					if( !(adjacent_position_key in visited) ) {
						var height = board.lookup_piece_stack_height_by_key( adjacent_position_key );
						var height_range = height_min_max_array[ distance - 1 ];
						if( height >= height_range.min && height <= height_range.max 
						&&  distance == height_min_max_array.length - 1 ) // height_min_max_array also being used as an exact distance specifier
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
		// base case (empty board with no pieces)
		var free_spaces = {};
		if( _.keys( board.pieces ).length == 0 ) {
			free_spaces[ origin.encode() ] = origin;
			return free_spaces;
		}
		var filtered_free_spaces = {};
		// for each occupied position ...
		_.forEach( board.pieces, function( piece_stack, position_key ) {
			var position = Position.decode( position_key );
			// scan the positions adjacent to it
			var adjacent_positions = board.lookup_adjacent_positions( position );
			// for each adjacent position ...
			_.forEach( adjacent_positions, function( adjacency ) {
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
		while( cursor.encode() in board.pieces )
			cursor = cursor.translation( direction );
		return cursor;
	}
	// check whether a board is contiguous
	//   returns true if contiguous
	// optionally, treat a specific position as if it were missing its topmost piece
	board.check_contiguity = function( assuming_piece_moved_position ) {
		var assuming_piece_moved_position_key = (typeof assuming_piece_moved_position !== "undefined") ? assuming_piece_moved_position.encode() : undefined;
		var occupied_piece_position_keys = _.keys( board.pieces );
		// do not count the assumed empty position, if it is specified, and occupied with height == 1 (normal case for most lookups); height > 1 has no effect on contiguity
		if( typeof assuming_piece_moved_position !== "undefined"
		&&  board.lookup_piece_stack_height( assuming_piece_moved_position ) <= 1 ) {
			_.pull( occupied_piece_position_keys, assuming_piece_moved_position_key ); // does nothing if assuming_empty_position was not specified, or if the specified position is not actually occupied
		} else {
			assuming_piece_moved_position_key = undefined; // position key should no longer be treated as empty, because there would be a piece underneath
		}
		// count pieces expected to have been visited at the end
		var occupied_space_count = occupied_piece_position_keys.length;
		if( occupied_space_count == 0 )
			return true; // empty board is explicitly contiguous
		// starting at an arbitrary occupied position ...
		var pieces_to_visit = [ Position.decode( occupied_piece_position_keys[0] ) ];
		var visited_pieces = {};
		visited_pieces[ occupied_piece_position_keys[0] ] = true;
		// traverse adjacency graph until no more linked pieces could be found
		while( pieces_to_visit.length > 0 ) {
			var pieces_to_visit_next = [];
			_.forEach( pieces_to_visit, function( position ) {
				// scan the positions adjacent to it
				var adjacent_positions = board.lookup_adjacent_positions( position );
				// for each adjacent position ...
				_.forEach( adjacent_positions, function( adjacency ) {
					// if the position is occupied
					// and the position is not being filtered via function argument
					if( typeof adjacency.contents !== "undefined" 
					&& !( adjacency.position_key in visited_pieces )
					&& adjacency.position_key != assuming_piece_moved_position_key ) {
						visited_pieces[ adjacency.position_key ] = true;
						pieces_to_visit_next.push( adjacency.position );
					}
				});
			});
			pieces_to_visit = pieces_to_visit_next;
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

exports.origin = origin;

exports.create = create;
exports.can_slide_lookup_table = can_slide_lookup_table;

