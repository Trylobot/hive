var _ = require("lodash");
_(global).extend(require("./util"));
var Piece = require("./piece");
var Board = require("./board");
var Rules = require("./rules");

/*
game.js
this class is used to represent a hive game.
it encapsulates all of the hive rules, and allows for
	progression from one board state to the next.
	it can list all the possible moves.
	it also evaluates end states and determines the game winner, 
	or if there is a draw.
*/

// functions

// creates a new game board and initializes player hands, with optional add-on pieces
function create( use_mosquito, use_ladybug, use_pillbug ) {
	var game = {
		board: Board.create(),
		hands: [
			[ // player 1, White
				Piece.create( "White", "Queen Bee" ),
				Piece.create( "White", "Queen Bee" ),
				Piece.create( "White", "Beetle" ),
				Piece.create( "White", "Beetle" ),
				Piece.create( "White", "Grasshopper" ),
				Piece.create( "White", "Grasshopper" ),
				Piece.create( "White", "Grasshopper" ),
				Piece.create( "White", "Spider" ),
				Piece.create( "White", "Spider" ),
				Piece.create( "White", "Soldier Ant" ),
				Piece.create( "White", "Soldier Ant" ),
				Piece.create( "White", "Soldier Ant" )
			], 
			[ // player 2, Black
				Piece.create( "Black", "Queen Bee" ),
				Piece.create( "Black", "Queen Bee" ),
				Piece.create( "Black", "Beetle" ),
				Piece.create( "Black", "Beetle" ),
				Piece.create( "Black", "Grasshopper" ),
				Piece.create( "Black", "Grasshopper" ),
				Piece.create( "Black", "Grasshopper" ),
				Piece.create( "Black", "Spider" ),
				Piece.create( "Black", "Spider" ),
				Piece.create( "Black", "Soldier Ant" ),
				Piece.create( "Black", "Soldier Ant" ),
				Piece.create( "Black", "Soldier Ant" )
			]
		]
	}
	if( use_mosquito ) {
		game.hands[0].push( Piece.create( "White", "Mosquito" ));
		game.hands[1].push( Piece.create( "Black", "Mosquito" ));
	}
	if( use_ladybug ) {
		game.hands[0].push( Piece.create( "White", "Ladybug" ));
		game.hands[1].push( Piece.create( "Black", "Ladybug" ));
	}
	if( use_pillbug ) {
		game.hands[0].push( Piece.create( "White", "Pillbug" ));
		game.hands[1].push( Piece.create( "Black", "Pillbug" ));
	}
	return game;
}

// exports

exports.create = create;

