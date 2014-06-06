var Piece = require("../../../core/domain/piece");

exports["test that all pieces can be created"] = function( assert ) {
	var t, c, p;
	
	c = "White";
	t = "Queen Bee";
	p = Piece.create( c, t );
	assert.ok(
		t == Piece.type_name( p.type ) && c == Piece.color_name( p.color ), 
		"piece is created with correct color and type; piece = " + JSON.stringify( p ));
	
	c = "White";
	t = "Beetle";
	p = Piece.create( c, t );
	assert.ok(
		t == Piece.type_name( p.type ) && c == Piece.color_name( p.color ), 
		"piece is created with correct color and type; piece = " + JSON.stringify( p ));
	
	c = "White";
	t = "Grasshopper";
	p = Piece.create( c, t );
	assert.ok(
		t == Piece.type_name( p.type ) && c == Piece.color_name( p.color ), 
		"piece is created with correct color and type; piece = " + JSON.stringify( p ));
	
	c = "White";
	t = "Spider";
	p = Piece.create( c, t );
	assert.ok(
		t == Piece.type_name( p.type ) && c == Piece.color_name( p.color ), 
		"piece is created with correct color and type; piece = " + JSON.stringify( p ));
	
	c = "White";
	t = "Soldier Ant";
	p = Piece.create( c, t );
	assert.ok(
		t == Piece.type_name( p.type ) && c == Piece.color_name( p.color ), 
		"piece is created with correct color and type; piece = " + JSON.stringify( p ));
	
	c = "White";
	t = "Mosquito";
	p = Piece.create( c, t );
	assert.ok(
		t == Piece.type_name( p.type ) && c == Piece.color_name( p.color ), 
		"piece is created with correct color and type; piece = " + JSON.stringify( p ));
	
	c = "White";
	t = "Ladybug";
	p = Piece.create( c, t );
	assert.ok(
		t == Piece.type_name( p.type ) && c == Piece.color_name( p.color ), 
		"piece is created with correct color and type; piece = " + JSON.stringify( p ));
	
	c = "White";
	t = "Pillbug";
	p = Piece.create( c, t );
	assert.ok(
		t == Piece.type_name( p.type ) && c == Piece.color_name( p.color ), 
		"piece is created with correct color and type; piece = " + JSON.stringify( p ));
	
	c = "Black";
	t = "Queen Bee";
	p = Piece.create( c, t );
	assert.ok(
		t == Piece.type_name( p.type ) && c == Piece.color_name( p.color ), 
		"piece is created with correct color and type; piece = " + JSON.stringify( p ));
	
	c = "Black";
	t = "Beetle";
	p = Piece.create( c, t );
	assert.ok(
		t == Piece.type_name( p.type ) && c == Piece.color_name( p.color ), 
		"piece is created with correct color and type; piece = " + JSON.stringify( p ));
	
	c = "Black";
	t = "Grasshopper";
	p = Piece.create( c, t );
	assert.ok(
		t == Piece.type_name( p.type ) && c == Piece.color_name( p.color ), 
		"piece is created with correct color and type; piece = " + JSON.stringify( p ));
	
	c = "Black";
	t = "Spider";
	p = Piece.create( c, t );
	assert.ok(
		t == Piece.type_name( p.type ) && c == Piece.color_name( p.color ), 
		"piece is created with correct color and type; piece = " + JSON.stringify( p ));
	
	c = "Black";
	t = "Soldier Ant";
	p = Piece.create( c, t );
	assert.ok(
		t == Piece.type_name( p.type ) && c == Piece.color_name( p.color ), 
		"piece is created with correct color and type; piece = " + JSON.stringify( p ));
	
	c = "Black";
	t = "Mosquito";
	p = Piece.create( c, t );
	assert.ok(
		t == Piece.type_name( p.type ) && c == Piece.color_name( p.color ), 
		"piece is created with correct color and type; piece = " + JSON.stringify( p ));
	
	c = "Black";
	t = "Ladybug";
	p = Piece.create( c, t );
	assert.ok(
		t == Piece.type_name( p.type ) && c == Piece.color_name( p.color ), 
		"piece is created with correct color and type; piece = " + JSON.stringify( p ));
	
	c = "Black";
	t = "Pillbug";
	p = Piece.create( c, t );
	assert.ok(
		t == Piece.type_name( p.type ) && c == Piece.color_name( p.color ), 
		"piece is created with correct color and type; piece = " + JSON.stringify( p ));
}

if( module == require.main )
	require("test").run( exports );
