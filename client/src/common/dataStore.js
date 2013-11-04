'use strict';

angular.module('TCWS.dataStore', ['TCWS.inputHandler','TCWS.map','TCWS.grid'])

    .factory('DataStore', ['InputHandler','OpenLayersMap','Grid',function (InputHandler,OpenLayersMap,Grid) {
        // Service logic

        var dataStore = {
            layers:{

            },
            map:{

            }
        };

        // Public API here
        return {
            getDataFromFile : function(param){

                var id = param.sourceId + '-' + param.layerId;

                if(!dataStore.layers[id]){
                    return InputHandler.getDataFromFile(param.path).then(function(data){

                        var layerData = {
                            name : param.name,
                            layerId : param.layerId,
                            sourceId : param.sourceId,
                            path : param.path,
                            gmlData : data,
                            epsg : data.metadata.projection,
                            attributes : [],
                            featureCount : null
                        };

                        var length = data.features.length;
                        for (var i=0;i<length;i++)
                        {
                            layerData.attributes[i] = {};
                            for (var prop in data.features[i].values_) {
                                if (prop != 'geometry' && data.features[i].values_.hasOwnProperty(prop)) {
                                    layerData.attributes[i][prop] = data.features[i].values_[prop];
                                }
                            }
                        }

                        dataStore.layers[id] = layerData;
                    });
                }
                else{
                    return false;
                }
            },
            getLayerListShort : function(){
                var result = [];

                for (var prop in dataStore.layers) {
                    if (dataStore.layers.hasOwnProperty(prop)) {
                        result.push({
                            id : prop,
                            name : dataStore.layers[prop].name
                        });
                    }
                }
                return result;

            },
            removeLayer : function(id){
                delete dataStore.layers[id];
            },
            showLayerInMap : function(id){
                if(dataStore.layers[id]){
                    OpenLayersMap.addLayer(dataStore.layers[id]);
                    return true;
                }
                else{
                    return false;
                }
            },
            showLayerInGrid : function(id){
                if(dataStore.layers[id]){
                    Grid.showData(dataStore.layers[id]);
                }
                else{
                    return false;
                }
            }


        }
    }]);