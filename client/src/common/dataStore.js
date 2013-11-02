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
            getDataFromFile : function(sourceFile){
                return InputHandler.getDataFromFile(sourceFile).then(function(data){

                    var layerData = {gmlData : data,
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

                    dataStore.layers['123'] = layerData;
                });
            },
            getDataListShort : function(){
                if(dataStore.layers['123']){
                    return [{id: '123', name : 'Aut'}];
                }
                else{
                    return [];
                }

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