/**
 * Server module to perform database tasks, the methods are directly used as middleware for specific routes
 * @name Server:db
 * @namespace
 * @author Andreas Krimbacher
 */
var db = require('./db');

var tmpTableName = 'tmp';

module.exports.handleRequest =  function(req, res) {
    console.dir(req.rawBody);
    console.dir(req.query);


    if(req.query.methodGroup == 'classify' && req.query.method == 'quantile'){
        db.importGML(req, function(err){
            if(err) {
                console.log(err);
                res.end(err);
                return
            }

            var sql = 'SELECT classify_quantil('+req.query.classCount+',\'"'+db.defaultSchema+'".'+tmpTableName+'\', \''+req.query.column+'\')';
            db.sql(sql, function(err) {

                if(err) {
                    console.log(err);
                    res.end(err);
                    return
                }

                console.log("Quantile classified");

                db.exportGML(function(err,data){
                    if(err) {
                        console.log(err);
                        res.end(err);
                        return
                    }

                    console.log("Send response!");

                    res.writeHead(200, {'Content-Type': 'text/plain'});
                    res.end(data);
                });
            });

        });

    }
};
