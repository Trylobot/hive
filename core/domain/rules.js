var _ = require("lodash");
_(global).extend(require("./util"));
var piece = require("./piece");
var position = require("./position");
var board = require("./board");

/*
rules.js
this module is used to represent the rules of hive.
	it can provide a list of valid end positions for a piece, 
	given a board state (for a placement check)
	or a board state and a current position (for a movement check)
*/

// functions

function find_valid_placement( piece, board ) {
	
}

function find_valid_movement( piece, board, position ) {
	
}

// exports

exports.find_valid_placement = find_valid_placement;
exports.find_valid_movement = find_valid_movement;

