"use strict";

// basic config
var fs = require('fs');
var cfg = JSON.parse(
	fs.readFileSync( 'web.cfg.json', 'utf8' ));
// module dependencies
var express = require('express');
var compress = require('compression');
var favicon = require('serve-favicon');
var http = require('http');
var app = express();
var server = app.listen( cfg.server_port );
console.log( "express server listening on port " + cfg.server_port );
var io = require('socket.io').listen( server );
require('datejs');
var _ = require('lodash');
// module configs
app.use( compress() ); // gzip compression
app.use( favicon( 'favicon.png' ));
io.set( 'log level', cfg.socket_io_log_level ); // 0 - 4, ascending verbosity

// routing - index page
app.get( '/', function( request, response ) {
	// if( !primary_host_check( request, response ) )
	// 	return;
	response.sendfile( 'index.html' );
});

// static fileserver
app.use( express.static( __dirname+'/public', {
	maxAge: 31557600000 // one year
}));

io.sockets.on( 'connection', function( socket ) {

});

