"use strict";

// dependencies
//   built-in
var http = require("http");
var fs = require("fs");
//   3rd-party
var _ = require("lodash");
//   user
var package_json = require("./package.json");
var core_basepath = fs.existsSync("./core/") ? "./core/" : "../core/";
var ai_basepath = fs.existsSync("./ai/") ? "./ai/" : "../ai/";
_(global).extend(require(core_basepath+"domain/util"));
var Piece = require(core_basepath+"domain/piece");
var Position = require(core_basepath+"domain/position");
var Turn = require(core_basepath+"domain/turn");
var Board = require(core_basepath+"domain/board");
var Rules = require(core_basepath+"domain/rules");
var Game = require(core_basepath+"domain/game");
var Player = require(core_basepath+"domain/player");
var Core = require(core_basepath+"core");
var AI = require(ai_basepath+"rando/hive-ai-rando"); 

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
	pixi_board_piece_rotations: null,
	max_ghost_ui_distance: null,
	pixi_white_hand: null,
	pixi_black_hand: null,
	hand_gutter_size: null,
	scale_values: null,
	scale_i: null,
	hand_text_font: null,
	stack_counter_text_font: null,
	status_text_font: null,
	status_text_fg: null,
	status_text_bg: null,
	forfeit_text_fg: null,
	forfeit_text_bg: null,
	forfeit_text_hit_rect: null,
	possible_theme_dirs: null,
	theme_dir: null,
	theme: null,
	col_delta_x: null,
	row_delta_y: null,
	height_delta_y: null,
	symbol_scale_y: null,
	// hive domain
	core: null,
	game_id: null,
	game_instance: null,
	AI: null,
	// dat.gui
	dat_gui: null,
	dat_gui_themes: null,
	open_file_dialog: null,
	save_file_dialog: null
};
// scale & zoom
register_window_size( model );
model.scale_values = [ 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.85, 1, 1.25, 1.5, 2, 2.5, 3 ];
//                       .05   .05  .1   .1   .1   .1   .15  .15  25  .25   .5 .5   .5
model.default_scale_i = model.scale_values.indexOf( 1 ); // 100% zoom
model.scale_i = model.default_scale_i;
// hand gutter
model.hand_gutter_size = 120;
// ghost distance
model.max_ghost_ui_distance = 300;
// theme
model.theme_dir = "./themes/Hive Carbon Isometric/"; // default
model.theme = require( model.theme_dir + "theme-package.json");
model.col_delta_x = model.theme.col_delta_x;
model.row_delta_y = model.theme.row_delta_y;
model.height_delta_y = model.theme.height_delta_y;
model.symbol_scale_y = model.theme.symbol_scale_y;
// spritemap
model.spritemap_loader = new PIXI.AssetLoader([ model.theme_dir + model.theme.spritemap ]);
model.spritemap_loader.onComplete = initialize_textures;
model.spritemap_loader.load();
// other themes
model.possible_theme_dirs = fs.readdirSync("./themes/");
// stage
model.background_color = 0x808080;
var interactive = true;
model.stage = new PIXI.Stage( model.background_color, interactive );
// background
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
// status text (global, static)
model.hand_text_font = "700 36px Roboto";
model.stack_counter_text_font = "700 36px Roboto";
model.status_text_font = "700 48px Roboto";
var status_text_fg = new PIXI.Text( "", { font: model.status_text_font, fill: "White" });
var status_text_bg = new PIXI.Text( "", { font: model.status_text_font, fill: "Black" });
model.status_text_fg = status_text_fg;
model.status_text_bg = status_text_bg;
model.stage.addChild( status_text_bg );
model.stage.addChild( status_text_fg );
// forfeit button (global, static)
var forfeit_text_fg = new PIXI.Text( "Click here to forfeit", { font: model.status_text_font, fill: "White" });
var forfeit_text_bg = new PIXI.Text( "Click here to forfeit", { font: model.status_text_font, fill: "Black" });
forfeit_text_fg.visible = false;
forfeit_text_bg.visible = false;
//var forfeit_text_hit_rect = new PIXI.DisplayObjectContainer( ... )
forfeit_text_fg.setInteractive( false );
forfeit_text_fg.mouseover = forfeit_mouseover;
forfeit_text_fg.mouseout = forfeit_mouseout;
forfeit_text_fg.click = forfeit_click;
model.forfeit_text_fg = forfeit_text_fg;
model.forfeit_text_bg = forfeit_text_bg;
model.stage.addChild( forfeit_text_bg );
model.stage.addChild( forfeit_text_fg );
// renderer
model.renderer = PIXI.autoDetectRenderer( 
	model.renderer_width, 
	model.renderer_height );
