'use strict';

angular.module('TCWS.executionChain', [])

    .factory('ExecutionChain', ['$q','DataStore',function ($q,DataStore) {
        // Service logic

        var _nextChainElementId = 1;
        // Public API here
        return {
            getNextExecutionChainElementId : function(){
                return _nextChainElementId++;
            },
            getExecutionChainObject : function(type,config){

                var chainObject = {
                    id : _nextChainElementId++,
                    type : type,
                    config : {}
                };

                if(type == 'import'){
                    chainObject.config.inputService ={
                        desc: config.inputService.desc,
                        name: config.inputService.name,
                        type: config.inputService.type
                    };
                    chainObject.config.config = config.inputService.param.files[config.config.layer];

                }
                if(type == 'integrate'){
                    chainObject.config = config;
                    var layers = [];
                    for (var prop in config.mappingTable.layers) {
                        if (config.mappingTable.layers.hasOwnProperty(prop)) {
                            layers.push(config.mappingTable.layers[prop]);
                        }
                    }
                    chainObject.config.mappingTable.layers = layers;
                }
                if(type == 'manipulate'){
                    chainObject.config = config;
                }
                if(type == 'service'){
                    chainObject.config.processingService ={
                        desc: config.processingService.desc,
                        name: config.processingService.name,
                        serviceType: config.processingService.serviceType,
                        url: config.processingService.url
                    };

                    chainObject.config.config = config.config;

                    chainObject.config.config.method = config.processingService.methods[config.config.methodId].method;
                    chainObject.config.config.methodName = config.processingService.methods[config.config.methodId].methodName;
                    chainObject.config.config.methodGroup = config.processingService.methods[config.config.methodId].methodGroup;
                    chainObject.config.config.methodGroupName = config.processingService.methods[config.config.methodId].methodGroupName;
                }
                if(type == 'symbology'){
                    chainObject.config.symbologyRepository ={
                        desc: config.symbologyRepository.desc,
                        name: config.symbologyRepository.name,
                        type: config.symbologyRepository.type
                    };

                    chainObject.config.config = config.config;

                    chainObject.config.config.fileType = config.symbologyRepository.param[config.config.type+'Symbologys'][config.config.groupId].fileType;
                    chainObject.config.config.groupName = config.symbologyRepository.param[config.config.type+'Symbologys'][config.config.groupId].groupName;
                    chainObject.config.config.path = config.symbologyRepository.param[config.config.type+'Symbologys'][config.config.groupId].path;
                    chainObject.config.config.method = config.symbologyRepository.param[config.config.type+'Symbologys'][config.config.groupId].fileType;
                }


                return chainObject;
            },
            getExecutionChainRecursive : function(layerId){
                var executionChain = [];

                var layerData = DataStore.getLayer(layerId);
                var length = layerData.executionChain.length;
                for (var i=0;i<length;i++)
                {
                    executionChain.push(layerData.executionChain[i]);
                }


                var getPredecessorChain = function(executionChain){
                    var predecessor = [];
                    var layerDataPredecessor;

                    if(executionChain[0].type == 'integrate'){
                        var length = executionChain[0].config.mappingTable.layers.length;
                        for (i=0;i<length;i++)
                        {
                            predecessor.push(executionChain[0].config.mappingTable.layers[i].layerId);
                        }
                    }
                    if(executionChain[0].type == 'service' && executionChain[0].config.config.resultInfo.type == 'new'){
                        predecessor = executionChain[0].config.config.requestData.layersId;
                    }

                    var length1 = predecessor.length;
                    for (var i=0;i<length1;i++)
                    {
                        layerDataPredecessor = DataStore.getLayer(predecessor[i]);
                        var length2 = layerDataPredecessor.executionChain.length;
                        for (var k=length2;k--; )
                        {
                            executionChain.splice(0,0,layerDataPredecessor.executionChain[k]);
                        }

                        getPredecessorChain(executionChain);
                    }
                };

                getPredecessorChain(executionChain);

                return executionChain;
            },
            executionChainToXML  : function(executionChain){
                var parser = new X2JS();
                return parser.json2xml_str({executionChain : {executionChangeElement : executionChain}});
            }
        }
    }]);