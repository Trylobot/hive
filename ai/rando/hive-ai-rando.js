"use strict";

/* 
ai-rando.js
this is an example ai that chooses a move at rando[m]
*/

var zmq = require("zmq");
var responder = zmq.socket("rep");

responder.connect( "tcp://localhost:19855" );

responder.on( "message", function( data_string ) {
	var data = JSON.parse( data_string );
	var move_index = Math.floor( Math.random() * data.possible_moves );
	responder.send( move_index );
});

