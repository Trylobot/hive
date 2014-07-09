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
		return Position.decode_all( board.lookup_occupied_position_keys() );
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
	board.lookup_adjacent_climb_positions = function( position, position_is_self ) {
		position_is_self = (typeof position_is_self === "undefined") ? true : false; // assumed true if not explicitly overridden
		var position_list = [];
		var self_height = board.lookup_piece_stack_height( position );
		if( position_is_self )
			self_height--;
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
	// search the board, given a starting position
	//   for paths a certain distance away in tiles [distance_range.min, distance_range.max]
	//   where each tile in the path matches a semantic specification object (further explanation below)
	//   and each path returned corresponds to a different end position (some paths to that end position may therefore be omitted)
	//   and that each path contains no backtracking.
	// the search algorithm used is breadth-first search
	// ---
	// range  (object)   applies to "distance_range" and "height_range"
	//   min: (number)     minimum boundary (inclusive)
	//   max: (number)     maximum boundary (inclusive)
	// ---
	// range  (number)   minimum AND maximum boundary (inclusive)
	// ---
	// height_range_specification  (object; dynamic keys)
	//   <key>: (range)    key is a comma-separated list of distances for which this height range applies. 
	//   [... more ]         each item in this key-list may be a specific distance, or it may be a range in the form of a hyphen-separated range pair (inclusive).
	//                     a key of '*' provides a default height range to fall back upon
	//                     any distance for which the height range is completely unspecified by any method
	//                       will result in a range of [0, Infinity]
	// ---
	// height_range_specification  (number)     minimum AND maximum height (all distances, inclusive)
	// 
	board.find_unique_paths_matching_conditions = function( start_position, distance_range, height_range_specification ) {
		var result = {
			paths: {}, // will include one path per destination, where the key is the encoded destination position
			destinations: [] // each destination will be unique
		};
		// argument normalization
		distance_range = parse_range( distance_range );
		height_range_specification = parse_height_range_specification( height_range_specification, distance_range.max );
		if( distance_range.min == Infinity ) // garbage in?
			return result; // garbage out.
		// prepare breadth-first search, using linked lists, sharing common sub-lists, and a common root node
		var root_path_node = new Path_Node( start_position, undefined );
		var branch_nodes = []; // nodes that will be searched in next iteration, resulting new branch nodes added here, and original node moved to trunk_nodes
		//                        if no new nodes result, original node is moved to leaf_nodes (terminal nodes that need not be further explored)
		var leaf_nodes = []; // paths that have been explored fully and terminated, potentially before max distance reached
		branch_nodes.push( root_path_node );
		// perform search
		for( var distance = 1; distance <= distance_range.max; ++distance ) {
			// useful debugging statement:
			//   _.map( branch_nodes, function( node ){ return Position.encode_all( node.trace_back_to_root( root_path_node )).join(" --> "); });
			var height_range = height_range_specification[ distance ];
			if( branch_nodes.length == 0 )
				break; // no more branch nodes to explore; all nodes are presumably leaf nodes, but distance max has not been reached; it could be infinity, or there might not be any valid moves
			_.forEach( _.clone( branch_nodes ), function( branch_node ) {
				var branch_node_height = board.lookup_piece_stack_height( branch_node.position );
				var branch_node_position_is_self = false;
				if( start_position.is_equal( branch_node.position )) {
					--branch_node_height;
					branch_node_position_is_self = true;
				}
				var adjacencies = [];
				// the following distinction is necessary because restrictions are slightly different for "slide" vs. "climb"
				if( branch_node_height == 0 && height_range.min == 0 )
					adjacencies.push( board.lookup_adjacent_slide_positions( branch_node.position, start_position ));
				if( branch_node_height > 0 || height_range.max >= 1 )
					adjacencies.push( board.lookup_adjacent_climb_positions( branch_node.position, branch_node_position_is_self ));
				adjacencies = _.filter( _.flatten( adjacencies ), function( adjacent_position ) {
					var adjacent_position_key = adjacent_position.encode();
					// height-range check against height range specification for the current distance (as measured from the start_position)
					var height = board.lookup_piece_stack_height( adjacent_position );
					if( height < height_range.min 
					||  height > height_range.max ) {
						// this position is outside of the valid height range specified
						return false;
					}
					// anti-backtracking check (potentially expensive)
					var cursor = branch_node;
					while( cursor ) { // attempting to scan root's parent should terminate the loop
						if( adjacent_position.is_equal( cursor.position ))
							return false; // path already contains this adjacent position, closer to the root; ignore it
						cursor = cursor.parent;
					}
					return true; // all checks pass
				});
				// there might not be any further adjacencies to explore for this leaf node.
				//   in which case it becomes a terminal node, not to be checked again.
				// if a node becomes terminal without reaching the minimum distance specified by distance_range,
				//   it will be omitted from the final output
				if( adjacencies.length > 0 ) {
					_.forEach( adjacencies, function( adjacent_position ) {
						branch_nodes.push( new Path_Node( adjacent_position, branch_node ));
					});
				}
				else { // length == 0
					leaf_nodes.push( branch_node );
				}
				// in no case should branch_node ever be scanned again
				_.pull( branch_nodes, branch_node );
			});
		}
		// all current branch nodes and leaf nodes are potentially valid path destinations
		// trace leaf nodes (having path_lengths within the caller's specified range) back to the root node
		//   result.paths (Object), result.destinations (Array)
		_.forEach( _.extend( {}, branch_nodes, leaf_nodes ), function( terminal_path_node ) {
			if( terminal_path_node.path_length < distance_range.min
			||  terminal_path_node.path_length > distance_range.max )
				return; // path not of sufficient length
			var path = terminal_path_node.trace_back_to_root( root_path_node );
			var destination_key = terminal_path_node.position.encode();
			result.paths[ destination_key ] = path;
		});
		_.forEach( result.paths, function( path, destination_key ) {
			result.destinations.push( Position.decode( destination_key ));
		})
		return result;
	}
	// -------------
	return board;
}

