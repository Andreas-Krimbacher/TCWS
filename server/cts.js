/**
 * Server module to perform database tasks, the methods are directly used as middleware for specific routes
 * @name Server:db
 * @namespace
 * @author Andreas Krimbacher
 */
var db = require('./db');

var geomName = 'geometryProperty';

module.exports.handleRequest =  function(req, res) {
    //console.dir(req.rawBody);
    console.dir(req.query);

    var tmpTableName = db.getNextTmpTableName();

    if(req.query.methodGroup == 'dotMap' && req.query.method == 'dotFromArea'){

        var dotTableSuffix = 'dots';

        db.importGML(req,tmpTableName, function(err){
            if(err) {
                console.log(err);
                res.end(err);
                return
            }


            var sql = 'SELECT dot_map(\''+db.defaultSchema+'\',\''+tmpTableName+'\',\''+dotTableSuffix+'\',\''+geomName+'\',\''+req.query.attribute+'\',\''+req.query.keepAttribute+'\',\''+req.query.dotValue+'\',\''+req.query.dotDistance+'\');';
            db.sql(sql, function(err) {

                if(err) {
                    console.log(err);
                    res.end(err);
                    return
                }

                console.log("Dot Map created");

                tmpTableName = tmpTableName + '_' + dotTableSuffix;

                db.exportGML(tmpTableName,function(err,data){
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
