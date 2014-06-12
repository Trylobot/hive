"use strict";

/*
utils.js
misc utilities
*/

// array insert
Array.prototype.insert = function( index, item ) {
	this.splice( index, 0, item );
	return this;
}

// repositions the last character of a string to the beginning
String.prototype.rotate = function( num ) {
	if( typeof num === 'undefined' )
		num = 1; // default value
	num = num % this.length; // normalize
	if( num < 0 )
		num = this.length + num; // wrap
	return this.substr( this.length - num ) + this.substr( 0, this.length - num );
}

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

