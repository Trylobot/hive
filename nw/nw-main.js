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

// angular
var hive_app = angular.module( "hive_app", [] )
.controller( "main_controller", function( $scope ) {
	// angular monkey patch
	$scope.safeApply = function( fn ) {
		var phase = this.$root.$$phase;
		if( phase == '$apply' || phase == '$digest' ) {
			if( fn && typeof fn === "function" ) {
				fn();
			}
		} else {
			this.$apply( fn );
		}
	};
	// view-model
	var model = {
		// pixi.js
		stage: null,
		renderer: null,
		spritemap_loader: null,
		textures: null,
		col_delta_x: (140 -   1),
		row_delta_y: (351 - 269),
		// hive domain
		core: null,
		game_id: null,
		game_instance: null
	};
	$scope.model = model;
	// page-load initialization: pixi.js
	//   spritemap
	model.spritemap_loader = new PIXI.AssetLoader([ "spritemap.json" ]);
	model.spritemap_loader.onComplete( on_assets_loaded );
	model.spritemap_loader.load();
	//   stage
	model.stage = new PIXI.Stage(0x66FF99);
	//   renderer
	model.renderer = PIXI.autoDetectRenderer( 
		package_json.renderer.width, 
		package_json.renderer.height );
	document.body.appendChild( renderer.view );
	requestAnimFrame( animate );
	//   functions
	function on_assets_loaded() {
		model.textures = {};
		_.forEach( Piece.colors_enum, function( piece_color ) {
			// add tiles (2x)
			var frame_key = piece_color + " Tile";
			model.textures[ frame_key ] = PIXI.Texture.fromFrame( frame_key );
			// add symbols (16x)
			_.forEach( Piece.types_enum, function( piece_type ) {
				var frame_key = piece_color + " " + piece_type;
				model.textures[ frame_key ] = PIXI.Texture.fromFrame( frame_key );
			});
		});
	}
	function create_pixi_piece( hive_piece ) {
		var tile_sprite = PIXI.Sprite( model.textures[ hive_piece.color + " Tile" ]);
		tile_sprite.anchor.x = 0.5;
		tile_sprite.anchor.y = 0.5;
		var symbol_sprite = PIXI.Sprite( model.textures[ hive_piece.color + " " + hive_piece.type ]);
		symbol_sprite.anchor.x = 0.5;
		symbol_sprite.anchor.y = 0.5;
		var container = new PIXI.DisplayObjectContainer();
		container.addChild( tile_sprite );
		container.addChild( symbol_sprite );
		container.anchor.x = 0.5;
		container.anchor.y = 0.5;
		return container;
	}
	function create_pixi_board( hive_board ) {
		// for now, only shows pieces on top of each piece-stack
		// due to top-down orthogonal view
		var container = new PIXI.DisplayObjectContainer();
		var occupied_position_keys = hive_board.lookup_occupied_position_keys();
		_.forEach( occupied_position_keys, function( position_key ) {
			var hive_piece = board.lookup_piece_by_key( position_key );
			var pixi_piece = create_pixi_piece( hive_piece );
			var position = Position.decode( position_key );
			pixi_piece.position.x = position.col * model.col_delta_x;
			pixi_piece.position.y = position.row * model.row_delta_y;
			container.addChild( pixi_piece );
		})
		return container;
	}
	function create_pixi_hand( hive_hand ) {

	}
	function arrange_dynamic_elements( pixi_stage, pixi_board, pixi_white_hand, pixi_black_hand, player_turn ) {
		pixi_stage.addChild( pixi_board );
	}
	function animate() {
		model.renderer.render( model.stage );
		requestAnimFrame( animate );
	}
	// page-load initialization: hive domain + angular ui event handlers
	model.core = Core.create();
	$scope.start_game = function() {
		model.game_id = core.create_game(
			Player.create( "Human" ), // White Player
			Player.create( "Human" ), // Black Player
			false, // Game: Use Mosquito?
			false, // Game: Use Ladybug?
			false ); // Game: Use Pillbug?
		model.game_instance = core.lookup_game( model.game_id );
		// TODO: setup actual first turn
		
		var hive_board = model.game_instance.board;
		hive_board.place_piece( Piece.create( "White", "Queen Bee" ), Position.create( 0, 0 ));
		hive_board.place_piece( Piece.create( "Black", "Queen Bee" ), Position.create( 1, 1 ));
		var pixi_board = create_pixi_board( hive_board );
		var pixi_white_hand = null;
		var pixi_black_hand = null;
		arrange_dynamic_elements( model.stage, pixi_board, pixi_white_hand, pixi_black_hand, "White" );

		$scope.safeApply();
	}
	// start game immediately
	$scope.start_game();
});

