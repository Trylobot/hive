"use strict";

var package_json = require("../../package.json");

var _ = require("lodash");
_(global).extend(require("./util"));
var Piece = require("./piece");

/* 
player.js
this module is used to represent a hive player. 
*/

// data

var colors_enum = 
	Piece.colors_enum; // inherit

var proximity_enum = [
	"Local",
	"Remote"
];

var player_types_enum = [
	"Human",
	"AI"
];

var message_types_enum = [
	"Greetings",
	"Choose Turn"
];

// functions

function create_local_human( color ) {
	var player = {
		player_type: "Human",
		color: color,
		proximity: "Local",
		enforce_rules: true
	}
	return player;
}

function create_local_tester( color ) {
	var player = {
		player_type: "Tester",
		color: color,
		proximity: "Local",
		enforce_rules: false
	}
	return player;
}

function create_local_ai( color, local_path ) {
	var player = {
		player_type: "AI",
		color: color,
		proximity: "Local",
		local_path: local_path,
		enforce_rules: true
	}
	return player;
}

function create_remote_human( color, remote_host, remote_port ) {
	var player = {
		player_type: "Human",
		color: color,
		proximity: "Remote",
		remote_host: remote_host,
		remote_port: remote_port,
		enforce_rules: true
	}
	return player;
}

function create_remote_ai( color, remote_host, remote_port ) {
	var player = {
		player_type: "AI",
		color: color,
		proximity: "Remote",
		remote_host: remote_host,
		remote_port: remote_port,
		enforce_rules: true
	}
	return player;
}

// exports

exports.colors_enum = colors_enum;
exports.player_types_enum = player_types_enum;
exports.message_types_enum = message_types_enum;
exports.create_local_human = create_local_human;
exports.create_local_tester = create_local_tester;
exports.create_local_ai = create_local_ai;
exports.create_remote_human = create_remote_human;
exports.create_remote_ai = create_remote_ai;

