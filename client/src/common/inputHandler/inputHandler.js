'use strict';

angular.module('TCWS.inputHandler', [])

    .factory('InputHandler', ['$http',function ($http) {
        // Service logic

        var getFileData = function(sourceFile){
            return $http({method: 'GET', url: sourceFile}).then(function(result){
                return result.data;
            });
        };

        var parseFileData = function(fileData){
            var parser =  new ol.parser.ogc.GML_v2({readOptions:{axisOrientation: 'en'}});
            return parser.readFeaturesFromString(fileData);
        };

        // Public API here
        return {
            getDataFromFile : function(sourceFile){
                return getFileData(sourceFile).then(function(fileData){
                    return parseFileData(fileData);
                });
            }
        }
    }]);