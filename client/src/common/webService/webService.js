'use strict';

angular.module('TCWS.webService', ['TCWS.webService.spatialAnalysisService','TCWS.webService.classifyClusterService'])

    .factory('WebService', ['$http','SpatialAnalysisService','ClassifyClusterService','DataStore','InputHandler',function ($http,SpatialAnalysisService,ClassifyClusterService,DataStore,InputHandler) {
        // Service logic




        // Public API here
        return {
            executeRequest : function(requestInfo){

                var length = requestInfo.config.requestData.layersId.length;
                for (var i=0;i<length;i++)
                {
                    requestInfo.config.requestData.layersData[i].GML = DataStore.getLayerAsGML(requestInfo.config.requestData.layersId[i]);
                }

                if(requestInfo.processingService.serviceType == 'sas'){
                    return SpatialAnalysisService.executeRequest(requestInfo).then(function(gmlData){
                        var layerData = InputHandler.getDataFromGMLString(gmlData);

                        return layerData;
                    });
                }

                if(requestInfo.processingService.serviceType == 'ccs'){
                    return SpatialAnalysisService.executeRequest(requestInfo).then(function(gmlData){
                        var layerData = InputHandler.getDataFromGMLString(gmlData);

                        return layerData;
                    });
                }

            }
        }
    }]);