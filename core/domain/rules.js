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
*/

// functions

function find_valid_placement( piece, board ) {
	// placement can only occur in an empty spot on the bottom layer
	var free_spaces = board.lookup_free_spaces();
}

function find_valid_movement( piece, board, position ) {
	
}

// exports

exports.find_valid_placement = find_valid_placement;
exports.find_valid_movement = find_valid_movement;

