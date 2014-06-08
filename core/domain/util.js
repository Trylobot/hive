"use strict";

/*
utils.js
misc utilities
*/

// returns a map wherein all elements of the given list
// are now keys in a map, and each of those keys
// is associated with its numeric index in the list
function invert_list( list ) {
	var map = {};
	for( var i = 0; i < list.length; ++i ) {
		map[list[i]] = i;
	}
	return map;
}

exports.invert_list = invert_list;

