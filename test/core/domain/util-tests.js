var _ = require("lodash");
_(global).extend(require("../../../core/domain/util"));

exports["test util Array.prototype.insert"] = function( assert ) {
	var list = [ "key1", "key2" ];
	list.insert( 0, "key0" );
	assert.deepEqual(
		list,
		[ "key0", "key1", "key2" ],
		"value was inserted at position 0" );
}

if( module == require.main )
	require("test").run( exports );
