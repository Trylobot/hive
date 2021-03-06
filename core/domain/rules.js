"use strict";

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

// TODO: return all positions as position keys, no position objects
function lookup_possible_turns( color, board, hand, turn_number, turn_history ) {
	var possible_turns,
		game_over,
		possible_placement_piece_types,
		possible_placement_positions,
		possible_placement,
		possible_movement,
		possible_special_abilities,
		possible_forfeit,
		positions_of_owned_pieces,
		last_turn,
		last_turn_ability_user_piece,
		movement,
		special_abilities;

	game_over = check_if_game_over( board ).game_over;
	if( game_over ) {
		// there are no possible turns; the game is over
		possible_turns = null;
	}
	else {
		// at least one turn type will be available; if nothing else, then the ability to forfeit due to no other types being available
		possible_turns = {};
		possible_placement_positions = find_valid_placement_positions( color, board, turn_number );
		possible_placement_positions = Position.encode_all( possible_placement_positions );
		//
		if( check_force_queen_placement( color, board, turn_number )) {
			// queen must be placed because it is the fourth turn and the player has not yet placed their queen
			possible_placement_piece_types = [ "Queen Bee" ];
		}
		else {
			// queen placement not forced; placement types derived from pieces available in the hand; 
			// zero-count pieces are by convention not present in the hand object; this is enforced externally, and assumed here
			possible_placement_piece_types = _.keys( hand );
			//
			if( !check_allow_queen_placement( turn_number )) {
				// queen placement is not allowed due to it being the first turn
				_.pull( possible_placement_piece_types, "Queen Bee" );
			}
			//
			if( check_any_movement_allowed( color, board )) {
				// queen bee has been placed, and movement (and special abilities) are in general allowed now
				//
				positions_of_owned_pieces = board.search_top_pieces( color ); // "A piece with a beetle on top of it is unable to move ...", so only check the top pieces
				//
				_.forEach( positions_of_owned_pieces, function( owned_piece ) {
					// check if the owned piece was moved by a pillbug last turn, causing it to be "stunned" for one turn
					last_turn = _.last( turn_history );
					if( last_turn.turn_type == "Special Ability" ) {
						last_turn_ability_user_piece = board.lookup_piece_by_key( last_turn.ability_user );
						if( last_turn_ability_user_piece && last_turn_ability_user_piece.type == "Pillbug" 
						&&  owned_piece.position_key == last_turn.destination )
							return; // piece is not eligible for movement nor special abilities due to being stunned
					}
					//
					movement = find_valid_movement( board, owned_piece.position );
					movement = Position.encode_all( movement );
					if( typeof movement !== "undefined" 
					&&  movement != null 
					&&  movement.length > 0 ) {
						if( !possible_movement )
							possible_movement = {};
						possible_movement[ owned_piece.position_key ] = movement;
					}
					//
					special_abilities = find_valid_special_abilities( board, owned_piece.position, turn_history );
					special_abilities = _.mapValues( special_abilities, function( destination_position_array ) {
						return Position.encode_all( destination_position_array );
					});
					if( typeof special_abilities !== "undefined" 
					&&  special_abilities != null 
					&&  _.keys( special_abilities ).length > 0 ) {
						if( !possible_special_abilities )
							possible_special_abilities = {};
						possible_special_abilities[ owned_piece.position_key ] = special_abilities;
					}
				});
			}
		}
		// check if there is any valid placement
		if( _.keys( possible_placement_positions ).length > 0 
		&&  possible_placement_piece_types.length > 0 ) {
			// number of total possible placement moves is greater than 0
			possible_placement = {
				piece_types: possible_placement_piece_types,
				positions: possible_placement_positions
			};
		}
		//
		if( !possible_placement && !possible_movement && !possible_special_abilities )
			possible_forfeit = true;
		//
		if( possible_placement )
			possible_turns["Placement"] = possible_placement;
		if( possible_movement )
			possible_turns["Movement"] = possible_movement;
		if( possible_special_abilities )
			possible_turns["Special Ability"] = possible_special_abilities;
		if( possible_forfeit )
			possible_turns["Forfeit"] = possible_forfeit;
	}
	return possible_turns;
}

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
function check_force_queen_placement( color, board, turn_number ) {
	// there is no queen on the board for the given color, and it is the fourth turn of one of the players
	return ( board.count_pieces( color, "Queen Bee" ) <= 0
		&& ( turn_number == 6 || turn_number == 7 ));
}

