var Position = require("../../../core/domain/position");

exports["test position create, encode, decode, encode_all, decode_all"] = function( assert ) {
	var position, position_key;

	position = Position.create( 0, 0 );
	assert.equal(
		JSON.stringify( position ),
		JSON.stringify( { row: 0, col: 0 } ),
		"position has the correct data" );
	position_key = position.encode();
	assert.equal(
		"0,0",
		position_key,
		"encoded position has the correct value" );

	position = Position.create( 9, -13 );
	assert.equal(
		JSON.stringify( position ),
		JSON.stringify( { row: 9, col: -13 } ),
		"position has the correct data" );
	position_key = position.encode();
	assert.equal(
		"9,-13",
		position_key,
		"encoded position has the correct value" );

	position_key = "-3,5";
	position = Position.decode( position_key );
	assert.equal(
		JSON.stringify( position ),
		JSON.stringify( { row: -3, col: 5 } ),
		"decoded position has the correct data" );

	// TODO: test encode_all

	// TODO: test decode_all
	
}

exports["test position translation"] = function( assert ) {
	var position, translated_position;

	position = Position.create( 0, 0 );

	translated_position = position.translation( "12 o'clock" );
	assert.equal(
		JSON.stringify( translated_position ),
		JSON.stringify({ row: -2, col: 0 }),
		"12 o'clock" );

	translated_position = position.translation( "2 o'clock" );
	assert.equal(
		JSON.stringify( translated_position ),
		JSON.stringify({ row: -1, col: 1 }),
		"2 o'clock" );

	translated_position = position.translation( "4 o'clock" );
	assert.equal(
		JSON.stringify( translated_position ),
		JSON.stringify({ row: 1, col: 1 }),
		"4 o'clock" );

	translated_position = position.translation( "6 o'clock" );
	assert.equal(
		JSON.stringify( translated_position ),
		JSON.stringify({ row: 2, col: 0 }),
		"6 o'clock" );

	translated_position = position.translation( "8 o'clock" );
	assert.equal(
		JSON.stringify( translated_position ),
		JSON.stringify({ row: 1, col: -1 }),
		"8 o'clock" );

	translated_position = position.translation( "10 o'clock" );
	assert.equal(
		JSON.stringify( translated_position ),
		JSON.stringify({ row: -1, col: -1 }),
		"10 o'clock" );
}

exports["test position copy"] = function( assert ) {
	
}

if( module == require.main )
	require("test").run( exports );
