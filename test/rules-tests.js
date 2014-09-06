var _ = require("lodash");
_(global).extend(require("../core/domain/util"));
var Piece = require("../core/domain/piece");
var Position = require("../core/domain/position");
var Board = require("../core/domain/board");
var Game = require("../core/domain/game");
var Rules = require("../core/domain/rules");

exports["test rules lookup_possible_turns"] = function( assert ) {
	var board, save, game, turns;

	save = require('./saved_games/white_turn_17__should_allow_placement.hive-game.json'); // this was named this way because of another bug, but the test itself has been corrected
	game = Game.load( save );
	turns = game.lookup_possible_turns();
	assert.ok( _.keys( turns ).length == 1 && turns["Forfeit"] == true, "White Player should only be able to forfeit" );

	// TODO: test that (0,0) is the only valid placement position for an empty board
	// TODO: test that placement can occur next to a piece of the opposite color when the board contains exactly one piece

	// TODO: test that Queen Bee cannot be placed on turn# 0 (first turn)
	
	// TODO: test that movement turn cannot leave the board in the same state as it was originally
	//   this turn would be indistinguishable from a "pass" turn and is not allowed
	//   (when a player has legal moves)
}

exports["test rules check_force_queen_placement"] = function( assert ) {
	var game, board, check;

	board = Board.create();
	board.place_piece( Piece.create( "White", "Spider" ), Position.create( 0, 0 ));
	board.place_piece( Piece.create( "Black", "Spider" ), Position.create( -2, 0 ));
	board.place_piece( Piece.create( "White", "Beetle" ), Position.create( -3, 1 ));
	board.place_piece( Piece.create( "Black", "Spider" ), Position.create( 1, 1 ));
	check = Rules.check_force_queen_placement( "White", board, 4 );
	assert.ok( !check,
		"Queen Bee placement not yet enforced" );
	board.place_piece( Piece.create( "White", "Soldier Ant" ), Position.create( 1, -1 ));
	board.place_piece( Piece.create( "Black", "Soldier Ant" ), Position.create( -3, -1 ));
	check = Rules.check_force_queen_placement( "White", board, 6 );
	assert.ok( check,
		"Queen Bee must be placed by either player's fourth turn" );
	board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( -4, 0 ));
	board.place_piece( Piece.create( "Black", "Queen Bee" ), Position.create( 2, 0 ));
	check = Rules.check_force_queen_placement( "White", board, 8 );
	assert.ok( !check,
		"Queen Bee confirmed already placed" );
}

exports["test rules check_allow_queen_placement"] = function( assert ) {
	assert.ok( !Rules.check_allow_queen_placement( 0 ) && !Rules.check_allow_queen_placement( 1 ), "queen placement NOT allowed" );
	assert.ok( Rules.check_allow_queen_placement( 2 ) && Rules.check_allow_queen_placement( 3 ), "queen placement ALLOWED" );
}

exports["test rules check_any_movement_allowed"] = function( assert ) {
	var board;

	board = Board.create();
	board.place_piece( Piece.create( "White", "Spider" ), Position.create( 0, 0 ));
	board.place_piece( Piece.create( "Black", "Spider" ), Position.create( -2, 0 ));
	assert.ok( !Rules.check_any_movement_allowed( "White", board ) && !Rules.check_any_movement_allowed( "Black", board ), "NO movement allowed" );
	board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( -4, 0 ));
	board.place_piece( Piece.create( "Black", "Queen Bee" ), Position.create( 2, 0 ));
	assert.ok( Rules.check_any_movement_allowed( "White", board ) && Rules.check_any_movement_allowed( "Black", board ), "movement ALLOWED" );
}

