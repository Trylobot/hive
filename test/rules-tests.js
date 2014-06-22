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
	var board;

	// test that beetle cannot climb up onto a piece through a "gate"
	board = Board.create();
	board.place_piece( Piece.create( "White", "Beetle" ), Position.create( 0, 0 ));
	board.place_piece( Piece.create( "Black", "Spider" ), Position.create( -1, 1 ));
	board.place_piece( Piece.create( "Black", "Beetle" ), Position.create( -1, 1 ));
	board.place_piece( Piece.create( "Black", "Spider" ), Position.create( -1, -1 ));
	board.place_piece( Piece.create( "Black", "Beetle" ), Position.create( -1, -1 ));
	board.place_piece( Piece.create( "Black", "Queen Bee" ), Position.create( -2, 0 ));
	var valid_movement_Beetle = Rules.find_valid_movement_Beetle( board, Position.create( 0, 0 ));
	assert.deepEqual(
		_.difference(
			Position.encode_all( valid_movement_Beetle ),
			[ "1,-1", "1,1", "-1,1", "-1,-1" ] // notably: NOT "-2,0"
		),
		[],
		"Beetle able to move as expected" );


}

exports["test rules find_valid_movement_Grasshopper"] = function( assert ) {

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
