angular.module('TCWS.tools.overview', [])

    .controller('OverviewCtrl', ['$scope','DataStore',function ($scope,DataStore) {
        $scope.layerList = DataStore.getDataListShort();

        $scope.showLayer = function(id){
            DataStore.showLayerInMap(id);
            DataStore.showLayerInGrid(id);
        };

    }]);