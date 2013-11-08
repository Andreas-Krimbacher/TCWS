'use strict';

angular.module('TCWS.webService.classifyClusterService', [])

    .factory('ClassifyClusterService', ['$http',function ($http) {
        // Service logic




        // Public API here
        return {
            executeRequest : function(requestInfo){
                return $http({
                    url: requestInfo.processingService.url,
                    method: "POST",
                    params : requestInfo.config.requestParam,
                    data: requestInfo.config.requestData.layersData[0].GML,
                    headers: {'Content-Type': 'application/xml'}
                }).then(function(fileData){
                        return fileData.data;
                    });
            }
        }
    }]);