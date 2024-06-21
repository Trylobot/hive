var _ = require("lodash");
var util = require("./domain/util");
var Piece = require("../core/domain/piece");
var Position = require("../core/domain/position");
var Board = require("../core/domain/board");

exports["test board place_piece"] = function( assert ) {
	var board;

	board = Board.create();
	board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( 0, 0 ));
	assert.equal(
		_.keys( board.pieces ).length,
		1,
		"expected 1 piece on the board" )
}

exports["test board move_piece"] = function( assert ) {
	var board, piece;

	board = Board.create();
	board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( 0, 0 ));
	board.place_piece( Piece.create( "Black", "Queen Bee" ), Position.create( 1, 1 ));
	board.move_piece( Position.create( 1, 1 ), Position.create( -1, 1 ));
	piece = board.lookup_piece( Position.create( -1, 1 ));
	assert.ok(
		piece.color == "Black" && piece.type == "Queen Bee",
		"expected to find moved piece at specified position" );
}

exports["test board remove_piece"] = function( assert ) {
	var board;

	board = Board.create();
	board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( 0, 0 ));
	assert.ok( _.keys( board.pieces ).length == 1, "one piece on the board" );
	board.remove_piece( Position.create( 0, 0 ));
	assert.ok( _.keys( board.pieces ).length == 0, "no pieces on the board" );
}

exports["test board count_pieces"] = function( assert ) {
	var board, count;

	board = Board.create();
	count = board.count_pieces();
	assert.equal( count, 0, "expected 0 pieces" );
	board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( 0, 0 ));
	board.place_piece( Piece.create( "White", "Spider" ), Position.create( 1, 1 ));
	board.place_piece( Piece.create( "White", "Spider" ), Position.create( 1, 1 ));
	count = board.count_pieces();
	assert.equal( count, 3, "expected 3 pieces" );
	count = board.count_pieces( "White", undefined );
	assert.equal( count, 3, "expected 3 pieces" );
	count = board.count_pieces( undefined, "Queen Bee" );
	assert.equal( count, 1, "expected 1 piece" );
	count = board.count_pieces( undefined, "Spider" );
	assert.equal( count, 2, "expected 2 pieces" );
	count = board.count_pieces( "Black", "Spider" );
	assert.equal( count, 0, "expected 0 pieces" );
}

exports["test board search_pieces"] = function( assert ) {
	var board, results;

	board = Board.create();
	results = board.search_pieces();
	assert.equal( results.length, 0, "expected 0 pieces" );
	board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( 0, 0 ));
	board.place_piece( Piece.create( "White", "Spider" ), Position.create( 1, 1 ));
	board.place_piece( Piece.create( "White", "Beetle" ), Position.create( 1, 1 ));
	results = board.search_pieces();
	assert.equal( results.length, 3, "expected 3 pieces" );
	results = board.search_pieces( "White", undefined );
	assert.equal( results.length, 3, "expected 3 pieces" );
	results = board.search_pieces( undefined, "Queen Bee" );
	assert.equal( results.length, 1, "expected 1 piece" );
	results = board.search_pieces( undefined, "Spider" );
	assert.equal( results.length, 1, "expected 1 piece" );
	results = board.search_pieces( undefined, "Beetle" );
	assert.equal( results.length, 1, "expected 1 piece" );
	results = board.search_pieces( "Black", "Spider" );
	assert.equal( results.length, 0, "expected 0 pieces" );
}

