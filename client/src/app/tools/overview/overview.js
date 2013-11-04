angular.module('TCWS.tools.overview', [])

    .controller('OverviewCtrl', ['$scope','DataStore',function ($scope,DataStore) {
        $scope.currentMenu = null;

        $scope.selectMenu = function(type){
            $scope.currentMenu = type;
            $scope.overviewMenu = '/app/tools/overview/overviewMenu_' + type + '.tpl.html';
        };

    }])

    .controller('OverviewLayersCtrl', ['$scope','DataStore',function ($scope,DataStore) {
        $scope.layerList = DataStore.getLayerListShort();

        $scope.showInMap = function(layer){
            DataStore.showLayerInMap(layer.id);
        };

        $scope.showInGrid = function(layer){
            DataStore.showLayerInGrid(layer.id);
        };

        $scope.remove = function(index){
            DataStore.removeLayer($scope.layerList[index].id);
            $scope.layerList.splice(index,1);
        };
    }]);