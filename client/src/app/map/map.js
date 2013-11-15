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

        $scope.bigMap = false;

        $scope.resizeMap = function(bigMap){
            $scope.$emit('resizeMap', bigMap);
            $scope.bigMap = bigMap;
            OpenLayersMap.updateSize();
        };
    }])

    .factory('OpenLayersMap', ['SymbologyFactory',function (SymbologyFactory) {
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

            basemaps.OSM = { layer :new ol.layer.Tile({
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
            updateSize : function(){
                map.updateSize();
            },
            createMap : function (divId) {
                createBaseMaps();

                map = new ol.Map({
                    target: divId,
                    layers: [],
                    view: new ol.View2D({
                        center: ol.proj.transform([8.486863,47.381258], 'EPSG:4326', 'EPSG:3857'),
                        zoom: 8
                    })
                });

                //map.addLayer(basemaps.esriTopo.layer);
                //currentBasemap = basemaps.esriTopo;
            },
            getBaseMaps : function(){
                var result = [];
                for (var prop in basemaps) {
                    if (basemaps.hasOwnProperty(prop)) {
                        result.push({id : prop,
                            name: basemaps[prop].name})
                        if(currentBasemap && result[result.length-1].id == currentBasemap.id) result[result.length-1].inMap = true;
                    }
                }
                return result;
            },
            setBaseMap : function(id){
                if(currentBasemap) map.removeLayer(currentBasemap.layer);
                map.getLayers().insertAt(0,basemaps[id].layer);
                currentBasemap = basemaps[id];
            },
            removeBaseMap : function(id){
                if(currentBasemap.id == id){
                    map.removeLayer(currentBasemap.layer);
                    currentBasemap = null;
                }
            },
            setCenter: function(Lon,Lat,Zoom){
                map.setView(
                    new ol.View2D({
                        center: ol.proj.transform([Lon, Lat], 'EPSG:4326', 'EPSG:3857'),
                        zoom: Zoom
                    })
                );
            },
            addLayer : function(layerData,zIndex){

                if(!layerData.olLayer){

                    var style;
                    if(!layerData.symbology){
                        style = SymbologyFactory.getDefaultStyle(layerData.type);
                    }
                    else{
                        style = SymbologyFactory.getLayerStyle(layerData.type,layerData.symbology,layerData.gmlData.features);
                    }


                    var layer = new ol.layer.Vector({
                        source: new ol.source.Vector({}),
                        style: style
                    });


                    var transform = ol.proj.getTransform(layerData.epsg, "EPSG:3857");
                    for(var i = 0, ii = layerData.gmlData.features.length;i < ii;++i) {
                        layerData.gmlData.features[i].values_[layerData.gmlData.features[i].geometryName_].transform(transform)
                    }
                    layerData.epsg = "EPSG:3857";
                    layerData.gmlData.metadata.projection = "EPSG:3857";

                    layer.addFeatures(layerData.gmlData.features);

                    layerData.olLayer = layer;
                }


                if(zIndex) map.getLayers().insertAt(zIndex,layerData.olLayer);
                else map.addLayer(layerData.olLayer);

                layers[layerData.id] = layerData.olLayer;
            },
            removeLayer : function(id){
                map.removeLayer(layers[id]);
                delete layers[id];
            },
            selectFeature : function(layerId, featureId){

                if(!layers[layerId]) return;

                var features = layers[layerId].featureCache_.idLookup_;
                for (var prop in features) {
                    if (features.hasOwnProperty(prop)) {
                        if(features[prop].getId() == featureId){
                            layers[layerId].setRenderIntent('selected',[features[prop]]);
                            break;
                        }
                    }
                }
            },
            unSelectFeature : function(layerId, featureId){

                if(!layers[layerId]) return;

                var features = layers[layerId].featureCache_.idLookup_;
                for (var prop in features) {
                    if (features.hasOwnProperty(prop)) {
                        if(features[prop].getId() == featureId){
                            layers[layerId].setRenderIntent('default',[features[prop]]);
                            break;
                        }
                    }
                }
            }
        }
    }])

    .factory('SymbologyFactory', function () {
        // Service logic

        var _selectRule =
            new ol.style.Rule({
                filter: 'renderIntent("selected")',
                symbolizers: [
                    new ol.style.Fill({
                        color: '#9E320E',
                        opacity: 0.6
                    })
                ]
            });



        var _CartoCssToOLStyle = function(style,overallStyle){

            if(overallStyle){
                for (var prop in overallStyle) {
                    if (overallStyle.hasOwnProperty(prop)) {
                        if(!style[prop]) style[prop] = overallStyle[prop];
                    }
                }
            }


            var styles = {Fill:null,Stroke:null};

            for (var prop in style) {
                if (style.hasOwnProperty(prop)) {
                    if(prop == 'line-color'){
                        if(!styles.Stroke){
                            styles.Stroke = new ol.style.Stroke();
                        }

                        styles.Stroke.setColor( new ol.expr.Literal(style[prop]) );
                    }

                    if(prop == 'line-width'){
                        if(!styles.Stroke){
                            styles.Stroke = new ol.style.Stroke();
                        }

                        styles.Stroke.setWidth( new ol.expr.Literal(style[prop]) );
                    }

                    if(prop == 'line-opacity'){
                        if(!styles.Stroke){
                            styles.Stroke = new ol.style.Stroke();
                        }

                        styles.Stroke.setOpacity( new ol.expr.Literal(1 - style[prop]) );
                    }

                    if(prop == 'polygon-fill'){
                        if(!styles.Fill){
                            styles.Fill = new ol.style.Fill();
                        }

                        styles.Fill.setColor( new ol.expr.Literal(style[prop]) );
                    }

                    if(prop == 'polygon-opacity'){
                        if(!styles.Fill){
                            styles.Fill = new ol.style.Fill();
                        }

                        styles.Fill.setOpacity( new ol.expr.Literal(1 - style[prop]) );
                    }

                    if(prop == 'marker-type'){
                        if(!styles.Shape){
                            styles.Shape = new ol.style.Shape({fill: new ol.style.Fill()})
                        }

                        //hack: ellipse not supported only circle
                        if(style[prop] == 'ellipse') var shapeType = ol.style.ShapeType.CIRCLE;

                        styles.Shape.setType( shapeType );
                    }

                    if(prop == 'marker-fill'){
                        if(!styles.Shape){
                            styles.Shape = new ol.style.Shape({fill: new ol.style.Fill()})
                        }

                        var fill = styles.Shape.getFill();
                        fill.setColor( new ol.expr.Literal(style[prop]) );

                        styles.Shape.setFill( fill );
                    }

                    if(prop == 'marker-fill-opacity'){
                        if(!styles.Shape){
                            styles.Shape = new ol.style.Shape({fill: new ol.style.Fill()})
                        }

                        var fill = styles.Shape.getFill();
                        fill.setOpacity( new ol.expr.Literal(1 - style[prop]) );

                        styles.Shape.setFill( fill );
                    }

                    if(prop == 'marker-width'){
                        if(!styles.Shape){
                            styles.Shape = new ol.style.Shape({fill: new ol.style.Fill()})
                        }

                        styles.Shape.setSize( new ol.expr.Literal(style[prop]) );
                    }
                }
            }

            var styleArray = [];
            for (var prop in styles) {
                if (styles[prop] && styles.hasOwnProperty(prop)) {
                    styleArray.push(styles[prop]);
                }
            }

            return styleArray;
        };

        // Public API here
        return {
            getLayerStyle : function(type,symbology,features){

                if(type == 'polygon'){
                    var overallStyle = _CartoCssToOLStyle(symbology.style);

                    var rules = [_selectRule];
                    var rule,symbolizer;

                    var length1 = symbology.variableSymbology.length;
                    for (var i=0;i<length1;i++)
                    {
                        if(symbology.variableSymbology[i].styleType == 'list'){

                            for (var prop in symbology.variableSymbology[i].values) {
                                if (symbology.variableSymbology[i].values.hasOwnProperty(prop)) {

                                    symbolizer = _CartoCssToOLStyle(symbology.variableSymbology[i].styles[prop],symbology.style);

                                    rule = new ol.style.Rule({
                                        filter: symbology.variableSymbology[i].column + ' == "'+symbology.variableSymbology[i].values[prop]+'"',
                                        symbolizers: symbolizer
                                    });

                                    rules.push(rule)
                                }
                            }
                        }
                    }

                    var layerStyle = new ol.style.Style(
                        {
                            rules: rules,
                            symbolizers: overallStyle
                        }
                    );
                }

                if(type == 'point'){

                    var rules = [_selectRule];
                    var rule,symbolizer;

                    if(symbology.styleType == 'diaML'){
                        var length = features.length;
                        for (var i=0;i<length;i++)
                        {

                            symbolizer = new ol.style.Icon({
                                url: features[i].values_.diaML.img
                            });

                            //features[i].values_.diaMLID = features[i].values_.diaML.id;

                            rule = new ol.style.Rule({
                                filter:  'diaML.id == "'+features[i].values_.diaML.id+'"',
                                symbolizers: [symbolizer]
                            });

                            rules.push(rule)

                        }

                        var layerStyle = new ol.style.Style({
                            rules: rules,
                            symbolizers: []
                        });

                    }

                    if(symbology.styleType == 'cartoCss'){
                        var overallStyle = _CartoCssToOLStyle(symbology.style);

                        //to do: variableSymbology implementation

                        var layerStyle = new ol.style.Style({
                            rules: rules,
                            symbolizers: overallStyle
                        });
                    }

                }


                return layerStyle;
            },
            getDefaultStyle : function(type){
                if(type == 'polygon'){
                    var style = new ol.style.Style({
                        rules: [_selectRule],
                        symbolizers: [
                            new ol.style.Fill({
                                opacity: 0
                            }),
                            new ol.style.Stroke({
                                color: '#6666ff'
                            })
                        ]
                    });
                }
                return style;
            }
        }
    });