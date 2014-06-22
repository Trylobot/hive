var Piece = require("../core/domain/piece");

exports["test piece create"] = function( assert ) {
	var color, type, piece;
	
	color = "White";
	type = "Queen Bee";
	piece = Piece.create( color, type );
	assert.ok(
		type == piece.type && color == piece.color,
		color + " " + type );
	
	color = "White";
	type = "Beetle";
	piece = Piece.create( color, type );
	assert.ok(
		type == piece.type && color == piece.color,
		color + " " + type );
	
	color = "White";
	type = "Grasshopper";
	piece = Piece.create( color, type );
	assert.ok(
		type == piece.type && color == piece.color,
		color + " " + type );
	
	color = "White";
	type = "Spider";
	piece = Piece.create( color, type );
	assert.ok(
		type == piece.type && color == piece.color,
		color + " " + type );
	
	color = "White";
	type = "Soldier Ant";
	piece = Piece.create( color, type );
	assert.ok(
		type == piece.type && color == piece.color,
		color + " " + type );
	
	color = "White";
	type = "Mosquito";
	piece = Piece.create( color, type );
	assert.ok(
		type == piece.type && color == piece.color,
		color + " " + type );
	
	color = "White";
	type = "Ladybug";
	piece = Piece.create( color, type );
	assert.ok(
		type == piece.type && color == piece.color,
		color + " " + type );
	
	color = "White";
	type = "Pillbug";
	piece = Piece.create( color, type );
	assert.ok(
		type == piece.type && color == piece.color,
		color + " " + type );
	
	color = "Black";
	type = "Queen Bee";
	piece = Piece.create( color, type );
	assert.ok(
		type == piece.type && color == piece.color,
		color + " " + type );
	
	color = "Black";
	type = "Beetle";
	piece = Piece.create( color, type );
	assert.ok(
		type == piece.type && color == piece.color,
		color + " " + type );
	
	color = "Black";
	type = "Grasshopper";
	piece = Piece.create( color, type );
	assert.ok(
		type == piece.type && color == piece.color,
		color + " " + type );
	
	color = "Black";
	type = "Spider";
	piece = Piece.create( color, type );
	assert.ok(
		type == piece.type && color == piece.color,
		color + " " + type );
	
	color = "Black";
	type = "Soldier Ant";
	piece = Piece.create( color, type );
	assert.ok(
		type == piece.type && color == piece.color,
		color + " " + type );
	
	color = "Black";
	type = "Mosquito";
	piece = Piece.create( color, type );
	assert.ok(
		type == piece.type && color == piece.color,
		color + " " + type );
	
	color = "Black";
	type = "Ladybug";
	piece = Piece.create( color, type );
	assert.ok(
		type == piece.type && color == piece.color,
		color + " " + type );
	
	color = "Black";
	type = "Pillbug";
	piece = Piece.create( color, type );
	assert.ok(
		type == piece.type && color == piece.color,
		color + " " + type );
}

if( module == require.main )
	require("test").run( exports );
