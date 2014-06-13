angular.module( "hive_app", ["btford.socket-io", "hive_app.main_controller"] )
.factory( "socket", function( socket_factory ) {
	return socket_factory();
});

angular.module( "hive_app.main_controller", ["btford.socket-io"])
.controller( "main_controller", function( $scope, socket ) {
	socket.forward( "connect", $scope );
	socket.forward( "update_game", $scope );
	socket.forward( "choose_turn", $scope );
	socket.forward( "disconnect", $scope );
	// ----
	$scope.$on( "socket:connect", function( _event ) {
		$scope.connected = true;
	});
	$scope.$on( "socket:update_game", function( _event, game ) {
		$scope.game = game;
	});
	$scope.choose_turn = function( turn ) {
		socket.emit( "choose_turn", turn );
	};
	$scope.$on( "socket:disconnect", function( _event ) {
		$scope.connected = false;
	});
});

