'use strict';

angular.module('TCWS.dataStore', ['TCWS.inputHandler','TCWS.map','TCWS.grid'])

    .factory('DataStore', function () {
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
            addLayer : function(layer){
                dataStore.layers[layer.id] = layer;
            },
            removeLayer : function(id){
                delete dataStore.layers[id];
            },
            integrateLayer : function(mappingTable,name){

                var spatialLayer = null;
                var attributeLayer = null;
                var spatialColumn = null;
                var attributeColumn = null;

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

                var sourceId = integrationLayerSourceId;
                var layerId = newIntegrationLayerId;
                newIntegrationLayerId++;

                if(!name) name = spatialLayer.name + ' ' + attributeLayer.name;

                var layerData = {
                    id : sourceId + '-' + layerId,
                    name : name,
                    layerId : layerId,
                    sourceId : sourceId,
                    type : spatialLayer.type,
                    gmlData : {features : [], metadata : {projection : spatialLayer.gmlData.metadata}},
                    epsg : spatialLayer.epsg,
                    attributes : [],
                    labels : {},
                    featureCount : spatialLayer.featureCount
                };

                var column,feature,oldFeature,attributeMatchString;
                var length2,length3;

                var length = spatialLayer.gmlData.features.length;
                for (var i=0;i<length;i++)
                {
                    oldFeature = spatialLayer.gmlData.features[i];
                    feature = new ol.Feature();
                    feature.featureId_ = oldFeature.featureId_;
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
                    for (prop in mappingTable[spatialLayer.id].index) {
                        if (mappingTable[spatialLayer.id].index.hasOwnProperty(prop)) {
                            if(mappingTable[spatialLayer.id].index[prop] == oldFeature.values_[spatialColumn]){
                                attributeMatchString = mappingTable[attributeLayer.id].index[prop];
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
                        if (prop != 'geometry' && layerData.gmlData.features[i].values_.hasOwnProperty(prop)) {
                            layerData.attributes[i][prop] = layerData.gmlData.features[i].values_[prop];
                        }
                    }
                }
                layerData.featureCount = i;

                dataStore.layers[layerData.id] = layerData;
            }
        }
    });