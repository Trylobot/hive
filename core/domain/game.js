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
function create_game( use_mosquito, use_ladybug, use_pillbug ) {
	var game = {
		board: board.create_board(),
		hands: [
			[ // player 1, White
				piece.create_piece( "White", "Queen Bee" ),
				piece.create_piece( "White", "Queen Bee" ),
				piece.create_piece( "White", "Beetle" ),
				piece.create_piece( "White", "Beetle" ),
				piece.create_piece( "White", "Grasshopper" ),
				piece.create_piece( "White", "Grasshopper" ),
				piece.create_piece( "White", "Grasshopper" ),
				piece.create_piece( "White", "Spider" ),
				piece.create_piece( "White", "Spider" ),
				piece.create_piece( "White", "Soldier Ant" ),
				piece.create_piece( "White", "Soldier Ant" ),
				piece.create_piece( "White", "Soldier Ant" )
			], 
			[ // player 2, Black
				piece.create_piece( "Black", "Queen Bee" ),
				piece.create_piece( "Black", "Queen Bee" ),
				piece.create_piece( "Black", "Beetle" ),
				piece.create_piece( "Black", "Beetle" ),
				piece.create_piece( "Black", "Grasshopper" ),
				piece.create_piece( "Black", "Grasshopper" ),
				piece.create_piece( "Black", "Grasshopper" ),
				piece.create_piece( "Black", "Spider" ),
				piece.create_piece( "Black", "Spider" ),
				piece.create_piece( "Black", "Soldier Ant" ),
				piece.create_piece( "Black", "Soldier Ant" ),
				piece.create_piece( "Black", "Soldier Ant" )
			]
		]
	}
	if( use_mosquito ) {
		game.hands[0].push( piece.create_piece( "White", "Mosquito" ));
		game.hands[1].push( piece.create_piece( "Black", "Mosquito" ));
	}
	if( use_ladybug ) {
		game.hands[0].push( piece.create_piece( "White", "Ladybug" ));
		game.hands[1].push( piece.create_piece( "Black", "Ladybug" ));
	}
	if( use_pillbug ) {
		game.hands[0].push( piece.create_piece( "White", "Pillbug" ));
		game.hands[1].push( piece.create_piece( "Black", "Pillbug" ));
	}
	return game;
}

// exports

exports.create_game = create_game;

