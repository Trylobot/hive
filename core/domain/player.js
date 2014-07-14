"use strict";

var package_json = require("../../package.json");

var _ = require("lodash");
_(global).extend(require("./util"));

/* 
player.js
this module is used to represent a hive player. 
*/

// data

var player_types_enum = [
	"Human",
	"AI",
	"Testing"
];

var message_types_enum = [
	"GREETINGS",
	"CHOOSE_TURN"
];

// functions

function create( player_type, proximity, ai_module, remote_address, listen_port ) {
	var player = {
		player_type: player_type,
		proximity: proximity,
		ai_module: ai_module,
		remote_address: remote_address,
		listen_port: listen_port
	}
	return player;
};

// exports

exports.player_types_enum = player_types_enum;
exports.message_types_enum = message_types_enum;
exports.create = create;


