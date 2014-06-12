"use strict";

// basic config
_(global).extend(require("./domain/util"));
var fs = require("fs");
var cfg = JSON.parse(
	fs.readFileSync( "web.cfg.json", "utf8" ));
// module dependencies
var express = require("express");
var http = require("http");
var app = express();
var server = app.listen( cfg.server_port );
console.log( "express server listening on port " + cfg.server_port );
var io = require("socket.io").listen( server );
require("datejs");
var _ = require("lodash");
// module configs
app.use( require("compression")() ); // gzip compression
app.use( require("serve-favicon")( "favicon.png" ));
app.use( require("express-json")() );
io.set( "log level", cfg.socket_io_log_level ); // 0 - 4, ascending verbosity
// internal libs
// var Piece = require("./core/domain/piece");
// var Position = require("./core/domain/position");
// var Turn = require("./core/domain/turn");
// var Board = require("./core/domain/board");
// var Rules = require("./core/domain/rules");
// var Game = require("./core/domain/game");
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
app.get( "/", function( request, response ) {
	response.sendfile( "index.html" );
});

// routing - create new game
//   expects application/json in post body
app.post( "/new", function( request, response ) {
	if( validate_create_game_request( request )) {
		var game_id = core.start_game( 
			Player.create(
				request.body.white_player.player_type,
				request.body.white_player.zmq_uri ),
			Player.create(
				request.body.black_player.player_type,
				request.body.black_player.zmq_uri ),
			request.body.use_mosquito,
			request.body.use_ladybug,
			request.body.use_pillbug );
		response.redirect( "/play?" + game_id )
	} else {
		response.send( 400 ); // bad request
	}
});

// routing - play/spectate existing game
app.get( "/play", function( request, response ) {
	var game_id = extract_valid_game_id( request );
	if( game_id ) {
		response.sendfile( "play_game.html" )
	} else {
		response.send( 400 ); // bad request
	}
});

// static fileserver
app.use( express.static( __dirname+"/public", {
	maxAge: 31557600000 // default cache-expiry: one year
}));

io.sockets.on( "connection", function( socket ) {
	// TODO: send CHOOSE_TURN requests to human(s)
	// TODO: receive CHOOSE_TURN responses from human(s)
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

