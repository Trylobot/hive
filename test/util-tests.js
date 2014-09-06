var _ = require("lodash");
_(global).extend(require("../core/domain/util"));

exports["test util cycle_chars"] = function( assert ) {
	assert.deepEqual(
		cycle_chars( "12345", 1 ),
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
