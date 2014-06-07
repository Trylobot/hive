var Position = require("../../../core/domain/position");

exports["test position create, encode, decode"] = function( assert ) {
	var position, position_key;

	position = Position.create( 0, 0, 0 );
	assert.equal(
		JSON.stringify( position ),
		JSON.stringify( { row: 0, col: 0, layer: 0 } ),
		"position has the correct data" );
	position_key = position.encode();
	assert.equal(
		"0,0,0",
		position_key,
		"encoded position has the correct value" );

	position = Position.create( 9, -13, 6 );
	assert.equal(
		JSON.stringify( position ),
		JSON.stringify( { row: 9, col: -13, layer: 6 } ),
		"position has the correct data" );
	position_key = position.encode();
	assert.equal(
		"9,-13,6",
		position_key,
		"encoded position has the correct value" );

	position_key = "-3,5,0";
	position = Position.decode( position_key );
	assert.equal(
		JSON.stringify( position ),
		JSON.stringify( { row: -3, col: 5, layer: 0 } ),
		"decoded position has the correct data" );
}

exports["test position translation"] = function( assert ) {
	var position, translated_position;

	position = Position.create( 0, 0, 0 );

	translated_position = position.translation( "-row" );
	assert.equal(
		JSON.stringify( translated_position ),
		JSON.stringify( { row: -2, col: 0, layer: 0 } ),
		"12 o'clock" );

	translated_position = position.translation( "-row+col" );
	assert.equal(
		JSON.stringify( translated_position ),
		JSON.stringify( { row: -1, col: 1, layer: 0 } ),
		"2 o'clock" );

	translated_position = position.translation( "+row+col" );
	assert.equal(
		JSON.stringify( translated_position ),
		JSON.stringify( { row: 1, col: 1, layer: 0 } ),
		"4 o'clock" );

	translated_position = position.translation( "+row" );
	assert.equal(
		JSON.stringify( translated_position ),
		JSON.stringify( { row: 2, col: 0, layer: 0 } ),
		"6 o'clock" );

	translated_position = position.translation( "+row-col" );
	assert.equal(
		JSON.stringify( translated_position ),
		JSON.stringify( { row: 1, col: -1, layer: 0 } ),
		"8 o'clock" );

	translated_position = position.translation( "-row-col" );
	assert.equal(
		JSON.stringify( translated_position ),
		JSON.stringify( { row: -1, col: -1, layer: 0 } ),
		"10 o'clock" );

	translated_position = position.translation( "+layer" );
	assert.equal(
		JSON.stringify( translated_position ),
		JSON.stringify( { row: 0, col: 0, layer: 1 } ),
		"straight up" );

	translated_position = position.translation( "-layer" );
	assert.equal(
		JSON.stringify( translated_position ),
		JSON.stringify( { row: 0, col: 0, layer: -1 } ),
		"straight down" );

}

if( module == require.main )
	require("test").run( exports );
