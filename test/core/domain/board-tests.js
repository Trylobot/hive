var _ = require("lodash");
var Piece = require("../../../core/domain/piece");
var Position = require("../../../core/domain/position");
var Board = require("../../../core/domain/board");

exports["test board place_piece"] = function( assert ) {
	var board;

	board = Board.create();
	board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( 0, 0, 0 ));
	assert.equal(
		_.keys(board.pieces).length,
		1,
		"expected 1 piece on the board" )
}

exports["test board move_piece, lookup_piece"] = function( assert ) {
	var board, piece;

	board = Board.create();
	board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( 0, 0, 0 ));
	board.place_piece( Piece.create( "Black", "Queen Bee" ), Position.create( 1, 1, 0 ));
	board.move_piece( Position.create( 1, 1, 0 ), Position.create( -1, 1, 0 ));
	piece = board.lookup_piece( Position.create( -1, 1, 0 ));
	assert.ok(
		piece.color == Piece.color_id( "Black" ) && piece.type == Piece.type_id( "Queen Bee" ),
		"expected to find moved piece" );
}

exports["test board lookup_topmost_piece"] = function( assert ) {
	var board, piece;

	board = Board.create();

	piece = board.lookup_topmost_piece( Position.create( 0, 0, 0 ));
	assert.ok(
		typeof piece === "undefined",
		"Nothing is on top" );

	board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( 0, 0, 0 ));
	piece = board.lookup_topmost_piece( Position.create( 0, 0, 0 ));
	assert.ok(
		piece.color == Piece.color_id( "White" ) && piece.type == Piece.type_id( "Queen Bee" ),
		"White Queen Bee is on top" );

	board.place_piece( Piece.create( "Black", "Beetle" ), Position.create( 0, 0, 1 ));
	piece = board.lookup_topmost_piece( Position.create( 0, 0, 0 ));
	assert.ok(
		piece.color == Piece.color_id( "Black" ) && piece.type == Piece.type_id( "Beetle" ),
		"Black Beetle is on top" );

	board.place_piece( Piece.create( "White", "Beetle" ), Position.create( 0, 0, 2 ));
	piece = board.lookup_topmost_piece( Position.create( 0, 0, 0 ));
	assert.ok(
		piece.color == Piece.color_id( "White" ) && piece.type == Piece.type_id( "Beetle" ),
		"White Beetle is on top" );

	board.place_piece( Piece.create( "Black", "Beetle" ), Position.create( 0, 0, 3 ));
	piece = board.lookup_topmost_piece( Position.create( 0, 0, 0 ));
	assert.ok(
		piece.color == Piece.color_id( "Black" ) && piece.type == Piece.type_id( "Beetle" ),
		"Black Beetle is on top" );
}

exports["test board lookup_coplanar_adjacent_positions"] = function( assert ) {
	var board, adjacent_pieces;

	board = Board.create();
	board.place_piece( Piece.create( "White", "Grasshopper" ), Position.create( 1, 1, 0 ));
	board.place_piece( Piece.create( "White", "Spider" ), Position.create( 0, 0, 0 ));
	board.place_piece( Piece.create( "Black", "Soldier Ant" ), Position.create( 3, 1, 0 ));
	board.place_piece( Piece.create( "Black", "Spider" ), Position.create( -1, -1, 0 ));
	adjacent_pieces = board.lookup_coplanar_adjacent_positions( Position.create( 1, 1, 0 ));
	assert.equal(
		_.reduce( adjacent_pieces, function( sum, adjacency ) { return sum + (adjacency.contents ? 1 : 0); }, 0 ),
		2,
		"number of occupied adjacencies match expected" );
}

exports["test board lookup_piece_atop"] = function( assert ) {
	var board, piece;

	board = Board.create();
	board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( 0, 0, 0 ));
	board.place_piece( Piece.create( "Black", "Beetle" ), Position.create( 0, 0, 1 ));
	piece = board.lookup_piece_atop( Position.create( 0, 0, 0 ));
	assert.ok(
		piece.color == Piece.color_id( "Black" ) && piece.type == Piece.type_id( "Beetle" ),
		"Black Beetle is atop White Queen Bee" );
}

exports["test board lookup_free_spaces"] = function( assert ) {
	var board, free_spaces;

	board = Board.create();
	board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( 0, 0, 0 ));
	free_spaces = board.lookup_free_spaces();
	assert.equal(
		JSON.stringify( _.difference( _.keys( free_spaces ), [
			"-2,0,0",
			"-1,1,0",
			"1,1,0",
			"2,0,0",
			"1,-1,0",
			"-1,-1,0"
		])),
		JSON.stringify( [] ),
		"free spaces (unfiltered) found exactly match those expected" );

	board = Board.create();
	board.place_piece( Piece.create( "Black", "Spider" ), Position.create( 0, 0, 0 ));
	board.place_piece( Piece.create( "White", "Beetle" ), Position.create( 0, 0, 1 ));
	board.place_piece( Piece.create( "Black", "Spider" ), Position.create( 1, 1, 0 ));
	board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( 3, 1, 0 ));
	board.place_piece( Piece.create( "Black", "Queen Bee" ), Position.create( -1, -1, 0 ));
	
	free_spaces = board.lookup_free_spaces();
	assert.equal(
		JSON.stringify( _.difference( _.keys( free_spaces ), [
			"-3,-1,0", 
			"-2,0,0", 
			"-1,1,0", 
			"0,2,0", 
			"2,2,0", 
			"4,2,0", 
			"5,1,0", 
			"4,0,0", 
			"2,0,0", 
			"1,-1,0", 
			"0,-2,0", 
			"-2,-2,0"
		])),
		JSON.stringify( [] ),
		"free spaces (unfiltered) found exactly match those expected" );
	
	free_spaces = board.lookup_free_spaces( "White" );
	assert.equal(
		JSON.stringify( _.difference( _.keys( free_spaces ), [
			"4,2,0", 
			"5,1,0", 
			"4,0,0"
		])),
		JSON.stringify( [] ),
		"free spaces (White) found exactly match those expected" );
	
	free_spaces = board.lookup_free_spaces( "Black" );
	assert.equal(
		JSON.stringify( _.difference( _.keys( free_spaces ), [
			"-3,-1,0", 
			"0,2,0", 
			"0,-2,0", 
			"-2,-2,0"
		])),
		JSON.stringify( [] ),
		"free spaces (Black) found exactly match those expected" );
}

exports["test board check_contiguity"] = function( assert ) {
	var board;

	board = Board.create();
	board.place_piece( Piece.create( "Black", "Spider" ), Position.create( 0, 0, 0 ));
	board.place_piece( Piece.create( "White", "Beetle" ), Position.create( 0, 0, 1 ));
	board.place_piece( Piece.create( "Black", "Spider" ), Position.create( 1, 1, 0 ));
	board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( 3, 1, 0 ));
	board.place_piece( Piece.create( "Black", "Queen Bee" ), Position.create( -1, -1, 0 ));
	// board is of course contiguous initially ...
	var is_contiguous = board.check_contiguity();
	assert.equal(
		is_contiguous,
		true,
		"board should confirm that the board WOULD be contiguous" );
	// but what would happen if I moved the Black Spider at (1, 1, 0)?
	var is_contiguous = board.check_contiguity( Position.create( 1, 1, 0 ));
	assert.equal(
		is_contiguous,
		false,
		"board should confirm that the board would NOT BE contiguous" );
}

exports["test board lookup_free_position_chain"] = function( assert ) {

}

if( module == require.main )
	require("test").run( exports );
