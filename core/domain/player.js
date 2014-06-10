"use strict";

var _ = require("lodash");
_(global).extend(require("./util"));

/* 
player.js
this module is used to represent a hive player. 
	it handles connecting to remote AI modules and binding to in-progress game ID's
	it also handles human player input
*/

// functions

function create() {
	var player = {}
	return player;
};

// exports

exports.create = create;

