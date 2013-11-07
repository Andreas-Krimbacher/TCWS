'use strict';

angular.module('TCWS.webService.spatialAnalysisService', [])

    .factory('SpatialAnalysisService', ['$http',function ($http) {
        // Service logic




        // Public API here
        return {
            executeRequest : function(requestInfo){
                return $http({
                    url: requestInfo.url,
                    method: "POST",
                    data: requestInfo.requestData.layers[0].GML,
                    headers: {'Content-Type': 'application/xml'}
                }).then(function(fileData){
                        return fileData.data;
                    });
            }
        }
    }]);