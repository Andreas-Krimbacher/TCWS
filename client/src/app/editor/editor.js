'use strict';

angular.module('TCWS.editor', ['TCWS.map', 'TCWS.grid','TCWS.tools'])
    .controller('EditorCtrl', ['$scope', 'OpenLayersMap',function ($scope, OpenLayersMap) {


    }])

    .factory('Editor', ['DataStore','InputHandler','OpenLayersMap','Grid',function (DataStore,InputHandler,OpenLayersMap,Grid) {
        // Service logic

        var layersInMap = {};
        var layerInGrid = null;


        // Public API here
        return {
            getLayerListShort : function(){
                var list = DataStore.getLayerListShort();

                var length = list.length;
                for (var i=0;i<length;i++)
                {
                    if(layersInMap[list[i].id]) list[i].inMap = true;
                    if(layerInGrid == list[i].id) list[i].inGrid = true;
                }

                return list;
            },
            removeLayer : function(id){
                if(layersInMap[id]) OpenLayersMap.removeLayer(id);
                if(layerInGrid == id) Grid.removeData();
                DataStore.removeLayer(id);
            },
            updateLayer : function(id,data){
                DataStore.updateLayer(id,data);

                var layer = DataStore.getLayer(id);

                if(layersInMap[id]){
                    OpenLayersMap.removeLayer(id);
                    OpenLayersMap.addLayer(layer);
                }
                if(layerInGrid == id){
                    Grid.removeData();
                    Grid.showData(layer);
                }
            },
            addLayerToMap : function(id){
                var layer = DataStore.getLayer(id);
                if(layer){
                    OpenLayersMap.addLayer(layer);
                    layersInMap[id] = true;
                    return true;
                }
                else{
                    return false;
                }
            },
            removeLayerFromMap : function(id){
                var layer = DataStore.getLayer(id);
                if(layer){
                    OpenLayersMap.removeLayer(layer.id);
                    layersInMap[id] = false;
                    return true;
                }
                else{
                    return false;
                }
            },
            showLayerInGrid : function(id){
                var layer = DataStore.getLayer(id);
                if(layer){
                    Grid.showData(layer);
                    layerInGrid = id;
                    return true;
                }
                else{
                    return false;
                }
            },
            getInputServices : function(){
                //Hardcoded Input Services

                var paramOECD = {dimensionConfig :
                {
                    "country" : 0,
                    "year" : 0,
                    "age" : 'v',
                    "concept" : 0,
                    "sex" : 'h'
                },
                    datasetNumber : 1
                };

                var usgsp = {dimensionConfig :
                {
                    "year" : 0,
                    "state" : 'v',
                    "concept" : 'h'
                },
                    datasetNumber : 0
                };

                var swiss = {dimensionConfig :
                {
                    "year" : 0,
                    "area" : 'v',
                    "concept" : 'h'
                },
                    datasetNumber : 0
                };

                var fileService = {files: {'1' : {layerId: 1, type: 'area', name: 'AUT 0', path: 'Areas/AUT/aut0.xml', fileType: 'GML'},
                    '2' : {layerId: 2, type: 'area', name: 'AUT 1', path: 'Areas/AUT/aut1.xml', fileType: 'GML'},
                    '3' : {layerId: 3, type: 'area', name: 'AUT 2', path: 'Areas/AUT/aut2.xml', fileType: 'GML'},
                    '4' : {layerId: 4, type: 'area', name: 'CH 0', path: 'Areas/CH/ch0.xml', fileType: 'GML'},
                    '5' : {layerId: 5, type: 'area', name: 'CH 1', path: 'Areas/CH/ch1.xml', fileType: 'GML'},
                    '6' : {layerId: 6, type: 'area', name: 'CH 2', path: 'Areas/CH/ch2.xml', fileType: 'GML'},
                    '8' : {layerId: 8, type: 'attribute', name: 'oecd-canada', path: 'Attribute/oecd-canada.json', fileType: 'JSON-stat', param : paramOECD},
                    '7' : {layerId: 7, type: 'attribute', name: 'us gsp', path: 'Attribute/us-gsp.json', fileType: 'JSON-stat', param : usgsp},
                    '9' : {layerId: 9, type: 'attribute', name: 'Switzerland Pop Kant', path: 'Attribute/swiss_pop_cant_2012.json', fileType: 'JSON-stat', param : swiss},
                    '10' : {layerId: 10, type: 'area', name: 'Swiss Districts', path: 'Areas/Swiss/district.xml', fileType: 'GML'},
                    '11' : {layerId: 11, type: 'attribute', name: 'Swiss Pop Dist', path: 'Attribute/swiss_pop_dist_2012.csv', fileType: 'CSV'}}};

                var inputServices = { '1' : {sourceId: 1, name: 'Hosted Data Files', desc: 'Files hosted on the Server. For free!', type : 'file' , param: fileService},
                    '2' : {sourceId: 2, name: 'Wikipedia', desc: 'Wikipedia Data Crawler Service.'},
                    '3' : {sourceId: 3, name: 'WFS OECD', desc: 'Data from OECD.'}};

                return inputServices;
            },
            importData : function(param){

                if(param.inputService.type == 'file'){

                    var id = param.inputService.sourceId + '-' + param.config.layer;

                    var layerInfo = param.inputService.param.files[param.config.layer];

                    if(!DataStore.getLayer(id)){
                        return InputHandler.getDataFromFile(layerInfo,param.inputService).then(function(layerData){

                            DataStore.addLayer(layerData);
                        });
                    }
                    else{
                        return false;
                    }
                }
            }
        }
    }]);

