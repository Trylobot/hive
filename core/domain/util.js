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
