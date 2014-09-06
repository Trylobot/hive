var _ = require("lodash");

/*
utils.js
misc utilities
*/

// repositions the last character of a string to the beginning
function cycle_chars( str, num ) {
	if( typeof num === 'undefined' )
		num = 1; // default value
	num = num % str.length; // normalize
	if( num < 0 )
		num = str.length + num; // wrap
	return str.substr( str.length - num ) + str.substr( 0, str.length - num );
}

// 
function set_equality( set0, set1 ) {
	return set0.length == set1.length
		&& _.difference( set0, set1 ).length == 0
		&& _.difference( set1, set0 ).length == 0
}

function json_equality( value0, value1 ) {
	return JSON.stringify( value0 ) == JSON.stringify( value1 );
}

// the following are well-tested externally sourced functions

function base62_encode( a ) { // positive base10 encoded integer
	var b, c;
	for ( a = a !== +a || a % 1 ? -1 : a, b = ""; // if not a base10 integer, 'a' will be '-1'; for example, '.5 % 1 == .5' but '1 % 1 == 0'
		  a >= 0; // also prevents the user to use negative base10 integers
		  a = Math.floor(a / 62) || -1 // using a bitwise hack here will fail with great numbers
	) {
		// a%62 -> 0-61
		// 0-9   | 36-61 | 10-35
		// 48-57 | 65-90 | 97-121
		// 0-9   | A-Z   | a-z
		b = String.fromCharCode(((c = a % 62) > 9 ? c > 35 ? 29 : 87 : 48) + c) + b;
	}
	return b; // will return either an empty or a base62-encoded string
}

function pad( val, len ) {
	var str = String( val );
	if( len > str.length )
		str = Array( len + 1 - str.length ).join( "0" ) + str;
	return str;
}

function isNumber( n ) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

exports.cycle_chars = cycle_chars;
exports.set_equality = set_equality;
exports.json_equality = json_equality;
exports.base62_encode = base62_encode;
exports.pad = pad;
exports.isNumber = isNumber;

