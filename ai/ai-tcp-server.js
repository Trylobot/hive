"use strict";

if( !process.argv[2] || !process.argv[3] ) {
	console.log( "usage:  node ai-tcp-server.js [./path/to/ai-module] [server-port]" );
	process.exit();
}

// dependencies
var net = require("net");
var JsonSocket = require("json-socket");
var helper = require("./ai-helper");

var ai_module = helper.load_ai_module( process.argv[2] );
var server_port = process.argv[3];

var server = net.createServer( function( socket ) { // connect handler
	socket = new JsonSocket( socket ); // tcp socket decorator for json objects
	socket.on( "message", function( message ) {
		var ai_response = ai_module.process_message( message );
		socket.sendMessage( ai_response );
	});
	socket.on( "error", function( err ) {
		// ignore
	});
});

server.listen( server_port, function() { // listening handler
	console.log( "listening on port " + server_port );
});

