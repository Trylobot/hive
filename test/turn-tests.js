var Position = require("../core/domain/position");
var Turn = require("../core/domain/turn");

exports["test turn"] = function( assert ) {
	var turn;

	turn = Turn.create_placement( "Grasshopper", Position.create( 2, 0 ));
	assert.ok(
		turn.turn_type == "Placement" && turn.piece_type == "Grasshopper" && turn.destination == "2,0",
		"actual matches expected" );
	
	turn = Turn.create_movement( Position.create( 0, 0 ), Position.create( 2, 0 ));
	assert.ok(
		turn.turn_type == "Movement" && turn.source == "0,0" && turn.destination == "2,0",
		"actual matches expected" );
	
	turn = Turn.create_forfeit();
	assert.ok(
		turn.turn_type == "Forfeit",
		"actual matches expected" );
}

if( module == require.main )
	require("test").run( exports );
