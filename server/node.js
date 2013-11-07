var express = require('express');
var server = require('./server');

server.use("/", express.static(__dirname + '/../client/src'));
server.use("/", express.static(__dirname + '/../client/src/.tmp'));
server.use("/", express.static(__dirname + '/../client'));
server.use("/", express.static(__dirname + '/../FileServer'));

server.listen(9000);