exports["test board search_top_pieces"] = function( assert ) {
	var board, results;

	board = Board.create();
	results = board.search_top_pieces();
	assert.equal( results.length, 0, "expected 0 pieces" );
	board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( 0, 0 ));
	board.place_piece( Piece.create( "White", "Spider" ), Position.create( 1, 1 ));
	board.place_piece( Piece.create( "White", "Beetle" ), Position.create( 1, 1 ));
	results = board.search_top_pieces();
	assert.equal( results.length, 2, "expected 2 pieces" );
	results = board.search_top_pieces( "White", undefined );
	assert.equal( results.length, 2, "expected 2 pieces" );
	results = board.search_top_pieces( undefined, "Queen Bee" );
	assert.equal( results.length, 1, "expected 1 piece" );
	results = board.search_top_pieces( undefined, "Spider" );
	assert.equal( results.length, 0, "expected 0 pieces" );
	results = board.search_top_pieces( undefined, "Beetle" );
	assert.equal( results.length, 1, "expected 1 piece" );
	results = board.search_top_pieces( "Black", "Spider" );
	assert.equal( results.length, 0, "expected 0 pieces" );
}

exports["test board lookup_occupied_positions, lookup_occupied_position_keys"] = function( assert ) {
	var board, occupied_positions;

	board = Board.create();
	board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( 0, 0 ));
	occupied_positions = board.lookup_occupied_positions();
	assert.ok( occupied_positions[0].is_equal( Position.create( 0, 0 )), "origin is occupied" );
}

exports["test board lookup_piece_stack, lookup_piece_stack_by_key"] = function( assert ) {
	var board, stack;

	board = Board.create();
	board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( 0, 0 ));
	board.place_piece( Piece.create( "Black", "Beetle" ), Position.create( 0, 0 ));
	board.place_piece( Piece.create( "White", "Beetle" ), Position.create( 0, 0 ));
	board.place_piece( Piece.create( "Black", "Beetle" ), Position.create( 0, 0 ));
	board.place_piece( Piece.create( "White", "Beetle" ), Position.create( 0, 0 ));
	stack = board.lookup_piece_stack( Position.create( 0, 0 ));
	assert.ok( stack.length === 5 && stack[4].color === "White" && stack[4].type === "Beetle", "stack contents are correct" );

}

exports["test board lookup_piece_stack_height, lookup_piece_stack_height_by_key"] = function( assert ) {
	var board, stack_height;

	board = Board.create();
	board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( 0, 0 ));
	board.place_piece( Piece.create( "Black", "Beetle" ), Position.create( 0, 0 ));
	board.place_piece( Piece.create( "White", "Beetle" ), Position.create( 0, 0 ));
	board.place_piece( Piece.create( "Black", "Beetle" ), Position.create( 0, 0 ));
	board.place_piece( Piece.create( "White", "Beetle" ), Position.create( 0, 0 ));
	stack_height = board.lookup_piece_stack_height( Position.create( 0, 0 ));
	assert.ok( stack_height === 5, "stack height is correct" );
}

exports["test board lookup_piece, lookup_piece_by_key"] = function( assert ) {
	var board, piece;

	board = Board.create();

	piece = board.lookup_piece( Position.create( 0, 0 ));
	assert.ok(
		typeof piece === "undefined",
		"Nothing is on top" );

	board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( 0, 0 ));
	piece = board.lookup_piece( Position.create( 0, 0 ));
	assert.ok(
		piece.color == "White" && piece.type == "Queen Bee",
		"White Queen Bee is on top" );

	board.place_piece( Piece.create( "Black", "Beetle" ), Position.create( 0, 0 ));
	piece = board.lookup_piece( Position.create( 0, 0 ));
	assert.ok(
		piece.color == "Black" && piece.type == "Beetle",
		"Black Beetle is on top" );

	board.place_piece( Piece.create( "White", "Beetle" ), Position.create( 0, 0 ));
	piece = board.lookup_piece( Position.create( 0, 0 ));
	assert.ok(
		piece.color == "White" && piece.type == "Beetle",
		"White Beetle is on top" );

	board.place_piece( Piece.create( "Black", "Beetle" ), Position.create( 0, 0 ));
	piece = board.lookup_piece( Position.create( 0, 0 ));
	assert.ok(
		piece.color == "Black" && piece.type == "Beetle",
		"Black Beetle is on top" );
}

