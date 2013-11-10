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

    .controller('OverviewLayersCtrl', ['$scope','DataStore','Editor','OpenLayersMap',function ($scope,DataStore,Editor,OpenLayersMap) {
        var currentBaseMap = null;
        var layerInGrid = null;

        $scope.layerList = Editor.getLayerListShort();
        $scope.baseMaps = OpenLayersMap.getBaseMaps();

        var length = $scope.baseMaps.length;
        for (var i=0;i<length;i++)
        {
            if($scope.baseMaps[i].inMap) currentBaseMap = $scope.baseMaps[i];
        }

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
    }]);