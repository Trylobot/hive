"use strict";

if( !process.argv[2] ) {
	console.log( "usage:  node ai-local-stdio.js [./path/to/ai-module]" );
	process.exit();
}

// dependencies
var readline = require('readline');
var helper = require("./ai-helper");

var ai_module = helper.load_ai_module( process.argv[2] );

var rli = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

rli.on( "line", function( data ) {
	var message = JSON.parse( data );
	var ai_response = ai_module.process_message( message );
	var ai_response_str = JSON.stringify( ai_response );
	rli.write( ai_response_str + "\n" );
});

rli.on( "close", process.exit );

