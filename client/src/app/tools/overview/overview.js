angular.module('TCWS.tools.overview', ['TCWS.components'])
    .run(function($rootScope) {
        $rootScope.startOverviewMenu = 'layers';
    })

    .controller('OverviewCtrl', ['$scope',function ($scope) {
        $scope.currentMenu = $scope.startOverviewMenu;
        $scope.overviewMenu = '/app/tools/overview/overviewMenu_' + $scope.currentMenu + '.tpl.html';

        $scope.selectMenu = function(type){
            $scope.currentMenu = type;
            $scope.overviewMenu = '/app/tools/overview/overviewMenu_' + type + '.tpl.html';
        };

    }])

    .controller('OverviewLayersCtrl', ['$scope','DataStore','Editor','OpenLayersMap','$http',function ($scope,DataStore,Editor,OpenLayersMap,$http) {

        var showLayerInMap = function(layerId){
            Editor.addLayerToMap(layerId);
        };

        var hideLayerInMap = function(layerId){
            Editor.removeLayerFromMap(layerId);
        };

        var showLayerInGrid = function(layerId){
            Editor.showLayerInGrid(layerId);
        };

        var removeLayer = function(layerId){
            Editor.removeLayer(layerId);
        };

        var updateLayerStackIndex = function(layerArray){
            Editor.updateLayerStackIndexFromArray(layerArray);
        };

        var saveLayerToFile = function(layerId){
            var gmlString = DataStore.getLayerAsGML(layerId);
            $http({
                url: 'http://localhost:9000/services/saveFile',
                method: "POST",
                params : {path : 'NewFile/',fileName: layerId + '.xml'},
                data: gmlString,
                headers: {'Content-Type': 'application/xml'}
            });
        };

        $scope.overlayLayerListOptions = {
            layerList : Editor.getLayerListShort(),
            hideLayerInMap : hideLayerInMap,
            showLayerInMap : showLayerInMap,
            showLayerInGrid : showLayerInGrid,
            removeLayer : removeLayer,
            updateLayerStackIndex : updateLayerStackIndex,
            saveLayerToFile : saveLayerToFile
        };



        var hideBaseLayerInMap = function(baseMapId){
            OpenLayersMap.removeBaseMap(baseMapId);
        };

        var showBaseLayerInMap = function(baseMapId){
            OpenLayersMap.setBaseMap(baseMapId);
        };

        $scope.baseLayerListOptions = {
            layerList : OpenLayersMap.getBaseMaps(),
            hideLayerInMap : hideBaseLayerInMap,
            showLayerInMap : showBaseLayerInMap,
            disableSort : true
        };

        $scope.$on('updateLayerList', function (event) {
            $scope.overlayLayerListOptions.layerList =  Editor.getLayerListShort();
            $scope.baseLayerListOptions.layerList = OpenLayersMap.getBaseMaps();
        });

    }])

    .controller('OverviewPublishCtrl', ['$scope','ExecutionChain',function ($scope,ExecutionChain) {
        console.log(ExecutionChain.executionChainToXML(ExecutionChain.getExecutionChainRecursive('555-3')));

    }]);