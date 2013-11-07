/**
 * Server main file, exports the express object to the grunt server
 * @name Server
 * @namespace
 * @author Andreas Krimbacher
 */
var express = require('express');

var SAS = require('./sas');

//Server
var app = express();

var anyBodyParser = function(req, res, next) {
    var data = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk) {
        data += chunk;
    });
    req.on('end', function() {
        req.rawBody = data;
        next();
    });
}

app.post('/services/SAS', anyBodyParser, SAS.handleRequest);
app.post('/services/CCS', anyBodyParser, SAS.handleRequest);


//export module
module.exports = app;

