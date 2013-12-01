'use strict';

angular.module('TCWS.editor', ['TCWS.map', 'TCWS.grid','TCWS.tools','TCWS.executionChain','TCWS.descriptionService','toaster'])
    .controller('EditorCtrl', ['$scope', 'OpenLayersMap',function ($scope, OpenLayersMap) {
        $scope.bigMap = false;

        $scope.$on('resizeMap', function (event, bigMap) {
            $scope.bigMap = bigMap;
        });

        $scope.$on('featureSelectedInGrid', function (event, feature) {
            OpenLayersMap.selectFeature(feature.layerId, feature.featureId);
        });
        $scope.$on('featureUnSelectedInGrid', function (event, feature) {
            OpenLayersMap.unSelectFeature(feature.layerId, feature.featureId);
        });



    }])

    .factory('Editor', ['$rootScope','DataStore','InputHandler','OpenLayersMap','Grid','WebService','Symbology','ExecutionChain','DescriptionService',function ($rootScope,DataStore,InputHandler,OpenLayersMap,Grid,WebService,Symbology,ExecutionChain,DescriptionService) {
        // Service logic

        var layersInMap = {};
        var layerInGrid = null;

        var _updateLayer = function(id,layerData){
            if(layerData) DataStore.updateLayer(id,layerData);

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
                $rootScope.$broadcast('updateLayerList');
            },
            updateLayer : function(id,layerData){
                _updateLayer(id,layerData);

            },
            createUpdateLayer : function(method, methodInfo){
                if(method == 'integrate'){
                    DataStore.integrateLayer(methodInfo.mappingTable,methodInfo.layerId, methodInfo.layerName);
                    DataStore.addExecutionChainObjectToLayer(methodInfo.layerId,ExecutionChain.getExecutionChainObjectFromConfig('integrate', methodInfo));
                }

                if(method == 'manipulateTable'){
                    DataStore.manipulateTable(methodInfo.layerId,methodInfo.action,methodInfo.config);
                    DataStore.addExecutionChainObjectToLayer(methodInfo.layerId,ExecutionChain.getExecutionChainObjectFromConfig('manipulate', methodInfo));

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
            addLayerToMap : function(id){
                var layer = DataStore.getLayer(id);
                if(layer){
                    OpenLayersMap.addLayer(layer);
                    layersInMap[id] = true;
                    $rootScope.$broadcast('updateLayerList');
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
                    $rootScope.$broadcast('updateLayerList');
                    return true;
                }
                else{
                    return false;
                }
            },
            updateLayerStackIndexFromArray : function(layerArray){
                DataStore.updateLayerStackIndexFromArray(layerArray);
                OpenLayersMap.updateLayerStackFromArray(layerArray);
                $rootScope.$broadcast('updateLayerList');
            },
            showLayerInGrid : function(id){
                var layer = DataStore.getLayer(id);
                if(layer){
                    Grid.showData(layer);
                    layerInGrid = id;
                    $rootScope.$broadcast('updateLayerList');
                    return true;
                }
                else{
                    return false;
                }
            },
            getInputServices : function(){
               return DescriptionService.getInputServices();

            },
            getProcessingServices : function(){
                return DescriptionService.getProcessingServices();
            },
            importData : function(param){

                if(param.inputService.type == 'local'){

                    var id = param.inputService.sourceId + '-' + param.config.layer;
                    if(param.layerId) id = param.layerId;

                    var layerInfo = param.inputService.param.files[param.config.layer];

                    if(!DataStore.getLayer(id)){
                        return InputHandler.getDataFromFile(layerInfo,param.inputService,id).then(function(layerData){

                            param.layerId = layerData.id;
                            layerData.executionChain = [ExecutionChain.getExecutionChainObjectFromConfig('import', param)];

                            DataStore.addLayer(layerData);
                            $rootScope.$broadcast('updateLayerList');
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

                if(parameters.processingService.methods){
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
                }

                return WebService.executeRequest(parameters).then(function(data){
                    if(parameters.config.resultInfo.type == 'update'){
                        _updateLayer(parameters.config.requestData.layersData[0].id, data);
                        DataStore.addExecutionChainObjectToLayer(parameters.config.requestData.layersData[0].id,ExecutionChain.getExecutionChainObjectFromConfig('service', parameters));
                    }
                    if(parameters.config.resultInfo.type == 'new'){

                        var layer = data;
                        layer.id = parameters.config.resultInfo.layersId[0];
                        layer.type = parameters.config.resultInfo.layersType[0];
                        layer.name = parameters.config.resultInfo.layersName[0];

                        layer.executionChain = [ExecutionChain.getExecutionChainObjectFromConfig('service', parameters)];

                        DataStore.addLayer(layer);
                    }

                    $rootScope.$broadcast('updateLayerList');


                });
            },
            applySymbology : function(layerId,symbology,type,repositoryInfo){

                var parameters = {
                    symbologyRepository : repositoryInfo.symbologyRepositories,
                    config : {
                        layerId : layerId,
                        type : type,
                        groupId :repositoryInfo.groupId,
                        symbologyId: repositoryInfo.symbologyId,
                        columns : repositoryInfo.columns
                    }
                };

                if(type == 'polygon'){
                        DataStore.applyPolygonSymbology(layerId,symbology);
                        DataStore.addExecutionChainObjectToLayer(layerId,ExecutionChain.getExecutionChainObjectFromConfig('symbology', parameters));
                        _updateLayer(layerId);
                }

                if(type == 'point'){
                        DataStore.applyPointSymbology(layerId,symbology);
                        DataStore.addExecutionChainObjectToLayer(layerId,ExecutionChain.getExecutionChainObjectFromConfig('symbology', parameters));
                        _updateLayer(layerId);
                }

            },
            getAndApplySymbology : function(parameters){

                if(parameters.config.type == 'polygon'){
                    return Symbology.getPolygonSymbology(parameters.symbologyRepository,parameters.config).then(function(symbology){

                        DataStore.applyPolygonSymbology(parameters.config.layerId,symbology);
                        DataStore.addExecutionChainObjectToLayer(parameters.config.layerId,ExecutionChain.getExecutionChainObjectFromConfig('symbology', parameters));

                        _updateLayer(parameters.config.layerId);
                    });
                }

                if(parameters.config.type == 'point'){
                    return Symbology.getPointSymbology(parameters.symbologyRepository,parameters.config).then(function(symbology){

                        DataStore.applyPointSymbology(parameters.config.layerId,symbology);
                        DataStore.addExecutionChainObjectToLayer(parameters.config.layerId,ExecutionChain.getExecutionChainObjectFromConfig('symbology', parameters));

                        _updateLayer(parameters.config.layerId);
                    });
                }

            }
        }
    }])

    .factory('ServiceChain', ['$q','Editor','OpenLayersMap',function ($q,Editor,OpenLayersMap) {
        // Service logic

        var _executeChainElement = function(serviceChainElement,toaster){

            if(serviceChainElement.desc && toaster) toaster.pop('success', "", serviceChainElement.desc ,0);

            var promise = null;

            if(serviceChainElement.type == 'import'){
                promise = Editor.importData(serviceChainElement.config);
            }

            if(serviceChainElement.type == 'integrate'){
                Editor.createUpdateLayer('integrate',serviceChainElement.config);
            }

            if(serviceChainElement.type == 'manipulateTable' || serviceChainElement.type == 'manipulate'){
                Editor.createUpdateLayer('manipulateTable', serviceChainElement.config);
            }

            if(serviceChainElement.type == 'service'){
                promise = Editor.executeServiceRequest(serviceChainElement.config);
            }

            if(serviceChainElement.type == 'symbology'){
                promise = Editor.getAndApplySymbology(serviceChainElement.config);
            }

            if(serviceChainElement.type == 'show'){
                if(serviceChainElement.config.place == 'map'){
                    if(serviceChainElement.config.type == 'base') OpenLayersMap.setBaseMap(serviceChainElement.config.layerId);
                    else Editor.addLayerToMap(serviceChainElement.config.layerId);

                }
                if(serviceChainElement.config.place == 'grid') Editor.showLayerInGrid(serviceChainElement.config.layerId);
            }

            return promise;
        };

        // Public API here
        return {
            executeServiceChain : function(serviceChain,toaster){
                var defer = $q.defer();
                var promise = defer.promise;

                var addPromise = function(serviceChainElement,toaster) {
                    promise = promise.then(function () {
                        return _executeChainElement(serviceChainElement,toaster);
                    });
                };

                var length = serviceChain.length;
                for (var i=0;i<length;i++)
                {
                    addPromise(serviceChain[i],toaster);
                }

                defer.resolve();

                return promise;
            }
        }
    }]);