var _ = require("lodash");
_(global).extend(require("./util"));
var Piece = require("./piece");
var Position = require("./position");
var Board = require("./board");

/*
rules.js
this module is used to represent the rules of hive.
	it can provide a list of valid end positions for a piece, 
	given a board state (for a placement check)
	or a board state and a current position (for a movement check)

HIVE - by John Yianni
	"A Game Buzzing With Possibilities"
	http://gen42.com

Playing the Game
	Play begins with one player placing a piece	from their hand to the centre of the table
	and the next player joining one of their own pieces to it edge to edge. Players then
	take turns to either place or move any one of their pieces.

The Hive
	The pieces in play define the playing surface, known as the Hive.

*/

// functions

/*

Placing
	A new piece can be introduced into the game at any time. However, with the exception
	of the first piece placed by each player, pieces may not be placed next to a piece of
	the opponent's colour. It is possible to win the game without placing all your pieces,
	but once a piece has been placed, it cannot be removed.

Placing your Queen Bee
	Your Queen Bee can be placed at any time from your first to your fourth turn. You
	must place your Queen Bee on your fourth turn if you have not placed it before.

*/
function check_placement_possible( piece, board, turn_number ) {
	throw "not yet implemented";
}

/*

Moving
	Once your Queen Bee has been placed (but not before), you can decide whether to use
	each turn after that to place another piece or to move one of the pieces that have
	already been placed. Each creature has its own way of moving. When moving, it is
	possible to move pieces to a position where they touch one or more of your opponent's
	pieces. 

	All pieces must always touch at least one other piece. If a piece is the only
	connection between two parts of the Hive, it may not be moved. (See 'One Hive rule')

*/
function check_movement_possible( color, board ) {
	throw "not yet implemented";
}

/*

Unable to Move or Place
	If a player can not place a new piece or move an existing piece, the turn passes
	to their opponent who then takes their turn again. The game continues in this way
	until the player is able to move or place one of their pieces, or until their
	Queen Bee is surrounded.

*/
function find_valid_placement( piece, board, turn_number ) {
	return board.lookup_free_spaces( Piece.color_name( piece.color ));
}

function find_valid_movement( piece, board, position, turn_number ) {
	var piece_type = Piece.type_name( piece.type );
	var piece_color = Piece.color_name( piece.color );
	switch( piece_type )
	{
		case "Queen Bee":
			return find_valid_movement__Queen_Bee( piece_color, board, position );
			break;

		case "Beetle":
			return find_valid_movement__Beetle( piece_color, board, position );			
			break;

		case "Grasshopper":
			return find_valid_movement__Grasshopper( piece_color, board, position );			
			break;

		case "Spider":
			return find_valid_movement__Spider( piece_color, board, position );			
			break;

		case "Soldier Ant":
			return find_valid_movement__Soldier_Ant( piece_color, board, position );			
			break;

		case "Mosquito":
			return find_valid_movement__Mosquito( piece_color, board, position );			
			break;

		case "Ladybug":
			return find_valid_movement__Ladybug( piece_color, board, position );			
			break;

		case "Pillbug":
			return find_valid_movement__Pillbug( piece_color, board, position );			
			break;
	}
	throw "invalid piece type: " + piece_type;
}

/*

Queen Bee
	The Queen Bee can move only one space per turn.

*/
function find_valid_movement__Queen_Bee( color, board, position ) {
	// lookup a position chain for this piece
	// find chain items up to 1 space away
	throw "not yet implemented";
}

/*

Beetle
	The Beetle, like the Queen Bee, moves only space per turn around the Hive, but
	can also move on top of the Hive. A piece with a beetle on top of it is unable
	to move and for the purposes of the placing rules, the stack takes on the
	colour of the Beetle.

	From its position on top of the Hive, the Beetle can move from piece to piece
	across the top of the Hive. It can also drop into spaces that are surrounded
	and therefore not accessible to most other creatures.

	The only way to block a Beetle that is on top of the Hive is to move another
	Beetle on top of it. All Beetles and Mosquitoes can be stacked on top of each
	other.

	When it is first placed, the Beetle is placed in the same way as all the other
	pieces. It cannot be placed directly on top of the Hive, even though it can
	be moved there later.

*/
function find_valid_movement__Beetle( color, board, position ) {
	throw "not yet implemented";
}

/*

Grasshopper
	The Grasshopper does not move around the outside of the Hive like the other
	creatures. Instead it jumps from its space over any number of pieces (but
	at least one) to the next unoccupied space along a straight row of joined
	pieces.

	This gives it the advantage of being able to fill in a space which is
	surrounded by other pieces.

*/
function find_valid_movement__Grasshopper( color, board, position ) {
	throw "not yet implemented";
}

/*

Spider
	The Spider moves three spaces per turn - no more, no less. It must move in a
	direct path and cannot backtrack on itself. It may only move around pieces
	that it is in direct contact with on each step of its move. It may not move
	across to a piece that it is not in direct contact with.

*/
function find_valid_movement__Spider( color, board, position ) {
	throw "not yet implemented";
}

