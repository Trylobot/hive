var _ = require("lodash");
_(global).extend(require("../../../core/domain/util"));

exports["test util Array insert"] = function( assert ) {
	assert.deepEqual(
		[ 1, 2, 3, 4 ].insert( 0, 5 ),
		[ 5, 1, 2, 3, 4 ],
		"actual matches expected" );
}

exports["test util String cycle_chars"] = function( assert ) {
	assert.deepEqual(
		"12345".cycle_chars( 1 ),
		"51234",
		"actual matches expected" );
}

if( module == require.main )
	require("test").run( exports );
