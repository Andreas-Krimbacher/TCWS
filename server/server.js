/**
 * Server main file, exports the express object to the grunt server
 * @name Server
 * @namespace
 * @author Andreas Krimbacher
 */
var express = require('express');

var SAS = require('./sas');
var CCS = require('./ccs');
var CTS = require('./cts');

var Utilities = require('./utilities');

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
app.post('/services/CCS', anyBodyParser, CCS.handleRequest);
app.post('/services/CTS', anyBodyParser, CTS.handleRequest);

app.post('/services/saveFile', anyBodyParser, Utilities.saveFile);
app.post('/services/saveMap', anyBodyParser, Utilities.saveMap);
app.get('/services/getMap', anyBodyParser, Utilities.getMap);

//export module
module.exports = app;

