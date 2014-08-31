"use strict";

// managed dependencies
var readline = require('readline').createInterface({
	input: process.stdin,
	output: process.stdout
});

if( !process.argv[2] ) { // ai_module_path must be provided as first argument <required>
	console.log( "usage: node ai-tcp-server.js <./path/to/ai-module.js>" );
	process.exit();
}

var ai_module = require( process.argv[2] );

readline.on( "line", function( input_line ) {
	var message = JSON.parse( input_line );
	var ai_response = ai_module.process_message( message );
	var ai_response_str = JSON.stringify( ai_response );
	readline.write( ai_response_str );
});

readline.on( "close", process.exit );

