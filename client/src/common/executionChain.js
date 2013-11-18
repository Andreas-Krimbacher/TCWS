'use strict';

angular.module('TCWS.executionChain', ['TCWS.dataStore','TCWS.descriptionService'])

    .factory('ExecutionChain', ['$q','DataStore','DescriptionService',function ($q,DataStore,DescriptionService) {
        // Service logic

        var _nextChainElementId = 1;
        // Public API here
        return {
            getNextExecutionChainElementId : function(){
                return _nextChainElementId++;
            },
            getExecutionChainObjectFromConfig : function(type,config){

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
                    chainObject.config.layerId = config.layerId;

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
                        type: config.processingService.type,
                        url: config.processingService.url
                    };

                    chainObject.config.config = config.config;

                    chainObject.config.config.requestData.layersData = [];

                    if(config.processingService.methods){
                        chainObject.config.config.method = config.processingService.methods[config.config.methodId].method;
                        chainObject.config.config.methodName = config.processingService.methods[config.config.methodId].methodName;
                        chainObject.config.config.methodGroup = config.processingService.methods[config.config.methodId].methodGroup;
                        chainObject.config.config.methodGroupName = config.processingService.methods[config.config.methodId].methodGroupName;
                    }
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
            getConfigFromExecutionChainObject : function(chainObject){

                var configObject = {
                    id : _nextChainElementId++,
                    type : chainObject.type,
                    config : {}
                };

                var type = chainObject.type;

                if(type == 'import'){
                    var inputServices = DescriptionService.getInputServices();

                    configObject.config.inputService = inputServices['local'];

                    configObject.config.config = {};
                    configObject.config.config.layer = chainObject.config.config.layerId;
                    configObject.config.layerId = chainObject.config.layerId;

                    configObject.desc = 'Import Layer -' + chainObject.config.config.name + '- as ' + chainObject.config.layerId;
                }
                if(type == 'integrate'){
                    configObject.config = chainObject.config;

                    var ids = [];
                    var layers = {};
                    var length = chainObject.config.mappingTable.layers.length;
                    for (var i=0;i<length;i++)
                    {
                        layers[chainObject.config.mappingTable.layers[i].layerId] = chainObject.config.mappingTable.layers[i];
                        ids.push(chainObject.config.mappingTable.layers[i].layerId);
                    }

                    configObject.config.mappingTable.layers = layers;

                    configObject.desc = 'Integrate Layer '+ids[0]+' and '+ids[1]+' to -' + chainObject.config.layerName + '- as ' + chainObject.config.layerId;
                }
                if(type == 'manipulate'){
                    configObject.config = chainObject.config;

                    configObject.desc = 'Manipulate Layer ' + chainObject.config.layerId;
                }
                if(type == 'service'){
                    configObject.config = chainObject.config;
                    configObject.config.config.requestData.layersData = [];
                    configObject.config.config.requestData.layersId = [configObject.config.config.requestData.layersId];

                    configObject.config.config.resultInfo.layersId = [configObject.config.config.resultInfo.layersId];
                    configObject.config.config.resultInfo.layersName = [configObject.config.config.resultInfo.layersName];
                    configObject.config.config.resultInfo.layersType = [configObject.config.config.resultInfo.layersType];

                    configObject.desc = 'Execute -'+chainObject.config.config.methodName+'- with Layer ' + configObject.config.config.requestData.layersId;
                }
                if(type == 'symbology'){
                    configObject.config = chainObject.config;

                    var localSymbologyRepo = DescriptionService.getSymbologyRepositories();
                    configObject.config.symbologyRepository = localSymbologyRepo['local'];

                    if(Object.prototype.toString.call( configObject.config.config.columns ) != '[object Array]') configObject.config.config.columns = [configObject.config.config.columns];

                    configObject.desc = 'Apply '+configObject.config.config.groupName+' Symbology to Layer ' + configObject.config.config.layerId;
                }

                return configObject;
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
            mergeExecutionChains : function(executionChains){
                //the id of the execution chain elements has to represent the order!

                var executionChain = [];

                var isInChain;
                var length1 = executionChains.length;
                for (var i=0;i<length1;i++)
                {
                    var length2 = executionChains[i].length;
                    for (var j=0;j<length2;j++)
                    {
                        isInChain = false
                        var length3 = executionChain.length;
                        for (var k=0;k<length3;k++)
                        {
                            if(executionChain[k].id == executionChains[i][j].id) isInChain = true;
                        }
                        if(!isInChain) executionChain.push(executionChains[i][j]);
                    }
                }

                executionChain.sort(function(a,b) {
                    return a.id- b.id;
                });

                return executionChain;
            },
            getMapXML  : function(mapInfo,executionChain){
                var parser = new X2JS();

                var mapObject = {'TCWS-Map' : {
                    mapInfo : mapInfo,
                    executionChain : {executionChangeElement : executionChain}
                }};

                return parser.json2xml_str(mapObject);
            },
            getMapDataFromXML : function(xml){
                var parser = new X2JS();
                var result = parser.xml_str2json(xml);

                var mapData = {};
                mapData.mapInfo = result['TCWS-Map'].mapInfo;
                mapData.executionChain = result['TCWS-Map'].executionChain.executionChangeElement;

                if(Object.prototype.toString.call(mapData.executionChain) != '[object Array]') mapData.executionChain = [mapData.executionChain];

                return mapData;
            }
        }
    }]);