exports["test board lookup_piece_at_height"] = function( assert ) {
	var board, piece;

	board = Board.create();
	board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( 0, 0 ));
	board.place_piece( Piece.create( "Black", "Beetle" ), Position.create( 0, 0 ));
	board.place_piece( Piece.create( "White", "Beetle" ), Position.create( 0, 0 ));
	board.place_piece( Piece.create( "Black", "Beetle" ), Position.create( 0, 0 ));
	board.place_piece( Piece.create( "White", "Beetle" ), Position.create( 0, 0 ));
	piece = board.lookup_piece_at_height( Position.create( 0, 0 ), 4 );
	assert.ok( piece.color == "White" && piece.type == "Beetle", "piece is correct" );
}

exports["test board lookup_adjacent_positions"] = function( assert ) {
	var board, adjacent_pieces;

	board = Board.create();
	board.place_piece( Piece.create( "White", "Grasshopper" ), Position.create( 1, 1 ));
	board.place_piece( Piece.create( "White", "Spider" ), Position.create( 0, 0 ));
	board.place_piece( Piece.create( "Black", "Soldier Ant" ), Position.create( 3, 1 ));
	board.place_piece( Piece.create( "Black", "Spider" ), Position.create( -1, -1 ));
	adjacent_pieces = board.lookup_adjacent_positions( Position.create( 1, 1 ));
	assert.equal(
		_.reduce( adjacent_pieces, function( sum, adjacency ) { return sum + (!!adjacency.contents ? 1 : 0); }, 0 ),
		2,
		"number of occupied adjacencies match expected" );
}

exports["test board lookup_adjacent_slide_positions"] = function( assert ) {
	var board;

	board = Board.create();
	board.place_piece( Piece.create( "Black", "Spider" ), Position.create( 0, 0 ));
	board.place_piece( Piece.create( "White", "Beetle" ), Position.create( 0, 0 ));
	board.place_piece( Piece.create( "Black", "Spider" ), Position.create( 1, 1 ));
	board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( 3, 1 ));
	board.place_piece( Piece.create( "Black", "Queen Bee" ), Position.create( -1, -1 ));
	board.place_piece( Piece.create( "White", "Soldier Ant" ), Position.create( 1, -1 ));
	board.place_piece( Piece.create( "Black", "Soldier Ant" ), Position.create( 3, -1 ));
	// what if I wanted to move the Black Queen?
	var adjacent_slide_positions = board.lookup_adjacent_slide_positions( Position.create( -1, -1 ));
	assert.equal(
		JSON.stringify( adjacent_slide_positions ),
		JSON.stringify( [
			{ row: -2, col: 0 },
			{ row: 0, col: -2 }
		]),
		"slide positions are correct" );
}

exports["test board lookup_adjacent_climb_positions"] = function( assert ) {
	var board, positions;

	board = Board.create();
	board.place_piece( Piece.create( "Black", "Spider" ), Position.create( 0, 0 ));
	board.place_piece( Piece.create( "Black", "Spider" ), Position.create( 1, 1 ));
	board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( 3, 1 ));
	board.place_piece( Piece.create( "Black", "Beetle" ), Position.create( -1, -1 ));
	board.place_piece( Piece.create( "Black", "Queen Bee" ), Position.create( 2, -2 ));
	board.place_piece( Piece.create( "White", "Soldier Ant" ), Position.create( 1, -1 ));
	board.place_piece( Piece.create( "Black", "Soldier Ant" ), Position.create( 3, -1 ));
	positions = Position.encode_all( board.lookup_adjacent_climb_positions( Position.create( -1, -1 )));
	assert.ok( positions.length == 2
		&& _.contains( positions, "0,0" )
		&& _.contains( positions, "1,-1" ),
		"climb positions are correct" );
}