/*
http://boardgamegeek.com/wiki/page/Hive_FAQ
	You cannot place your queen as your first move.
*/
function check_allow_queen_placement( turn_number ) {
	return turn_number > 1;
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
function check_any_movement_allowed( color, board ) {
	return ( board.count_pieces( color, "Queen Bee" ) > 0 );
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
	var result = {
		game_over: false,
		is_draw: false,
		winner: undefined
	};
	var search = board.search_pieces( "White", "Queen Bee" );
	if( search.length > 0 ) {
		var White_Queen_Bee = search[0];
		var occupied_adjacencies = board.lookup_occupied_adjacencies( White_Queen_Bee.position );
		var occupied_adjacencies_count = occupied_adjacencies.length;
		if( occupied_adjacencies_count >= 6 ) {
			result.game_over = true;
			result.winner = "Black";
		}
	}
	var search = board.search_pieces( "Black", "Queen Bee" );
	if( search.length > 0 ) {
		var Black_Queen_Bee = search[0];
		var occupied_adjacencies = board.lookup_occupied_adjacencies( Black_Queen_Bee.position );
		var occupied_adjacencies_count = occupied_adjacencies.length;
		if( occupied_adjacencies_count >= 6 ) {
			if( ! result.winner ) {
				result.game_over = true;
				result.winner = "White";
			} else {
				result.is_draw = true;
				result.winner = undefined;
			}
		}
	}
	return result;
}

/*

Unable to Move or Place
	If a player can not place a new piece or move an existing piece, the turn passes
	to their opponent who then takes their turn again. The game continues in this way
	until the player is able to move or place one of their pieces, or until their
	Queen Bee is surrounded.

	http://boardspace.net/english/about_hive.html
	  Rules Change: at boardspace the "Queen" opening has been forbidden for both black and white.
	  John Yianni supports this change, which is intended to eliminate the problem of excess draws in "queen opening" games.
*/
function find_valid_placement_positions( color, board, turn_number ) {
	return board.lookup_free_spaces( (turn_number >= 2) ? color : undefined );
}

/*

One Hive rule
	The pieces in play must be linked at all times. At no time can you leave a piece
	stranded (not joined to the Hive) or separate the Hive in two.

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
function find_valid_movement( board, position ) {
	var piece = board.lookup_piece( position );
	// one hive rule
	if( !board.check_contiguity( position ))
		return [];
	// freedom to move rule (varies by piece)
	switch( piece.type )
	{   
		case "Queen Bee":   return find_valid_movement_Queen_Bee(   board, position ); break;
		case "Beetle":      return find_valid_movement_Beetle(      board, position ); break;
		case "Grasshopper": return find_valid_movement_Grasshopper( board, position ); break;
		case "Spider":      return find_valid_movement_Spider(      board, position ); break;
		case "Soldier Ant": return find_valid_movement_Soldier_Ant( board, position ); break;
		case "Mosquito":    return find_valid_movement_Mosquito(    board, position ); break;
		case "Ladybug":     return find_valid_movement_Ladybug(     board, position ); break;
		case "Pillbug":     return find_valid_movement_Pillbug(     board, position ); break;
		default:            throw "unrecognized piece type: " + piece.type;            break;
	}
}

function find_valid_special_abilities( board, position, turn_history ) {
	var piece = board.lookup_piece( position );
	switch( piece.type )
	{   
		case "Queen Bee":   return [];                                                                     break;
		case "Beetle":      return [];                                                                     break;
		case "Grasshopper": return [];                                                                     break;
		case "Spider":      return [];                                                                     break;
		case "Soldier Ant": return [];                                                                     break;
		case "Mosquito":    return find_valid_special_abilities_Mosquito( board, position, turn_history ); break;
		case "Ladybug":     return [];                                                                     break;
		case "Pillbug":     return find_valid_special_abilities_Pillbug(  board, position, turn_history ); break;
		default:            throw "unrecognized piece type: " + piece.type;                                break;
	}
}

/*

Queen Bee
	The Queen Bee can move only one space per turn.

*/
function find_valid_movement_Queen_Bee( board, position ) {
	return board.lookup_adjacent_slide_positions( position );
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

	http://www.boardgamegeek.com/wiki/page/Hive_FAQ#toc8
	  Q: Are beetles affected by the Freedom To Move rule?
	  A: Yes. (albeit in a different way): Beetles cannot slide through "gates"
*/
function find_valid_movement_Beetle( board, position ) {
	return _.union(
		board.lookup_adjacent_slide_positions( position ),
		board.lookup_adjacent_climb_positions( position )
	);
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
function find_valid_movement_Grasshopper( board, position ) {
	var adjacent_positions = board.lookup_adjacent_positions( position );
	var valid_movement = [];
	_.forEach( adjacent_positions, function( adjacency, direction ) {
		if( typeof adjacency.contents !== "undefined" )
			valid_movement.push( 
				board.find_free_space_in_direction( adjacency.position, direction ));
	});
	return valid_movement;
}

/*

Spider
	The Spider moves three spaces per turn - no more, no less. It must move in a
	direct path and cannot backtrack on itself. It may only move around pieces
	that it is in direct contact with on each step of its move. It may not move
	across to a piece that it is not in direct contact with.

*/
function find_valid_movement_Spider( board, position ) {
	// return all paths of length 3 that traverse slideable free spaces
	var distance_range = 3;
	var height_range_specification = 0;
	var valid_paths = board.find_unique_paths_matching_conditions( position, distance_range, height_range_specification )
	return valid_paths.destinations;
}

/*

Soldier Ant
	The Soldier Ant can move from its position to any other position around the
	Hive provided the restrictions are adhered to.

*/
function find_valid_movement_Soldier_Ant( board, position ) {
	return _.values( board.lookup_slide_destinations_within_range( position, 1, Infinity ));
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
function find_valid_movement_Mosquito( board, position ) {
	if( board.lookup_piece_stack_height( position ) > 1 ) // on top of the hive
		return find_valid_movement_Beetle( board, position );
	else { // not on top of the hive
		var adjacent_piece_types = _.compact( _.unique( 
			_.map( board.lookup_adjacent_positions( position ), function( adjacency ) {
				var piece_stack = adjacency.contents;
				if( typeof piece_stack !== "undefined" )
					return piece_stack[ piece_stack.length - 1 ].type; // type of top piece
			}
		)));
		var movement = _.flatten( _.map( adjacent_piece_types, 
			function( piece_type ) {
				switch( piece_type )
				{   
					case "Queen Bee":   return find_valid_movement_Queen_Bee(   board, position ); break;
					case "Beetle":      return find_valid_movement_Beetle(      board, position ); break;
					case "Grasshopper": return find_valid_movement_Grasshopper( board, position ); break;
					case "Spider":      return find_valid_movement_Spider(      board, position ); break;
					case "Soldier Ant": return find_valid_movement_Soldier_Ant( board, position ); break;
					case "Mosquito":    return [];                                                 break;
					case "Ladybug":     return find_valid_movement_Ladybug(     board, position ); break;
					case "Pillbug":     return find_valid_movement_Pillbug(     board, position ); break;
					default:            throw "unrecognized piece type: " + piece_type;            break;
				}
			}
		));
		return movement;
	}
}

function find_valid_special_abilities_Mosquito( board, position, turn_history ) {
	if( board.lookup_piece_stack_height( position ) > 1 ) // on top of the hive
		return [];
	else { // not on top of the hive
		var adjacent_piece_types = _.unique( _.map( 
			board.lookup_adjacent_positions( position ), function( adjacency ) {
				var piece_stack = adjacency.contents;
				if( typeof piece_stack !== "undefined" )
					return piece_stack[ piece_stack.length - 1 ].type; // type of top piece
			}
		));
		if( _.contains( adjacent_piece_types, "Pillbug" ))
			return find_valid_special_abilities_Pillbug( board, position, turn_history );
		else
			return [];
	}
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
function find_valid_movement_Ladybug( board, position ) {
	// return all paths of length 3 that traverse slideable free spaces
	var distance_range = 3;
	var height_range_specification = {
		"1-2": { min: 1, max: Infinity },
		"3": 0 //min: 0, max: 0
	};
	var valid_paths = board.find_unique_paths_matching_conditions( position, distance_range, height_range_specification )
	return valid_paths.destinations;
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

	Clarification from John Yianni: The Pillbug using its special ability does not
	count as "movement" from the perspective of an opposing player's Pillbug, and
	thus does not grant it immunity from being moved by the opposing Pillbug. Only
	physically moved pieces have such protection.

	Further Clarification: A stunned Pillbug (one that was just moved by a Pillbug)
	cannot use its special ability.

*/
function find_valid_movement_Pillbug( board, position ) {
	return board.lookup_adjacent_slide_positions( position );
}

function find_valid_special_abilities_Pillbug( board, position, turn_history ) {
	var adjacencies = board.lookup_adjacent_positions( position );
	var valid_occupied_adjacencies = [];
	var free_adjacencies = [];
	_.forEach( adjacencies, function( adjacency, direction ) {
		var stack_cw = adjacencies[ Position.rotation( direction, true )].contents;
		var stack_ccw = adjacencies[ Position.rotation( direction, false )].contents;
		if( typeof stack_cw === "undefined" || typeof stack_ccw === "undefined" 
		||  stack_cw.length <= 1 || stack_ccw.length <= 1 ) { // piece not sliding through a gate?
			if( typeof adjacency.contents === "undefined" )
				free_adjacencies.push( adjacency.position ); // position object expected here
			else if( adjacency.contents.length <= 1 // unstacked?
			&& board.check_contiguity( adjacency.position )) // won't break hive?
				valid_occupied_adjacencies.push( adjacency.position_key ); // position_key expected here
		}
	});
	if( turn_history ) {
		var last_turn = turn_history[ turn_history.length - 1 ];
		_.pull( valid_occupied_adjacencies, last_turn.destination );
	}
	// --------------
	var results = {};
	_.forEach( valid_occupied_adjacencies, function( occupied_position_key ) {
		results[ occupied_position_key ] = free_adjacencies;
	});
	return results;
}

// exports

exports.lookup_possible_turns = lookup_possible_turns;
exports.check_force_queen_placement = check_force_queen_placement;
exports.check_allow_queen_placement = check_allow_queen_placement;
exports.check_any_movement_allowed = check_any_movement_allowed;
exports.check_if_game_over = check_if_game_over;
exports.find_valid_placement_positions = find_valid_placement_positions;
exports.find_valid_movement = find_valid_movement;
exports.find_valid_special_abilities = find_valid_special_abilities;
exports.find_valid_movement_Queen_Bee = find_valid_movement_Queen_Bee;
exports.find_valid_movement_Beetle = find_valid_movement_Beetle;
exports.find_valid_movement_Grasshopper = find_valid_movement_Grasshopper;
exports.find_valid_movement_Spider = find_valid_movement_Spider;
exports.find_valid_movement_Soldier_Ant = find_valid_movement_Soldier_Ant;
exports.find_valid_special_abilities_Mosquito = find_valid_special_abilities_Mosquito;
exports.find_valid_movement_Mosquito = find_valid_movement_Mosquito;
exports.find_valid_movement_Ladybug = find_valid_movement_Ladybug;
exports.find_valid_movement_Pillbug = find_valid_movement_Pillbug;
exports.find_valid_special_abilities_Pillbug = find_valid_special_abilities_Pillbug;

