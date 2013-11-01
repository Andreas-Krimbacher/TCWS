'use strict';

angular.module('TCWS.editor', [])
    .controller('EditorCtrl', ['$scope', 'OpenLayersMap',function ($scope, OpenLayersMap) {
        $scope.zoomToZurich = function(){
            OpenLayersMap.setCenter(8.486863,47.381258,11);
        };

    }]);