exports["test board lookup_occupied_adjacencies"] = function( assert ) {
	var board, adjacencies;

	board = Board.create();
	board.place_piece( Piece.create( "Black", "Spider" ), Position.create( 0, 0 ));
	board.place_piece( Piece.create( "Black", "Spider" ), Position.create( 1, 1 ));
	board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( 3, 1 ));
	board.place_piece( Piece.create( "Black", "Beetle" ), Position.create( -1, -1 ));
	board.place_piece( Piece.create( "Black", "Queen Bee" ), Position.create( 2, -2 ));
	board.place_piece( Piece.create( "White", "Soldier Ant" ), Position.create( 1, -1 ));
	board.place_piece( Piece.create( "Black", "Soldier Ant" ), Position.create( 3, -1 ));
	adjacencies = Position.encode_all( board.lookup_occupied_adjacencies( Position.create( -1, -1 )));
	assert.ok( adjacencies.length == 2
		&& _.contains( adjacencies, "0,0" )
		&& _.contains( adjacencies, "1,-1" ),
		"adjacencies are correct" );
}

exports["test board lookup_slide_destinations_within_range"] = function( assert ) {
	var board;

	board = Board.create();
	board.place_piece( Piece.create( "Black", "Spider" ), Position.create( 0, 0 ));
	board.place_piece( Piece.create( "White", "Beetle" ), Position.create( 0, 0 ));
	board.place_piece( Piece.create( "Black", "Spider" ), Position.create( 1, 1 ));
	board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( 3, 1 ));
	board.place_piece( Piece.create( "Black", "Queen Bee" ), Position.create( -1, -1 ));
	board.place_piece( Piece.create( "White", "Soldier Ant" ), Position.create( 1, -1 ));
	board.place_piece( Piece.create( "Black", "Soldier Ant" ), Position.create( 3, -1 ));
	
	// Queen Bee style
	var slide_destinations = board.lookup_slide_destinations_within_range( Position.create( -1, -1 ), 1, 1 );
	var slide_destinations_keys = _.keys( slide_destinations );
	assert.equal(
		slide_destinations_keys.length,
		2,
		"there are the correct number of positions (Queen Bee style)" );
	assert.deepEqual(
		_.difference(
			slide_destinations_keys,
			[ "-2,0", "0,-2" ]
		),
		[],
		"the expected positions are present (Queen Bee style)" );

	// Spider style
	var slide_destinations = board.lookup_slide_destinations_within_range( Position.create( -1, -1 ), 3, 3 );
	var slide_destinations_keys = _.keys( slide_destinations );
	assert.equal(
		slide_destinations_keys.length,
		2,
		"there are the correct number of positions (Spider style)" );
	assert.deepEqual(
		_.difference(
			slide_destinations_keys,
			[ "0,2", "4,-2" ]
		),
		[],
		"the expected positions are present (Spider style)" );

	// Soldier Ant style
	var slide_destinations = board.lookup_slide_destinations_within_range( Position.create( -1, -1 ), 1, Infinity );
	var slide_destinations_keys = _.keys( slide_destinations );
	assert.equal(
		slide_destinations_keys.length,
		11,
		"there are the correct number of positions (Soldier Ant style)" );
	assert.deepEqual(
		_.difference(
			slide_destinations_keys,
			[ "-2,0", "-1,1", "0,2", "2,2", "4,2", "5,1", "4,0", "5,-1", "4,-2", "2,-2", "0,-2" ]
		),
		[],
		"the expected positions are present (Soldier Ant style)" );

}

