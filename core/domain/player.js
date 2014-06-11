"use strict";

var package_json = require("../package.json");

var _ = require("lodash");
_(global).extend(require("./util"));
var zmq = require("zmq");
var requester = zmq.socket("req");

/* 
player.js
this module is used to represent a hive player. 
	it handles connecting to remote AI modules and binding to in-progress game ID's
	it also handles human player input
*/

// data

var player_types_enum = [
	"Human",
	"AI"
];

var message_types_enum = [
	"GREETINGS",
	"CHOOSE_TURN"
];

// functions

function create( player_type, zmq_uri ) {
	var player = {
		player_type: player_type,
		zmq_uri: zmq_uri,
		info: null // eventually populated with return from greetings request
	}
	var awaiting_greetings_response = false;
	player.greetings = function() {
		awaiting_greetings_response = true;
		requester.send(
			JSON.stringify({
				request_type: "GREETINGS",
				system_version: package_json.version
			}));
	}
	var choose_turn_callback = null;
	player.choose_turn = function( game_id, game_state, possible_turns, callback_fn ) {
		// TODO: translate Position objects in outgoing requests into their encoded string form
		// TODO: translate encoded string positions in incoming responses into Position objects
		choose_turn_callback = callback_fn;
		requester.send(
			JSON.stringify({
				request_type: "CHOOSE_TURN",
				game_id: game_id,
				possible_turns: possible_turns,
				game_state: game_state
			}));
	}
	// -----------
	requester.connect( zmq_uri );
	requester.on( "message", function( message_string ) {
		var message = JSON.parse( message_string );
		switch( message.request_type ) {
			case "GREETINGS":
				if( awaiting_greetings_response ) {
					awaiting_greetings_response = false;
					player.info = message;
				}
				break;
			case "CHOOSE_TURN":
				if( choose_turn_callback ) {
					var callback_fn = greetings_callback;
					greetings_callback = null;
					callback_fn( message );
				}
				break;
		}
	});
	return player;
};

// exports

exports.types_enum = types_enum;
exports.message_types_enum = message_types_enum;
exports.create = create;


