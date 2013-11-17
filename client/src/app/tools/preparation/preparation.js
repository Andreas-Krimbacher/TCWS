angular.module('TCWS.tools.preparation', ['TCWS.webService'])
    .run(function($rootScope) {
        $rootScope.startPreparationTool = 'analyze';
    })

    .controller('PreparationCtrl', ['$scope',function ($scope) {
        $scope.currentTool = $scope.startPreparationTool;
        $scope.preparationTool = '/app/tools/preparation/preparationTool_' + $scope.currentTool + '.tpl.html';

        $scope.selectTool = function(type){
            $scope.currentTool = type;
            $scope.preparationTool = '/app/tools/preparation/preparationTool_' + type + '.tpl.html';
        };
    }])

    .controller('PreparationFactoryCtrl', ['$scope','Editor','DataStore',function ($scope,Editor,DataStore) {

        var layerList = Editor.getLayerListShort();

        var spatialLayerList = [];
        var attributeLayerList = [];

        $scope.spatialColumnList = [];
        $scope.attributeColumnList = [];

        var length = layerList.length;
        for (var i=0;i<length;i++)
        {
            if(layerList[i].type != 'attribute') spatialLayerList.push({id:layerList[i].id,text:layerList[i].name});
            else attributeLayerList.push({id:layerList[i].id,text:layerList[i].name})
        }

        $scope.selectOptionsSpatialLayer = {
            allowClear:true,
            data: spatialLayerList
        };

        $scope.selectOptionsAttributeLayer = {
            allowClear:true,
            data: attributeLayerList
        };

        $scope.selectOptionsSpatialColumn = {
            allowClear:true,
            data: $scope.spatialColumnList
        };

        $scope.selectOptionsAttributeColumn = {
            allowClear:true,
            data: $scope.attributeColumnList
        };

        $scope.$watch('spatialLayer', function (newValue, oldValue) {
            if(newValue){
                $scope.spatialLayerData = DataStore.getLayer(newValue.id);

                $scope.spatialColumnList = [];
                for (var prop in $scope.spatialLayerData.labels) {
                    if ($scope.spatialLayerData.labels.hasOwnProperty(prop)) {
                        $scope.spatialColumnList.push({id:prop,text:$scope.spatialLayerData.labels[prop]});
                    }
                }
                $scope.selectOptionsSpatialColumn.data = $scope.spatialColumnList;

                //Hack because options get not updated
                $('#factorySpatialColumn').select2( $scope.selectOptionsSpatialColumn)
            }
            else{
                $scope.spatialColumnList = [];
                $scope.selectOptionsSpatialColumn.data = $scope.spatialColumnList;
                $('#factorySpatialColumn').select2( $scope.selectOptionsSpatialColumn)
            }
        });

        $scope.$watch('attributeLayer', function (newValue, oldValue) {
            if(newValue){
                $scope.attributeLayerData = DataStore.getLayer(newValue.id);

                $scope.attributeColumnList = [];
                for (var prop in $scope.attributeLayerData.labels) {
                    if ($scope.attributeLayerData.labels.hasOwnProperty(prop)) {
                        $scope.attributeColumnList.push({id:prop,text:$scope.attributeLayerData.labels[prop]});
                    }
                }
                $scope.selectOptionsAttributeColumn.data = $scope.attributeColumnList;

                //Hack because options get not updated
                $('#factoryAttributeColumn').select2($scope.selectOptionsAttributeColumn)
            }
            else{
                $scope.attributeColumnList = [];
                $scope.selectOptionsAttributeColumn.data = $scope.attributeColumnList;
                $('#factoryAttributeColumn').select2($scope.selectOptionsAttributeColumn)
            }
        });

        $scope.mappingTable = {
            directMatch : false,
            layers : {
                "1-9" : {
                    "column" : "area",
                    "columnNewTable" : ['area','T','M','W'],
                    "index" :
                    {
                        "0":"Aargau",
                        "1":"Appenzell A.Rh.",
                        "2":"Appenzell I.Rh.",
                        "3":"Basel-Landschaft",
                        "4":"Basel-Stadt",
                        "5":"Bern",
                        "6":"Freiburg",
                        "7":"Genf",
                        "8":"Glarus",
                        "9":"Graubünden",
                        "10":"Jura",
                        "11":"Luzern",
                        "12":"Neuenburg",
                        "13":"Nidwalden",
                        "14":"Obwalden",
                        "15":"Schaffhausen",
                        "16":"Schwyz",
                        "17":"Solothurn",
                        "18":"St. Gallen",
                        "19":"Tessin",
                        "20":"Thurgau",
                        "21":"Uri",
                        "22":"Waadt",
                        "23":"Wallis",
                        "24":"Zug",
                        "25":"Zürich"
                    }
                },
                "1-5" : {
                    "column" : "NAME_1",
                    "columnNewTable" : ['ID_1'],
                    "index" :
                    {
                        "0":"Aargau",
                        "1":"Appenzell Ausserrhoden",
                        "2":"Appenzell Innerrhoden",
                        "3":"Basel-Landschaft",
                        "4":"Basel-Stadt",
                        "5":"Bern",
                        "6":"Fribourg",
                        "7":"Genève",
                        "8":"Glarus",
                        "9":"Graubünden",
                        "10":"Jura",
                        "11":"Lucerne",
                        "12":"Neuchâtel",
                        "13":"Nidwalden",
                        "14":"Obwalden",
                        "15":"Schaffhausen",
                        "16":"Schwyz",
                        "17":"Solothurn",
                        "18":"Sankt Gallen",
                        "19":"Ticino",
                        "20":"Thurgau",
                        "21":"Uri",
                        "22":"Vaud",
                        "23":"Valais",
                        "24":"Zug",
                        "25":"Zürich"
                    }
                }
            }
        };

        $scope.createLayer = function(){
            Editor.createUpdateLayer('integrate', {mappingTable : $scope.mappingTable,layerName:'Pop Canton 2012'});
        };


    }])

    .controller('PreparationAnalyzeCtrl', ['$scope','Editor',function ($scope,Editor) {

        var processingServices = Editor.getProcessingServices();
        var layerListShort = Editor.getLayerListShort();

        var requestMethods = [];
        var count = 1;
        for (var prop1 in processingServices) {
            if (processingServices.hasOwnProperty(prop1)) {
                requestMethods.push({ text : processingServices[prop1].name, children : []});
                for (var prop2 in processingServices[prop1].methods) {
                    if (processingServices[prop1].methods.hasOwnProperty(prop2)) {
                        requestMethods[requestMethods.length-1].children.push(
                            {
                                id : count,
                                text : processingServices[prop1].methods[prop2].methodName,
                                serviceId : prop1,
                                methodId : processingServices[prop1].methods[prop2].methodId
                            }
                        );
                        count++;
                    }
                }
            }
        }


        var layerList = [];
        var length = layerListShort.length;
        for (var i=0;i<length;i++)
        {
            if(layerListShort[i].type != 'attribute') layerList.push({id:layerListShort[i].id,text:layerListShort[i].name});
        }

        $scope.selectOptionsLayer = {
            allowClear:true,
            data: layerList
        };

        $scope.selectOptionsMethod = {
            allowClear:true,
            data: requestMethods
        };

        $scope.executeMethod = function(){
            var info = {
                processingService : processingServices[$scope.method.serviceId],
                config: {
                    methodId : $scope.method.methodId,
                    requestData : {
                        layersId : [$scope.layer.id],
                        layersData : []
                    },
                    requestParam : {}
                }
            };

            if(info.processingService.serviceType == 'ccs'){
                info.config.requestParam = {
                    column : 'area_size',
                    classCount : 5
                };
            }

            Editor.executeServiceRequest(info);
        };

    }]);