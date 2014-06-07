var _ = require("lodash");
var Piece = require("../../../core/domain/piece");
var Position = require("../../../core/domain/position");
var Board = require("../../../core/domain/board");

exports["test place_piece"] = function( assert ) {
	var board;

	board = Board.create();
	board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( 0, 0, 0 ));
	assert.ok(
		_.keys(board.pieces).length == 1,
		"expected 1 piece on the board" )
}

exports["test move_piece"] = function( assert ) {
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

exports["test lookup_piece"] = function( assert ) {
}

exports["test lookup_topmost_piece"] = function( assert ) {
}

exports["test lookup_coplanar_adjacent_pieces"] = function( assert ) {
}

exports["test lookup_piece_atop"] = function( assert ) {
}

exports["test lookup_free_spaces"] = function( assert ) {
	var board, free_spaces;

	board = Board.create();
	board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( 0, 0, 0 ));
	free_spaces = board.lookup_free_spaces();
	assert.ok(
		_.difference( 
			_.keys( free_spaces ), 
			[ "-2,0,0", "-1,1,0", "1,1,0", "2,0,0", "1,-1,0", "-1,-1,0" ]
		).length == 0,
		"free spaces found exactly match those expected" );
}

if( module == require.main )
	require("test").run( exports );
