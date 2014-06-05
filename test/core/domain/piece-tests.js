var piece = require("../../../core/domain/piece");

exports["test that all piece types and colors are present"] = function( assert ) {
  var t, c, p;
  
  c = "White";
  t = "Queen Bee";
  p = piece.create_piece( c, t );
  assert.equal(
  	t == piece.type_name( p.type ) && c == piece.color_name( p.color ), 
  	"piece is created with correct color and type" );
  
  c = "White";
  t = "Beetle";
  p = piece.create_piece( c, t );
  assert.equal(
  	t == piece.type_name( p.type ) && c == piece.color_name( p.color ), 
  	"piece is created with correct color and type" );
  
  c = "White";
  t = "Grasshopper";
  p = piece.create_piece( c, t );
  assert.equal(
  	t == piece.type_name( p.type ) && c == piece.color_name( p.color ), 
  	"piece is created with correct color and type" );
  
  c = "White";
  t = "Spider";
  p = piece.create_piece( c, t );
  assert.equal(
  	t == piece.type_name( p.type ) && c == piece.color_name( p.color ), 
  	"piece is created with correct color and type" );
  
  c = "White";
  t = "Soldier Ant";
  p = piece.create_piece( c, t );
  assert.equal(
  	t == piece.type_name( p.type ) && c == piece.color_name( p.color ), 
  	"piece is created with correct color and type" );
  
  c = "White";
  t = "Mosquito";
  p = piece.create_piece( c, t );
  assert.equal(
  	t == piece.type_name( p.type ) && c == piece.color_name( p.color ), 
  	"piece is created with correct color and type" );
  
  c = "White";
  t = "Ladybug";
  p = piece.create_piece( c, t );
  assert.equal(
  	t == piece.type_name( p.type ) && c == piece.color_name( p.color ), 
  	"piece is created with correct color and type" );
  
  c = "White";
  t = "Pillbug";
  p = piece.create_piece( c, t );
  assert.equal(
  	t == piece.type_name( p.type ) && c == piece.color_name( p.color ), 
  	"piece is created with correct color and type" );
  
  c = "Black";
  t = "Queen Bee";
  p = piece.create_piece( c, t );
  assert.equal(
  	t == piece.type_name( p.type ) && c == piece.color_name( p.color ), 
  	"piece is created with correct color and type" );
  
  c = "Black";
  t = "Beetle";
  p = piece.create_piece( c, t );
  assert.equal(
  	t == piece.type_name( p.type ) && c == piece.color_name( p.color ), 
  	"piece is created with correct color and type" );
  
  c = "Black";
  t = "Grasshopper";
  p = piece.create_piece( c, t );
  assert.equal(
  	t == piece.type_name( p.type ) && c == piece.color_name( p.color ), 
  	"piece is created with correct color and type" );
  
  c = "Black";
  t = "Spider";
  p = piece.create_piece( c, t );
  assert.equal(
  	t == piece.type_name( p.type ) && c == piece.color_name( p.color ), 
  	"piece is created with correct color and type" );
  
  c = "Black";
  t = "Soldier Ant";
  p = piece.create_piece( c, t );
  assert.equal(
  	t == piece.type_name( p.type ) && c == piece.color_name( p.color ), 
  	"piece is created with correct color and type" );
  
  c = "Black";
  t = "Mosquito";
  p = piece.create_piece( c, t );
  assert.equal(
  	t == piece.type_name( p.type ) && c == piece.color_name( p.color ), 
  	"piece is created with correct color and type" );
  
  c = "Black";
  t = "Ladybug";
  p = piece.create_piece( c, t );
  assert.equal(
  	t == piece.type_name( p.type ) && c == piece.color_name( p.color ), 
  	"piece is created with correct color and type" );
  
  c = "Black";
  t = "Pillbug";
  p = piece.create_piece( c, t );
  assert.equal(
  	t == piece.type_name( p.type ) && c == piece.color_name( p.color ), 
  	"piece is created with correct color and type" );
}

if( module == require.main )
	require("test").run( exports );
