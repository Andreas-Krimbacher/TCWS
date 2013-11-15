'use strict';

angular.module('TCWS.editor', ['TCWS.map', 'TCWS.grid','TCWS.tools'])
    .controller('EditorCtrl', ['$scope', 'OpenLayersMap',function ($scope, OpenLayersMap) {

        var smallMapSize = {'width' : '50%', 'height' : '60%'};
        var bigMapSize = {'width' : '100%', 'height' : '100%'};

        $scope.bigMap = false;

        $scope.$on('resizeMap', function (event, bigMap) {
            $scope.bigMap = bigMap;
            if( $scope.bigMap) $('#view-left').css(bigMapSize);
            else $('#view-left').css(smallMapSize);
        });

        $scope.$on('featureSelectedInGrid', function (event, feature) {
            OpenLayersMap.selectFeature(feature.layerId, feature.featureId);
        });
        $scope.$on('featureUnSelectedInGrid', function (event, feature) {
            OpenLayersMap.unSelectFeature(feature.layerId, feature.featureId);
        });

    }])

    .factory('Editor', ['DataStore','InputHandler','OpenLayersMap','Grid','WebService',function (DataStore,InputHandler,OpenLayersMap,Grid,WebService) {
        // Service logic

        var layersInMap = {};
        var layerInGrid = null;

        var _updateLayer = function(id,layerData){
            DataStore.updateLayer(id,layerData);

            var layer = DataStore.getLayer(id);

            if(layersInMap[id]){
                OpenLayersMap.removeLayer(id);
                OpenLayersMap.addLayer(layer);
            }
            if(layerInGrid == id){
                Grid.removeData();
                Grid.showData(layer);
            }
        };

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
            updateLayer : function(id,layerData){
                _updateLayer(id,layerData);
            },
            createUpdateLayer : function(method, methodInfo){
                if(method == 'integrate'){
                    DataStore.integrateLayer(methodInfo.mappingTable,methodInfo.layerId, methodInfo.layerName);
                }

                if(method == 'manipulateTable'){
                    DataStore.manipulateTable(methodInfo.layerId,methodInfo.action,methodInfo.config);

                    var layer = DataStore.getLayer(methodInfo.layerId);

                    if(layersInMap[methodInfo.layerId]){
                        OpenLayersMap.removeLayer(methodInfo.layerId);
                        OpenLayersMap.addLayer(layer);
                    }
                    if(layerInGrid == methodInfo.layerId){
                        Grid.removeData();
                        Grid.showData(layer);
                    }
                }
            },
            addLayerToMap : function(id,zIndex){
                var layer = DataStore.getLayer(id);
                if(layer){
                    OpenLayersMap.addLayer(layer,zIndex);
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

                var fileService = {files: {'1' : {layerId: 1, type: 'polygon', name: 'AUT 0', path: 'Areas/AUT/aut0.xml', fileType: 'GML'},
                    '2' : {layerId: 2, type: 'polygon', name: 'AUT 1', path: 'Areas/AUT/aut1.xml', fileType: 'GML'},
                    '3' : {layerId: 3, type: 'polygon', name: 'AUT 2', path: 'Areas/AUT/aut2.xml', fileType: 'GML'},
                    '4' : {layerId: 4, type: 'polygon', name: 'CH 0', path: 'Areas/CH/ch0.xml', fileType: 'GML'},
                    '5' : {layerId: 5, type: 'polygon', name: 'CH 1', path: 'Areas/CH/ch1.xml', fileType: 'GML'},
                    '6' : {layerId: 6, type: 'polygon', name: 'CH 2', path: 'Areas/CH/ch2.xml', fileType: 'GML'},
                    '8' : {layerId: 8, type: 'attribute', name: 'oecd-canada', path: 'Attribute/oecd-canada.json', fileType: 'JSON-stat', param : paramOECD},
                    '7' : {layerId: 7, type: 'attribute', name: 'us gsp', path: 'Attribute/us-gsp.json', fileType: 'JSON-stat', param : usgsp},
                    '9' : {layerId: 9, type: 'attribute', name: 'Switzerland Pop Kant', path: 'Attribute/swiss_pop_cant_2012.json', fileType: 'JSON-stat', param : swiss},
                    '10' : {layerId: 10, type: 'polygon', name: 'Swiss Districts', path: 'Areas/Swiss/district.xml', fileType: 'GML'},
                    '11' : {layerId: 11, type: 'attribute', name: 'Swiss Pop Dist', path: 'Attribute/swiss_pop_dist_2012.csv', fileType: 'CSV'},
                    '12' : {layerId: 12, type: 'polygon', name: 'Swiss Cantons Polygon', path: 'Areas/Swiss/canton.xml', fileType: 'GML-OGR'},
                    '13' : {layerId: 13, type: 'attribute', name: 'Pop Cantons 2010,2011', path: 'Attribute/pop_swiss_2010_2011.csv', fileType: 'CSV'},
                    '14' : {layerId: 14, type: 'attribute', name: 'Study Cantons 2010,2011', path: 'Attribute/study_swiss_2010_2011.csv', fileType: 'CSV'}}};

                var inputServices = { '1' : {sourceId: 1, name: 'Hosted Data Files', desc: 'Files hosted on the Server. For free!', type : 'file' , param: fileService},
                    '2' : {sourceId: 2, name: 'Wikipedia', desc: 'Wikipedia Data Crawler Service.'},
                    '3' : {sourceId: 3, name: 'WFS OECD', desc: 'Data from OECD.'}};

                return inputServices;
            },
            getProcessingServices : function(){
                var area =
                {
                    methodId : '1',
                    method : 'area',
                    name : 'Calculate Area',
                    methodGroup : 'measure',
                    methodGroupName : 'Measure',
                    requestParam :
                    {
                        methodGroup : 'measure',
                        method : 'area'
                    },
                    resultInfo :
                    {
                        type : 'update'
                    }
                };

                var centroid =
                {
                    methodId : '1',
                    method : 'centroid',
                    name : 'Calculate Centroid',
                    methodGroup : 'analyzeGeometry',
                    methodGroupName : 'Analyze geometry',
                    requestParam :
                    {
                        methodGroup : 'analyzeGeometry',
                        method : 'centroid'
                    },
                    resultInfo :
                    {
                        type : 'new'
                    }
                };

                var sas =
                {
                    serviceType : 'sas',
                    serviceId : '1',
                    name: 'Spatial Analysis Service',
                    url : 'http://localhost:9000/services/SAS',
                    methods :
                    {
                        '1' : area,
                        '2' : centroid
                    }
                };

                var classifyQuantile =
                {
                    methodId : '1',
                    method : 'quantile',
                    name : 'Quantile Classification',
                    methodGroup : 'classify',
                    methodGroupName : 'Classify',
                    requestParam :
                    {
                        methodGroup : 'classify',
                        method : 'quantile',
                        column : null,
                        classCount : null
                    },
                    resultInfo :
                    {
                        type : 'update'
                    }
                };

                var ccs =
                {
                    serviceType : 'ccs',
                    serviceId : '2',
                    name: 'Classify and Cluster Service',
                    url : 'http://localhost:9000/services/CCS',
                    methods :
                    {
                        '1' : classifyQuantile
                    }
                };

                var dotMap =
                {
                    methodId : '1',
                    method : 'dotFromArea',
                    name : 'Dot Map From Area',
                    methodGroup : 'dotMap',
                    methodGroupName : 'Dot Maps',
                    requestParam :
                    {
                        methodGroup : 'dotMap',
                        method : 'dotFromArea',
                        attribute : null,
                        keepAttribute : null,
                        dotValue : null,
                        dotDistance : null
                    },
                    resultInfo :
                    {
                        type : 'new'
                    }
                };

                var cts =
                {
                    serviceType : 'cts',
                    serviceId : '3',
                    name: 'Cartographic Technique Service',
                    url : 'http://localhost:9000/services/CTS',
                    methods :
                    {
                        '1' : dotMap
                    }
                };

                return {'1' : sas, '2': ccs, '3': cts} ;
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
            },
            executeServiceRequest : function(parameters){
                if(parameters.config.requestData.layersId.length != 0 && parameters.config.requestData.layersData.length == 0){
                    var length = parameters.config.requestData.layersId.length;
                    for (var i=0;i<length;i++)
                    {
                        parameters.config.requestData.layersData[i] = DataStore.getLayer(parameters.config.requestData.layersId[i]);
                    }
                }

                var methodInfo = parameters.processingService.methods[parameters.config.methodId];

                for (var prop in methodInfo.requestParam) {
                    if (methodInfo.requestParam.hasOwnProperty(prop)) {

                        if(!parameters.config.requestParam[prop]){
                            parameters.config.requestParam[prop] = methodInfo.requestParam[prop];
                        }

                        if(!parameters.config.requestParam[prop]){
                            console.log('Request Parameter "'+prop+'" not defined!')
                        }

                    }
                }

                for (prop in methodInfo.resultInfo) {
                    if (methodInfo.resultInfo.hasOwnProperty(prop)) {

                        if(!parameters.config.resultInfo[prop]){
                            parameters.config.resultInfo[prop] = methodInfo.resultInfo[prop];
                        }
                    }
                }

                return WebService.executeRequest(parameters).then(function(data){
                    if(parameters.config.resultInfo.type == 'update'){
                        _updateLayer(parameters.config.requestData.layersData[0].id, data);
                    }
                    if(parameters.config.resultInfo.type == 'new'){

                        var layer = data;
                        layer.id = parameters.config.resultInfo.layersId[0];
                        layer.type = parameters.config.resultInfo.layersType[0];
                        layer.name = parameters.config.resultInfo.layersName[0];

                        DataStore.addLayer(layer);
                    }
                });
            },
            applySymbology : function(id,type,symbology){
                if(type == 'polygon') DataStore.applyPolygonSymbology(id,symbology);
                if(type == 'point') DataStore.applyPointSymbology(id,symbology);

                var layerData = DataStore.getLayer(id);
                layerData.olLayer = null;
                if(layersInMap[layerData.id]){
                    OpenLayersMap.removeLayer(layerData.id);
                    OpenLayersMap.addLayer(layerData);
                }

            }
        }
    }])

    .factory('ServiceChain', ['Editor','$q',function (Editor,$q) {
        // Service logic

        var _executeChainElement = function(serviceChainElement){

            var promise = null;

            if(serviceChainElement.type == 'import'){
                promise = Editor.importData(serviceChainElement.config);
            }

            if(serviceChainElement.type == 'integrate'){
                Editor.createUpdateLayer('integrate',serviceChainElement.config);
            }

            if(serviceChainElement.type == 'manipulateTable'){
                Editor.createUpdateLayer('manipulateTable', serviceChainElement.config);
            }

            if(serviceChainElement.type == 'service'){
                promise = Editor.executeServiceRequest(serviceChainElement.config);
            }

            if(serviceChainElement.type == 'symbologyAsync'){
                return serviceChainElement.config.symbology.then(function(symbology){
                    Editor.applySymbology(serviceChainElement.config.layerId, serviceChainElement.config.symbologyType, symbology);
                });
            }

            if(serviceChainElement.type == 'symbologySync'){
                Editor.applySymbology(serviceChainElement.config.layerId, serviceChainElement.config.symbologyType, serviceChainElement.config.symbology);

            }

            if(serviceChainElement.type == 'show'){
                if(serviceChainElement.config.place == 'map') Editor.addLayerToMap(serviceChainElement.config.layerId,serviceChainElement.config.zIndex);
                if(serviceChainElement.config.place == 'grid') Editor.showLayerInGrid(serviceChainElement.config.layerId);
            }

            return promise;
        };

        // Public API here
        return {
            executeServiceChain : function(serviceChain){
                var defer = $q.defer();
                var promise = defer.promise;

                var addPromise = function(serviceChainElement) {
                    promise = promise.then(function () {
                        return _executeChainElement(serviceChainElement);
                    })
                };

                var length = serviceChain.length;
                for (var i=0;i<length;i++)
                {
                    addPromise(serviceChain[i]);
                }

                defer.resolve();
            }
        }
    }]);