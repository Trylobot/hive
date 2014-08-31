"use strict";

// dependencies
var helper = require("./ai-helper");

var ai_module = helper.load_ai_module( process.argv[2] );

process.on( "message", function( message ) {
	var ai_response = ai_module.process_message( message );
	process.send( ai_response );
});

