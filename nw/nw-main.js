"use strict";

// dependencies
var _ = require("lodash");
_(global).extend(require("../core/domain/util"));
var package_json = require("./package.json");
var Piece = require("../core/domain/piece");
var Position = require("../core/domain/position");
var Turn = require("../core/domain/turn");
var Board = require("../core/domain/board");
var Rules = require("../core/domain/rules");
var Game = require("../core/domain/game");
var Player = require("../core/domain/player");
var Core = require("../core/core");

/*
nw-main.js
this module manages game instances, and handles communications between players and games.
	players can be humans only, on the same machine (for now).
*/

// basics
window.onresize = window_resize;
// view-model
var model = {
	// pixi.js
	stage: null,
	background: null,
	background_color: null,
	renderer_width: null,
	renderer_height: null,
	renderer_halfWidth: null,
	renderer_halfHeight: null,
	renderer: null,
	spritemap_loader: null,
	textures: null,
	pixi_board: null,
	pixi_white_hand: null,
	pixi_black_hand: null,
	status_text_fg: null,
	status_text_bg: null,
	col_delta_x: (140 -   1), // based on size of sprite at scale=1
	row_delta_y: (351 - 269),
	drag_start_interaction_position: null,
	drag_start_pixi_board_position: null,
	// hive domain
	core: null,
	game_id: null,
	game_instance: null
};
register_window_size( model );
// spritemap
model.spritemap_loader = new PIXI.AssetLoader([ "spritemap.json" ]);
model.spritemap_loader.onComplete = on_assets_loaded;
model.spritemap_loader.load();
// stage
model.background_color = 0x808080;
var interactive = true;
model.stage = new PIXI.Stage( model.background_color, interactive );
model.background = new PIXI.DisplayObjectContainer();
model.background.setInteractive( interactive );
update_background_hit_rect( model );
model.background.mousedown = background_mousedown;
model.background.mousemove = background_mousemove;
model.background.mouseup = background_mouseup;
model.background.mouseout = background_mouseup;
model.stage.addChild( model.background );
// renderer
model.renderer = PIXI.autoDetectRenderer( 
	model.renderer_width, 
	model.renderer_height );
