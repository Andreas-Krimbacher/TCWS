'use strict';

angular.module('TCWS.symbology', [])

    .factory('Symbology', ['DiaML',function (DiaML) {
        // Service logic

        var colorScheme = {
            '1' : {'polygon-fill' : '#7FC97F'},
            '2' :{'polygon-fill' : '#BEAED4'},
            '3' :{'polygon-fill' : '#FDC086'},
            '4' :{'polygon-fill' : '#FFFF99'},
            '5' :{'polygon-fill' : '#386CB0'}
        };

        var polygonGroupSymbology = {
            '1':{
                groupId : 1,
                groupName : 'Beautiful',
                groupStyle : {
                    'polygon-fill' : '#ffffff',
                    'polygon-opacity' : 1,
                    'line-color' : '#5cb85c',
                    'line-width' : 1
                },
                symbologys : {
                    '1' : {
                        symbologyId : 1,
                        name : 'Qualitative',
                        style : {},
                        variableSymbology : [
                            {
                                columnType : 'nominal',
                                column : null,
                                styles : colorScheme,
                                values : {},
                                styleType : 'list',
                                maxValues : 5,
                                minValues : 2
                            }
                        ]
                    }
                }
            }
        };

        var pointGroupSymbology = {
            '1':{
                groupId : 1,
                groupName : 'Pie Charts',
                groupStyle : {},
                symbologys : {
                    '1' : {
                        symbologyId : 1,
                        name : 'Two Values Grouped',
                        style : {},
                        DiaML : {sourceType : 'file', config : {path : 'Symbology/DiaML/pie.xml'}, json : null, xml : null, type : 'diagram'},
                        variableSymbology : [
                            {
                                columnType : 'metric',
                                column : null,
                                diaMLRef : 'column1'
                            },
                            {
                                columnType : 'metric',
                                column : null,
                                diaMLRef : 'column2'
                            },
                            {
                                columnType : 'metric',
                                column : null,
                                diaMLRef : 'column3'
                            },
                            {
                                columnType : 'metric',
                                column : null,
                                diaMLRef : 'column4'
                            }
                        ]
                    }
                }
            }
        };

        // Public API here
        return {
            getPolygonGroupSymbology : function(){


                return angular.copy(polygonGroupSymbology);

            },
            getPointGroupSymbology : function(){

                var result = angular.copy(pointGroupSymbology);
                return DiaML.diaMLToJson(result['1'].symbologys['1'].DiaML).then(function(){

                    return result;

                });

            },
            getPolygonSymbology : function(groupId,symbologyId,columns){

                var symbology = angular.copy(polygonGroupSymbology[groupId].symbologys[symbologyId]);

                for (var prop in polygonGroupSymbology[groupId].groupStyle) {
                    if (polygonGroupSymbology[groupId].groupStyle.hasOwnProperty(prop)) {

                        if(!symbology.style[prop]){
                            symbology.style[prop] = polygonGroupSymbology[groupId].groupStyle[prop];
                        }

                    }
                }

                var length = symbology.variableSymbology.length;
                for (var i=0;i<length;i++)
                {
                    symbology.variableSymbology[i].column = columns[i];
                }

                return symbology;
            },
            getPointSymbology : function(groupId,symbologyId,columns){

                var symbology = angular.copy(pointGroupSymbology[groupId].symbologys[symbologyId]);
                var length = symbology.variableSymbology.length;
                for (var i=0;i<length;i++)
                {
                    symbology.variableSymbology[i].column = columns[i];
                }

                return DiaML.diaMLToJson(symbology.DiaML).then(function(){
                    return symbology;
                });
            }
        }
    }])

    .factory('DiaML', function ($http) {
        // Service logic


        // Public API here
        return {
            diaMLToJson : function(diaML){

                if(!diaML.xml){
                    if(diaML.sourceType == 'file'){
                        return $http({method: 'GET', url: diaML.config.path}).then(function(result){
                            var parser = new X2JS();
                            diaML.json = parser.xml_str2json(result.data);

                        });
                    }
                }
                else{
                    var parser = new X2JS();
                    var json = parser.xml_str2json(diaML.xml);

                    return json;
                }
            },
            getCanvasDiagrams : function(diaML,values){

                var primitive = diaML.symbol.primitive;
                var diagramArrangement = diaML.symbol.diagram.diagramArrangement;
                var diagramRelation = diaML.symbol.diagram.diagramRelation;

                var maxStrokeWidth = 0;

                var styles = {};

                var length = diaML.symbol.style.length;
                for (var i=0;i<length;i++)
                {
                    styles[diaML.symbol.style[i]._id] = {};
                    for (var prop in diaML.symbol.style[i]) {
                        if (diaML.symbol.style[i].hasOwnProperty(prop)) {

                            if(prop != '_id'){
                                styles[diaML.symbol.style[i]._id][prop] = diaML.symbol.style[i][prop].toString();

                                if(prop == 'stroke-width' && (parseInt( styles[diaML.symbol.style[i]._id][prop] ) > maxStrokeWidth))
                                    maxStrokeWidth = parseInt( styles[diaML.symbol.style[i]._id][prop] );
                            }

                        }
                    }
                }

                if(primitive.sector && diagramArrangement.polar){

                    //standard variables
                    var groupCount = parseInt(diagramArrangement.polar.groups.toString());
                    var centerDistance = parseInt(diagramArrangement.polar.centerDistance.toString()) || 0;
                    var relationCount = diagramRelation.length;

                    var relationsPerGroup = relationCount / groupCount;

                    var totalAngle = parseInt(diagramArrangement.polar.totalAngle.toString());
                    var totalGroupAngle = totalAngle / groupCount;

                    var minRadius = parseInt(diaML.symbol.diagram._minSize.toString());
                    var maxRadius = parseInt(diaML.symbol.diagram._maxSize.toString());

                    var diagrams = [];
                    var valueObject = null;

                    if(values){
                        var smallestTotalSum = Infinity;
                        var smallestPartSum = Infinity;

                        var biggestTotalSum = 0;
                        var biggestPartSum = 0;

                        var length0,count,counter;
                        if(values) length0 = values.length;
                        else length0 = 1;

                        for (var k=0;k<length0;k++)
                        {

                            valueObject = values[k];

                            var totalSum = 0;
                            var partSum = [];
                            count = 0;
                            counter = 0;
                            for (prop in valueObject) {
                                if (valueObject.hasOwnProperty(prop)) {
                                    if((counter % relationsPerGroup) == 0) count++;
                                    partSum[count-1] = (partSum[count-1] || 0) + parseFloat(valueObject[prop]);

                                    counter++;
                                }
                            }

                            for (i=partSum.length; i--;) {
                                totalSum += partSum[i];

                                if( (partSum[i] != 0) && (partSum[i] < smallestPartSum)) smallestPartSum = partSum[i];
                                if( (partSum[i] != 0) && (partSum[i] > biggestPartSum)) biggestPartSum = partSum[i];
                            }

                            if((totalSum != 0) && (totalSum < smallestTotalSum)) smallestTotalSum = totalSum;
                            if((totalSum != 0) && (totalSum > biggestTotalSum)) biggestTotalSum = totalSum;

                            values[k].partSum = partSum;
                            values[k].totalSum = totalSum;
                        }
                    }

                    //linear scaling of r
                    console.log(smallestTotalSum);
                    console.log(smallestPartSum);
                    console.log(biggestTotalSum);
                    console.log(biggestPartSum);

                    var k_total = (maxRadius - minRadius) / (biggestTotalSum - smallestTotalSum);
                    var k_partSum = (maxRadius - minRadius) / (biggestPartSum - smallestPartSum);
                    //

                    if(values) length0 = values.length;
                    else length0 = 1;

                    for (k=0;k<length0;k++)
                    {
                        if(values) valueObject = values[k];

                        //angle
                        var angle = primitive.sector.angle;
                        var defaultAngleValues = primitive.sector.angle.toString().split(',');
                        var angleValue;

                        var startAngle = 0;
                        var angleValues = [];

                        if(angle._scale == 'dataValue'){
                            count = 0;
                            for (i=0;i<relationCount;i++)
                            {
                                if(valueObject){
                                    if((i % relationsPerGroup) == 0) count++;
                                    if(valueObject.partSum[count-1] == 0){
                                        angleValue = totalGroupAngle / relationsPerGroup;
                                    }
                                    else{
                                        angleValue = ( parseFloat(valueObject[diagramRelation[i].dataRef.toString()]) / valueObject.partSum[count-1]) * totalGroupAngle;
                                    }
                                    angleValues[i] = {startAngle : startAngle, endAngle : startAngle + angleValue, centerDirection : (totalGroupAngle*(count-1)) + (totalGroupAngle/2)};
                                    startAngle = startAngle + angleValue;
                                }
                                else{
                                    angleValue = parseInt(defaultAngleValues[i]);
                                    angleValues[i] = {startAngle : startAngle, endAngle : startAngle + angleValue};
                                    startAngle = startAngle + angleValue;
                                }
                            }
                        }

                        //radius
                        var radius = primitive.sector.r;
                        var defaultRadiusValues = primitive.sector.r.toString().split(',');

                        var radiusValues = [];
                        var maxRadiusValue = 0;

                        if(radius._scale == 'partSum'){
                            count = 0;
                            for (i=0;i<relationCount;i++)
                            {
                                if((i % relationsPerGroup) == 0) count++;
                                if(valueObject){
                                    radiusValues[i] = {radius : ((valueObject.partSum[count-1] - smallestPartSum) * k_partSum) + minRadius };
                                }
                                else{
                                    radiusValues[i] = {radius : parseInt(defaultRadiusValues[count-1])};
                                }
                                if(radiusValues[i].radius > maxRadiusValue) maxRadiusValue = radiusValues[i].radius;
                            }
                        }



                        //styles
                        var relationStyles = [];

                        for (i=0;i<relationCount;i++)
                        {
                            relationStyles[i] = styles[diagramRelation[i].styleRef.toString()];
                        }


                        //draw diagrams

                        var canvas = document.createElement('canvas');
                        canvas.width = (maxRadiusValue + maxStrokeWidth + centerDistance)*2;
                        canvas.height = (maxRadiusValue + maxStrokeWidth + centerDistance)*2;
                        var ctx = canvas.getContext('2d');

                        var cx0 = canvas.width / 2;
                        var cy0 = canvas.height / 2;

                        var cx = cx0;
                        var cy = cy0;

                        var direction;

                        for (i=0;i<relationCount;i++)
                        {
                            if(parseFloat(valueObject[diagramRelation[i].dataRef.toString()]) != 0){
                                ctx.beginPath();

                                ctx.fillStyle = relationStyles[i].fill;
                                ctx.strokeStyle =  relationStyles[i].stroke;
                                ctx.lineWidth= relationStyles[i]['stroke-width'];

                                if(centerDistance != 0){
                                    direction = angleValues[i].centerDirection - 90;

                                    cx = cx0 + Math.cos(direction * (Math.PI/180)) * centerDistance;
                                    cy = cy0 + Math.sin(direction * (Math.PI/180)) * centerDistance;
                                }

                                ctx.moveTo(cx,cy);
                                ctx.arc(cx,cy,radiusValues[i].radius,(angleValues[i].startAngle - 90) * (Math.PI/180),(angleValues[i].endAngle - 90) * (Math.PI/180));
                                ctx.lineTo(cx,cy);

                                ctx.stroke();
                                ctx.fill();

                                ctx.closePath();
                            }
                            else{
                                console.log('Skipped 0 value!');
                            }
                        }

                        diagrams.push({id : k, img : canvas.toDataURL(), width: canvas.width, height : canvas.height, size : (canvas.width * canvas.height)});
                    }

                }
                else{
                    console.log('DiaML Primitive not supported!')
                }

                return diagrams;
            }

        }
    });