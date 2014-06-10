"use strict";

/*
utils.js
misc utilities
*/

// array insert
Array.prototype.insert = function( index, item ) {
  this.splice(index, 0, item);
}


