var _ = require("lodash");
_(global).extend(require("../core/domain/util"));
var Piece = require("../core/domain/piece");
var Position = require("../core/domain/position");
var Turn = require("../core/domain/turn");
var Board = require("../core/domain/board");
var Rules = require("../core/domain/rules");
var Game = require("../core/domain/game");
var Player = require("../core/domain/player");
var Core = require("../core/core");

exports["test bug1 can't move queen but SHOULD be able to"] = function( assert ) {
	var game, possible_turns;
	
	game = Game.create( false, false, false ); // White starts
	game.perform_turn( Turn.create_placement( "Spider", Position.create( 0, 0 )));
	game.perform_turn( Turn.create_placement( "Spider", Position.create( -2, 0 )));
	game.perform_turn( Turn.create_placement( "Queen Bee", Position.create( 1, 1 )));
	game.perform_turn( Turn.create_placement( "Beetle", Position.create( -3, 1 )));
	possible_turns = Rules.lookup_possible_turns( game.player_turn, game.board, game.hands[ game.player_turn ], game.turn_number );
	assert.ok(
		"1,1" in possible_turns["Movement"], 
		"should be able to move the White Queen Bee" );
}

exports["test bug2 can't move spider but SHOULD be able to"] = function( assert ) {
	var game, possible_turns;
	
	game = Game.create( false, false, false ); // White starts
	game.perform_turn( Turn.create_placement( "Spider", Position.create( 0, 0 ))); // Place White Spider
	game.perform_turn( Turn.create_placement( "Spider", Position.create( -1, 1 ))); // Place Black Spider
	game.perform_turn( Turn.create_placement( "Queen Bee", Position.create( 2, 0 ))); // Place White Queen Bee
	game.perform_turn( Turn.create_placement( "Soldier Ant", Position.create( -3, 1 ))); // Place Black Soldier Ant
	game.perform_turn( Turn.create_movement( Position.create( 2, 0 ), Position.create( 1, 1 ))); // Move White Queen Bee
	game.perform_turn( Turn.create_placement( "Queen Bee", Position.create( -2, 2 ))); // Place Black Queen Bee
	possible_turns = Rules.lookup_possible_turns( game.player_turn, game.board, game.hands[ game.player_turn ], game.turn_number );
	assert.ok(
		"0,0" in possible_turns["Movement"],
		"should be able to move the White Spider" );

}

exports["test bug3 can move spider but should NOT be able to"] = function( assert ) {
	var game, possible_turns;
	
	game = Game.create( false, false, false ); // White starts
	game.perform_turn( Turn.create_placement( "Spider", Position.create( 0, 0 ))); // Place White Spider
	game.perform_turn( Turn.create_placement( "Spider", Position.create( -1, 1 ))); // Place Black Spider
	game.perform_turn( Turn.create_placement( "Queen Bee", Position.create( 2, 0 ))); // Place White Queen Bee
	game.perform_turn( Turn.create_placement( "Soldier Ant", Position.create( -3, 1 ))); // Place Black Soldier Ant
	possible_turns = Rules.lookup_possible_turns( game.player_turn, game.board, game.hands[ game.player_turn ], game.turn_number );
	assert.ok(
		!("0,0" in possible_turns["Movement"]),
		"should not be able to move the White Spider" );

}

exports["test bug4 can't move beetle but should be able to"] = function( assert ) {
	var game, possible_turns;

	game = Game.load({ use_mosquito: false, use_ladybug: false, use_pillbug: false }, [
		{"turn_type":"Placement","piece_type":"Spider","destination":"0,0"},
		{"turn_type":"Placement","piece_type":"Grasshopper","destination":"-2,0"},
		{"turn_type":"Placement","piece_type":"Queen Bee","destination":"1,-1"},
		{"turn_type":"Placement","piece_type":"Beetle","destination":"-3,-1"},
		{"turn_type":"Movement","source":"1,-1","destination":"-1,-1"},
		{"turn_type":"Placement","piece_type":"Queen Bee","destination":"-3,1"},
		{"turn_type":"Movement","source":"0,0","destination":"-4,2"}
	]);
	possible_turns = Rules.lookup_possible_turns( game.player_turn, game.board, game.hands[ game.player_turn ], game.turn_number );
	assert.ok( "-3,-1" in possible_turns["Movement"], "should be able to move the Black Beetle" );
}

