"use strict";

// managed dependencies
var net = require("net");

// local dependencies
var cfg = require("./ai-tcp-server.config.json");
var ai_module;
if( !process.argv[2] ) { // ai_module_path must be provided as first argument <required>; server-port is [optional]
	console.log( "usage: node ai-tcp-server.js <./path/to/ai-module.js> [server-port]" );
	process.exit();
}
else {
	var ai_module_path = process.argv[2];
	ai_module = require( ai_module_path ); 
	if( process.argv[3] ) { // cli argument overrides default server port
		cfg.server_port = process.argv[3];
	}
}

var server = net.createServer( function( socket ) { // connect handler
	// wait for incoming messages
	socket.on( "data", function( data ) {
		var message = JSON.parse( data );
		var ai_response = ai_module.process_message( message );
		var ai_response_str = JSON.stringify( ai_response );
		socket.write( ai_response_str );
	});
});

server.listen( cfg.server_port, function() { // listening handler
	console.log( "listening on port " + cfg.server_port );
});