model.renderer.view.className = "PIXI-Renderer";
document.body.appendChild( model.renderer.view );
requestAnimFrame( animate );
// functions
function create_pixi_piece( hive_piece ) {
	var tile_sprite = new PIXI.Sprite( model.textures[ hive_piece.color + " Tile" ]);
	tile_sprite.anchor.x = 0.5;
	tile_sprite.anchor.y = 0.5;
	var symbol_sprite = new PIXI.Sprite( model.textures[ hive_piece.color + " " + hive_piece.type ]);
	symbol_sprite.anchor.x = 0.5;
	symbol_sprite.anchor.y = 0.5;
	var container = new PIXI.DisplayObjectContainer();
	container.addChild( tile_sprite );
	container.addChild( symbol_sprite );
	return container;
}
function create_pixi_marquee( piece_color ) {
	var pixi_marquee = new PIXI.Sprite( model.textures[ hive_piece.color + " Marquee" ]);
	pixi_marquee.anchor.x = 0.5;
	pixi_marquee.anchor.y = 0.5;
	return pixi_marquee;
}
function create_pixi_board( hive_board, hive_possible_turns ) {
	// for now, only shows pieces on top of each piece-stack
	// due to top-down orthogonal view
	var container = new PIXI.DisplayObjectContainer()
	var occupied_position_keys = hive_board.lookup_occupied_position_keys();
	_.forEach( occupied_position_keys, function( position_key ) {
		var hive_piece = hive_board.lookup_piece_by_key( position_key );
		var pixi_piece = create_pixi_piece( hive_piece );
		var position = Position.decode( position_key );
		pixi_piece.position.x = position.col * model.col_delta_x;
		pixi_piece.position.y = position.row * model.row_delta_y;
		container.addChild( pixi_piece );
	});
	return container;
}
function create_pixi_hand( hive_hand ) {

}
function register_window_size( model ) {
	model.renderer_width = window.innerWidth;
	model.renderer_height = window.innerHeight;
	model.renderer_halfWidth = Math.floor( window.innerWidth / 2 );
	model.renderer_halfHeight = Math.floor( window.innerHeight / 2 );
}
function animate() {
	model.renderer.render( model.stage );
	requestAnimFrame( animate );
}
// hive domain
var core = Core.create();
model.core = core;
//
function on_assets_loaded() {
	initialize_textures();
	// start game after an arbitrary delay to allow fonts to be loaded (ultimately this will be in response to a form submit)
	start_game();
}
function initialize_textures() {
	model.textures = {};
	_.forEach( Piece.colors_enum, function( piece_color ) {
		// add tiles (2x)
		var frame_key = piece_color + " Tile";
		model.textures[ frame_key ] = PIXI.Texture.fromFrame( frame_key );
		// add marquee (2x)
		var frame_key = piece_color + " Marquee";
		model.textures[ frame_key ] = PIXI.Texture.fromFrame( frame_key );
		// add symbols (16x)
		_.forEach( Piece.types_enum, function( piece_type ) {
			var frame_key = piece_color + " " + piece_type;
			model.textures[ frame_key ] = PIXI.Texture.fromFrame( frame_key );
		});
	});
}
function start_game() { //$scope.start_game = function() {
	model.game_id = core.create_game(
		Player.create( "Human" ), // White Player
		Player.create( "Human" ), // Black Player
		false, // Game: Use Mosquito?
		false, // Game: Use Ladybug?
		false ); // Game: Use Pillbug?
	model.game_instance = core.lookup_game( model.game_id );
	setup_mock_game();
}
function setup_mock_game() {
	// TODO: setup actual first turn
	var status_text_fg = new PIXI.Text( "", { font: "200 48px DINPro", fill: "black" });
	var status_text_bg = new PIXI.Text( "", { font: "200 48px DINPro", fill: "white" });
	model.status_text_fg = status_text_fg;
	model.status_text_bg = status_text_bg;
	position_status_text( model );
	// ----
	var hive_game = model.game_instance.game;
	var hive_board = hive_game.board;
	hive_board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( 0, 0 ));
	hive_board.place_piece( Piece.create( "Black", "Queen Bee" ), Position.create( 1, 1 ));
	var hive_possible_turns = Rules.lookup_possible_turns( 
		hive_game.player_turn, 
		hive_game.board, 
		hive_game.hands[ hive_game.player_turn ],
		hive_game.turn_number );
	var pixi_board = create_pixi_board( hive_board, hive_possible_turns );
	model.pixi_board = pixi_board;
	pixi_board.position.x = model.renderer_halfWidth;
	pixi_board.position.y = model.renderer_halfHeight;
	var pixi_white_hand = null;
	var pixi_black_hand = null;
	model.pixi_white_hand = pixi_white_hand;
	model.pixi_black_hand = pixi_black_hand;	
	// ----
	model.stage.addChild( pixi_board );
	model.stage.addChild( status_text_bg );
	model.stage.addChild( status_text_fg );
	update_status_text( model );
}

// events
function window_resize() {
	register_window_size( model );
	model.renderer.resize( model.renderer_width, model.renderer_height );
	update_background_hit_rect( model );
	position_status_text( model );
}
function update_background_hit_rect( model ) {
	model.background.hitArea = new PIXI.Rectangle( 0, 0, model.renderer_width, model.renderer_height );	
}
function position_status_text( model ) {
	model.status_text_fg.position.x = 12;
	model.status_text_fg.position.y = model.renderer_height - 62;
	model.status_text_bg.position.x = model.status_text_fg.position.x;
	model.status_text_bg.position.y = model.status_text_fg.position.y - 2;
}
function update_status_text( model ) {
	model.status_text_fg.setText( model.game_instance.game.player_turn + "'s turn" );
	model.status_text_bg.setText( model.game_instance.game.player_turn + "'s turn" );
}

// right-click drag: start
function background_mousedown( interactionData ) {
	if( interactionData.originalEvent.button == 2 && model.pixi_board ) {
		model.drag_start_mouse = _.clone( interactionData.global );
		model.drag_start_pixi_board = _.clone( model.pixi_board.position );
		document.body.style.cursor = "move";
	}
}
// right-click drag: move pixi_board around
function background_mousemove( interactionData ) {
	if( model.drag_start_mouse && model.pixi_board ) {
		model.pixi_board.position.x = model.drag_start_pixi_board.x + (interactionData.global.x - model.drag_start_mouse.x);
		model.pixi_board.position.y = model.drag_start_pixi_board.y + (interactionData.global.y - model.drag_start_mouse.y);
	}
}
// right-click drag: end
function background_mouseup( interactionData ) {
	model.drag_start_mouse = null;
	model.drag_start_pixi_board = null;
	document.body.style.cursor = "auto";
}

function log_point( pixi_point, msg ) {
	console.log( "("+pixi_point.x+","+pixi_point.y+")" + msg?" "+msg:"" );
}

