var util = require("./domain/util");
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
	assert.ok( util.json_equality( position_key_array,
		["0,0","-1,-1","2,0"] ),
		"positions encoded properly" );

	position_array2 = Position.decode_all( position_key_array );
	assert.ok( util.json_equality( position_array, 
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
		"12 o'clock translation correct" );

	translated_position = position.translation( "2 o'clock" );
	assert.equal(
		JSON.stringify( translated_position ),
		JSON.stringify({ row: -1, col: 1 }),
		"2 o'clock translation correct" );

	translated_position = position.translation( "4 o'clock" );
	assert.equal(
		JSON.stringify( translated_position ),
		JSON.stringify({ row: 1, col: 1 }),
		"4 o'clock translation correct" );

	translated_position = position.translation( "6 o'clock" );
	assert.equal(
		JSON.stringify( translated_position ),
		JSON.stringify({ row: 2, col: 0 }),
		"6 o'clock translation correct" );

	translated_position = position.translation( "8 o'clock" );
	assert.equal(
		JSON.stringify( translated_position ),
		JSON.stringify({ row: 1, col: -1 }),
		"8 o'clock translation correct" );

	translated_position = position.translation( "10 o'clock" );
	assert.equal(
		JSON.stringify( translated_position ),
		JSON.stringify({ row: -1, col: -1 }),
		"10 o'clock translation correct" );
}

// exports["test position rotation_about_position"] = function( assert ) {
// 	var position, rotated_position;

// 	position = Position.create( -2, 0 );
// 	rotated_position = position.rotation_about_position( Position.create( 0, 0 ), 1 );
// 	assert.ok( rotated_position.row == -1 && rotated_position.col == 1,
// 		"rotated_position should be in correct location" );
// }

exports["test position adjacencies"] = function( assert ) {
	var position, adjacencies;

	position = Position.create( -5, -1 );
	adjacencies = Position.encode_all( position.adjacencies() );
	assert.ok( util.json_equality( adjacencies,
		["-7,-1","-6,0","-4,0","-3,-1","-4,-2","-6,-2"] ),
		"adjacent positions reported properly" );
}

exports["test position rotation"] = function( assert ) {
	var clockwise = true;
	assert.ok( 
		"2 o'clock"  == Position.rotation( "12 o'clock", clockwise ) &&
		"10 o'clock" == Position.rotation( "12 o'clock", !clockwise ),
		"12 o'clock rotation correct" );
	assert.ok( 
		"4 o'clock"  == Position.rotation( "2 o'clock", clockwise ) &&
		"12 o'clock" == Position.rotation( "2 o'clock", !clockwise ),
		"2 o'clock rotation correct" );
	assert.ok( 
		"6 o'clock"  == Position.rotation( "4 o'clock", clockwise ) &&
		"2 o'clock" == Position.rotation( "4 o'clock", !clockwise ),
		"4 o'clock rotation correct" );
	assert.ok( 
		"8 o'clock"  == Position.rotation( "6 o'clock", clockwise ) &&
		"4 o'clock" == Position.rotation( "6 o'clock", !clockwise ),
		"6 o'clock rotation correct" );
	assert.ok( 
		"10 o'clock"  == Position.rotation( "8 o'clock", clockwise ) &&
		"6 o'clock" == Position.rotation( "8 o'clock", !clockwise ),
		"8 o'clock rotation correct" );
	assert.ok( 
		"12 o'clock"  == Position.rotation( "10 o'clock", clockwise ) &&
		"8 o'clock" == Position.rotation( "10 o'clock", !clockwise ),
		"10 o'clock rotation correct" );
}

exports["test position force_encoded_string"] = function( assert ) {
	var position, position_key, result;
	position = Position.create( 3, 1 );
	position_key = "3,1";
	assert.ok( Position.force_encoded_string( position )     == "3,1"
		&&     Position.force_encoded_string( position_key ) == "3,1",
		"encoded_string correct" );
}

exports["test position force_decoded_object"] = function( assert ) {
	var position, position_key, result;
	position = Position.create( -1, -1 );
	position_key = "-1,-1";
	assert.ok( util.json_equality( Position.force_decoded_object( position ),     { row: -1, col: -1 })
		&&     util.json_equality( Position.force_decoded_object( position_key ), { row: -1, col: -1 }),
		"decoded_object correct" );
}

exports["test position copy"] = function( assert ) {
	var position, position2;

	position = Position.create( 0, 0 );
	position2 = position.copy();
	assert.ok( util.json_equality( position, position2 ),
		"position copied" );
}

exports["test position is_equal"] = function( assert ) {
	var p0, p1, p2;
	p0 = Position.create( 0, 0 );
	p1 = Position.create( 0, 2 );
	p2 = Position.create( 0, 0 );
	assert.ok( !p0.is_equal( p1 ), "non-equality" );
	assert.ok( p0.is_equal( p2 ), "equality" );
}

if( module == require.main )
	require("test").run( exports );