model.renderer.view.className = "PIXI-Renderer";
document.body.appendChild( model.renderer.view );
requestAnimFrame( animate );
// hive domain
var core = Core.create();
model.core = core;
model.pixi_board_piece_rotations = {};
model.AI = AI;
// dat.gui
var gui = new dat.GUI();
model.open_file_dialog = document.getElementById("open_file_dialog");
model.save_file_dialog = document.getElementById("save_file_dialog");
model.dat_gui = {
	"New (vs Human)": function() {
		start_game( 
			"Human",
			"Human",
			model.dat_gui["Use Mosquito"],
			model.dat_gui["Use Ladybug"],
			model.dat_gui["Use Pillbug"] );
		gui.close();
	},
	"New (vs AI)": function() {
		start_game( 
			"Human",
			"AI",
			model.dat_gui["Use Mosquito"],
			model.dat_gui["Use Ladybug"],
			model.dat_gui["Use Pillbug"] );
		gui.close();
	},
	"Use Mosquito": false,
	"Use Ladybug": false,
	"Use Pillbug": false,
	"Load Game": function() {
		choose_read_file_path( function( path ) {
			fs.readFile( path, function( error, data ) {
				load_game( data );
				gui.close();
			});
		});
	},
	"Save Game": function() {
		choose_write_file_path( function( path ) {
			var data = save_game();
			fs.writeFile( path, data );
			gui.close();
		});
	},
	"Themes": null, // (Folder)   "./themes/" + <model.possible_theme_dirs>
	"Open Debugger": function() {
		require("nw.gui").Window.get().showDevTools();
		gui.close();
	}
};
model.dat_gui_themes = _.zipObject( 
	model.possible_theme_dirs, 
	_.map( model.possible_theme_dirs, function( theme_folder ) {
		return function() {
			// theme
			model.theme_dir = "./themes/" + theme_folder + "/";
			model.theme = require( model.theme_dir + "theme-package.json");
			model.col_delta_x = model.theme.col_delta_x;
			model.row_delta_y = model.theme.row_delta_y;
			model.height_delta_y = model.theme.height_delta_y;
			model.symbol_scale_y = model.theme.symbol_scale_y;
			// spritemap
			_.forEach( model.textures, function( texture ) {
				texture.destroy( true ); // destroy texture and base texture
			});
			model.spritemap_loader = new PIXI.AssetLoader([ model.theme_dir + model.theme.spritemap ]);
			model.spritemap_loader.onComplete = initialize_textures;
			model.spritemap_loader.load();
			// TODO: this function needs a bunch of work
			//   after this runs, if a game is in progress, a bunch of old variables are causing issues
			//   we need to re-initialize the stage, or something, I guess
		}
	})
);
gui.add( model.dat_gui, "New (vs Human)" );
gui.add( model.dat_gui, "New (vs AI)" );
gui.add( model.dat_gui, "Use Mosquito" );
gui.add( model.dat_gui, "Use Ladybug" );
gui.add( model.dat_gui, "Use Pillbug" );
gui.add( model.dat_gui, "Load Game" );
gui.add( model.dat_gui, "Save Game" );
var gui_themes = gui.addFolder( "Themes" );
_.forEach( model.dat_gui_themes, function( set_theme_fn, theme_name ) {
	gui_themes.add( model.dat_gui_themes, theme_name );
});
gui.add( model.dat_gui, "Open Debugger" );

