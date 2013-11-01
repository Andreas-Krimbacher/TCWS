'use strict';

angular.module('TCWS.map', [])

    .directive('tcwsMap', function () {
        return {
            templateUrl: '/app/map/map.tpl.html',
            restrict: 'E',
            controller: 'MapCtrl',
            link: function postLink(scope, element, attrs) {


            }
        };
    })


    .controller('MapCtrl', ['$scope','OpenLayersMap',function ($scope,OpenLayersMap) {
        OpenLayersMap.createMap('map');
        //OpenLayersMap.setCenter(8.486863,47.381258,18);

        $scope.layers = [];


        $scope.addLayer = function(layer){
            $scope.layers.push(layer);
        };
    }])

    .factory('OpenLayersMap', function () {
        // Service logic
        var map = null;
        var layers = [];


        // Public API here
        return {
            getMap : function(){
                return map;
            },
            createMap : function (divId) {
                map = new ol.Map({
                    target: divId,
                    layers: [
                        new ol.layer.Tile({
                            source: new ol.source.MapQuestOpenAerial()
                        })
                    ],
                    view: new ol.View2D({
                        center: ol.proj.transform([37.41, 8.82], 'EPSG:4326', 'EPSG:3857'),
                        zoom: 4
                    })
                });

            },
            setCenter: function(Lon,Lat,Zoom){
                map.setView(
                    new ol.View2D({
                        center: ol.proj.transform([Lon, Lat], 'EPSG:4326', 'EPSG:3857'),
                        zoom: Zoom
                    })
                );
            },
            addLayer : function(layer){
                layers.push(layer);
            },
            getLayers : function(){
                return layers;
            }
        }
    });