var _ = require("lodash");
_(global).extend(require("../core/domain/util"));
var Piece = require("../core/domain/piece");
var Position = require("../core/domain/position");
var Board = require("../core/domain/board");
var Rules = require("../core/domain/rules");

exports["test rules lookup_possible_turns"] = function( assert ) {
	var board;

	// TODO: test that (0,0) is the only valid placement position for an empty board
	// TODO: test that placement can occur next to a piece of the opposite color when the board contains exactly one piece

	// TODO: test that Queen Bee cannot be placed on turn# 0 (first turn)
	
	// TODO: test that Queen Bee must be placed by turn# 3 (fourth turn)

	// TODO: test that movement turn cannot leave the board in the same state as it was originally
	//   this turn would be indistinguishable from a "pass" turn and is not allowed
	//   (when a player has legal moves)
}

exports["test rules check_force_queen_placement"] = function( assert ) {

}

exports["test rules check_if_game_over"] = function( assert ) {

}

exports["test rules check_allow_queen_placement"] = function( assert ) {

}

exports["test rules check_any_movement_allowed"] = function( assert ) {

}

exports["test rules find_valid_placement_positions"] = function( assert ) {
	
}

exports["test rules find_valid_movement"] = function( assert ) {

}

exports["test rules find_valid_movement_Queen_Bee"] = function( assert ) {

}

exports["test rules find_valid_movement_Beetle"] = function( assert ) {
	var game, board, valid_movement;

	board = Board.create();
	board.place_piece( Piece.create( "White", "Beetle" ), Position.create( 0, 0 ));
	board.place_piece( Piece.create( "Black", "Beetle" ), Position.create( -2, 0 ));
	valid_movement = Position.encode_all( Rules.find_valid_movement_Beetle( board, Position.create( 0, 0 )));
	assert.ok(
		valid_movement.length == 3 &&
		_.contains( valid_movement, "-2,0" ) &&
		_.contains( valid_movement, "-1,1" ) &&
		_.contains( valid_movement, "-1,-1" ),
		"Beetle able to perform basic slides and to climb up" );
	board.move_piece( Position.create( 0, 0 ), Position.create( -2, 0 ));
	valid_movement = Position.encode_all( Rules.find_valid_movement_Beetle( board, Position.create( -2, 0 )));
	assert.ok(
		valid_movement.length == 6 &&
		_.contains( valid_movement, "-4,0" ) &&
		_.contains( valid_movement, "-3,1" ) &&
		_.contains( valid_movement, "-1,1" ) &&
		_.contains( valid_movement, "0,0" ) &&
		_.contains( valid_movement, "-1,-1" ) &&
		_.contains( valid_movement, "-3,-1" ),
		"Beetle able to climb back down" );


	// test that beetle cannot climb up onto a piece through a "gate" (but can otherwise climb up)
	board = Board.create();
	board.place_piece( Piece.create( "White", "Beetle" ), Position.create( 0, 0 ));
	board.place_piece( Piece.create( "Black", "Spider" ), Position.create( -1, 1 ));
	board.place_piece( Piece.create( "Black", "Spider" ), Position.create( -1, -1 ));
	board.place_piece( Piece.create( "Black", "Beetle" ), Position.create( -1, -1 ));
	board.place_piece( Piece.create( "Black", "Queen Bee" ), Position.create( -2, 0 ));
	valid_movement = Position.encode_all( Rules.find_valid_movement_Beetle( board, Position.create( 0, 0 )));
	assert.ok(
		valid_movement.length == 5 &&
		_.contains( valid_movement, "1,-1" ) &&
		_.contains( valid_movement, "1,1" ) &&
		_.contains( valid_movement, "-1,1" ) &&
		_.contains( valid_movement, "-1,-1" ) &&
		_.contains( valid_movement, "-2,0" ),
		"Beetle able to climb up" );
	board.place_piece( Piece.create( "Black", "Beetle" ), Position.create( -1, 1 ));
	valid_movement = Position.encode_all( Rules.find_valid_movement_Beetle( board, Position.create( 0, 0 )));
	assert.ok(
		valid_movement.length == 4 &&
		_.contains( valid_movement, "1,-1" ) &&
		_.contains( valid_movement, "1,1" ) &&
		_.contains( valid_movement, "-1,1" ) &&
		_.contains( valid_movement, "-1,-1" ), // notably NOT -2,0
		"Beetle blocked from climbing up by a gate" );

	// test that beetle can jump down from being up on the hive, even through a "lower-level" gate
	board = Board.create();
	board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( -2, 0 ));
	board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( -1, 1 ));
	board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( 1, 1 ));
	board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( 2, 0 ));
	board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( 1, -1 ));
	board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( -1, -1 ));
	board.place_piece( Piece.create( "Black", "Beetle" ), Position.create( -1, 1 ));
	valid_movement = Position.encode_all( Rules.find_valid_movement_Beetle( board, Position.create( -1, 1 )));
	assert.ok(
		_.contains( valid_movement, "0,0" ),
		"Beetle can climb down into hole" );

	// TODO: test that beetle can jump into a "hole" surrounded on all sides
	// TODO: test that beetle can jump up and down to and from large stacks of 4x or more pieces
}

exports["test rules find_valid_movement_Grasshopper"] = function( assert ) {
	var board, valid_movement;

	board = Board.create();
	board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( 0, 0 ));
	board.place_piece( Piece.create( "Black", "Queen Bee" ), Position.create( -2, 0 ));
	board.place_piece( Piece.create( "White", "Grasshopper" ), Position.create( 2, 0 ));
	valid_movement = Position.encode_all( Rules.find_valid_movement_Grasshopper( board, Position.create( 2, 0 )));
	assert.ok(
		valid_movement.length == 1 &&
		_.contains( valid_movement, "-4,0" ),
		"Grasshopper should be able to leap over to the far side" );
	
	// TODO: test that grasshopper cannot jump in directions that it doesn't have adjacencies for
	// TODO: test that grasshopper can leap tall buildings in a single bound
}

exports["test rules find_valid_movement_Spider"] = function( assert ) {

}

exports["test rules find_valid_movement_Soldier_Ant"] = function( assert ) {

}

exports["test rules find_valid_movement_Mosquito"] = function( assert ) {

}

exports["test rules find_valid_movement_Ladybug"] = function( assert ) {

}

exports["test rules find_valid_movement_Pillbug"] = function( assert ) {

}


if( module == require.main )
	require("test").run( exports );