exports["test bug5 can't move beetle but should be able to"] = function( assert ) {
	var save, game, possible_turns;

	save = JSON.parse('{"creation_parameters":{"use_mosquito":false,"use_ladybug":false,"use_pillbug":false},"turn_history":[{"turn_type":"Placement","piece_type":"Spider","destination":"0,0"},{"turn_type":"Placement","piece_type":"Spider","destination":"-1,1"},{"turn_type":"Placement","piece_type":"Beetle","destination":"-1,-1"},{"turn_type":"Placement","piece_type":"Queen Bee","destination":"-3,1"},{"turn_type":"Placement","piece_type":"Queen Bee","destination":"1,-1"},{"turn_type":"Placement","piece_type":"Beetle","destination":"-2,2"},{"turn_type":"Movement","source":"-1,-1","destination":"1,-1"},{"turn_type":"Movement","source":"-2,2","destination":"-3,1"},{"turn_type":"Movement","source":"1,-1","destination":"0,0"},{"turn_type":"Movement","source":"-3,1","destination":"-1,1"}]}');
	game = Game.load( save.creation_parameters, save.turn_history );
	possible_turns = Rules.lookup_possible_turns( game.player_turn, game.board, game.hands[ game.player_turn ], game.turn_number );
	assert.ok( "0,0" in possible_turns["Movement"], "should be able to move the White Beetle" );
}

exports["test bug6 should not be able to move pieces of the opponent's color, ever, but can with stacked beetles"] = function( assert ) {
	var save, game, possible_turns;

	save = JSON.parse('{"creation_parameters":{"use_mosquito":false,"use_ladybug":false,"use_pillbug":false},"turn_history":[{"turn_type":"Placement","piece_type":"Beetle","destination":"0,0"},{"turn_type":"Placement","piece_type":"Beetle","destination":"2,0"},{"turn_type":"Placement","piece_type":"Queen Bee","destination":"-1,1"},{"turn_type":"Placement","piece_type":"Queen Bee","destination":"3,1"},{"turn_type":"Movement","source":"-1,1","destination":"1,1"},{"turn_type":"Movement","source":"2,0","destination":"1,1"},{"turn_type":"Movement","source":"0,0","destination":"1,1"},{"turn_type":"Movement","source":"1,1","destination":"2,0"},{"turn_type":"Movement","source":"2,0","destination":"0,0"},{"turn_type":"Movement","source":"1,1","destination":"0,0"},{"turn_type":"Movement","source":"0,0","destination":"-1,1"},{"turn_type":"Movement","source":"3,1","destination":"2,0"},{"turn_type":"Movement","source":"0,0","destination":"1,1"},{"turn_type":"Movement","source":"-1,1","destination":"1,1"},{"turn_type":"Movement","source":"1,1","destination":"0,2"},{"turn_type":"Movement","source":"0,2","destination":"-1,1"},{"turn_type":"Movement","source":"1,1","destination":"2,2"},{"turn_type":"Movement","source":"-1,1","destination":"0,2"},{"turn_type":"Movement","source":"2,2","destination":"1,3"},{"turn_type":"Movement","source":"2,0","destination":"3,1"},{"turn_type":"Movement","source":"1,3","destination":"2,2"},{"turn_type":"Movement","source":"0,2","destination":"-1,1"},{"turn_type":"Movement","source":"2,2","destination":"1,1"},{"turn_type":"Movement","source":"3,1","destination":"2,0"},{"turn_type":"Movement","source":"1,1","destination":"2,2"},{"turn_type":"Movement","source":"-1,1","destination":"0,2"},{"turn_type":"Movement","source":"2,2","destination":"0,2"},{"turn_type":"Movement","source":"0,2","destination":"1,3"},{"turn_type":"Movement","source":"1,3","destination":"0,2"},{"turn_type":"Movement","source":"0,2","destination":"2,2"},{"turn_type":"Movement","source":"2,2","destination":"0,2"}]}');
	game = Game.load( save.creation_parameters, save.turn_history );
	possible_turns = game.lookup_possible_turns();
	assert.ok( !("0,2" in possible_turns["Movement"]), "Black Player should not be able to move White Beetle" );
}


if( module == require.main )
	require("test").run( exports );
