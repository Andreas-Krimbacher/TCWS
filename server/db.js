/**
 * Server module to perform database tasks, the methods are directly used as middleware for specific routes
 * @name Server:db
 * @namespace
 * @author Andreas Krimbacher
 */
var fs = require('fs');
var pg = require('pg');
var exec = require('child_process').exec;


//set connection string here *******************************************************************************
//**********************************************************************************************************
//e.g.: var connectionString = "postgres://urban:urban@localhost:5432/urban";
//**********************************************************************************************************

var pgConfig = {database : 'TCWS',
    schema : 'Service',
    user : 'TCWS',
    password : 'TCWS',
    host : 'localhost',
    port : '5432'};

module.exports.defaultSchema = pgConfig.schema;

var connectionString = 'postgres://'+pgConfig.user+':'+pgConfig.password+'@'+pgConfig.host+':'+pgConfig.port+'/'+pgConfig.database;
var client = new pg.Client(connectionString);
client.connect();

var tmpPath = '/home/nd/ooo/TCWS/FileServer/tmp/';
var tmpInFileName = 'tmpInGmlData.xml';
var tmpOutFileName = 'tmpOutGmlData.xml';
var tmpTableName = 'tmp';
var geomName = 'geometryProperty';

module.exports.importGML = function(req,callback){

    fs.writeFile(tmpPath+tmpInFileName, req.rawBody, function(err) {
        if(err) {
            console.log(err);
            res.end(err);
            return
        }
        console.log("The file was uploaded!");

        var sql = 'DROP TABLE IF EXISTS "'+pgConfig.schema+'".'+tmpTableName+';';
        console.log(sql);
        client.query(sql, function(err) {

            if(err) {
                console.log(err);
                res.end(err);
                return
            }

            console.log("DB initialized!");

            var cmd = 'ogr2ogr -f PostgreSQL ';
            cmd += '"PG:dbname='+pgConfig.database+' host='+pgConfig.host+' user='+pgConfig.user+' password='+pgConfig.password+' active_schema='+pgConfig.schema+'" ';
            cmd += tmpPath+tmpInFileName+' -lco GEOMETRY_NAME='+geomName+' -nln '+tmpTableName;

            console.log(cmd);
            exec(cmd, function (err, stdout, stderr) {
                if(err){
                    res.end(err);
                    return
                }

                console.log(stdout);
                console.log(stderr);

                console.log("Table imported!");

                callback();

            });

        });

    });
};

module.exports.exportGML = function(callback){
    var cmd = 'ogr2ogr -f "ESRI Shapefile" '+tmpPath+' ';
    cmd += '"PG:dbname='+pgConfig.database+' host='+pgConfig.host+' user='+pgConfig.user+' password='+pgConfig.password+' active_schema='+pgConfig.schema+'" ';
    cmd += ' -sql "SELECT * FROM '+tmpTableName+'" -nln '+tmpOutFileName+' -overwrite';

    console.log(cmd);
    exec(cmd, function (err, stdout, stderr) {
        if(err){
            res.end(err);
            return
        }

        console.log(stdout);
        console.log(stderr);

        console.log("Output Shape created!");

        var cmd = 'ogr2ogr -f "GML" -a_srs EPSG:4326 -t_srs EPSG:4326 -preserve_fid '+tmpPath+tmpOutFileName+' '+tmpPath+tmpOutFileName+'.shp';

        console.log(cmd);
        exec(cmd, function (err, stdout, stderr) {
            if(err){
                res.end(err);
                return
            }

            console.log(stdout);
            console.log(stderr);

            console.log("Output GML created!");


            fs.readFile(tmpPath+tmpOutFileName, 'utf8', function (err,data) {
                if(err){
                    res.end(err);
                    return
                }

                data = data.replace(/ogr:FeatureCollection/g,'wfs:FeatureCollection');
                data = data.replace('xmlns:ogr="http://ogr.maptools.org/"','xmlns:ogr="http://ogr.maptools.org/" \n xmlns:wfs="http://www.opengis.net/wfs"');

                console.log(data);

                callback(data);
            });


        });

    });
};

module.exports.sql = function(sql,callback){
    console.log(sql);
    client.query(sql, function(err) {

        callback(err);
    });
};