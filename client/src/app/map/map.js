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
        var layers = {};

        var basemaps = {};
        var currentBasemap = null;

        var createBaseMaps = function(){
            basemaps.mapQuestOSM = { layer : new ol.layer.Tile({
                source: new ol.source.MapQuestOSM()
            }),
                name : 'Map Quest OSM',
                id : 'mapQuestOSM'
            };

            basemaps.mapQuestOpenArial = { layer : new ol.layer.Tile({
                source: new ol.source.MapQuestOpenAerial()
            }),
                name : 'Map Quest Open Arial',
                id : 'mapQuestOpenArial'
            };

            basemaps.osm = { layer :new ol.layer.Tile({
                source: new ol.source.OSM()
            }),
                name : 'OSM',
                id : 'OSM'
            };

            basemaps.mapBoxThema = { layer : new ol.layer.Tile({
                source: new ol.source.TileJSON({
                    url: 'http://api.tiles.mapbox.com/v3/mapbox.geography-class.jsonp',
                    crossOrigin: 'anonymous'
                })
            }),
                name : 'Map Box Thematic',
                id : 'mapBoxThema'
            };

            var attribution = new ol.Attribution({
                html: 'Tiles &copy; <a href="http://services.arcgisonline.com/ArcGIS/' +
                    'rest/services/World_Topo_Map/MapServer">ArcGIS</a>'
            });

            basemaps.esriTopo = { layer : new ol.layer.Tile({
                source: new ol.source.XYZ({
                    attributions: [attribution],
                    url: 'http://server.arcgisonline.com/ArcGIS/rest/services/' +
                        'World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
                })
            }),
                name : 'Esri Topo',
                id : 'esriTopo'
            };
        };


        // Public API here
        return {
            getMap : function(){
                return map;
            },
            createMap : function (divId) {
                createBaseMaps();

                map = new ol.Map({
                    target: divId,
                    layers: [],
                    view: new ol.View2D({
                        center: ol.proj.transform([8.486863,47.381258], 'EPSG:4326', 'EPSG:3857'),
                        zoom: 4
                    })
                });

                //map.addLayer(basemaps.esriTopo.layer);
                currentBasemap = basemaps.esriTopo;
            },
            getBaseMaps : function(){
                var result = [];
                for (var prop in basemaps) {
                    if (basemaps.hasOwnProperty(prop)) {
                        result.push({id : prop,
                            name: basemaps[prop].name})
                        if(result[result.length-1].id == currentBasemap.id) result[result.length-1].inMap = true;
                    }
                }
                return result;
            },
            setBaseMap : function(id){
                if(currentBasemap) map.removeLayer(currentBasemap.layer);
                map.addLayer(basemaps[id].layer);
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
                for(var i = 0, ii = layerData.gmlData.features.length;i < ii;++i) {
                    layerData.gmlData.features[i].values_[layerData.gmlData.features[i].geometryName_].transform(transform)
                }
                layerData.epsg = "EPSG:3857";
                layerData.gmlData.metadata.projection = "EPSG:3857";

                layer.addFeatures(layerData.gmlData.features);

                layers[layerData.id] = layer;
            },
            removeLayer : function(id){
                map.removeLayer(layers[id]);
            }
        }
    });