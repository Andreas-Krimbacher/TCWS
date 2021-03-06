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

    if(req.query.methodGroup == 'measure' && req.query.method == 'area'){

        db.importGML(req,tmpTableName, function(err){
            if(err) {
                console.log(err);
                res.end(err);
                return
            }


            var sql = 'ALTER TABLE "'+db.defaultSchema+'".'+tmpTableName+' ADD COLUMN area_size bigint;';
            db.sql(sql, function(err) {
                if(err) {
                    console.log(err);
                    res.end(err);
                    return
                }

                console.log("Column added!");


                sql = 'UPDATE "'+db.defaultSchema+'".'+tmpTableName+' SET area_size = cast(ST_Area(ST_Transform("'+geomName+'", utmzone(ST_Centroid("'+geomName+'")))) / 1000000 as bigint);';
                db.sql(sql, function(err) {

                    if(err) {
                        console.log(err);
                        res.end(err);
                        return
                    }

                    console.log("Area calculated!");

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

        });
    }

    if(req.query.methodGroup == 'analyzeGeometry' && req.query.method == 'centroid'){

        db.importGML(req,tmpTableName, function(err){
            if(err) {
                console.log(err);
                res.end(err);
                return
            }


            var sql = 'UPDATE "'+db.defaultSchema+'".'+tmpTableName+' SET "'+geomName+'" = ST_Centroid("'+geomName+'")';
            db.sql(sql, function(err) {
                if(err) {
                    console.log(err);
                    res.end(err);
                    return
                }

                console.log("Centroid calculated!");


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
