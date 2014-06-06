var _ = require("lodash");
_(global).extend(require("./util"));
var piece = require("./piece");
var board = require("./board");
var rules = require("./rules");

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
		board: board.create(),
		hands: [
			[ // player 1, White
				piece.create( "White", "Queen Bee" ),
				piece.create( "White", "Queen Bee" ),
				piece.create( "White", "Beetle" ),
				piece.create( "White", "Beetle" ),
				piece.create( "White", "Grasshopper" ),
				piece.create( "White", "Grasshopper" ),
				piece.create( "White", "Grasshopper" ),
				piece.create( "White", "Spider" ),
				piece.create( "White", "Spider" ),
				piece.create( "White", "Soldier Ant" ),
				piece.create( "White", "Soldier Ant" ),
				piece.create( "White", "Soldier Ant" )
			], 
			[ // player 2, Black
				piece.create( "Black", "Queen Bee" ),
				piece.create( "Black", "Queen Bee" ),
				piece.create( "Black", "Beetle" ),
				piece.create( "Black", "Beetle" ),
				piece.create( "Black", "Grasshopper" ),
				piece.create( "Black", "Grasshopper" ),
				piece.create( "Black", "Grasshopper" ),
				piece.create( "Black", "Spider" ),
				piece.create( "Black", "Spider" ),
				piece.create( "Black", "Soldier Ant" ),
				piece.create( "Black", "Soldier Ant" ),
				piece.create( "Black", "Soldier Ant" )
			]
		]
	}
	if( use_mosquito ) {
		game.hands[0].push( piece.create( "White", "Mosquito" ));
		game.hands[1].push( piece.create( "Black", "Mosquito" ));
	}
	if( use_ladybug ) {
		game.hands[0].push( piece.create( "White", "Ladybug" ));
		game.hands[1].push( piece.create( "Black", "Ladybug" ));
	}
	if( use_pillbug ) {
		game.hands[0].push( piece.create( "White", "Pillbug" ));
		game.hands[1].push( piece.create( "Black", "Pillbug" ));
	}
	return game;
}

// exports

exports.create = create;

