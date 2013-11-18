'use strict';

angular.module('TCWS.symbology', [])

    .factory('Symbology', ['DiaML','$http','DescriptionService',function (DiaML,$http,DescriptionService) {
        // Service logic

        var _getFileData = function(path){
            return $http({method: 'GET', url: path}).then(function(result){
                return result.data;
            });
        };

        // Public API here
        return {
            getSymbologyRepositories : function(){
                return DescriptionService.getSymbologyRepositories();
            },
            getPolygonSymbologyGroups : function(symbologyRepository){

                return symbologyRepository.param.polygonSymbologys;

            },
            getPointSymbologyGroups : function(symbologyRepository){

                return symbologyRepository.param.pointSymbologys;

            },
            getPolygonSymbologyGroup : function(symbologyRepository,groupId){

                var path = symbologyRepository.param.polygonSymbologys[groupId].path;
                return _getFileData(path).then(function(symbologyGroup){
                    return symbologyGroup;
                });

            },
            getPointSymbologyGroup : function(symbologyRepository,groupId){

                var path = symbologyRepository.param.pointSymbologys[groupId].path;
                return _getFileData(path).then(function(symbologyGroup){
                    return symbologyGroup;
                });

            },
            getPolygonSymbology : function(symbologyRepository,config){
                //implementation for cartoCSS with variable Style
                var path = symbologyRepository.param.polygonSymbologys[config.groupId].path;

                return _getFileData(path).then(function(symbologyGroup){

                    var symbology = symbologyGroup.symbologys[config.symbologyId];

                    for (var prop in symbologyGroup.groupStyle) {
                        if (symbologyGroup.groupStyle.hasOwnProperty(prop)) {

                            if(!symbology.style[prop]){
                                symbology.style[prop] = symbologyGroup.groupStyle[prop];
                            }

                        }
                    }

                    if(config.columns){
                        var length = symbology.variableSymbology.length;
                        for (var i=0;i<length;i++)
                        {
                            symbology.variableSymbology[i].column = config.columns[i];
                        }
                    }

                    var promise = null;
                    length = symbology.variableSymbology.length;
                    for (i=0;i<length;i++)
                    {
                        if(typeof symbology.variableSymbology[i].styles == 'string'){
                            var variableStylePath = symbologyRepository.param.variableStyle[symbology.variableSymbology[i].styles].path;

                            if(!promise){
                                (function(i){
                                    promise = _getFileData(variableStylePath).then(function(variableSymbology){
                                        symbology.variableSymbology[i].styles = variableSymbology;
                                        return symbology;
                                    });
                                })(i);
                            }
                            else{
                                (function(i){
                                    promise.then(function(variableSymbology){
                                        symbology.variableSymbology[i].styles = variableSymbology;
                                        return symbology;
                                    });
                                })(i);
                            }

                        }
                    }

                    if(promise) return promise;
                    else return symbology;
                });
            },
            getPointSymbology : function(symbologyRepository,config){
                //implementation for diaml and cartoCSS without variable Style

                var path = symbologyRepository.param.pointSymbologys[config.groupId].path;

                return _getFileData(path).then(function(symbologyGroup){
                    var symbology = symbologyGroup.symbologys[config.symbologyId];

                    if(config.columns){
                        var length = symbology.variableSymbology.length;
                        for (var i=0;i<length;i++)
                        {
                            symbology.variableSymbology[i].column = config.columns[i];
                        }
                    }

                    var promise = null;
                    if(symbology.styleType == 'diaML'){
                        if(!symbology.diaML.xml){
                            if(symbology.diaML.sourceType == 'file'){
                                promise = _getFileData(symbology.diaML.config.path).then(function(diaMLXml){
                                    symbology.diaML.json = DiaML.diaMLXmlToJson(diaMLXml);

                                    return symbology;
                                });
                            }
                        }
                        else{
                            diaML.json = DiaML.diaMLXmlToJson(diaMLXml);
                        }
                    }

                    if(symbology.styleType == 'cartoCss'){
                        for (var prop in symbologyGroup.groupStyle) {
                            if (symbologyGroup.groupStyle.hasOwnProperty(prop)) {
                                if(!symbology.style[prop]){
                                    symbology.style[prop] = symbologyGroup.groupStyle[prop];
                                }
                            }
                        }
                    }

                    if(promise) return promise;
                    else return symbology;
                });
            },
            getPreview : function(symbology,symbologyType){
                var img = '';

                if(symbologyType == 'point' && symbology.styleType == 'diaML'){
                    var diagrams = DiaML.getCanvasDiagrams(symbology.diaML.json, null);
                    img = diagrams[0];
                }

                return img;
            }
        }
    }])

    .factory('DiaML', function ($http) {
        // Service logic


        // Public API here
        return {
            diaMLXmlToJson : function(xml){

                var parser = new X2JS();
                var json = parser.xml_str2json(xml);

                return json;

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
                                if((i % relationsPerGroup) == 0) count++;
                                if(valueObject){
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
                                    angleValues[i] = {startAngle : startAngle, endAngle : startAngle + angleValue, centerDirection : (totalGroupAngle*(count-1)) + (totalGroupAngle/2)};
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
                            if(!values || parseFloat(valueObject[diagramRelation[i].dataRef.toString()]) != 0){
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