/*

Soldier Ant
	The Soldier Ant can move from its position to any other position around the
	Hive provided the restrictions are adhered to.

*/
function find_valid_movement__Soldier_Ant( color, board, position ) {
	throw "not yet implemented";
}

/*

Mosquito
	The Mosquito is placed in the same way as the other pieces. Once in play, the
	Mosquito takes on the movement characteristics of any creature it touches at
	the time, including your opponents', thus changing its characteristics
	throughout the game.

	Exception: if moved as a Beetle on top of the Hive, it continues to move as
	a Beetle until it climbs down from the Hive. If when on the ground level it
	is next to a stacked Beetle, it may move as a Beetle and not the piece below
	the Beetle. If touching another Mosquito only (including a stacked Mosquito)
	and no other piece, it may not move.

*/
function find_valid_movement__Mosquito( color, board, position ) {
	throw "not yet implemented";
}

/*

Ladybug
	The Ladybug moves three spaces; two on top of the Hive, and then one down.
	It must move exactly two on top of the Hive and then move one down on its
	last move. It may not move around the outside of the Hive and may not end
	its movement on top of the Hive. Even though it cannot block by landing
	on top of other pieces like the Beetle, it can move into or out of surrounded
	spaces. It also has the advantage of being much faster.

*/
function find_valid_movement__Ladybug( color, board, position ) {
	throw "not yet implemented";
}

/*

Pillbug
	The Pillbug moves like the Queen Bee - one space at a time - but it has a
	special ability that it may use instead of moving. This ability allows the
	Pillbug to move an adjacent unstacked piece (whether friend or enemy) two
	spaces: up onto the pillbug itself, then down into an empty space adjacent
	to itself. Some exceptions for this ability: 
	- The Pillbug may not move the piece most recently moved by the opponent.
	- The Pillbug may not move any piece in a stack of pieces.
	- The Pillbug may not move a piece if it splits the hive (One Hive rule)
	- The Pillbug may not move a piece through a too-narrow gap of stacked
	  pieces (Freedom to Move rule)
	
	Any piece which physically moved (directly or by the Pillbug) is rendered
	immobile on the next player's turn; it cannot move or be moved, nor use its
	special ability. The Mosquito can mimic either the movement or special
	ability of the Pillbug, even when the Pillbug it is touching has been rendered
	immobile by another Pillbug.

*/
function find_valid_movement__Pillbug( color, board, position ) {
	throw "not yet implemented";
}

/*

One Hive rule
	The pieces in play must be linked at all times. At no time can you leave a piece
	stranded (not joined to the Hive) or separate the Hive in two.

*/
function check_one_hive_rule( board, newly_empty_position ) {
	throw "not yet implemented";
}

/*

Freedom to Move
	The creatures can only move in a sliding movement. If a piece is surrounded to
	the point that it can no longer physically slide out of its position, it may
	not be moved. The only exceptions are the Grasshopper (which jumps into or out
	of a space), the Beetle and Ladybug (which climb up and down) and the Mosquito
	(which can mimic one of the three). Similarly, no piece may move into a space
	that it cannot physically slide into.

	When first introduced to the game, a piece may be placed into a space that is
	surrounded as long as it does not violate any of the placing rules, in particular
	the rule about pieces not being allowed to touch pieces of the other colour when
	they are first placed.

*/
function check_freedom_to_move_rule( board, start_position, end_position, sliding_moves_position_chain ) {
	throw "not yet implemented";
}

/*

The End of the Game
	The game ends as soon as one Queen Bee is completely surrounded by pieces of any colour.
	The person whose Queen Bee is surrounded loses the game, unless the last piece to
	surround their Queen Bee also completes the surrounding of the other Queen Bee. In that
	case the game is drawn. A draw may also be agreed if both players are in a position where
	they are forced to move the same two pieces over and over again, without any possibility
	of the stalemate being resolved.

*/
// returns an object with fields:
//   game_over: true if game is over, false otherwise
//   is_draw: true if game is over and game ended in a draw, false otherwise
//   winner: color_name string corresponding to the winning player if any, undefined otherwise
function check_if_game_over( board ) {
	throw "not yet implemented";
	return {
		game_over: false,
		is_draw: false,
		winner: undefined
	};
}

// exports

exports.check_placement_possible = check_placement_possible;
exports.check_movement_possible = check_movement_possible;
exports.find_valid_placement = find_valid_placement;
exports.find_valid_movement = find_valid_movement;
exports.find_valid_movement__Queen_Bee = find_valid_movement__Queen_Bee;
exports.find_valid_movement__Beetle = find_valid_movement__Beetle;
exports.find_valid_movement__Grasshopper = find_valid_movement__Grasshopper;
exports.find_valid_movement__Spider = find_valid_movement__Spider;
exports.find_valid_movement__Soldier_Ant = find_valid_movement__Soldier_Ant;
exports.find_valid_movement__Mosquito = find_valid_movement__Mosquito;
exports.find_valid_movement__Ladybug = find_valid_movement__Ladybug;
exports.find_valid_movement__Pillbug = find_valid_movement__Pillbug;
exports.check_one_hive_rule = check_one_hive_rule;
exports.check_freedom_to_move_rule = check_freedom_to_move_rule;
exports.check_if_game_over = check_if_game_over;
