'use strict';

angular.module('TCWS.webService', ['TCWS.webService.spatialAnalysisService','TCWS.webService.classifyClusterService','TCWS.webService.cartographicTechniqueService'])

    .factory('WebService', ['$http','SpatialAnalysisService','ClassifyClusterService','CartographicTechniqueService','DataStore','InputHandler',function ($http,SpatialAnalysisService,ClassifyClusterService,CartographicTechniqueService,DataStore,InputHandler) {
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
                    return ClassifyClusterService.executeRequest(requestInfo).then(function(gmlData){
                        var layerData = InputHandler.getDataFromGMLString(gmlData);

                        return layerData;
                    });
                }

                if(requestInfo.processingService.serviceType == 'cts'){
                    return CartographicTechniqueService.executeRequest(requestInfo).then(function(gmlData){
                        var layerData = InputHandler.getDataFromGMLString(gmlData);

                        return layerData;
                    });
                }

            }
        }
    }]);