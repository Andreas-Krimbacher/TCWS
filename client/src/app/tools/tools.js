/**
 * Created by nd on 11/1/13.
 */
angular.module('TCWS.tools', ['TCWS.tools.overview','TCWS.tools.input','TCWS.tools.preparation','TCWS.tools.symbology'])
    .run(function($rootScope,Editor,DataStore) {
        $rootScope.startTool = 'preparation';

        var inputServices = Editor.getInputServices();

        Editor.importData({inputService: inputServices['1'], config:{layer:5}}).then(function(){
            Editor.importData({inputService: inputServices['1'], config:{layer:9}}).then(function(){
                var mappingTable = {
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

                DataStore.integrateLayer(mappingTable,'Pop Canton 2012');
            });
        });

        Editor.importData({inputService: inputServices['1'], config:{layer:11}}).then(function(){
            Editor.importData({inputService: inputServices['1'], config:{layer:10}}).then(function(){
                var mappingTable = {
                    directMatch : true,
                    layers : {
                        "1-10" : {
                            "column" : "BEZIRK",
                            "columnNewTable" : []
                        },
                        "1-11" : {
                            "column" : "BEZIRK_ID",
                            "columnNewTable" : ['BEZIRK_ID','KT_ID','DIST','T','M','W']
                        }
                    }
                };

                DataStore.integrateLayer(mappingTable,'Pop District 2012');
            });
        });

        Editor.importData({inputService: inputServices['1'], config:{layer:12}})
//        Editor.importData({inputService: inputServices['1'], config:{layer:4}});
//        Editor.importData({inputService: inputServices['1'], config:{layer:7}});
//        Editor.importData({inputService: inputServices['1'], config:{layer:9}});




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