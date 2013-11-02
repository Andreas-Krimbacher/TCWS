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
                        })],
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
            addLayer : function(layerData){

                var layer = new ol.layer.Vector({
                    source: new ol.source.Vector({}),
                    style: new ol.style.Style({
                        symbolizers: [
                            new ol.style.Fill({
                                color: '#ffffff',
                                opacity: 0.25
                            }),
                            new ol.style.Stroke({
                                color: '#6666ff'
                            })
                        ]
                    })
                });

                map.addLayer(layer);
                var transform = ol.proj.getTransform(layerData.epsg, "EPSG:3857");
                var geometry = null;
                for(var i = 0, ii = layerData.gmlData.features.length;i < ii;++i) {
                    geometry = layerData.gmlData.features[i].getGeometry();
                    geometry.transform(transform)
                }
                layer.addFeatures(layerData.gmlData.features);

                layers.push(layer);
            },
            getLayers : function(){
                return layers;
            }
        }
    });