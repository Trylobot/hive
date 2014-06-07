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
			[], // player 0: White
			[]  // player 1: Black
		],
		current_turn: 0,
		state_history: [],
		game_over: false,
		winner: null,
		is_draw: false
	}
	game.record_current_state = function() {
		var serialized_game_state = JSON.stringify({
			board: game.board,
			hands: game.hands
		});
		game.state_history.push( serialized_game_state );
	}
	game.perform_placement = function( player_hand_index, hand_piece_index, position ) {
		var hand = board.hands[ player_hand_index ];
		var piece = hand[ hand_piece_index ];
		_.pull( hand, piece );
		board.place_piece( position );
	}
	game.perform_movement = function( position_0, position_1 ) {
		board.move_piece( position_0, position_1 );
	}
	// -------------------
	// default hands (no addons)
	// player 0: White
	game.hands[0].push( Piece.create( "White", "Queen Bee" ));
	game.hands[0].push( Piece.create( "White", "Queen Bee" ));
	game.hands[0].push( Piece.create( "White", "Beetle" ));
	game.hands[0].push( Piece.create( "White", "Beetle" ));
	game.hands[0].push( Piece.create( "White", "Grasshopper" ));
	game.hands[0].push( Piece.create( "White", "Grasshopper" ));
	game.hands[0].push( Piece.create( "White", "Grasshopper" ));
	game.hands[0].push( Piece.create( "White", "Spider" ));
	game.hands[0].push( Piece.create( "White", "Spider" ));
	game.hands[0].push( Piece.create( "White", "Soldier Ant" ));
	game.hands[0].push( Piece.create( "White", "Soldier Ant" ));
	game.hands[0].push( Piece.create( "White", "Soldier Ant" ));
	// player 1: Black
	game.hands[1].push( Piece.create( "Black", "Queen Bee" ));
	game.hands[1].push( Piece.create( "Black", "Queen Bee" ));
	game.hands[1].push( Piece.create( "Black", "Beetle" ));
	game.hands[1].push( Piece.create( "Black", "Beetle" ));
	game.hands[1].push( Piece.create( "Black", "Grasshopper" ));
	game.hands[1].push( Piece.create( "Black", "Grasshopper" ));
	game.hands[1].push( Piece.create( "Black", "Grasshopper" ));
	game.hands[1].push( Piece.create( "Black", "Spider" ));
	game.hands[1].push( Piece.create( "Black", "Spider" ));
	game.hands[1].push( Piece.create( "Black", "Soldier Ant" ));
	game.hands[1].push( Piece.create( "Black", "Soldier Ant" ));
	game.hands[1].push( Piece.create( "Black", "Soldier Ant" ));
	// optional addon pieces
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
	// initialize history with initial game state
	game.record_current_state();
	return game;
}

// exports

exports.create = create;

