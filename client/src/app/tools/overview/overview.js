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
        var currentBaseMap = null;
        var layerInGrid = null;

        $scope.layerList = Editor.getLayerListShort();
        $scope.baseMaps = OpenLayersMap.getBaseMaps();

        var length = $scope.baseMaps.length;
        for (var i=0;i<length;i++)
        {
            if($scope.baseMaps[i].inMap) currentBaseMap = $scope.baseMaps[i];
        }


        $scope.$on('updateLayerOverview', function (event) {
            $scope.layerList = Editor.getLayerListShort();
            $scope.baseMaps = OpenLayersMap.getBaseMaps();
            var length = $scope.baseMaps.length;
            for (var i=0;i<length;i++)
            {
                if($scope.baseMaps[i].inMap) currentBaseMap = $scope.baseMaps[i];
            }
        });

        $scope.setBaseMap = function(baseMap){

            if(currentBaseMap && currentBaseMap.id == baseMap.id){
                OpenLayersMap.removeBaseMap(baseMap.id);

                currentBaseMap.inMap = false;
                currentBaseMap = null;
            }
            else{
                OpenLayersMap.setBaseMap(baseMap.id);

                if(currentBaseMap) currentBaseMap.inMap = false;

                currentBaseMap = baseMap;
                baseMap.inMap = true;
            }
        };

        $scope.toogleLayerInMap = function(layer){
            if(layer.inMap){
                Editor.removeLayerFromMap(layer.id);
                layer.inMap = false;
            }
            else{
                Editor.addLayerToMap(layer.id);
                layer.inMap = true;
            }

        };

        $scope.showInGrid = function(layer){
            Editor.showLayerInGrid(layer.id);

            if(layerInGrid) layerInGrid.inGrid = false;

            layerInGrid = layer;
            layer.inGrid = true;
        };

        $scope.remove = function(index){
            Editor.removeLayer($scope.layerList[index].id);
            $scope.layerList.splice(index,1);
        };

        $scope.saveLayerToFile = function(layer){
            var gmlString = DataStore.getLayerAsGML(layer.id);
            $http({
                url: 'http://localhost:9000/services/saveFile',
                method: "POST",
                params : {path : 'NewFile/',fileName: layer.id + '.xml'},
                data: gmlString,
                headers: {'Content-Type': 'application/xml'}
            })
        };

    }]);