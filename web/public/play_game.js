"use strict";

var hive_app = angular.module( "hive_app", [] )
.config( function( $locationProvider ) {
	$locationProvider.html5Mode( true );
})
.controller( "main_controller", function( $scope, $location ) {
	// monkey patch
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
	// vars
	var model = {
		connected: false,
		game_id: $location.hash()
	};
	$scope.model = model;
	// socket initialize & connect to tcp://localhost:80
	var socket = io.connect();
	// socket receive
	socket.on( "connect", function() {
		model.connected = true;
		if( model.game_id )
			socket.emit( "join_game", game_id );
		$scope.safeApply();
	});
	socket.on( "update_game", function( game ) {
		model.game = game;
		$scope.safeApply();
	});
	socket.on( "bad_request", function( request ) {

	});
	socket.on( "not_found", function( game_id ) {

	});
	socket.on( "disconnect", function() {
		model.connected = false;
		$scope.safeApply();
	});
	// socket send
	$scope.start_game = function() {
		socket.emit( "start_game", {
			white_player: {
				player_type: "Human"
			},
			black_player: {
				player_type: "Human"
			},
			use_mosquito: false,
			use_ladybug: false,
			use_pillbug: false
		});
	}
});
