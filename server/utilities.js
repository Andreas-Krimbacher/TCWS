/**
 * Server module to perform database tasks, the methods are directly used as middleware for specific routes
 * @name Server:db
 * @namespace
 * @author Andreas Krimbacher
 */

var fs = require('fs');

module.exports.saveFile =  function(req, res) {
    //console.dir(req.rawBody);
    console.dir(req.query);

    var serverPath = '/home/nd/ooo/TCWS/FileServer/';

    fs.writeFile(serverPath + req.query.path + req.query.fileName, req.rawBody, function(err) {
        if(err) {
            console.log(err);
            res.end(err);
            return
        }
        console.log("The file was uploaded!");

        console.log("Send response!");

        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('okay');

    });
};

module.exports.saveMap =  function(req, res) {
    //console.dir(req.rawBody);
    console.dir(req.query);

    var serverPath = '/home/nd/ooo/TCWS/FileServer/';

    fs.writeFile(serverPath + 'Maps/' + req.query.fileName, req.rawBody, function(err) {
        if(err) {
            console.log(err);
            res.end(err);
            return
        }
        console.log("The map was uploaded!");

        console.log("Send response!");

        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('okay');

    });
};

module.exports.getMap =  function(req, res) {
    //console.dir(req.rawBody);
    console.dir(req.query);

    var serverPath = '/home/nd/ooo/TCWS/FileServer/';

    var file = serverPath + 'Maps/' + req.query.mapId + '.xml';

    if (fs.existsSync(file)) { // or fs.existsSync
        fs.readFile(file, 'utf8', function (err,data) {
            if(err){
                console.log(err);
                res.end(err);
                return
            }

            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end(data);
        });
    }
    else{
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('No File');
    }


};