"use strict";

// basic config
var _ = require("lodash");
_(global).extend(require("./core/domain/util"));
var cfg = require("./web.cfg.json");
// module dependencies
var express = require("express");
var http = require("http");
var app = express();
var server = app.listen( cfg.server_port );
console.log( "express server listening on port " + cfg.server_port );
var io = require("socket.io").listen( server );
// module configs
app.use( require("compression")() ); // gzip compression
app.use( require("serve-favicon")( "favicon.png" ));
app.use( require("express-json")() );
io.set( "log level", cfg.socket_io_log_level ); // 0 - 4, ascending verbosity
// internal libs
var Player = require("./core/domain/player");
var Core = require("./core/core");

/*
core.js
this module manages game instances, and handles communications between players and games.
	players can be humans or AIs.
	human players use the web app.
	AIs implement the ZeroMQ interface and wait to be called upon.
*/

// -------------------------------

var core = Core.create();

// routing - index page
//   landing page, about, links, etc.
app.get( "/", function( request, response ) {
	response.sendfile( "index.html" );
});

// routing - play or spectate games
app.get( "/play", function( request, response ) {
	response.sendfile( "play_game.html" )
});

// static fileserver
app.use( express.static( __dirname+"/public", {
	maxAge: 31557600000 // default cache-expiry: one year
}));

// socket event handlers
io.sockets.on( "connection", function( socket ) {
	// create a new game
	socket.on( "start_game", function( game_config ) {
		// create game objects and put game into initial state
		// TODO: include the socket.id into the Player object so that players can't hijack each other
		var game_id = core.start_game(
			Player.create(
				game_config.white_player.player_type,
				game_config.white_player.zmq_uri ),
			Player.create(
				game_config.black_player.player_type,
				game_config.black_player.zmq_uri ),
			game_config.use_mosquito,
			game_config.use_ladybug,
			game_config.use_pillbug );
		// disconnect from any previous game(s)
		_.forEach( _.keys( io.sockets.manager.roomClients[ socket.id ]), function( game_id ) {
			socket.leave( game_id );
		});
		socket.join( game_id );
		// send game state
		socket.emit( "update_game", game_instance.game );
	});
	// join existing game
	socket.on( "join_game", function( game_id ) {
		var game_instance = core.lookup_game( game_id );
		if( game_instance ) {
			socket.join( game_id );
			// send game state
			socket.emit( "update_game", game_instance.game );
		}
	})
	// choose_turn: a human player is sending their turn choice for a game_instance
	socket.on( "choose_turn", function( turn ) {
		// TODO: when the board state changes, notify all connected participants via:
		// io.sockets.in( game_id ).emit( "update_game", game_instance.game );
	});
	// set_player: human player is setting the configuration options for one of the players in a game_instance
	//   for example, setting the white or black player to human or AI, or swapping an AI module out for another
	socket.on( "set_player", function( player ) {

	});
	socket.on( "disconnect", function() {

	});
});

// ---------------------

function validate_create_game_request( request ) {
	if( typeof request === "object" && request != null
	&&  typeof request.body === "object" && request.body != null
	&&  typeof request.body.white_player === "object" && request.body.white_player != null
	&&  typeof request.body.white_player.player_type === "string" && _.contains( Player.player_types_enum, request.body.white_player.player_type )
	&&  typeof request.body.black_player === "object" && request.body.black_player != null
	&&  typeof request.body.black_player.player_type === "string" && _.contains( Player.player_types_enum, request.body.black_player.player_type )
	&&  typeof request.body.use_mosquito === "boolean"
	&&  typeof request.body.use_ladybug  === "boolean"
	&&  typeof request.body.use_pillbug  === "boolean" ) {
		return true;
	} else {
		return false;
	}
}

function extract_valid_game_id( request ) {
	var query_string_param_keys = _.keys( request.query );
	if( query_string_param_keys.length != 1 )
		return false;
	var game_id = query_string_param_keys[0];
	if( !core.lookup_game( game_id ))
		return false;
	return game_id; // active game exists with given id
}

