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

if( module == require.main )
	require("test").run( exports );
