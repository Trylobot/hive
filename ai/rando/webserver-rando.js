"use strict";

// dependencies
var http = require("http");
var cfg = require("./web-rando.cfg.json");
var hive_ai_rando = require("./hive-ai-rando.js");

var server = http.createServer( function( request, response ) {
	if( request.method === "POST" ) {
		var chunks = [], data;
		request.on( "data", function( chunk ) {
			chunks.push( chunk );
		});
		request.on( "end", function() {
			data = chunks.join("");
			var message = JSON.parse( data );
			console.log( "----------------------------------------" );
			console.log( "REQUEST  " + JSON.stringify( message, null, 2 ));
			///////////////
			var ai_response = hive_ai_rando.process_message( message );
			var ai_response_str = JSON.stringify( ai_response );
			///////////////
			console.log( "RESPONSE  " + JSON.stringify( ai_response, null, 2 ));
			response.writeHead( 200, { "content-type": "text/json" });
			response.write( ai_response_str );
			response.end();
		});
	}
});

server.listen( cfg.server_port );
console.log( "listening on port " + cfg.server_port );

