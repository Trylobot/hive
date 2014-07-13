var Position = require("../core/domain/position");

exports["test position create, encode, decode"] = function( assert ) {
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
}

exports["test position encode_all, decode_all"] = function( assert ) {
	var position_array, position_key_array, position_array2;

	position_array = [
		Position.create( 0, 0 ),
		Position.create( -1, -1 ),
		Position.create( 2, 0 )
	];
	position_key_array = Position.encode_all( position_array );
	assert.ok( json_equality( position_key_array,
		["0,0","-1,-1","2,0"] ),
		"positions encoded properly" );

	position_array2 = Position.decode_all( position_key_array );
	assert.ok( json_equality( position_array, 
		position_array2 ),
		"positions decoded properly" );
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

exports["test position rotation_about_position"] = function( assert ) {
	var position, rotated_position;

	position = Position.create( -2, 0 );
	rotated_position = position.rotation_about_position( Position.create( 0, 0 ), 1 );
	assert.ok( rotated_position.row == -1 && rotated_position.col == 1,
		"rotated_position should be in correct location" );
}

exports["test position adjacencies"] = function( assert ) {

}

exports["test position rotation"] = function( assert ) {

}

exports["test position force_encoded_string"] = function( assert ) {

}

exports["test position force_decoded_object"] = function( assert ) {

}

exports["test position copy"] = function( assert ) {
	var position, position2;

	position = Position.create( 0, 0 );
	position2 = position.copy();
	assert.ok( json_equality( position, position2 ),
		"position copied" );
}

exports["test position is_equal"] = function( assert ) {
	
}

if( module == require.main )
	require("test").run( exports );

