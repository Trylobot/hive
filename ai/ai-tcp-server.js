"use strict";

if( !process.argv[2] || !process.argv[3] ) {
	console.log( "usage:  node ai-tcp-server.js [./path/to/ai-module] [server-port]" );
	process.exit();
}

// dependencies
var net = require("net");
var helper = require("./ai-helper");

var ai_module = helper.load_ai_module( process.argv[2] );
var server_port = process.argv[3];

var server = net.createServer( function( socket ) { // connect handler
	socket.on( "error", function( err ) {
		// ignore
	});
	// wait for incoming messages
	socket.on( "data", function( data ) {
		var message = JSON.parse( data );
		var ai_response = ai_module.process_message( message );
		var ai_response_str = JSON.stringify( ai_response );
		socket.write( ai_response_str );
	});
});

server.listen( server_port, function() { // listening handler
	console.log( "listening on port " + server_port );
});

