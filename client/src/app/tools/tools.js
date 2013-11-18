/**
 * Created by nd on 11/1/13.
 */
angular.module('TCWS.tools', ['TCWS.tools.overview','TCWS.tools.input','TCWS.tools.preparation','TCWS.tools.symbology'])
    .run(function($rootScope,Editor,ServiceChain,Symbology,$location) {
        $rootScope.startTool = 'overview';

        if($location.path().search('/viewer/') != -1) return;

        var inputServices = Editor.getInputServices();
        var processingServices = Editor.getProcessingServices();
        var symbologyRepositories = Symbology.getSymbologyRepositories();

        //Service chain choropleth districts

        var dataImport1 = {inputService: inputServices['local'], config:{layer:11}};
        var dataImport2 = {inputService: inputServices['local'], config:{layer:10}};

        var mappingTable = {
            directMatch : true,
            layers : {
                "1-10" : {
                    layerId : "1-10",
                    "column" : "BEZIRK",
                    "columnNewTable" : []
                },
                "1-11" : {
                    layerId : "1-11",
                    "column" : "BEZIRK_ID",
                    "columnNewTable" : ['BEZIRK_ID','KT_ID','DIST','T','M','W']
                }
            }
        };
        var integrate = {mappingTable : mappingTable, layerName : 'Choropleth 2012', layerId : '556-2'};

        var service1 = {
            processingService : processingServices['1'],
            config: {
                methodId : '1',
                requestData : {
                    layersId : ['556-2'],
                    layersData : []
                },
                requestParam : {},
                resultInfo : {}
            }
        };

        var manipulateTable1 = {
            layerId : '556-2',
            action : '/',
            config : {
                column2 : 't',
                column1 : 'area_size',
                targetColumn : 't_per_m2',
                targetColumnName : 'T pro m2'
            }
        };

        var service2 = {
            processingService : processingServices['2'],
            config: {
                methodId : '1',
                requestData : {
                    layersId : ['556-2'],
                    layersData : []
                },
                requestParam : {
                    column : 't_per_m2',
                    classCount : 5
                },
                resultInfo : {}
            }
        };

        var symbology = { symbologyRepository : symbologyRepositories['local'],
            config : {
                layerId : '556-2',
                type : 'polygon',
                groupId : 1,
                symbologyId: 1,
                columns : ['class']
            }
        };

        var show = {
            layerId : '556-2',
            place : 'map'
        };

        var serviceChain = [
            {type : 'import' , config : dataImport1 },
            {type : 'import' , config : dataImport2 },
            {type : 'integrate' , config : integrate },
            {type : 'service' , config : service1 },
            {type : 'manipulateTable' , config : manipulateTable1 },
            {type : 'service' , config : service2 },
            {type : 'symbology' , config : symbology },
            {type : 'show' , config : show }
        ];

//        ServiceChain.executeServiceChain(serviceChain);

        //service chain diaml study

        var dataImport1 = {inputService: inputServices['local'], config:{layer:12}};
        var dataImport2 = {inputService: inputServices['local'], config:{layer:13}};
        var dataImport3 = {inputService: inputServices['local'], config:{layer:14}};

        var mappingTable1 = {
            directMatch : true,
            layers : {
                "1-12" : {
                    layerId : "1-12",
                    "column" : "KURZ",
                    "columnNewTable" : []
                },
                "1-13" : {
                    layerId : "1-13",
                    "column" : "CANTON_ID",
                    "columnNewTable" : ['CANTON_ID','POP_M_2010','POP_M_2011','POP_W_2010','POP_W_2011']
                }
            }
        };
        var integrate1 = {mappingTable : mappingTable1, layerName : 'Pop Canton 2010,2011', layerId : '555-1'};

        var mappingTable2 = {
            directMatch : true,
            layers : {
                "555-1" : {
                    layerId : "555-1",
                    "column" : "CANTON_ID",
                    "columnNewTable" : ['CANTON_ID','POP_M_2010','POP_M_2011','POP_W_2010','POP_W_2011']
                },
                "1-14" : {
                    layerId : "1-14",
                    "column" : "CANTON_ID",
                    "columnNewTable" : ['S_M_2010','S_M_2011','S_W_2010','S_W_2011']
                }
            }
        };
        var integrate2 = {mappingTable : mappingTable2, layerName : 'Study Canton 2010,2011', layerId : '555-2'};

        var service1 = {
            processingService : processingServices['1'],
            config: {
                methodId : '2',
                requestData : {
                    layersId : ['555-2'],
                    layersData : []
                },
                requestParam : {},
                resultInfo : {
                    layersId : ['555-3'],
                    layersType : ['point'],
                    layersName : ['DiaML 2010,2011']
                }
            }
        };

        var manipulateTable1 = {
            layerId : '555-3',
            action : '/',
            config : {
                column2 : 'pop_m_2010',
                column1 : 's_m_2010',
                targetColumn : 's_m_2010',
                targetColumnName : '[%] Swiss Man 2010'
            }
        };

        var manipulateTable2 = {
            layerId : '555-3',
            action : '/',
            config : {
                column2 : 'pop_m_2011',
                column1 : 's_m_2011',
                targetColumn : 's_m_2011',
                targetColumnName : '[%] Swiss Man 2011'
            }
        };

        var manipulateTable3 = {
            layerId : '555-3',
            action : '/',
            config : {
                column2 : 'pop_w_2010',
                column1 : 's_w_2010',
                targetColumn : 's_w_2010',
                targetColumnName : '[%] Swiss Woman 2010'
            }
        };

        var manipulateTable4 = {
            layerId : '555-3',
            action : '/',
            config : {
                column2 : 'pop_w_2011',
                column1 : 's_w_2011',
                targetColumn : 's_w_2011',
                targetColumnName : '[%] Swiss Woman 2011'
            }
        };

        var symbology = { symbologyRepository : symbologyRepositories['local'],
            config : {
                layerId : '555-3',
                type : 'point',
                groupId : 1,
                symbologyId: 1,
                columns : ['s_w_2011','s_m_2011','s_m_2010','s_w_2010']
            }
        };

        var show1 = {
            layerId : '555-3',
            place : 'map'
        };

        var show2 = {
            layerId : '555-3',
            place : 'grid'
        };


        serviceChain = [
            {type : 'import' , config : dataImport1 },
            {type : 'import' , config : dataImport2 },
            {type : 'import' , config : dataImport3 },
            {type : 'integrate' , config : integrate1 },
            {type : 'integrate' , config : integrate2 },
            {type : 'service' , config : service1 },
            {type : 'manipulateTable' , config : manipulateTable1 },
            {type : 'manipulateTable' , config : manipulateTable2 },
            {type : 'manipulateTable' , config : manipulateTable3 },
            {type : 'manipulateTable' , config : manipulateTable4 },
            {type : 'symbology' , config : symbology },
            {type : 'show' , config : show1 }
//            {type : 'show' , config : show2 }
        ];

//        ServiceChain.executeServiceChain(serviceChain);

        //service chain dot map

        var dataImport1 = {inputService: inputServices['local'], config:{layer:12}};
        var dataImport2 = {inputService: inputServices['local'], config:{layer:11}};
        var dataImport3 = {inputService: inputServices['local'], config:{layer:10}};

        var mappingTable = {
            directMatch : true,
            layers : {
                "1-10" : {
                    layerId : "1-10",
                    "column" : "BEZIRK",
                    "columnNewTable" : []
                },
                "1-11" : {
                    layerId : "1-11",
                    "column" : "BEZIRK_ID",
                    "columnNewTable" : ['BEZIRK_ID','KT_ID','DIST','T','M','W']
                }
            }
        };
        var integrate = {mappingTable : mappingTable, layerName : 'Dot Map 2012', layerId : '557-1'};


        var service1 = {
            processingService : processingServices['3'],
            config: {
                methodId : '1',
                requestData : {
                    layersId : ['557-1'],
                    layersData : []
                },
                requestParam : {
                    attribute : 't',
                    keepAttribute : 'bezirk_id|kt_id|dist',
                    dotValue : 1000,
                    dotDistance : 0.001
                },
                resultInfo : {
                    layersId : ['557-2'],
                    layersType : ['point'],
                    layersName : ['Dot Map']
                }
            }
        };

        var symbology1 = { symbologyRepository : symbologyRepositories['local'],
            config : {
                layerId : '1-12',
                type : 'polygon',
                groupId : 2,
                symbologyId: 1
            }
        };

        var symbology2 = { symbologyRepository : symbologyRepositories['local'],
            config : {
                layerId : '557-2',
                type : 'point',
                groupId : 2,
                symbologyId: 1
            }
        };

        var show1 = {
            layerId : '1-12',
            place : 'map'
        };

        var show2 = {
            layerId : '557-2',
            place : 'map'
        };

        serviceChain = [
            {type : 'import' , config : dataImport1 },
            {type : 'import' , config : dataImport2 },
            {type : 'import' , config : dataImport3 },
            {type : 'integrate' , config : integrate },
            {type : 'service' , config : service1 },
            {type : 'symbology' , config : symbology1 },
            {type : 'symbology' , config : symbology2 },
            {type : 'show' , config : show2 },
            {type : 'show' , config : show1 }
        ];


//        ServiceChain.executeServiceChain(serviceChain);


        //        var mappingTable = {
//            directMatch : false,
//            layers : {
//                "1-9" : {
//                    "column" : "area",
//                    "columnNewTable" : ['area','T','M','W'],
//                    "index" :
//                    {
//                        "0":"Aargau",
//                        "1":"Appenzell A.Rh.",
//                        "2":"Appenzell I.Rh.",
//                        "3":"Basel-Landschaft",
//                        "4":"Basel-Stadt",
//                        "5":"Bern",
//                        "6":"Freiburg",
//                        "7":"Genf",
//                        "8":"Glarus",
//                        "9":"Graubünden",
//                        "10":"Jura",
//                        "11":"Luzern",
//                        "12":"Neuenburg",
//                        "13":"Nidwalden",
//                        "14":"Obwalden",
//                        "15":"Schaffhausen",
//                        "16":"Schwyz",
//                        "17":"Solothurn",
//                        "18":"St. Gallen",
//                        "19":"Tessin",
//                        "20":"Thurgau",
//                        "21":"Uri",
//                        "22":"Waadt",
//                        "23":"Wallis",
//                        "24":"Zug",
//                        "25":"Zürich"
//                    }
//                },
//                "1-5" : {
//                    "column" : "NAME_1",
//                    "columnNewTable" : ['ID_1'],
//                    "index" :
//                    {
//                        "0":"Aargau",
//                        "1":"Appenzell Ausserrhoden",
//                        "2":"Appenzell Innerrhoden",
//                        "3":"Basel-Landschaft",
//                        "4":"Basel-Stadt",
//                        "5":"Bern",
//                        "6":"Fribourg",
//                        "7":"Genève",
//                        "8":"Glarus",
//                        "9":"Graubünden",
//                        "10":"Jura",
//                        "11":"Lucerne",
//                        "12":"Neuchâtel",
//                        "13":"Nidwalden",
//                        "14":"Obwalden",
//                        "15":"Schaffhausen",
//                        "16":"Schwyz",
//                        "17":"Solothurn",
//                        "18":"Sankt Gallen",
//                        "19":"Ticino",
//                        "20":"Thurgau",
//                        "21":"Uri",
//                        "22":"Vaud",
//                        "23":"Valais",
//                        "24":"Zug",
//                        "25":"Zürich"
//                    }
//                }
//            }
//        };
    })


    .controller('ToolsCtrl', ['$scope','$rootScope',function ($scope,$rootScope) {
        $scope.currentTool = $rootScope.startTool;
        $scope.toolTemplate = '/app/tools/'+$scope.currentTool+'/'+$scope.currentTool+'.tpl.html';
        $scope.$broadcast('activateToolButton',$scope.currentTool);

        $scope.$on('setTool', function (event, toolName) {
            $scope.toolTemplate = '/app/tools/'+toolName+'/'+toolName+'.tpl.html';
            $scope.currentTool = toolName;
            $scope.$broadcast('activateToolButton',toolName);
        });

    }])

    .controller('NavbarCtrl', ['$scope',function ($scope) {
        $scope.currentTool = $scope.$parent.currentTool;

        $scope.$on('activateToolButton', function (event, toolName) {
            $scope.currentTool = toolName;
        });

        $scope.setCurrentTool = function(toolName){
            $scope.$emit('setTool', toolName);
        };
    }]);