//////////////////////////////////////////////////////////////////
// first-tier functions
//////////////////////////////////////////////////////////////////
function register_window_size( model ) {
	model.renderer_width = window.innerWidth;
	model.renderer_height = window.innerHeight;
	model.renderer_halfWidth = Math.floor( window.innerWidth / 2 );
	model.renderer_halfHeight = Math.floor( window.innerHeight / 2 );
}
function animate( time ) {
	model.renderer.render( model.stage );
	requestAnimFrame( animate );
	TWEEN.update( time );
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
function choose_read_file_path( callback_fn ) {
	model.open_file_dialog.addEventListener( "change", change_fn );
	function change_fn( event ) {
		this.removeEventListener( "change", change_fn );
		callback_fn( this.value );
		this.value = "";
	}
	model.open_file_dialog.click();
}
function choose_write_file_path( callback_fn ) {
	model.save_file_dialog.addEventListener( "change", change_fn );
	function change_fn( event ) {
		this.removeEventListener( "change", change_fn );
		callback_fn( this.value );
		this.value = "";
	}
	model.save_file_dialog.click();
}
// global
function save_game() {
	if( model.game_instance )
		return JSON.stringify( model.game_instance.game.save() );
}
// global
function load_game( saved_game_json_str ) {
	clear_hive_game( model );
	var data = JSON.parse( saved_game_json_str );
	model.game_id = core.load_game( 
		Player.create( "Human" ),
		Player.create( "Human" ),
		data );
	model.game_instance = core.lookup_game( model.game_id );
	console.log( model.game_instance );
	show_hive_game( model );
}
//
function start_game( white_player_type, black_player_type, use_mosquito, use_ladybug, use_pillbug ) {
	model.stage.setBackgroundColor( model.background_color );
	model.pixi_board_piece_rotations = {};
	model.game_id = core.create_game(
		Player.create( white_player_type ),
		Player.create( black_player_type ),
		use_mosquito,
		use_ladybug,
		use_pillbug );
	model.game_instance = core.lookup_game( model.game_id );
	console.log( model.game_instance );
	clear_hive_game( model );
	show_hive_game( model );
}
function show_hive_game( model ) {
	var hive_game = model.game_instance.game;
	var hive_possible_turns = hive_game.possible_turns;
	//
	var pixi_board = create_pixi_board( hive_game.board, hive_possible_turns );
	model.pixi_board = pixi_board;
	model.scale_i = model.default_scale_i; // default
	pixi_board.position.set( model.renderer_halfWidth, model.renderer_halfHeight + Math.floor(model.hand_gutter_size/2) );
	model.stage.addChild( pixi_board );
	//
	var pixi_white_hand = create_pixi_hand( "White", hive_game.hands["White"] );
	var pixi_black_hand = create_pixi_hand( "Black", hive_game.hands["Black"] );
	model.pixi_white_hand = pixi_white_hand;
	model.pixi_black_hand = pixi_black_hand;
	model.stage.addChild( pixi_white_hand );
	model.stage.addChild( pixi_black_hand );
	//
	update_status_text( model );
	position_status_text( model );
	position_hands( model );
}
function do_turn( model, turn ) {
	console.log( turn );
	model.stage.setInteractive( false );
	var position = _.clone( model.pixi_board.position );
	var scale_i = model.scale_i;
	var scale = model.scale_values[ scale_i ];
	clear_hive_game( model );
	model.game_instance.game.perform_turn( turn );
	////////////////////////
	show_hive_game( model );
	////////////////////////
	model.pixi_board.position.set( position.x, position.y );
	model.scale_i = scale_i;
	model.pixi_board.scale.set( scale, scale );
	model.stage.setInteractive( true );
	verify_board_integrity( model );

	// handle AI in the hackiest possible way
	// assumes AI is black, and human is white
	// this code is going to change like VERY SOON (tm), yo
	if( model.game_instance
	&& !model.game_instance.game.game_over
	&&  model.game_instance.game.possible_turns
	&&  model.game_instance.players[ model.game_instance.game.player_turn ].player_type == "AI" ) {
		fetch_and_apply_AI_turn_local( model );
	}
}
// assumed AI already configured
function fetch_and_apply_AI_turn_local( model ) {
	var message = prepare_choose_turn_request_message( model );
	var response_message = model.AI.process_message( message );
	var turn = parse_response_message( response_message );
	_.defer( do_turn, model, turn );
}
// not yet used
function fetch_and_apply_AI_turn_http( model ) {
	var message = prepare_choose_turn_request_message( model );
	var message_str = JSON.stringify( message );
	var headers = { 
		"Content-Type": "application/json", 
		"Content-Length": message_str.length
	};
	var options = {
		hostname: "localhost",
		port: 51337,
		path: "/",
		method: "POST"
	};
	var request = http.request( options, function( response ) {
		response.setEncoding("utf-8");
		var response_chunks = [];
		response.on("data", function( data ) {
			response_chunks.push( data );
		});
		response.on("end", function() {
			var response_text = response_chunks.join("");
			var response_message = JSON.parse( response_text );
			var turn = parse_response_message( response_message );
			_.defer( do_turn, model, turn );
		});
	});
	request.write( message_str );
	request.end();
}
function clear_hive_game( model ) {
	if( model.pixi_board ) {
		model.stage.removeChild( model.pixi_board );
		model.pixi_board = null;
		model.stage.removeChild( model.pixi_white_hand );
		model.stage.removeChild( model.pixi_black_hand );
		model.pixi_white_hand = null;
		model.pixi_black_hand = null;
		clear_status_text( model );
	}
}
function verify_board_integrity( model ) {
	var hive_pieces = model.game_instance.game.board.pieces;
	//var pixi_pieces = model.pixi_board.children;
	//var pixi_position_register = model.pixi_board.__hive_positions;
	// these three things need to agree, always.
	var errors = [];
	_.forEach( hive_pieces, function( piece_stack, position_key ) {
		_.forEach( piece_stack, function( hive_piece ) {
			var position = Position.decode( position_key );
			var pixi_point = new PIXI.Point( 
				position.col * model.col_delta_x, 
				position.row * model.row_delta_y );
			var pixi_piece = _.find( model.pixi_board.children, function( pixi_piece ) {
				return( pixi_piece.position.x == pixi_point.x && pixi_piece.position.y == pixi_point.y 
					&& pixi_piece.__hive_piece && pixi_piece.__hive_piece.color == hive_piece.color && pixi_piece.__hive_piece.type == hive_piece.type );
			});
			if( typeof pixi_piece === "undefined" ) {
				errors.push({
					position_key: position_key,
					expected_hive_piece: hive_piece,
					expected_UI_position: pixi_point,
					actual_PIXI_Sprites_at_UI_position: _.filter( model.pixi_board.children, function( pixi_piece ) {
						return( pixi_piece.position.x == pixi_point.x && pixi_piece.position.y == pixi_point.y );
					}),
					actual_PIXI_Sprite_registered_at_position_key: model.pixi_board.__hive_positions[ position_key ]
				});
			}
		});
	});
	if( errors.length > 0 )
		console.error({
			verify_board_integrity: false,
			errors: errors 
		});
}
function resolve_pixi_board_piece_rotation( registry, position_key, stack_layer, piece_color, piece_type ) {
	var key = position_key + "," + stack_layer + "/" + piece_color + "/" + piece_type;
	var rotation = registry[ key ];
	if( typeof rotation === "undefined" ) {
		rotation = get_random_rotation();
		registry[ key ] = rotation;
		return rotation;
	} else {
		return rotation;
	}
}

//////////////////////////////////////////////////////////////////
// second-tier functions
//////////////////////////////////////////////////////////////////
// depends on global: model
function prepare_choose_turn_request_message( model ) {
	// TODO: possible_turns should already be using position keys, and this should not be necessary
	var possible_turns = _.cloneDeep( model.game_instance.game.possible_turns );
	if( possible_turns["Placement"] )
		possible_turns["Placement"].positions = Position.encode_all( possible_turns["Placement"].positions );
	if( possible_turns["Movement"] )
		possible_turns["Movement"] = _.mapValues( possible_turns["Movement"], function( destination_position_array, source_position_key ) {
			return Position.encode_all( destination_position_array );
		});
	if( possible_turns["Special Ability"] )
		possible_turns["Special Ability"] = _.mapValues( possible_turns["Special Ability"], function( movement_map, ability_user_position_key ) {
			return _.mapValues( movement_map, function( destination_position_array, source_position_key ) {
				return Position.encode_all( destination_position_array );
			});
		});
	// TODO: game_state and possible turns should just use the native structure, this restructuring shouldn't be necessary
	var message = {
		request_type: "CHOOSE_TURN",
		game_id: model.game_id,
		possible_turns: possible_turns,
		game_state: {
			board: model.game_instance.game.board,
			hands: model.game_instance.game.hands,
			player_turn: model.game_instance.game.player_turn,
			turn_number: model.game_instance.game.turn_number,
			game_over: model.game_instance.game.game_over,
			winner: model.game_instance.game.winner,
			is_draw: model.game_instance.game.is_draw
		}
	};
	return message;
}
function parse_response_message( response_message ) {
	var turn;
	switch( response_message.turn_type ) {
		case "Placement":
			turn = Turn.create_placement( 
				response_message.piece_type, 
				response_message.destination );
			break;
		case "Movement":
			turn = Turn.create_movement(
				response_message.source,
				response_message.destination );
			break;
		case "Special Ability":
			turn = Turn.create_special_ability(
				response_message.ability_user,
				response_message.source,
				response_message.destination );
			break;
		case "Forfeit":
			turn = Turn.create_forfeit();
			break;
	}
	return turn;
}
function create_pixi_piece( hive_piece ) {
	var container = create_pixi_tile_sprite_container( hive_piece );
	var ghost_container = create_pixi_tile_sprite_container( hive_piece );
	ghost_container.visible = false;
	ghost_container.alpha = 0.333;
	var marquee = create_pixi_marquee( hive_piece.color ); // not immediately shown
	marquee.visible = false;
	container.addChild( marquee );
	// ghost is added to the board separately, but not as a child object of this piece.
	container.__hive_piece = hive_piece;
	container.__hive_pixi_marquee = marquee;
	container.__hive_pixi_ghost = ghost_container;
	return container;
}
// depends on global: model
function create_pixi_tile_sprite_container( hive_piece ) {
	var tile_sprite = new PIXI.Sprite( model.textures[ hive_piece.color + " Tile" ]);
	tile_sprite.anchor.set( 0.5, 0.5 );
	var symbol_sprite = new PIXI.Sprite( model.textures[ hive_piece.color + " " + hive_piece.type ]);
	symbol_sprite.anchor.set( 0.5, 0.5 );
	var container = new PIXI.DisplayObjectContainer();
	container.__symbol_sprite = symbol_sprite;
	container.addChild( tile_sprite );
	var symbol_squish_container = new PIXI.DisplayObjectContainer();
	symbol_squish_container.scale.set( 1.0, model.symbol_scale_y );
	symbol_sprite.anchor.set( 0.5, 0.5 / model.symbol_scale_y );
	symbol_squish_container.addChild( symbol_sprite );
	symbol_squish_container.position.set( 0, 0.5 * model.height_delta_y );
	container.addChild( symbol_squish_container );
	return container;
}
// depends on global: model
function create_pixi_marquee( piece_color ) {
	var pixi_marquee = new PIXI.Sprite( model.textures[ piece_color + " Marquee" ]);
	pixi_marquee.anchor.set( 0.5, 0.5 );
	pixi_marquee.alpha = 0.333;
	return pixi_marquee;
}
// depends on global: model
function create_pixi_board( hive_board, hive_possible_turns ) {
	// for now, only shows pieces on top of each piece-stack
	// due to top-down orthogonal view
	var container = new PIXI.DisplayObjectContainer();
	var stack_counters = new PIXI.DisplayObjectContainer();
	container.__stack_counters = stack_counters;
	container.__hive_board = hive_board;
	container.__hive_possible_turns = hive_possible_turns;
	container.__hive_positions = {};
	//
	var occupied_position_keys = hive_board.lookup_occupied_position_keys();
	_.forEach( occupied_position_keys, function( position_key ) {
		var position = Position.decode( position_key );
		var pixi_x = position.col * model.col_delta_x;
		var pixi_y = position.row * model.row_delta_y;
		var hive_piece;
		var position_register = {
			occupied: true,
			hive_piece: null,
			pixi_piece: null
		};
		container.__hive_positions[ position_key ] = position_register;
		var hive_piece_stack = hive_board.lookup_piece_stack( position );
		var hive_piece_stack_height = hive_piece_stack.length;
		// add all the pieces below the potentially interactive piece, so that if there's a stack, the user can see what's down 1 layer at least
		if( hive_piece_stack_height >= 2 ) {
			for( var i = 0; i <= hive_piece_stack_height - 2; ++i ) {
				hive_piece = hive_piece_stack[i];
				var underneath_pixi_piece = create_pixi_piece( hive_piece );
				underneath_pixi_piece.position.set( pixi_x, pixi_y + (model.height_delta_y * i) );
				underneath_pixi_piece.__symbol_sprite.rotation = resolve_pixi_board_piece_rotation( 
					model.pixi_board_piece_rotations, position_key, i, hive_piece.color, hive_piece.type );
				container.addChild( underneath_pixi_piece );
			}
		}
		// add the piece on top; potentially interactive
		hive_piece = hive_piece_stack[ hive_piece_stack_height - 1 ];
		position_register.hive_piece = hive_piece;
		var pixi_piece = create_pixi_piece( hive_piece );
		pixi_piece.__hive_position_key = position_key;
		position_register.pixi_piece = pixi_piece;
		pixi_piece.position.set( pixi_x, pixi_y + (model.height_delta_y * (hive_piece_stack_height - 1)) );
		pixi_piece.__symbol_sprite.rotation = resolve_pixi_board_piece_rotation( 
			model.pixi_board_piece_rotations, position_key, hive_piece_stack_height - 1, hive_piece.color, hive_piece.type );
		container.addChild( pixi_piece.__hive_pixi_ghost );
		container.addChild( pixi_piece );
		// add indicator for stacked pieces
		if( hive_piece_stack_height >= 2 ) {
			var font = model.stack_counter_text_font;
			var color = hive_piece.color;
			var opposite_color = Piece.opposite_color( color );
			var indicator_x = pixi_x + 5;
			var indicator_y = pixi_y + 32;
			var count_text_fg = new PIXI.Text( hive_piece_stack_height + "x", { font: font, fill: color });
			var count_text_bg = new PIXI.Text( hive_piece_stack_height + "x", { font: font, fill: opposite_color });
			count_text_fg.position.set( indicator_x, indicator_y - 2 );
			count_text_bg.position.set( indicator_x, indicator_y );
			stack_counters.addChild( count_text_fg );
			stack_counters.addChild( count_text_bg );
		}
		// movement for this piece ?
		if( hive_possible_turns && hive_possible_turns["Movement"]
		&&  position_key in hive_possible_turns["Movement"] ) {
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
	if( hive_possible_turns && hive_possible_turns["Special Ability"] ) {
		_.forEach( hive_possible_turns["Special Ability"], function( special_abilities, ability_source_position_key ) {
			// for now there's only one type of special ability; moving a nearby piece
			_.forEach( special_abilities, function( destination_positions, source_position_key ) {
				var position_register = container.__hive_positions[ source_position_key ];
				var pixi_piece = position_register.pixi_piece;
				pixi_piece.__hive_ability_user_source_position_key = ability_source_position_key;
				pixi_piece.__hive_special_moves = destination_positions; // list of position keys this piece can move to
				if( !pixi_piece.interactive ) { // piece might already have been made interactive for normal movement
					pixi_piece.interactive = true;
					pixi_piece.mouseover = pixi_piece_mouseover;
					pixi_piece.mouseout = pixi_piece_mouseout;
					pixi_piece.mousedown = pixi_piece_mousedown;
					pixi_piece.mousemove = pixi_piece_mousemove;
					pixi_piece.mouseup = pixi_piece_mouseup;
					pixi_piece.mouseupoutside = pixi_piece_mouseup;
				}
			});
		});
	}
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
		position_register["White Marquee"].visible = false;
		position_register["Black Marquee"].visible = false;
		container.addChildAt( position_register["White Marquee"], 0 ); // underneath all existing objects
		container.addChildAt( position_register["Black Marquee"], 0 ); // underneath all existing objects
		container.__hive_positions[ position_key ] = position_register;
	});
	container.addChild( stack_counters );
	return container;
}
// depends on global: model
function create_pixi_hand( color, hive_hand ) {
	var container = new PIXI.DisplayObjectContainer();
	container.__color = color;
	container.__hive_hand = hive_hand;
	var opposite_color = Piece.opposite_color( color );
	var default_alpha = 0.25;
	var scale = 0.75;
	var font = model.hand_text_font;
	var c_x = 10;
	var piece_types;
	// ordering hack
	if( color == "White" )
		piece_types = _(hive_hand).keys().reverse().value();
	else if( color == "Black" )
		piece_types = _(hive_hand).keys().value();
	_.forEach( piece_types, function( piece_type ) {
		var sprite = new PIXI.Sprite( model.textures[ opposite_color + " " + piece_type ]);
		sprite.__hive_color = color;
		sprite.__hive_piece_type = piece_type;
		sprite.__default_alpha = default_alpha;
		sprite.alpha = default_alpha;
		sprite.scale.set( scale, scale );
		sprite.position.set( c_x, 20 );
		container.addChild( sprite );
		var bounds = sprite.getBounds();
		// interactivity hack
		if( model.pixi_board.__hive_possible_turns != null
		&&  "Placement" in model.pixi_board.__hive_possible_turns
		&&  "piece_types" in model.pixi_board.__hive_possible_turns["Placement"]
		&&  "positions" in model.pixi_board.__hive_possible_turns["Placement"] 
		&&  _.keys( model.pixi_board.__hive_possible_turns["Placement"].positions ).length > 0 ) {
			if( color == model.game_instance.game.player_turn
			&&  _.contains( model.pixi_board.__hive_possible_turns["Placement"].piece_types, piece_type )) {
				sprite.setInteractive( true );
				sprite.mouseover = pixi_hand_mouseover;
				sprite.mouseout = pixi_hand_mouseout;
				sprite.mousedown = pixi_hand_mousedown;
			}
		}
		var delta_x = bounds.width*scale * 0.9;
		var piece_count = hive_hand[ piece_type ];
		var count_text_fg = new PIXI.Text( piece_count + "x", { font: font, fill: opposite_color });
		var count_text_bg = new PIXI.Text( piece_count + "x", { font: font, fill: color });
		count_text_fg.alpha = default_alpha;
		count_text_bg.alpha = default_alpha;
		count_text_fg.position.set( c_x + delta_x/2 - 18, -5 );
		count_text_bg.position.set( c_x + delta_x/2 - 18, -7 );
		container.addChild( count_text_fg );
		container.addChild( count_text_bg );
		sprite.__count_text_fg = count_text_fg;
		sprite.__count_text_bg = count_text_bg;
		c_x += delta_x;
	});
	container.__width = c_x;
	return container;
}

//////////////////////////////////////////////////////////////////
// third-tier functions
//////////////////////////////////////////////////////////////////
function document_mousewheel( event ) {
	var ticks = event.wheelDelta / 120;
	model.scale_i += ticks;
	if( model.scale_i < 0 )
		model.scale_i = 0;
	if( model.scale_i > model.scale_values.length - 1 )
		model.scale_i = model.scale_values.length - 1;
	var new_scale = model.scale_values[ model.scale_i ];
	if( model.pixi_board )
		new TWEEN.Tween( model.pixi_board.scale ).to({ x: new_scale, y: new_scale }, 150 ).easing( TWEEN.Easing.Sinusoidal.InOut ).start();
	// TODO: zoom to cursor
}

function window_resize() {
	register_window_size( model );
	model.renderer.resize( model.renderer_width, model.renderer_height );
	update_background_hit_rect( model );
	if( model.game_instance ) {
		position_status_text( model );
		position_hands( model );
	}
}

function forfeit_mouseover( ix ) {
	document.body.style.cursor = "pointer";
}
function forfeit_mouseout( ix ) {
	document.body.style.cursor = "inherit";
}
function forfeit_click( ix ) {
	var turn = Turn.create_forfeit();
	_.defer( do_turn, model, turn );
	document.body.style.cursor = "inherit";
}

function background_mousedown( ix ) {
	// right-click drag: start
	if( model.pixi_board && ix.originalEvent.button == 2 ) {
		model.pixi_board.__hive_drag_start_mouse = _.clone( ix.global );
		model.pixi_board.__hive_drag_start_pixi_board = _.clone( model.pixi_board.position );
		document.body.style.cursor = "move";
	}
}
function background_mousemove( ix ) {
	// right-click drag: move pixi_board around
	if( model.pixi_board && model.pixi_board.__hive_drag_start_mouse ) {
		model.pixi_board.position.set(
			model.pixi_board.__hive_drag_start_pixi_board.x + (ix.global.x - model.pixi_board.__hive_drag_start_mouse.x),
			model.pixi_board.__hive_drag_start_pixi_board.y + (ix.global.y - model.pixi_board.__hive_drag_start_mouse.y) );
	}
}
function background_mouseup( ix ) {
	// right-click drag: end
	if( model.pixi_board && model.pixi_board.__hive_drag_start_mouse && ix.originalEvent.button == 2 ) {
		model.pixi_board.__hive_drag_start_mouse = null;
		model.pixi_board.__hive_drag_start_pixi_board = null;
		document.body.style.cursor = "inherit";
	}
}

// mouse-in: only applied to pieces that can be interacted with
function pixi_piece_mouseover( ix ) {
	var self = this;
	// mouseover style
	document.body.style.cursor = "pointer";
	// if the user mouses over, then leaves the window, then comes back onto the piece, this might happen.
	// where the mouseover fires again, but the piece is still being dragged. don't want the marquee to re-appear in that case.
	if( ! self.__hive_drag_start_mouse ) {
		// show marquee on hover
		self.__hive_pixi_marquee.visible = true;
	}
}
function pixi_piece_mouseout( ix ) {
	var self = this;
	// mouseover style (if not dragging)
	if( ! self.__hive_drag_start_mouse ) {
		document.body.style.cursor = "inherit";
		// hide marquee
		self.__hive_pixi_marquee.visible = false;
	}
}
function pixi_piece_mousedown( ix ) {
	var self = this;
	// left-click drag: start
	if( ix.originalEvent.button == 0 ) {
		// create a "ghost" in place of the piece that is being moved, so the player can see where it used to be
		self.__hive_drag_start_mouse = _.clone( ix.global );
		self.__hive_drag_start_pixi_piece = _.clone( self.position );
		// hide piece marquee
		self.__hive_pixi_marquee.visible = false;
		// show marquees for all potential move locations
		pixi_piece_set_move_marquee_visible.call( self, 1, true );
		// show ghost-piece representing destination
		self.__hive_pixi_ghost.visible = true;
		// move this piece, and its ghost, to the highest z-layer so it's overtop everything else
		model.pixi_board.removeChild( self.__hive_pixi_ghost );
		model.pixi_board.addChild( self.__hive_pixi_ghost );
		model.pixi_board.removeChild( self );
		model.pixi_board.addChild( self );
		pixi_piece_mousemove.call( self, ix );
	}
}
function pixi_piece_set_move_marquee_visible( visible, use_opposite_color ) {
	var self = this;
	var destinations = _.compact( _.flatten([ self.__hive_moves, self.__hive_special_moves ]));
	_.forEach( destinations, function( position ) {
		var position_key = position.encode();
		var position_register = model.pixi_board.__hive_positions[ position_key ];
		if( position_register.occupied ) {
			position_register.pixi_piece.__hive_pixi_marquee.visible = visible;
		} else {
			if( visible ) { // showing
				var color = self.__hive_piece.color;
				if( use_opposite_color )
					color = Piece.opposite_color( color );
				position_register[ color + " Marquee" ].visible = true;
			} else { // hiding
				position_register[ "White Marquee" ].visible = false;
				position_register[ "Black Marquee" ].visible = false;
			}
		}
	});
}
function pixi_piece_mousemove( ix ) {
	var self = this;
	// left-click drag: move piece around
	if( self.__hive_drag_start_mouse ) {
		self.position.set(
			self.__hive_drag_start_pixi_piece.x + ((ix.global.x - self.__hive_drag_start_mouse.x) / model.pixi_board.scale.x),
			self.__hive_drag_start_pixi_piece.y + ((ix.global.y - self.__hive_drag_start_mouse.y) / model.pixi_board.scale.y) );
		// check distance and if close enough, move ghost piece to the nearby potential move destination
		var min_distance_squared = Infinity;
		var closest_position_key = null;
		var closest_pixi_position = null;
		var self_hive_position = Position.decode( self.__hive_position_key );
		var hive_moves_and_current_position = _.compact( _.flatten([ self_hive_position, self.__hive_moves, self.__hive_special_moves ]));
		_.forEach( hive_moves_and_current_position, function( position ) {
			var position_key = position.encode();
			var move_position;
			if( self_hive_position != position ) {
				var position_register = model.pixi_board.__hive_positions[ position_key ];
				if( position_register.occupied ) {
					move_position = position_register.pixi_piece.position;
				} else {
					move_position = position_register["White Marquee"].position;
				}
			} else {
				move_position = self.__hive_drag_start_pixi_piece;
			}
			var distance_squared = get_distance_squared( move_position, self.position );
			if( distance_squared < min_distance_squared ) {
				min_distance_squared = distance_squared;
				closest_position_key = position_key;
				closest_pixi_position = move_position;
			}
		});
		if( Math.sqrt( min_distance_squared ) <= model.max_ghost_ui_distance ) {
			self.__hive_pixi_ghost.visible = true;
			self.__hive_pixi_ghost.position.set( closest_pixi_position.x, closest_pixi_position.y );
			self.__hive_pixi_ghost.__hive_position_key = closest_position_key;
		} else {
			self.__hive_pixi_ghost.visible = false;
			self.__hive_pixi_ghost.position.set( self.__hive_drag_start_pixi_piece.x, self.__hive_drag_start_pixi_piece.y );
			self.__hive_pixi_ghost.__hive_position_key = null;
		}
	}
}
function pixi_piece_mouseup( ix ) {
	var self = this;
	// left-click drag: end
	if( self.__hive_drag_start_mouse && ix.originalEvent.button == 0 ) {
		// re-show piece marquee, because the mouse is assumed to be still over the piece
		self.__hive_pixi_marquee.visible = true;
		// hide all move-marquees
		pixi_piece_set_move_marquee_visible.call( self, false );
		// verify that the new position is not the same as the original position
		if( self.__hive_pixi_ghost.visible
		&&  !point_equal( self.__hive_drag_start_pixi_piece, self.__hive_pixi_ghost.position )) {
			// update hive game state and re-create entire hive board
			// for piece at    Position.decode( self.__hive_position_key )
			// to position at  Position.decode( self.__hive_pixi_ghost.__hive_position_key )
			var turn;
			var source_position_key = self.__hive_position_key;
			var destination_position_key = self.__hive_pixi_ghost.__hive_position_key;
			var source_position = Position.decode( source_position_key );
			var destination_position = Position.decode( destination_position_key );
			var match_destination_position = function( potential_destination ) {
				return destination_position.is_equal( potential_destination );
			}
			if( _.find( self.__hive_moves, match_destination_position )) {
				turn = Turn.create_movement( 
					source_position,
					destination_position );
				_.defer( do_turn, model, turn );
			} 
			else if( _.find( self.__hive_special_moves, match_destination_position )) {
				var ability_user_position_key = self.__hive_ability_user_source_position_key;
				var ability_user_position = Position.decode( ability_user_position_key );
				turn = Turn.create_special_ability( 
					ability_user_position,
					source_position,
					destination_position );
				_.defer( do_turn, model, turn );
			}
			else {
				throw destination_position_key + " not found in available moves";
			}
		} 
		else {
			// re-up the stack counters, one of which will have been hidden by this board-neutral action
			model.pixi_board.removeChild( model.pixi_board.__stack_counters );
			model.pixi_board.addChild( model.pixi_board.__stack_counters );
		}
		// hide ghost
		self.__hive_pixi_ghost.visible = false;
		// move this actual piece
		// TODO: tween this
		self.position.set( self.__hive_pixi_ghost.position.x, self.__hive_pixi_ghost.position.y );
		// revert drag state and possible mouseover style
		document.body.style.cursor = "inherit";
		self.__hive_drag_start_mouse = null;
		self.__hive_drag_start_pixi_piece = null;
	}
}

function pixi_hand_mouseover( ix ) {
	var self = this;
	// show
	self.alpha = 1;
	self.__count_text_fg.alpha = 1;
	self.__count_text_bg.alpha = 1;
}
function pixi_hand_mouseout( ix ) {
	var self = this;
	// dim
	self.alpha = self.__default_alpha;
	self.__count_text_fg.alpha = self.__default_alpha;
	self.__count_text_bg.alpha = self.__default_alpha;
}
function pixi_hand_mousedown( ix ) {
	var self = this;
	// create new pixi piece
	if( ix.originalEvent.button == 0 ) {
		var pixi_piece = create_pixi_piece( Piece.create( self.__hive_color, self.__hive_piece_type ));
		pixi_piece.scale.set( model.pixi_board.scale.x, model.pixi_board.scale.y );
		pixi_piece.__creator = self;
		pixi_piece.__hive_color = self.__hive_color;
		pixi_piece.__hive_piece_type = self.__hive_piece_type;
		self.__pixi_piece = pixi_piece;
		// start dragging new pixi piece
		pixi_piece.position.set( ix.global.x, ix.global.y );
		pixi_piece.__hive_drag_start_mouse = _.clone( ix.global );
		pixi_piece.setInteractive( true );
		pixi_piece.mousemove = pixi_hand_piece_mousemove;
		pixi_piece.mouseup = pixi_hand_piece_mouseup;
		pixi_piece.mouseupoutside = pixi_hand_piece_mouseup;
		// show placement position marquees
		pixi_piece.__hive_moves = _.values( model.pixi_board.__hive_possible_turns["Placement"].positions );
		pixi_piece_set_move_marquee_visible.call( pixi_piece, true, true );
		// create ghost piece
		pixi_piece.__hive_pixi_ghost = create_pixi_piece( Piece.create( self.__hive_color, self.__hive_piece_type ));
		pixi_piece.__hive_pixi_ghost.alpha = 0.333;
		pixi_piece.__hive_pixi_ghost.position.set( pixi_piece.position.x, pixi_piece.position.y );
		model.pixi_board.addChild( pixi_piece.__hive_pixi_ghost );
		model.stage.addChild( pixi_piece );
		var trash_bin = new PIXI.Graphics();
		trash_bin.beginFill( 0x000000 );
		trash_bin.drawRect( 0, 0, model.renderer_width, model.hand_gutter_size );
		trash_bin.endFill();
		trash_bin.alpha = 0.25;
		pixi_piece.__trash_bin = trash_bin;
		model.stage.addChildAt( trash_bin, 0 ); // background
		pixi_hand_piece_mousemove.call( pixi_piece, ix ); // simulate mouse movement event immediately
	}
}
function pixi_hand_piece_mousemove( ix ) {
	var self = this;
	if( self.__hive_drag_start_mouse ) {
		// move pixi piece
		self.position.set( ix.global.x, ix.global.y );
		// check distance and if close enough, move ghost piece to the nearby potential move destination
		var min_distance_squared = Infinity;
		var closest_position_key = null;
		var closest_pixi_position = null;
		// invalidate placement if mouse is in the "hand-gutter" at the top of the screen area.
		if( ix.global.y > model.hand_gutter_size ) {
			// get position in terms of board coordinates
			var boardspace_mouse_position = ix.getLocalPosition( model.pixi_board );
			_.forEach( self.__hive_moves, function( position ) {
				var position_key = position.encode();
				var position_register = model.pixi_board.__hive_positions[ position_key ];
				var move_position = position_register["White Marquee"].position;
				var distance_squared = get_distance_squared( move_position, boardspace_mouse_position );
				if( distance_squared < min_distance_squared ) {
					min_distance_squared = distance_squared;
					closest_position_key = position_key;
					closest_pixi_position = move_position;
				}
			});
		}
		if( closest_pixi_position 
		&&  Math.sqrt( min_distance_squared ) <= model.max_ghost_ui_distance ) {
			self.__hive_pixi_ghost.visible = true;
			self.__hive_pixi_ghost.position.set( closest_pixi_position.x, closest_pixi_position.y );
			self.__hive_pixi_ghost.__hive_position_key = closest_position_key;
		} else {
			self.__hive_pixi_ghost.visible = false;
			self.__hive_pixi_ghost.position.set( 0, 0 );
			self.__hive_pixi_ghost.__hive_position_key = null;
		}
	}
}
function pixi_hand_piece_mouseup( ix ) {
	var self = this;
	if( self.__hive_drag_start_mouse && ix.originalEvent.button == 0 ) {
		// perform a placement turn
		// allow cancelling placement by being towards the upper edge of the screen
		if( self.__hive_pixi_ghost.__hive_position_key ) {
			// update hive game state and re-create entire hive board
			// place piece   self.__hive_pixi_ghost.__hive_piece_type
			// at position   Position.decode( self.__hive_pixi_ghost.__hive_position_key )
			var turn = Turn.create_placement( 
				self.__hive_piece_type,
				Position.decode( self.__hive_pixi_ghost.__hive_position_key ));
			_.defer( do_turn, model, turn );
		}
		// cleanup
		pixi_piece_set_move_marquee_visible.call( self, false, true );
		self.setInteractive( false );
		model.pixi_board.removeChild( self.__hive_pixi_ghost ); // remove ghost from stage
		self.parent.removeChild( self.__trash_bin ); // remove trash bin object from stage
		self.__trash_bin = null;
		self.__hive_pixi_ghost = null;
		self.parent.removeChild( self ); // remove self from stage
		self.__creator.__pixi_piece = null; // remove generator ref
		self.__hive_drag_start_mouse = null; // indicate no longer dragging mode
	}
}

//////////////////////////////////////////////////////////////////
// fourth-tier functions
//////////////////////////////////////////////////////////////////
function update_background_hit_rect( model ) {
	model.background.hitArea = new PIXI.Rectangle( 0, 0, model.renderer_width, model.renderer_height );
}
function position_hands( model ) {
	model.pixi_white_hand.position.x = 0;
	model.pixi_black_hand.position.x = model.renderer_width - model.pixi_black_hand.__width;
}
function position_status_text( model ) {
	var x = 12, y = model.renderer_height - 62;
	model.status_text_fg.position.set( x, y );
	model.status_text_bg.position.set( x, y - 3 );
	//
	y -= 62;
	model.forfeit_text_fg.position.set( x, y );
	model.forfeit_text_bg.position.set( x, y - 3 );
}
function update_status_text( model ) {
	var text = "";
	var color = model.game_instance.game.player_turn;
	// end game check
	var game_over_status = Rules.check_if_game_over( model.game_instance.game.board );
	if( ! game_over_status.game_over ) {
		var player_turn_friendly = Math.floor( model.game_instance.game.turn_number / 2 ) + 1;
		text = color + "'s turn " + player_turn_friendly;
		text = color + "'s turn " + player_turn_friendly;
		//
		model.forfeit_text_fg.setStyle({ font: model.status_text_font, fill: color });
		model.forfeit_text_bg.setStyle({ font: model.status_text_font, fill: Piece.opposite_color( color )});
		if( has_moves( model )) {
			model.forfeit_text_fg.visible = false;
			model.forfeit_text_bg.visible = false;
			forfeit_text_fg.setInteractive( false );
		} else { // no moves, must forfeit
			model.forfeit_text_fg.visible = true;
			model.forfeit_text_bg.visible = true;
			forfeit_text_fg.setInteractive( true );
		}
	} else {
		if( ! game_over_status.is_draw ) {
			color = game_over_status.winner;
			text = color + " WINS!";
			text = color + " WINS!";
			if( color == "White" )
				model.stage.setBackgroundColor( 0x000000 ); // black, for contrast
			else if( color == "Black" )
				model.stage.setBackgroundColor( 0xFFFFFF ); // white, for contrast
		} else {
			text = "DRAW!";
			text = "DRAW!";
		}
	}
	model.status_text_fg.setText( text );
	model.status_text_bg.setText( text );
	model.status_text_fg.setStyle({ font: model.status_text_font, fill: color });
	model.status_text_bg.setStyle({ font: model.status_text_font, fill: Piece.opposite_color( color )});
}
function has_moves( model ) {
	var turns = model.pixi_board.__hive_possible_turns;
	return turns != null && !("Forfeit" in turns );
}
function clear_status_text( model ) {
	model.status_text_fg.setText( "" );
	model.status_text_bg.setText( "" );
}

//////////////////////////////////////////////////////////////////
// fifth-tier functions
//////////////////////////////////////////////////////////////////
function get_distance_squared( pos0, pos1 ) {
	var x = pos1.x - pos0.x;
	var y = pos1.y - pos0.y;
	return x*x + y*y;
}
function get_random_rotation() {
	return 2.0 * Math.PI * (1.0/6.0) * Math.floor( Math.random() * 6.0 ); // random rotation from six possible orientations (multiples of 60 degrees)
}
function point_equal( pos0, pos1 ) {
	return (pos0.x == pos1.x 
		&&  pos0.y == pos1.y);
}
function log_point( pixi_point, msg ) {
	console.log( "("+pixi_point.x+","+pixi_point.y+") " + msg?msg:"" );
}

