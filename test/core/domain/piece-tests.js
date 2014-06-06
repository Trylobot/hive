var piece = require("../../../core/domain/piece");

exports["test that all pieces can be created"] = function( assert ) {
	var t, c, p;
	
	c = "White";
	t = "Queen Bee";
	p = piece.create( c, t );
	assert.ok(
		t == piece.type_name( p.type ) && c == piece.color_name( p.color ), 
		"piece is created with correct color and type; piece = " + JSON.stringify( p ));
	
	c = "White";
	t = "Beetle";
	p = piece.create( c, t );
	assert.ok(
		t == piece.type_name( p.type ) && c == piece.color_name( p.color ), 
		"piece is created with correct color and type; piece = " + JSON.stringify( p ));
	
	c = "White";
	t = "Grasshopper";
	p = piece.create( c, t );
	assert.ok(
		t == piece.type_name( p.type ) && c == piece.color_name( p.color ), 
		"piece is created with correct color and type; piece = " + JSON.stringify( p ));
	
	c = "White";
	t = "Spider";
	p = piece.create( c, t );
	assert.ok(
		t == piece.type_name( p.type ) && c == piece.color_name( p.color ), 
		"piece is created with correct color and type; piece = " + JSON.stringify( p ));
	
	c = "White";
	t = "Soldier Ant";
	p = piece.create( c, t );
	assert.ok(
		t == piece.type_name( p.type ) && c == piece.color_name( p.color ), 
		"piece is created with correct color and type; piece = " + JSON.stringify( p ));
	
	c = "White";
	t = "Mosquito";
	p = piece.create( c, t );
	assert.ok(
		t == piece.type_name( p.type ) && c == piece.color_name( p.color ), 
		"piece is created with correct color and type; piece = " + JSON.stringify( p ));
	
	c = "White";
	t = "Ladybug";
	p = piece.create( c, t );
	assert.ok(
		t == piece.type_name( p.type ) && c == piece.color_name( p.color ), 
		"piece is created with correct color and type; piece = " + JSON.stringify( p ));
	
	c = "White";
	t = "Pillbug";
	p = piece.create( c, t );
	assert.ok(
		t == piece.type_name( p.type ) && c == piece.color_name( p.color ), 
		"piece is created with correct color and type; piece = " + JSON.stringify( p ));
	
	c = "Black";
	t = "Queen Bee";
	p = piece.create( c, t );
	assert.ok(
		t == piece.type_name( p.type ) && c == piece.color_name( p.color ), 
		"piece is created with correct color and type; piece = " + JSON.stringify( p ));
	
	c = "Black";
	t = "Beetle";
	p = piece.create( c, t );
	assert.ok(
		t == piece.type_name( p.type ) && c == piece.color_name( p.color ), 
		"piece is created with correct color and type; piece = " + JSON.stringify( p ));
	
	c = "Black";
	t = "Grasshopper";
	p = piece.create( c, t );
	assert.ok(
		t == piece.type_name( p.type ) && c == piece.color_name( p.color ), 
		"piece is created with correct color and type; piece = " + JSON.stringify( p ));
	
	c = "Black";
	t = "Spider";
	p = piece.create( c, t );
	assert.ok(
		t == piece.type_name( p.type ) && c == piece.color_name( p.color ), 
		"piece is created with correct color and type; piece = " + JSON.stringify( p ));
	
	c = "Black";
	t = "Soldier Ant";
	p = piece.create( c, t );
	assert.ok(
		t == piece.type_name( p.type ) && c == piece.color_name( p.color ), 
		"piece is created with correct color and type; piece = " + JSON.stringify( p ));
	
	c = "Black";
	t = "Mosquito";
	p = piece.create( c, t );
	assert.ok(
		t == piece.type_name( p.type ) && c == piece.color_name( p.color ), 
		"piece is created with correct color and type; piece = " + JSON.stringify( p ));
	
	c = "Black";
	t = "Ladybug";
	p = piece.create( c, t );
	assert.ok(
		t == piece.type_name( p.type ) && c == piece.color_name( p.color ), 
		"piece is created with correct color and type; piece = " + JSON.stringify( p ));
	
	c = "Black";
	t = "Pillbug";
	p = piece.create( c, t );
	assert.ok(
		t == piece.type_name( p.type ) && c == piece.color_name( p.color ), 
		"piece is created with correct color and type; piece = " + JSON.stringify( p ));
}

if( module == require.main )
	require("test").run( exports );