exports["test board lookup_free_spaces"] = function( assert ) {
	var board, free_spaces;

	board = Board.create();
	board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( 0, 0 ));
	free_spaces = board.lookup_free_spaces();
	assert.deepEqual(
		_.difference(
			_.keys( free_spaces ),
			[ "-2,0", "-1,1", "1,1", "2,0", "1,-1", "-1,-1" ]
		),
		[],
		"free spaces (unfiltered) found exactly match those expected" );

	board = Board.create();
	board.place_piece( Piece.create( "Black", "Spider" ), Position.create( 0, 0 ));
	board.place_piece( Piece.create( "White", "Beetle" ), Position.create( 0, 0 ));
	board.place_piece( Piece.create( "Black", "Spider" ), Position.create( 1, 1 ));
	board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( 3, 1 ));
	board.place_piece( Piece.create( "Black", "Queen Bee" ), Position.create( -1, -1 ));
	
	free_spaces = board.lookup_free_spaces();
	assert.deepEqual(
		_.difference(
			_.keys( free_spaces ),
			[ "-3,-1", "-2,0", "-1,1", "0,2", "2,2", "4,2", "5,1", "4,0", "2,0", "1,-1", "0,-2", "-2,-2" ]
		),
		[],
		"free spaces (unfiltered) found exactly match those expected" );
	
	free_spaces = board.lookup_free_spaces( "White" );
	assert.deepEqual(
		_.difference(
			_.keys( free_spaces ),
			[ "4,2", "5,1", "4,0" ]
		),
		[],
		"free spaces (White) found exactly match those expected" );
	
	free_spaces = board.lookup_free_spaces( "Black" );
	assert.deepEqual(
		_.difference(
			_.keys( free_spaces ),
			[ "-3,-1", "0,2", "0,-2", "-2,-2" ]
		),
		[],
		"free spaces (Black) found exactly match those expected" );
}

exports["test board find_free_space_in_direction"] = function( assert ) {
	var board, free_space;

	board = Board.create();
	board.place_piece( Piece.create( "Black", "Spider" ), Position.create( 0, 0 ));
	board.place_piece( Piece.create( "Black", "Spider" ), Position.create( 1, 1 ));
	board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( 3, 1 ));
	board.place_piece( Piece.create( "Black", "Grasshopper" ), Position.create( -1, -1 ));
	board.place_piece( Piece.create( "Black", "Queen Bee" ), Position.create( 2, -2 ));
	board.place_piece( Piece.create( "White", "Soldier Ant" ), Position.create( 1, -1 ));
	board.place_piece( Piece.create( "Black", "Soldier Ant" ), Position.create( 3, -1 ));
	free_space = board.find_free_space_in_direction( Position.create( -1, -1 ), "4 o'clock" );
	assert.ok( Position.create( 2, 2 ).is_equal( free_space ), "free space found correctly" );
}

exports["test board check_contiguity"] = function( assert ) {
	var board;

	board = Board.create();
	assert.ok( board.check_contiguity(), "empty board should be contiguous" );
	board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( 0, 0 ));
	assert.ok( board.check_contiguity(), "board with 1 piece should be contiguous" );
	board.place_piece( Piece.create( "Black", "Spider" ), Position.create( 1, 1 ));
	assert.ok( board.check_contiguity(), "board should remain contiguous" );
	board.place_piece( Piece.create( "White", "Spider" ), Position.create( -2, 0 ));
	assert.ok( board.check_contiguity(), "board should remain contiguous" );
	assert.ok( board.check_contiguity( Position.create( 1, 1 )), "board should confirm that it remains contiguous if we were to move the Black Spider" );
	assert.ok( board.check_contiguity( Position.create( -2, 0 )), "board should confirm that it remains contiguous if we were to move the White Spider" );
	assert.equal( board.check_contiguity( Position.create( 0, 0 )), false, "board should confirm that contiguity is BROKEN if we move the White Queen Bee" );

	board = Board.create();
	board.place_piece( Piece.create( "Black", "Spider" ), Position.create( 0, 0 ));
	board.place_piece( Piece.create( "White", "Beetle" ), Position.create( 0, 0 ));
	board.place_piece( Piece.create( "Black", "Spider" ), Position.create( 1, 1 ));
	board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( 3, 1 ));
	board.place_piece( Piece.create( "Black", "Queen Bee" ), Position.create( -1, -1 ));
	// board is of course contiguous initially ...
	var is_contiguous = board.check_contiguity();
	assert.equal(
		is_contiguous,
		true,
		"board should confirm that the board is initially contiguous" ); // pieces not on the bottom layer are being included
	// but what would happen if I moved the Black Spider at (1, 1, 0)?
	var is_contiguous = board.check_contiguity( Position.create( 1, 1 ));
	assert.equal(
		is_contiguous,
		false,
		"board should report contiguity violation in the case of moving the Black Spider" );

	board = Board.create();
	board.place_piece( Piece.create( "White", "Spider" ), Position.create( 0, 0 ));
	board.place_piece( Piece.create( "Black", "Spider" ), Position.create( -2, 0 ));
	board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( 1, 1 ));
	board.place_piece( Piece.create( "Black", "Beetle" ), Position.create( -3, 1 ));
	var is_contiguous = board.check_contiguity( Position.create( 1, 1 ));
	assert.equal(
		is_contiguous,
		true,
		"board should confirm that moving the White Queen Bee would not break contiguity" );
}

