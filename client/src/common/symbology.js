'use strict';

angular.module('TCWS.symbology', [])

    .factory('Symbology', function () {
        // Service logic

        var colorScheme = {
            '1' : {'polygon-fill' : '#7FC97F'},
            '2' :{'polygon-fill' : '#BEAED4'},
            '3' :{'polygon-fill' : '#FDC086'},
            '4' :{'polygon-fill' : '#FFFF99'},
            '5' :{'polygon-fill' : '#386CB0'}
        };

        var polygonGroupSymbology = {
            '1':{
                groupId : 1,
                groupName : 'Beautiful',
                groupStyle : {
                    'polygon-fill' : '#ffffff',
                    'polygon-opacity' : 1,
                    'line-color' : '#5cb85c',
                    'line-width' : 1
                },
                symbologys : {
                    '1' : {
                        symbologyId : 1,
                        name : 'Qualitative',
                        style : {},
                        variableSymbology : [
                            {
                                columnType : 'nominal',
                                column : null,
                                styles : colorScheme,
                                values : {},
                                styleType : 'list',
                                maxValues : 5,
                                minValues : 2
                            }
                        ]
                    }
                }
            }
        };

        // Public API here
        return {
            getPolygonGroupSymbology : function(){

                return angular.copy(polygonGroupSymbology);

            },
            getPolygonSymbology : function(groupId,symbologyId,colums){

                var symbology = angular.copy(polygonGroupSymbology[groupId].symbologys[symbologyId]);

                for (var prop in polygonGroupSymbology[groupId].groupStyle) {
                    if (polygonGroupSymbology[groupId].groupStyle.hasOwnProperty(prop)) {

                        if(!symbology.style[prop]){
                            symbology.style[prop] = polygonGroupSymbology[groupId].groupStyle[prop];
                        }

                    }
                }

                var length = symbology.variableSymbology.length;
                for (var i=0;i<length;i++)
                {
                    symbology.variableSymbology[i].column = colums[i];
                }

                return symbology;
            }
        }
    });