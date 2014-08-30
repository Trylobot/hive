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
	// humans cannot be directly interfaced with
	//   for local humans, the UI is responsible for updating the game_state directly
	player.send_greetings_request = null;
	player.send_choose_turn_request = null;
	// ----
	return player;
}

function create_local_tester( color ) {
	var player = {
		player_type: "Tester",
		color: color,
		proximity: "Local",
		enforce_rules: false
	}
	// humans cannot be directly interfaced with
	//   for local humans, the UI is responsible for updating the game_state directly
	//   with rules enforcement turned off, this game becomes a test game.
	player.send_greetings_request = null;
	player.send_choose_turn_request = null;
	// ----
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
	player.send_greetings_request = function( greetings_request_message, response_callback_fn, error_callback_fn ) {
		// TODO: invoke hive-cli as child process
	}
	player.send_choose_turn_request = function( choose_turn_request_message, response_callback_fn, error_callback_fn ) {
		// TODO: invoke hive-cli as child process
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
	// humans cannot be directly interfaced with
	//   for remote humans, the system will rely on that human's client program to invoke the core-to-core
	//   communication directly, synchronizing full game_state over TCP in the event of any sort of change
	player.send_greetings_request = null;
	player.send_choose_turn_request = null;
	// ----
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
	player.send_greetings_request = function( greetings_request_message, response_callback_fn, error_callback_fn ) {
		// TODO: send request over TCP
	}
	player.send_choose_turn_request = function( choose_turn_request_message, response_callback_fn, error_callback_fn ) {
		// TODO: send request over TCP
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

