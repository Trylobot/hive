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

exports["test bug1 cant move queen but should be able to"] = function( assert ) {
	var core, game_id, game, possible_turns;
	
	core = Core.create();
	game_id = core.create_game( 
		Player.create( "Human" ), 
		Player.create( "Human" ), 
		false, false, false );
	game = core.lookup_game( game_id ).game;
	game.perform_turn( Turn.create_placement( "Spider", Position.create( 0, 0 )));
	game.perform_turn( Turn.create_placement( "Spider", Position.create( -2, 0 )));
	game.perform_turn( Turn.create_placement( "Queen Bee", Position.create( 1, 1 )));
	game.perform_turn( Turn.create_placement( "Beetle", Position.create( -3, 1 )));
	possible_turns = Rules.lookup_possible_turns( 
		game.player_turn, 
		game.board, 
		game.hands[ game.player_turn ],
		game.turn_number );
	assert.ok(
		"1,1" in possible_turns["Movement"], 
		"should be able to move the White Queen Bee" );
}

if( module == require.main )
	require("test").run( exports );
