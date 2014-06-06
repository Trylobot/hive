var _ = require("lodash");
var Piece = require("../../../core/domain/piece");
var Position = require("../../../core/domain/position");
var Board = require("../../../core/domain/board");

// exports["test that board pieces can be placed and moved"] = function( assert ) {
	
// }

exports["test lookup_free_spaces"] = function( assert ) {
	var b, c, t, p, v, free_spaces;

	b = Board.create();
	c = "White";
	t = "Queen Bee";
	p = Piece.create( c, t );
	v = Position.create( 0, 0, 0 );
	b.place_piece( p, v );
	free_spaces = b.lookup_free_spaces();
	assert.ok(
		_.keys(free_spaces).length == 6,
		"there are 6 free spaces; _.keys(free_spaces).length = " + _.keys(free_spaces).length);
}

if( module == require.main )
	require("test").run( exports );
