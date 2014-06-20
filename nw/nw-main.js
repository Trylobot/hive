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
	scale_values: null,
	scale_i: null,
	status_text_fg: null,
	status_text_bg: null,
	col_delta_x: 138, // based on size of sprite at scale=1
	row_delta_y: 80,
	// hive domain
	core: null,
	game_id: null,
	game_instance: null
};
register_window_size( model );
model.scale_values = [ 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.85, 1, 1.25, 1.5, 2, 2.5, 3 ];
//                       .05   .05  .1   .1   .1   .1   .15  .15  25  .25   .5 .5   .5
model.default_scale_i = model.scale_values.indexOf( 1 );
model.scale_i = model.default_scale_i;
// spritemap
model.spritemap_loader = new PIXI.AssetLoader([ "spritemap.json" ]);
model.spritemap_loader.onComplete = on_assets_loaded;
model.spritemap_loader.load();
// stage
model.background_color = 0x808080;
var interactive = true;
model.stage = new PIXI.Stage( model.background_color, interactive );
// font usage causing load
var status_text_fg = new PIXI.Text( "", { font: "200 48px DINPro", fill: "White" });
var status_text_bg = new PIXI.Text( "", { font: "200 48px DINPro", fill: "Black" });
model.status_text_fg = status_text_fg;
model.status_text_bg = status_text_bg;
model.stage.addChild( status_text_bg );
model.stage.addChild( status_text_fg );
// 
document.addEventListener( "mousewheel", document_mousewheel );
model.background = new PIXI.DisplayObjectContainer();
model.background.setInteractive( interactive );
update_background_hit_rect( model );
model.background.mousedown = background_mousedown;
model.background.mousemove = background_mousemove;
model.background.mouseup = background_mouseup;
model.background.mouseupoutside = background_mouseup;
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
	var marquee = create_pixi_marquee( hive_piece.color ); // not immediately shown
	var container = new PIXI.DisplayObjectContainer();
	container.addChild( tile_sprite );
	container.addChild( symbol_sprite );
	container.addChild( marquee );
	container.__hive_piece = hive_piece;
	container.__hive_pixi_marquee = marquee;
	marquee.alpha = 0;
	return container;
}
function create_pixi_marquee( piece_color ) {
	var pixi_marquee = new PIXI.Sprite( model.textures[ piece_color + " Marquee" ]);
	pixi_marquee.anchor.x = 0.5;
	pixi_marquee.anchor.y = 0.5;
	return pixi_marquee;
}
function create_pixi_board( hive_board, hive_possible_turns ) {
	// for now, only shows pieces on top of each piece-stack
	// due to top-down orthogonal view
	var container = new PIXI.DisplayObjectContainer();
	container.__hive_board = hive_board;
	container.__hive_possible_turns = hive_possible_turns;
	container.__hive_positions = {};
	//
	var occupied_position_keys = hive_board.lookup_occupied_position_keys();
	_.forEach( occupied_position_keys, function( position_key ) {
		var position_register = {
			occupied: true,
			hive_piece: null,
			pixi_piece: null
		};
		container.__hive_positions[ position_key ] = position_register;
		var hive_piece = hive_board.lookup_piece_by_key( position_key );
		position_register.hive_piece = hive_piece;
		var pixi_piece = create_pixi_piece( hive_piece );
		position_register.pixi_piece = pixi_piece;
		var position = Position.decode( position_key );
		pixi_piece.position.x = position.col * model.col_delta_x;
		pixi_piece.position.y = position.row * model.row_delta_y;
		container.addChild( pixi_piece );
		// movement for this piece ?
		if( hive_possible_turns["Movement"] && position_key in hive_possible_turns["Movement"] ) {
			pixi_piece.__hive_position_key = position_key;
			pixi_piece.__hive_moves = hive_possible_turns["Movement"][ position_key ]; // list of position keys this piece can move to
			pixi_piece.interactive = true;
			pixi_piece.mouseover = pixi_piece_mouseover;
			pixi_piece.mouseout = pixi_piece_mouseout;
			pixi_piece.mousedown = pixi_piece_mousedown;
			pixi_piece.mousemove = pixi_piece_mousemove;
			pixi_piece.mouseup = pixi_piece_mouseup;
			pixi_piece.mouseupoutside = pixi_piece_mouseup;
		}
	});
	// 
	var free_spaces = hive_board.lookup_free_spaces();
	_.forEach( free_spaces, function( position, position_key ) {
		var position_register = {
			occupied: false,
			"White Marquee": null,
			"Black Marquee": null 
		};
		position_register["White Marquee"] = create_pixi_marquee( "White" );
		position_register["Black Marquee"] = create_pixi_marquee( "Black" );
		var x = position.col * model.col_delta_x;
		var y = position.row * model.row_delta_y;
		position_register["White Marquee"].position.set( x, y );
		position_register["Black Marquee"].position.set( x, y );
		position_register["White Marquee"].alpha = 0;
		position_register["Black Marquee"].alpha = 0;
		container.addChildAt( position_register["White Marquee"], 0 ); // underneath all existing objects
		container.addChildAt( position_register["Black Marquee"], 0 ); // underneath all existing objects
		container.__hive_positions[ position_key ] = position_register;
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
	setup_first_turn();
}
function setup_first_turn() {
	// TODO: setup actual first turn
	var hive_game = model.game_instance.game;
	hive_game.perform_placement( "White", "Queen Bee", Position.create( 0, 0 ));
	hive_game.perform_placement( "Black", "Queen Bee", Position.create( 1, 1 ));
	var hive_possible_turns = Rules.lookup_possible_turns( 
		hive_game.player_turn, 
		hive_game.board, 
		hive_game.hands[ hive_game.player_turn ],
		hive_game.turn_number );
	//
	var pixi_board = create_pixi_board( hive_game.board, hive_possible_turns );
	model.pixi_board = pixi_board;
	model.scale_i = model.default_scale_i; // default
	pixi_board.position.x = model.renderer_halfWidth;
	pixi_board.position.y = model.renderer_halfHeight;
	model.stage.addChild( pixi_board );
	//
	var pixi_white_hand = null;
	var pixi_black_hand = null;
	model.pixi_white_hand = pixi_white_hand;
	model.pixi_black_hand = pixi_black_hand;	
	//
	position_status_text( model );
	update_status_text( model );
}

// events
function document_mousewheel( event ) {
	var ticks = event.wheelDelta / 120;
	model.scale_i += ticks;
	if( model.scale_i < 0 )
		model.scale_i = 0;
	if( model.scale_i > model.scale_values.length - 1 )
		model.scale_i = model.scale_values.length - 1;
	var s = model.scale_values[ model.scale_i ];
	if( model.pixi_board )
		model.pixi_board.scale.set( s, s );
	// TODO: zoom to cursor
}

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
	model.status_text_bg.position.y = model.status_text_fg.position.y - 3;
}
function update_status_text( model ) {
	var color = model.game_instance.game.player_turn;
	model.status_text_fg.setText( color + "'s turn" );
	model.status_text_bg.setText( color + "'s turn" );
	model.status_text_fg.setStyle({ font: "700 48px DINPro", fill: color });
	model.status_text_bg.setStyle({ font: "700 48px DINPro", fill: Piece.opposite_color( color )});
}

function background_mousedown( interactionData ) {
	// right-click drag: start
	if( model.pixi_board && interactionData.originalEvent.button == 2 ) {
		model.pixi_board.__hive_drag_start_mouse = _.clone( interactionData.global );
		model.pixi_board.__hive_drag_start_pixi_board = _.clone( model.pixi_board.position );
		document.body.style.cursor = "move";
	}
}
function background_mousemove( interactionData ) {
	// right-click drag: move pixi_board around
	if( model.pixi_board && model.pixi_board.__hive_drag_start_mouse ) {
		model.pixi_board.position.x = model.pixi_board.__hive_drag_start_pixi_board.x + (interactionData.global.x - model.pixi_board.__hive_drag_start_mouse.x);
		model.pixi_board.position.y = model.pixi_board.__hive_drag_start_pixi_board.y + (interactionData.global.y - model.pixi_board.__hive_drag_start_mouse.y);
	}
}
function background_mouseup( interactionData ) {
	// right-click drag: end
	if( model.pixi_board && model.pixi_board.__hive_drag_start_mouse ) {
		model.pixi_board.__hive_drag_start_mouse = null;
		model.pixi_board.__hive_drag_start_pixi_board = null;
		document.body.style.cursor = "inherit";
	}
}

// mouse-in: only applied to pieces that can be interacted with
function pixi_piece_mouseover( interactionData ) {
	var self = this;
	// mouseover style
	document.body.style.cursor = "pointer";
	// show marquee on hover
	self.__hive_pixi_marquee.alpha = 1;
}
function pixi_piece_mouseout( interactionData ) {
	var self = this;
	// mouseover style (if not dragging)
	if( ! self.__hive_drag_start_mouse ) {
		document.body.style.cursor = "inherit";
		// hide marquee
		self.__hive_pixi_marquee.alpha = 0;
	}
}
function pixi_piece_mousedown( interactionData ) {
	var self = this;
	// left-click drag: start
	if( interactionData.originalEvent.button == 0 ) {
		// TODO: move this piece to the highest z-layer so it's overtop everything else
		// TODO: create a "ghost" in place of the piece that is being moved, so the player can see where it used to be
		self.__hive_drag_start_mouse = _.clone( interactionData.global );
		self.__hive_drag_start_pixi_piece = _.clone( self.position );
		// hide piece marquee
		self.__hive_pixi_marquee.alpha = 0;
		// show marquees for all potential move locations
		pixi_piece_set_move_marquee_alpha.call( self, 1 );
	}
}
function pixi_piece_set_move_marquee_alpha( alpha ) {
	var self = this;
	_.forEach( self.__hive_moves, function( position ) {
		var position_key = position.encode();
		var position_register = model.pixi_board.__hive_positions[ position_key ];
		if( position_register.occupied ) {
			position_register.pixi_piece.__hive_pixi_marquee.alpha = alpha;
		} else {
			var color = self.__hive_piece.color;
			position_register[ color + " Marquee" ].alpha = alpha;
		}
	});
}
function pixi_piece_mousemove( interactionData ) {
	var self = this;
	// left-click drag: move piece around
	if( self.__hive_drag_start_mouse ) {
		self.position.x = self.__hive_drag_start_pixi_piece.x + ((interactionData.global.x - self.__hive_drag_start_mouse.x) / model.pixi_board.scale.x);
		self.position.y = self.__hive_drag_start_pixi_piece.y + ((interactionData.global.y - self.__hive_drag_start_mouse.y) / model.pixi_board.scale.y);
		// TODO: check distance and if close enough, move ghost piece to the nearby potential move destination

	}
}
function pixi_piece_mouseup( interactionData ) {
	var self = this;
	// left-click drag: end
	if( self.__hive_drag_start_mouse ) {
		// move piece permanently to new location, or revert to old location
		self.position.x = self.__hive_drag_start_pixi_piece.x;
		self.position.y = self.__hive_drag_start_pixi_piece.y;
		// re-show piece marquee, because the mouse is assumed to be still over the piece
		self.__hive_pixi_marquee.alpha = 1;
		// hide all move-marquees
		pixi_piece_set_move_marquee_alpha.call( self, 0 );
		// TODO: hide ghost

		// revert drag state and possible mouseover style
		document.body.style.cursor = "inherit";
		self.__hive_drag_start_mouse = null;
		self.__hive_drag_start_pixi_piece = null;
	}
}

function log_point( pixi_point, msg ) {
	console.log( "("+pixi_point.x+","+pixi_point.y+") " + msg?msg:"" );
}

