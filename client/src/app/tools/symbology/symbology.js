angular.module('TCWS.tools.symbology', ['TCWS.symbology'])
    .run(function($rootScope) {
        $rootScope.startSymbologyView = 'point';
    })


    .controller('SymbologyCtrl', ['$scope',function ($scope) {
        $scope.currentSymbologyView = $scope.startSymbologyView;
        $scope.symbologyView = '/app/tools/symbology/symbology_' + $scope.currentSymbologyView + '.tpl.html';

        $scope.selectSymbologyView = function(type){
            $scope.currentSymbologyView = type;
            $scope.symbologyView = '/app/tools/symbology/symbology_' + $scope.currentSymbologyView + '.tpl.html';
        };
    }])

    .controller('SymbologyPointCtrl', ['$scope','Symbology','DiaML','Editor','DataStore',function ($scope,Symbology,DiaML,Editor,DataStore) {

        var symbologyRepositories = Symbology.getSymbologyRepositories();
        var symbologyRepository = symbologyRepositories['1'];

        var pointSymbologyGroups = Symbology.getPointSymbologyGroups(symbologyRepository);

        var symbologyGroupList = [];
        for (var prop in pointSymbologyGroups) {
            if (pointSymbologyGroups.hasOwnProperty(prop)) {
               symbologyGroupList.push({id:pointSymbologyGroups[prop].groupId, text : pointSymbologyGroups[prop].groupName})
            }
        }
        
        $scope.symbolSrc = '';
        $scope.currentStyle = null;

        $scope.pointSymbologiesList = [];

        $scope.selectOptionsSymbologyGroup = {
            allowClear:true,
            data: symbologyGroupList
        };

        $scope.selectOptionsPointSymbology = {
            allowClear:true,
            data:  $scope.pointSymbologiesList
        };


        $scope.$watch('symbologyGroup', function (newValue, oldValue) {
            if(newValue){
                $scope.pointSymbologiesList = [];

                Symbology.getPointSymbologyGroup(symbologyRepository,$scope.symbologyGroup.id).then(function(pointSymbologyGroup){

                    for (var prop in pointSymbologyGroup.symbologys) {
                        if (pointSymbologyGroup.symbologys.hasOwnProperty(prop)) {
                            $scope.pointSymbologiesList.push(
                                {
                                    id : pointSymbologyGroup.symbologys[prop].symbologyId,
                                    text : pointSymbologyGroup.symbologys[prop].name
                                }
                            );
                        }
                    }
                    $scope.selectOptionsPointSymbology.data = $scope.pointSymbologiesList;

                    //Hack because options get not updated
                    $('#pointSymbology').select2($scope.selectOptionsPointSymbology);
                });
            }
            else{
                $scope.pointSymbologiesList = [];
                $scope.selectOptionsPointSymbology.data = $scope.pointSymbologiesList;
                $('#pointSymbology').select2($scope.selectOptionsPointSymbology);
            }
        });

        $scope.$watch('pointSymbology', function (newValue, oldValue) {
            if(newValue){
                var config = {groupId : $scope.symbologyGroup.id, symbologyId : $scope.pointSymbology.id};
                Symbology.getPointSymbology(symbologyRepository, config).then(function(symbology){

                    var preview = Symbology.getPreview(symbology,'point');
                    $scope.symbolSrc = preview.img;
                    $scope.currentStyle = symbology;
                    $scope.columnCount = $scope.currentStyle.variableSymbology.length;
                });
            }
            else{
                $scope.currentStyle = null;
            }
        });

        //layer input

        var layerShortList = Editor.getLayerListShort();

        var layerList = [];
        $scope.columnList = [];


        var length = layerShortList.length;
        for (var i=0;i<length;i++)
        {
            layerList.push({id:layerShortList[i].id,text:layerShortList[i].name});
        }

        $scope.selectOptionsLayer = {
            allowClear:true,
            data: layerList
        };

        $scope.selectOptionsColumn = {
            allowClear:true,
            data: $scope.columnList,
            multiple: true
        };

        $scope.$watch('layer', function (newValue, oldValue) {
            if(newValue){
                $scope.layerData = DataStore.getLayer(newValue.id);

                $scope.columnList = [];
                for (var prop in $scope.layerData.labels) {
                    if ($scope.layerData.labels.hasOwnProperty(prop)) {
                        $scope.columnList.push({id:prop,text:$scope.layerData.labels[prop]});
                    }
                }
                $scope.selectOptionsColumn.data = $scope.columnList;

                //Hack because options get not updated
                $('#columnInput').select2($scope.selectOptionsColumn);
            }
            else{
                $scope.columnList = [];
                $scope.selectOptionsColumn.data = $scope.columnList;
                $('#columnInput').select2($scope.selectOptionsColumn);
            }
        });

        $scope.applySymbology = function(){
            //hack, because ng-model dont work.
            var columns =  $('#columnInput').val().split(',');
            var length = columns.length;
            for (var i=0;i<length;i++)
            {
                $scope.currentStyle.variableSymbology[i].column = columns[i];
            }

            var repositoryInfo = {
                symbologyRepositories : symbologyRepository,
                groupId : $scope.symbologyGroup.id,
                symbologyId : $scope.pointSymbology.id,
                columns : columns
            };

            Editor.applySymbology($scope.layer.id,$scope.currentStyle,'point',repositoryInfo);
        };

    }])

    .controller('SymbologyLineCtrl', ['$scope',function ($scope) {

    }])

    .controller('SymbologyPolygonCtrl', ['$scope','DataStore','Editor','Symbology',function ($scope,DataStore,Editor,Symbology) {

        var symbologyRepositories = Symbology.getSymbologyRepositories();
        var symbologyRepository = symbologyRepositories['1'];

        var polygonSymbologyGroups = Symbology.getPolygonSymbologyGroups(symbologyRepository);

        var symbologyGroupList = [];
        for (var prop in polygonSymbologyGroups) {
            if (polygonSymbologyGroups.hasOwnProperty(prop)) {
                symbologyGroupList.push({id:polygonSymbologyGroups[prop].groupId, text : polygonSymbologyGroups[prop].groupName})
            }
        }

        $scope.symbolSrc = '';
        $scope.currentStyle = null;

        $scope.polygonSymbologiesList = [];

        $scope.selectOptionsSymbologyGroup = {
            allowClear:true,
            data: symbologyGroupList
        };

        $scope.selectOptionsPolygonSymbology = {
            allowClear:true,
            data:  $scope.polygonSymbologiesList
        };


        $scope.$watch('symbologyGroup', function (newValue, oldValue) {
            if(newValue){
                $scope.polygonSymbologiesList = [];

                Symbology.getPolygonSymbologyGroup(symbologyRepository,$scope.symbologyGroup.id).then(function(polygonSymbologyGroup){

                    for (var prop in polygonSymbologyGroup.symbologys) {
                        if (polygonSymbologyGroup.symbologys.hasOwnProperty(prop)) {
                            $scope.polygonSymbologiesList.push(
                                {
                                    id : polygonSymbologyGroup.symbologys[prop].symbologyId,
                                    text : polygonSymbologyGroup.symbologys[prop].name
                                }
                            );
                        }
                    }
                    $scope.selectOptionsPolygonSymbology.data = $scope.polygonSymbologiesList;

                    //Hack because options get not updated
                    $('#polygonSymbology').select2($scope.selectOptionsPolygonSymbology);
                });
            }
            else{
                $scope.polygonSymbologiesList = [];
                $scope.selectOptionsPolygonSymbology.data = $scope.polygonSymbologiesList;
                $('#polygonSymbology').select2($scope.selectOptionsPolygonSymbology);
            }
        });

        $scope.$watch('polygonSymbology', function (newValue, oldValue) {
            if(newValue){
                var config = {groupId : $scope.symbologyGroup.id, symbologyId : $scope.polygonSymbology.id};
                Symbology.getPolygonSymbology(symbologyRepository, config).then(function(symbology){

                    // Todo: Implement Color Scheme over Preview Img
//                    var preview = Symbology.getPreview(symbology,'polygon');
//                    $scope.symbolSrc = preview.img;
                    $scope.currentStyle = symbology;
                    $scope.columnCount = $scope.currentStyle.variableSymbology.length;
                });
            }
            else{
                $scope.currentStyle = null;
            }
        });

        //layer input

        var layerShortList = Editor.getLayerListShort();

        var layerList = [];
        $scope.columnList = [];

        var length = layerShortList.length;
        for (var i=0;i<length;i++)
        {
            layerList.push({id:layerShortList[i].id,text:layerShortList[i].name});
        }

        $scope.selectOptionsLayer = {
            allowClear:true,
            data: layerList
        };

        $scope.selectOptionsColumn = {
            allowClear:true,
            data: $scope.columnList
        };

        $scope.$watch('layer', function (newValue, oldValue) {
            if(newValue){
                $scope.layerData = DataStore.getLayer(newValue.id);

                $scope.columnList = [];
                for (var prop in $scope.layerData.labels) {
                    if ($scope.layerData.labels.hasOwnProperty(prop)) {
                        $scope.columnList.push({id:prop,text:$scope.layerData.labels[prop]});
                    }
                }
                $scope.selectOptionsColumn.data = $scope.columnList;

                //Hack because options get not updated
                $('#columnInput').select2($scope.selectOptionsColumn);
            }
            else{
                $scope.columnList = [];
                $scope.selectOptionsColumn.data = $scope.columnList;
                $('#columnInput').select2($scope.selectOptionsColumn);
            }
        });

        $scope.applySymbology = function(){

            $scope.currentStyle.variableSymbology[0].column = $scope.column.id;

            var repositoryInfo = {
                symbologyRepositories : symbologyRepository,
                groupId : $scope.symbologyGroup.id,
                symbologyId : $scope.pointSymbology.id,
                columns : columns
            };

            Editor.applySymbology($scope.layer.id,$scope.currentStyle,'polygon',repositoryInfo);
        };

    }])

    .controller('SymbologyTypoCtrl', ['$scope',function ($scope) {

    }]);