exports["test rules check_if_game_over"] = function( assert ) {
	var game, board, game_status;

	board = Board.create();
	board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( 0, 0 ));
	board.place_piece( Piece.create( "Black", "Spider" ), Position.create( -2, 0 ));
	board.place_piece( Piece.create( "Black", "Spider" ), Position.create( -1, 1 ));
	board.place_piece( Piece.create( "Black", "Spider" ), Position.create( 1, 1 ));
	board.place_piece( Piece.create( "Black", "Spider" ), Position.create( 2, 0 ));
	board.place_piece( Piece.create( "Black", "Spider" ), Position.create( 1, -1 ));
	game_status = Rules.check_if_game_over( board );
	assert.ok( !game_status.game_over, "Game not yet over" );
	board.place_piece( Piece.create( "Black", "Spider" ), Position.create( -1, -1 ));
	game_status = Rules.check_if_game_over( board );
	assert.ok( game_status.game_over && game_status.winner == "Black", "Game is over, winner Black" );
	board.remove_piece( Position.create( -1, 1 ));
	board.place_piece( Piece.create( "Black", "Spider" ), Position.create( -3, 1 ));
	board.place_piece( Piece.create( "Black", "Spider" ), Position.create( -2, 2 ));
	board.place_piece( Piece.create( "Black", "Spider" ), Position.create( 0, 2 ));
	game_status = Rules.check_if_game_over( board );
	assert.ok( !game_status.game_over, "Game not yet over" );
	board.place_piece( Piece.create( "Black", "Queen Bee" ), Position.create( -1, 1 ));
	game_status = Rules.check_if_game_over( board );
	assert.ok( game_status.game_over && typeof game_status.winner == "undefined" && game_status.is_draw, "Game is over, draw" );

}

exports["test rules find_valid_placement_positions"] = function( assert ) {
	var board = Board.create();
	board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( 0, 0 ));
	board.place_piece( Piece.create( "Black", "Queen Bee" ), Position.create( 2, 0 ));
	assert.ok( json_equality( ["-2,0","-1,1","-1,-1"], _.keys( Rules.find_valid_placement_positions( "White", board, 2 ))), "White placement" );
	assert.ok( json_equality( ["3,1","4,0","3,-1"],    _.keys( Rules.find_valid_placement_positions( "Black", board, 3 ))), "Black placement" );
}

exports["test rules find_valid_movement"] = function( assert ) {
	var board, movement;
	// defer specific movement types to their specific functions
	//   instead check board_contiguity precondition
	board = Board.create();
	board.place_piece( "White,Soldier Ant", "0,0" );
	movement = Rules.find_valid_movement( board, "0,0" );
	assert.ok( movement.length == 0, "no valid movement (island)" );
	board.place_piece( "White,Queen Bee", "2,0" );
	movement = Rules.find_valid_movement( board, "0,0" );
	assert.ok( movement.length != 0, "valid movement (normal)" );
	board.place_piece( "White,Spider", "-2,0" );
	movement = Rules.find_valid_movement( board, "0,0" );
	assert.ok( movement.length == 0, "no valid movement (contiguity violated)" );
	board.place_piece( "Black,Grasshopper", "-3,1" );
	board.place_piece( "Black,Grasshopper", "-2,2" );
	board.place_piece( "Black,Grasshopper", "0,2" );
	board.place_piece( "Black,Grasshopper", "2,2" );
	board.place_piece( "Black,Grasshopper", "3,1" );
	movement = Rules.find_valid_movement( board, "0,0" );
	assert.ok( movement.length != 0, "valid movement (contiguity no longer violated)" );
	board.remove_piece( "0,2" );
	movement = Rules.find_valid_movement( board, "0,0" );
	assert.ok( movement.length == 0, "no valid movement (contiguity just barely violated)" );
}

exports["test rules find_valid_special_abilities"] = function( assert ) {
	var board, movement;
	board = Board.create();
	board.place_piece( "White,Pillbug", "0,0" );
	board.place_piece( "White,Queen Bee", "2,0" );
	board.place_piece( "Black,Spider", "1,-1" );
	board.place_piece( "Black,Spider", "1,1" );
	movement = Rules.find_valid_special_abilities( board, "0,0" );
	assert.ok( _.keys( movement ).length != 0, "valid special abilities" );
	board.place_piece( "Black,Beetle", "1,-1" );
	board.place_piece( "Black,Beetle", "1,1" );
	movement = Rules.find_valid_special_abilities( board, "0,0" );
	assert.ok( _.keys( movement ).length == 0, "no valid special abilities" );
}

