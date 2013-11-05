'use strict';

angular.module('TCWS.dataStore', ['TCWS.inputHandler','TCWS.map','TCWS.grid'])

    .factory('DataStore', function () {
        // Service logic

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
            }
        }
    });