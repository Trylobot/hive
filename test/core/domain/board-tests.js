var piece = require("../../../core/domain/piece");
var position = require("../../../core/domain/position");
var board = require("../../../core/domain/board");

// exports["test that board pieces can be placed and moved"] = function( assert ) {
	
// }

exports["test lookup_free_spaces"] = function( assert ) {
	var b, c, t, p, v, free_spaces;

	b = board.create();
	c = "White";
	t = "Queen Bee";
	p = piece.create( c, t );
	v = position.create( 0, 0, 0 );
	b.place_piece( p, v );
	free_spaces = b.lookup_free_spaces();
	assert.ok(
		!!free_spaces["-2,0,0"] &&
		!!free_spaces["-1,1,0"] &&
		!!free_spaces["1,1,0"] &&
		!!free_spaces["2,0,0"] &&
		!!free_spaces["1,-1,0"] &&
		!!free_spaces["-1,-1,0"],
		"free spaces reported are correct; free_spaces = " + JSON.stringify( free_spaces ));
}

if( module == require.main )
	require("test").run( exports );