exports["test rules find_valid_movement_Queen_Bee"] = function( assert ) {
	var game, board, valid_movement;

	board = Board.create();
	board.place_piece( Piece.create( "White", "Spider" ), Position.create( 0, 0 ));
	board.place_piece( Piece.create( "Black", "Spider" ), Position.create( -2, 0 ));
	board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( -3, 1 ));
	board.place_piece( Piece.create( "Black", "Spider" ), Position.create( 1, 1 ));
	valid_movement = Position.encode_all( Rules.find_valid_movement_Queen_Bee( board, Position.create( -3, 1 )));
	assert.ok( set_equality( valid_movement, 
		["-4,0","-1,1"] ),
		"Queen Bee movement matches expected" );


}

exports["test rules find_valid_movement_Beetle"] = function( assert ) {
	var game, board, valid_movement, save, possible_turns;

	board = Board.create();
	board.place_piece( Piece.create( "White", "Beetle" ), Position.create( 0, 0 ));
	board.place_piece( Piece.create( "Black", "Beetle" ), Position.create( -2, 0 ));
	valid_movement = Position.encode_all( Rules.find_valid_movement_Beetle( board, Position.create( 0, 0 )));
	assert.ok( set_equality( valid_movement, 
		["-2,0","-1,1","-1,-1"] ),
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

	save = JSON.parse('{"creation_parameters":{"use_mosquito":false,"use_ladybug":false,"use_pillbug":false},"turn_history":[{"turn_type":"Placement","piece_type":"Spider","destination":"0,0"},{"turn_type":"Placement","piece_type":"Spider","destination":"-1,1"},{"turn_type":"Placement","piece_type":"Beetle","destination":"-1,-1"},{"turn_type":"Placement","piece_type":"Queen Bee","destination":"-3,1"},{"turn_type":"Placement","piece_type":"Queen Bee","destination":"1,-1"},{"turn_type":"Placement","piece_type":"Beetle","destination":"-2,2"},{"turn_type":"Movement","source":"-1,-1","destination":"1,-1"},{"turn_type":"Movement","source":"-2,2","destination":"-3,1"},{"turn_type":"Movement","source":"1,-1","destination":"0,0"},{"turn_type":"Movement","source":"-3,1","destination":"-1,1"}]}');
	game = Game.load( save );
	possible_turns = game.lookup_possible_turns();
	assert.ok( "0,0" in possible_turns["Movement"], "should be able to move the White Beetle" );


	game = Game.load({ 
		creation_parameters:{ use_mosquito: false, use_ladybug: false, use_pillbug: false }, 
		turn_history: [
			{"turn_type":"Placement","piece_type":"Spider","destination":"0,0"},
			{"turn_type":"Placement","piece_type":"Grasshopper","destination":"-2,0"},
			{"turn_type":"Placement","piece_type":"Queen Bee","destination":"1,-1"},
			{"turn_type":"Placement","piece_type":"Beetle","destination":"-3,-1"},
			{"turn_type":"Movement","source":"1,-1","destination":"-1,-1"},
			{"turn_type":"Placement","piece_type":"Queen Bee","destination":"-3,1"},
			{"turn_type":"Movement","source":"0,0","destination":"-4,2"}
		]});
	possible_turns = game.lookup_possible_turns();
	assert.ok( "-3,-1" in possible_turns["Movement"], "should be able to move the Black Beetle" );

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
	var save, game, turns;

	save = require('./saved_games/black_turn_12__black_spider_should_have_4_moves.json');
	game = Game.load( save );
	turns = game.lookup_possible_turns();
	var position_key = game.board.search_pieces( "Black", "Spider" )[0].position_key;
	assert.equal( turns["Movement"] ? turns["Movement"][position_key].length : undefined, 4, "Black Spider should have 4 possible moves" );
}

exports["test rules find_valid_movement_Soldier_Ant"] = function( assert ) {
	var board, movement;
	// defer specific movement types to their specific functions
	//   instead check board_contiguity precondition
	board = Board.create();
	board.place_piece( "White,Soldier Ant", "0,0" );
	board.place_piece( "Black,Grasshopper", "1,-1" );
	board.place_piece( "Black,Grasshopper", "1,1" );
	board.place_piece( "Black,Grasshopper", "3,-1" );
	board.place_piece( "Black,Grasshopper", "3,1" );
	board.place_piece( "Black,Grasshopper", "4,0" );
	movement = Rules.find_valid_movement_Soldier_Ant( board, "0,0" );
	assert.equal( 
		JSON.stringify( Position.encode_all( movement ).sort() ),
		JSON.stringify( ["-1,1","0,2","2,2","4,2","5,1","6,0","5,-1","4,-2","2,-2","0,-2","-1,-1"].sort() ),
		"movement confirmed" );
}

exports["test rules find_valid_movement_Mosquito"] = function( assert ) {
	var board, movement;
	//
	// Queen Bee
	board = Board.create();
	board.place_piece( "Black,Queen Bee", "-2,0" );
	board.place_piece( "White,Mosquito", "0,0" );
	movement = Rules.find_valid_movement_Mosquito( board, "0,0" );
	assert.equal( 
		JSON.stringify( Position.encode_all( movement ).sort() ),
		JSON.stringify( ["-1,-1","-1,1"].sort() ),
		"Queen Bee movement mimicry: confirmed" );
	// Spider
	board = Board.create();
	board.place_piece( "Black,Spider", "-2,0" );
	board.place_piece( "White,Mosquito", "0,0" );
	movement = Rules.find_valid_movement_Mosquito( board, "0,0" );
	assert.equal( 
		JSON.stringify( Position.encode_all( movement ).sort() ),
		JSON.stringify( ["-4,0"].sort() ),
		"Spider movement mimicry: confirmed" );
	// Soldier Ant
	board = Board.create();
	board.place_piece( "Black,Soldier Ant", "-2,0" );
	board.place_piece( "White,Mosquito", "0,0" );
	movement = Rules.find_valid_movement_Mosquito( board, "0,0" );
	assert.equal( 
		JSON.stringify( Position.encode_all( movement ).sort() ),
		JSON.stringify( ["-1,-1","-3,-1","-4,0","-3,1","-1,1"].sort() ),
		"Soldier Ant movement mimicry: confirmed" );
	// Grasshopper
	board = Board.create();
	board.place_piece( "Black,Grasshopper", "-2,0" );
	board.place_piece( "White,Mosquito", "0,0" );
	movement = Rules.find_valid_movement_Mosquito( board, "0,0" );
	assert.equal( 
		JSON.stringify( Position.encode_all( movement ).sort() ),
		JSON.stringify( ["-4,0"].sort() ),
		"Grasshopper movement mimicry: confirmed" );
	// Beetle
	board = Board.create();
	board.place_piece( "Black,Beetle", "-2,0" );
	board.place_piece( "White,Mosquito", "0,0" );
	movement = Rules.find_valid_movement_Mosquito( board, "0,0" );
	assert.equal( 
		JSON.stringify( Position.encode_all( movement ).sort() ),
		JSON.stringify( ["-1,-1","-2,0","-1,1"].sort() ),
		"Beetle movement mimicry: confirmed" );
	// Mosquito
	board = Board.create();
	board.place_piece( "Black,Mosquito", "-2,0" );
	board.place_piece( "White,Mosquito", "0,0" );
	movement = Rules.find_valid_movement_Mosquito( board, "0,0" );
	assert.equal( 
		JSON.stringify( Position.encode_all( movement ).sort() ),
		JSON.stringify( [].sort() ),
		"Mosquito movement mimicry: confirmed" );
	// Ladybug
	board = Board.create();
	board.place_piece( "Black,Ladybug", "-2,0" );
	board.place_piece( "White,Mosquito", "0,0" );
	movement = Rules.find_valid_movement_Mosquito( board, "0,0" );
	assert.equal( 
		JSON.stringify( Position.encode_all( movement ).sort() ),
		JSON.stringify( [].sort() ),
		"Ladybug movement mimicry: confirmed" );
	board.place_piece( "Black,Queen Bee", "-3,-1" );
	movement = Rules.find_valid_movement_Mosquito( board, "0,0" );
	assert.equal( 
		JSON.stringify( Position.encode_all( movement ).sort() ),
		JSON.stringify( ["-5,-1","-4,0","-1,-1","-2,-2","-4,-2"].sort() ),
		"Ladybug movement mimicry: confirmed 2x" );
	// Pillbug
	board = Board.create();
	board.place_piece( "Black,Pillbug", "-2,0" );
	board.place_piece( "White,Mosquito", "0,0" );
	movement = Rules.find_valid_movement_Mosquito( board, "0,0" );
	assert.equal( 
		JSON.stringify( Position.encode_all( movement ).sort() ),
		JSON.stringify( ["-1,-1","-1,1"].sort() ),
		"Pillbug movement mimicry: confirmed" );
}

exports["test rules find_valid_special_abilities_Mosquito"] = function( assert ) {
	var board, abilities;
	// Pillbug
	board = Board.create();
	board.place_piece( "Black,Pillbug", "-2,0" );
	board.place_piece( "White,Mosquito", "0,0" );
	abilities = Rules.find_valid_special_abilities_Mosquito( board, "0,0" );
	assert.ok( _.keys( abilities ).length == 1 &&
		JSON.stringify( Position.encode_all( abilities["-2,0"] ).sort() )
		== JSON.stringify( ["-1,-1","-1,1","1,1","2,0","1,-1"].sort() ),
		"Pillbug ability mimicry: confirmed" );
}

exports["test rules find_valid_movement_Ladybug"] = function( assert ) {
	var save, game, turns;

	save = require('./saved_games/white_turn_3__ladybug.hive-game.json');
	game = Game.load( save );
	turns = game.lookup_possible_turns();
	assert.equal( turns["Movement"]["1,1"].length, 9, "Ladybug should have 9 possible moves" );

	// TODO: add a test for when a ladybug given only one potential pathway up on top of the hive, is blocked by a gate and thus has no actual valid moves without backtracking
}

exports["test rules find_valid_movement_Pillbug"] = function( assert ) {
	var game, board, valid_movement;

	board = Board.create();
	board.place_piece( Piece.create( "White", "Spider" ), Position.create( 0, 0 ));
	board.place_piece( Piece.create( "Black", "Spider" ), Position.create( -2, 0 ));
	board.place_piece( Piece.create( "White", "Pillbug" ), Position.create( -3, 1 ));
	board.place_piece( Piece.create( "Black", "Spider" ), Position.create( 1, 1 ));
	valid_movement = Position.encode_all( Rules.find_valid_movement_Pillbug( board, Position.create( -3, 1 )));
	assert.ok( set_equality( valid_movement, 
		["-4,0","-1,1"] ),
		"Pillbug movement matches expected" );
}

exports["test rules find_valid_special_abilities_Pillbug"] = function( assert ) {
	var board, abilities;
	// Pillbug
	board = Board.create();
	board.place_piece( "Black,Pillbug", "-2,0" );
	board.place_piece( "White,Pillbug", "0,0" );
	abilities = Rules.find_valid_special_abilities_Pillbug( board, "0,0" );
	assert.ok( _.keys( abilities ).length == 1 &&
		JSON.stringify( Position.encode_all( abilities["-2,0"] ).sort() )
		== JSON.stringify( ["-1,-1","-1,1","1,1","2,0","1,-1"].sort() ),
		"Pillbug ability: confirmed" );
}


if( module == require.main )
	require("test").run( exports );
