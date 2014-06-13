"use strict";

var hive_app = angular.module( "hive_app", [] )
.config( function( $locationProvider ) {
	$locationProvider.html5Mode( true );
})
.controller( "main_controller", function( $scope, $location ) {
	// monkey patch
	$scope.safeApply = function() {
		var phase = this.$root.$$phase;
		if( phase != '$apply' && phase != '$digest' )
			this.$apply();
	};	
	// vars
	var model = {
		connected: false
	};
	$scope.model = model;
	// init
	var socket = io.connect();
	// socket receive
	socket.on( "connect", function() {
		model.connected = true;
		$scope.safeApply();
	});
	socket.on( "update_game", function( game ) {
		model.game = game;
		$scope.safeApply();
	});
	socket.on( "disconnect", function() {
		model.connected = false;
		$scope.safeApply();
	});
	// socket send
	$scope.choose_turn = function( turn ) {
		socket.emit( "choose_turn", turn );
	};
});
