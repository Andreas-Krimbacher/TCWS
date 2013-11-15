'use strict';

angular.module('TCWS.dataStore', ['TCWS.inputHandler','TCWS.map','TCWS.grid'])

    .factory('DataStore',['InputHandler','DiaML', function (InputHandler,DiaML) {
        // Service logic

        var newIntegrationLayerId = 1;
        var integrationLayerSourceId = 999;

        var dataStore = {
            layers:{

            }
        };

        // Public API here
        return {
            getLayerListShort : function(){
                var result = [];

                for (var prop in dataStore.layers) {
                    if (dataStore.layers.hasOwnProperty(prop)) {
                        result.push({
                            id : prop,
                            name : dataStore.layers[prop].name,
                            type : dataStore.layers[prop].type
                        });
                    }
                }
                return result;

            },
            getLayer : function(id){
                return dataStore.layers[id];
            },
            getLayerAsGML : function(id){
                var parser = InputHandler.getGMLParser();

                var clonedGMLData = parser.readFeaturesFromString(parser.write(dataStore.layers[id].gmlData,{axisOrientation: 'en'}));
                var transform = ol.proj.getTransform(clonedGMLData.metadata.projection, "EPSG:4326");
                for(var i = 0, ii = clonedGMLData.features.length;i < ii;++i) {
                    clonedGMLData.features[i].values_[clonedGMLData.features[i].geometryName_].transform(transform)
                }
                clonedGMLData.metadata.projection = "EPSG:4326";

                return parser.write(clonedGMLData,{axisOrientation: 'en'});
            },
            addLayer : function(layer){
                dataStore.layers[layer.id] = layer;
            },
            updateLayer : function(id,data){
                for (var prop in data) {
                    if (data.hasOwnProperty(prop)) {
                        dataStore.layers[id][prop] = data[prop];
                    }
                }
            },
            applyPolygonSymbology : function(id,symbology){
                dataStore.layers[id].symbology = symbology;

                var layerData = dataStore.layers[id];

                var length1 = layerData.symbology.variableSymbology.length;
                for (var i=0;i<length1;i++)
                {
                    if(layerData.symbology.variableSymbology[i].columnType == 'nominal' && layerData.symbology.variableSymbology[i].styleType == 'list'){

                        var valuesArray = [];
                        var length2 = layerData.gmlData.features.length;
                        for (var k=0;k<length2;k++)
                        {
                            if(valuesArray.indexOf(layerData.gmlData.features[k].values_[layerData.symbology.variableSymbology[i].column]) == -1){
                                valuesArray.push(layerData.gmlData.features[k].values_[layerData.symbology.variableSymbology[i].column]);
                            }
                        }

                        if(valuesArray.length < layerData.symbology.variableSymbology[i].minValues || valuesArray.length > layerData.symbology.variableSymbology[i].maxValues){
                            console.log('Wrong number of categories for Symbology!');
                        }

                        valuesArray.sort();

                        var count = 0;
                        for (var prop in layerData.symbology.variableSymbology[i].styles) {
                            if (layerData.symbology.variableSymbology[i].styles.hasOwnProperty(prop)) {

                                layerData.symbology.variableSymbology[i].values[prop] = valuesArray[count];
                                count++;
                                if(valuesArray.length == count) break;

                            }
                        }
                    }
                }
            },
            applyPointSymbology : function(id,symbology){
                dataStore.layers[id].symbology = symbology;

                if(symbology.styleType == 'diaML'){

                    var layerData = dataStore.layers[id];

                    var values = [];
                    var value;

                    var length1 = layerData.gmlData.features.length;
                    for (var i=0;i<length1;i++)
                    {
                        value = {};
                        var length2 = layerData.symbology.variableSymbology.length;
                        for (var k=0;k<length2;k++)
                        {
                            value[layerData.symbology.variableSymbology[k].diaMLRef] = layerData.gmlData.features[i].values_[layerData.symbology.variableSymbology[k].column];
                        }

                        values.push(value);
                    }

                    var diagrams = DiaML.getCanvasDiagrams(layerData.symbology.DiaML.json, values);

                    length1 = layerData.gmlData.features.length;
                    for (i=0;i<length1;i++)
                    {
                        layerData.gmlData.features[i].values_.diaML = diagrams[i];
                    }

                    layerData.gmlData.features.sort(function(a,b) {
                        return parseFloat(b.values_.diaML.size) - parseFloat(a.values_.diaML.size)
                    });
                }

            },
            removeLayer : function(id){
                delete dataStore.layers[id];
            },
            integrateLayer : function(mappingTable,id,name){

                var spatialLayer = null;
                var attributeLayer = null;
                var spatialColumn = null;
                var attributeColumn = null;

                var originalMappingTable = mappingTable;
                var mappingTable = mappingTable.layers;

                for (var prop in mappingTable) {
                    if (mappingTable.hasOwnProperty(prop)) {
                        if(dataStore.layers[prop].type == 'attribute'){
                            attributeLayer = dataStore.layers[prop];
                            attributeColumn = mappingTable[prop].column;
                        }
                        else{
                            spatialLayer = dataStore.layers[prop];
                            spatialColumn = mappingTable[prop].column;
                        }
                    }
                }

                if(id){
                    var sourceId = null;
                    var layerId = null;
                }
                else{
                    var sourceId = integrationLayerSourceId;
                    var layerId = newIntegrationLayerId;
                    newIntegrationLayerId++;

                    id = sourceId + '-' + layerId;
                }

                if(!name) name = spatialLayer.name + ' ' + attributeLayer.name;

                var layerData = {
                    id : id,
                    name : name,
                    layerId : layerId,
                    sourceId : sourceId,
                    type : spatialLayer.type,
                    gmlData : {features : [], metadata : {projection : spatialLayer.gmlData.metadata.projection}},
                    epsg : spatialLayer.epsg,
                    attributes : [],
                    labels : {},
                    featureCount : spatialLayer.featureCount
                };

                var column,feature,oldFeature,attributeMatchString;
                var length2,length3;


                //Hack to clone the features feature.clone() dont work
                var parser = InputHandler.getGMLParser();
                var clonedGMLData = parser.readFeaturesFromString(parser.write(spatialLayer.gmlData,{axisOrientation: 'en'}));


                var length = spatialLayer.gmlData.features.length;
                for (var i=0;i<length;i++)
                {
                    oldFeature = clonedGMLData.features[i];
                    feature = new ol.Feature();
                    feature.featureId_ = oldFeature.featureId_+'a';
                    feature.geometryName_ = oldFeature.geometryName_;

                    // copy geometry
                    feature.values_[feature.geometryName_] = oldFeature.values_[oldFeature.geometryName_].clone();

                    // copy colums of spatial layer
                    length2 = mappingTable[spatialLayer.id].columnNewTable.length;
                    for (var k=0;k<length2;k++)
                    {
                        column = mappingTable[spatialLayer.id].columnNewTable[k];
                        feature.values_[column] = oldFeature.values_[column];

                        // add label
                        layerData.labels[column] = spatialLayer.labels[column];
                    }

                    // get attributeMatchString
                    if(originalMappingTable.directMatch){
                        attributeMatchString = oldFeature.values_[spatialColumn];
                    }
                    else{
                        for (prop in mappingTable[spatialLayer.id].index) {
                            if (mappingTable[spatialLayer.id].index.hasOwnProperty(prop)) {
                                if(mappingTable[spatialLayer.id].index[prop] == oldFeature.values_[spatialColumn]){
                                    attributeMatchString = mappingTable[attributeLayer.id].index[prop];
                                }
                            }
                        }
                    }


                    length2 = attributeLayer.attributes.length;
                    for (k=0;k<length2;k++)
                    {
                        if(attributeLayer.attributes[k][attributeColumn] == attributeMatchString){
                            // copy colums of attribute layer
                            length3 = mappingTable[attributeLayer.id].columnNewTable.length;
                            for (var j=0;j<length3;j++)
                            {
                                column = mappingTable[attributeLayer.id].columnNewTable[j];
                                feature.values_[column] = attributeLayer.attributes[k][column];

                                // add label
                                layerData.labels[column] = attributeLayer.labels[column];
                            }
                        }
                    }

                    layerData.gmlData.features.push(feature);
                }


                // create attribute data
                length = layerData.gmlData.features.length;
                for (i=0;i<length;i++)
                {
                    layerData.attributes[i] = {};
                    for (prop in layerData.gmlData.features[i].values_) {
                        if (prop != layerData.gmlData.features[i].geometryName_ && layerData.gmlData.features[i].values_.hasOwnProperty(prop)) {
                            layerData.attributes[i][prop] = layerData.gmlData.features[i].values_[prop];
                        }
                    }
                }
                layerData.featureCount = i;

                dataStore.layers[layerData.id] = layerData;
            },
            manipulateTable : function(layerId,action,config){

                var layerData = dataStore.layers[layerId];

                if(action == '/' || action == '*' || action == '+' || action == '-'){

                    var value1,value2,result;
                    var length = layerData.gmlData.features.length;
                    for (var i=0;i<length;i++)
                    {
                        value1 = layerData.gmlData.features[i].values_[config.column1] || config.value1;
                        value2 = layerData.gmlData.features[i].values_[config.column2] || config.value2;

                        if(action == '/') result = value1 / value2;
                        if(action == '*') result = value1 * value2;
                        if(action == '+') result = value1 + value2;
                        if(action == '-') result = value1 - value2;

                        layerData.gmlData.features[i].values_[config.targetColumn] =  result;
                    }

                    // create attribute data
                    length = layerData.gmlData.features.length;
                    for (i=0;i<length;i++)
                    {
                        layerData.attributes[i] = {};
                        for (var prop in layerData.gmlData.features[i].values_) {
                            if (prop != layerData.gmlData.features[i].geometryName_ && layerData.gmlData.features[i].values_.hasOwnProperty(prop)) {
                                layerData.attributes[i][prop] = layerData.gmlData.features[i].values_[prop];
                            }
                        }
                    }
                    layerData.featureCount = i;

                    layerData.labels[config.targetColumn] = config.targetColumnName;

                }
            }
        }
    }]);