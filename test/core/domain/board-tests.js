var _ = require("lodash");
_(global).extend(require("../../../core/domain/util"));
var Piece = require("../../../core/domain/piece");
var Position = require("../../../core/domain/position");
var Board = require("../../../core/domain/board");

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

exports["test board lookup_piece"] = function( assert ) {
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

exports["test board count_pieces"] = function( assert ) {
	
}

exports["test board search_pieces"] = function( assert ) {
	
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

exports["test board lookup_occupied_adjacencies"] = function( assert ) {
	
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

exports["test board find_free_space_in_direction"] = function( assert ) {
	
}

exports["test board check_contiguity"] = function( assert ) {
	var board;

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
		"board should confirm that the board WOULD be contiguous" ); // pieces not on the bottom layer are being included
	// but what would happen if I moved the Black Spider at (1, 1, 0)?
	var is_contiguous = board.check_contiguity( Position.create( 1, 1 ));
	assert.equal(
		is_contiguous,
		false,
		"board should confirm that the board would NOT BE contiguous" );
}

exports["test board can_slide_lookup_table"] = function( assert ) {
	var pass = true;
	_.forEach( Board.can_slide_lookup_table, function( value, key ) {
		var rotated_key = key;
		var rotated_value = value;
		for( var i = 0; i < 5; ++i ) {
			var rotated_key = rotated_key.rotate( 1 );
			var rotated_value = rotated_value.rotate( 1 );
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

if( module == require.main )
	require("test").run( exports );
