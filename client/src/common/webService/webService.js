'use strict';

angular.module('TCWS.webService', ['TCWS.webService.spatialAnalysisService'])

    .factory('WebService', ['$http','SpatialAnalysisService','DataStore','Editor','InputHandler',function ($http,SpatialAnalysisService,DataStore,Editor,InputHandler) {
        // Service logic




        // Public API here
        return {
            executeRequest : function(requestInfo){

                var length = requestInfo.requestData.layers.length;
                for (var i=0;i<length;i++)
                {
                    requestInfo.requestData.layers[i].GML = DataStore.getLayerAsGML(requestInfo.requestData.layers[i].id);
                }

                if(requestInfo.service == 'sas'){
                    return SpatialAnalysisService.executeRequest(requestInfo).then(function(gmlData){
                        var data = InputHandler.getDataFromGMLString(gmlData);

                        Editor.updateLayer(requestInfo.requestData.layers[0].id,data);
                    });
                }

            }
        }
    }]);