exports["test board can_slide_lookup_table"] = function( assert ) {
	var pass = true;
	_.forEach( Board.can_slide_lookup_table, function( value, key ) {
		var rotated_key = key;
		var rotated_value = value;
		for( var i = 0; i < 5; ++i ) {
			var rotated_key = util.cycle_chars( rotated_key, 1 );
			var rotated_value = util.cycle_chars( rotated_value, 1 );
			var actual_rotated_value = Board.can_slide_lookup_table[ rotated_key ];
			if( actual_rotated_value != rotated_value ) {
				pass = false;
				assert.fail({ message: "if ["+key+"]=>["+value+"] then ["+rotated_key+"]=>["+rotated_value+"], but ["+rotated_key+"]=>["+actual_rotated_value+"]" });
			}
		}
	});
	if( pass )
		assert.pass( "all tests passed" );
}

exports["test board find_unique_paths_matching_conditions"] = function( assert ) {
	var board, paths, destinations;

	board = Board.create();
	board.place_piece( Piece.create( "Black", "Spider" ), Position.create( 0, 0 ));
	board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( 1, 1 ));

	paths = board.find_unique_paths_matching_conditions( Position.create( 0, 0 ), 3, 0 ); // move like a spider
	destinations = Position.encode_all( paths.destinations );
	assert.ok( destinations.length == 1 && _.contains( destinations, "2,2" ), "destinations correct" );

	paths = board.find_unique_paths_matching_conditions( Position.create( 0, 0 ), 2, [ 1, 0 ] ); // move like a non-existent ladybug-like piece, distance == 2
	destinations = Position.encode_all( paths.destinations );
	assert.ok( destinations.length == 5 
		&& _.contains( destinations, "-1,1" )
		&& _.contains( destinations, "0,2" )
		&& _.contains( destinations, "2,2" )
		&& _.contains( destinations, "3,1" )
		&& _.contains( destinations, "2,0" ),
		"destinations correct" );
}

exports["test board parse_range"] = function( assert ) {
	var range;

	range = Board.parse_range( 3 );
	assert.ok( util.json_equality( range, { min: 3, max: 3 }), "range specifier should parse correctly" );
	
	range = Board.parse_range({ min: 1, max: Infinity });
	assert.ok( util.json_equality( range, { min: 1, max: Infinity }), "range specifier should parse correctly" );
}

exports["test board parse_height_range_specification"] = function( assert ) {
	var range, height_range_specification;

	range = Board.parse_height_range_specification( 0, 3 );
	assert.equal( JSON.stringify( range ), JSON.stringify([
		undefined,
		{ min: 0, max: 0 }, 
		{ min: 0, max: 0 }, 
		{ min: 0, max: 0 }
	]), "height range array should parse correctly" );

	range = Board.parse_height_range_specification({
		"*": 5,
		"2-3": { min: 0, max: 1 },
		"2,4,5": 2
	}, 5 );
	assert.equal( JSON.stringify( range ), JSON.stringify([
		undefined,
		{ min: 5, max: 5 },
		{ min: 2, max: 2 },
		{ min: 0, max: 1 },
		{ min: 2, max: 2 },
		{ min: 2, max: 2 }
	]), "height range array should parse correctly" );
}


if( module == require.main )
	require("test").run( exports );
