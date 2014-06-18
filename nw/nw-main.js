"use strict";

// dependencies
var _ = require("lodash");
_(global).extend(require("../core/domain/util"));
var package_json = require("./package.json");
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
		// hive domain
		core: null,
		game_id: null,
		game_instance: null
	};
	$scope.model = model;
	// page-load initialization - pixi.js
	model.stage = new PIXI.Stage(0x66FF99);
	model.renderer = PIXI.autoDetectRenderer( 
		package_json.renderer.width, 
		package_json.renderer.height );
	document.body.appendChild( renderer.view );
	requestAnimFrame( animate );
	// page-load initialization - hive domain
	model.core = Core.create();
	// functions
	function animate() {
		requestAnimFrame( animate );
	}
	$scope.start_game = function() {
		model.game_id = core.create_game(
			Player.create( "Human" ), // White Player
			Player.create( "Human" ), // Black Player
			false, // Game: Use Mosquito?
			false, // Game: Use Ladybug?
			false ); // Game: Use Pillbug?
		model.game_instance = core.lookup_game( model.game_id );
		$scope.safeApply();
	}
	// start game immediately
	$scope.start_game();
});