// supporting functions and types
function Path_Node( position, parent ) {
	this.position = position;
	this.position_key = position.encode();
	this.parent = parent;
	this.path_length = parent ? (1 + parent.path_length) : 0;
	//
	this.trace_back_to_root = function( root_node ) {
		var path = [ this.position ];
		var cursor = this;
		while( cursor != root_node ) {
			cursor = cursor.parent;
			if( cursor )
				path.push( cursor.position );
		}
		path.reverse();
		return path;
	}
}
function parse_range( range ) {
	if( typeof range === "number" )
		return { min: range, max: range };
	else if( typeof range === "object" )
		return { min: range.min, max: range.max };
}
function parse_height_range_specification( height_range_specification, max_distance ) {
	var height_range_for_distance = [ undefined ]; // index 0 is undefined because it means distance 0, which never needs to be specified
	// global defaults (no limits)
	var default_range = { 
		min: 0,
		max: Infinity
	};
	for( var i = 1; i <= max_distance; ++i )
		height_range_for_distance[ i ] = default_range;
	if( typeof height_range_specification === "number" ) {
		// single value given, use for all
		var range = { 
			min: height_range_specification, 
			max: height_range_specification
		};
		for( var i = 1; i <= max_distance; ++i )
			height_range_for_distance[ i ] = range;
	}
	else if( typeof height_range_specification === "object" ) {
		// default range
		if( '*' in height_range_specification )
			for( var i = 1; i <= max_distance; ++i )
				height_range_for_distance[ i ] = parse_range( height_range_specification['*'] );
		// specified ranges
		_.forEach( height_range_specification, function( height_range, distance_specifier_key ) {
			height_range = parse_range( height_range );
			if( typeof distance_specifier_key === "number" ) {
				height_range_for_distance[ distance_specifier_key + 1 ] = height_range;
			}
			else if( typeof distance_specifier_key === "string" ) {
				var items = distance_specifier_key.split(",");
				_.forEach( items, function( item ) {
					var range = item.split("-");
					if( range.length == 2 ) {
						for( var min = _.parseInt( range[0] ), max = _.parseInt( range[1] ), i = min; i <= max; ++i )
							height_range_for_distance[ i ] = height_range;
					}
					else if( range.length == 1 ) {
						height_range_for_distance[ _.parseInt( range[0] )] = height_range;
					}
				});
			}
		});
	}
	return height_range_for_distance;
}

// other data

// keys in this lookup table are specified as follows:
//   keys have one character for each of six directions
//   the sequence begins with 12 o'clock and proceeds clockwise
//   the characters represent the contents of the position one unit of distance away from an origin piece in the associated direction
//   the character will be "1" if that direction is occupied
//   the character will be "." if that direction is not occupied
// values in this lookup table are specified in precisely the same way as the lookup keys
//   except that they mean which directions are valid to slide into, instead of which ones are occupied
// TODO: is there a simple pattern here that I can exploit? is this table really necessary?
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
exports.can_slide_lookup_table = can_slide_lookup_table;

exports.create = create;
exports.Path_Node = Path_Node;
exports.parse_range = parse_range;
exports.parse_height_range_specification = parse_height_range_specification;

