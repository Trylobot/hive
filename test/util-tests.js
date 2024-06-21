var _ = require("lodash");
var util = require("./domain/util");

exports["test util cycle_chars"] = function( assert ) {
	assert.deepEqual(
		util.cycle_chars( "12345", 1 ),
		"51234",
		"actual matches expected" );
}

exports["test util set_equality"] = function( assert ) {

}
exports["test util json_equality"] = function( assert ) {

}
exports["test util mstr"] = function( assert ) {

}
exports["test util base62_encode"] = function( assert ) {

}
exports["test util pad"] = function( assert ) {

}
exports["test util isNumber"] = function( assert ) {

}

if( module == require.main )
	require("test").run( exports );
