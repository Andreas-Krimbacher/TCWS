/**
 * Created by nd on 11/1/13.
 */
angular.module('TCWS.grid', ['ngGrid'])

    .controller('GridCtrl', ['$scope','Grid',function ($scope,Grid) {
        $scope.myData = [];
        $scope.gridOptions = {
            data: 'myData'
        };

        Grid.registerViewUpdateCallback(function(data){
//            var length = data.columnDefs.length;
//            for (var i=0;i<length;i++)
//            {
//                $scope.gridOptions.columnDefs.push(data.columnDefs[i]);
//            }
            var length = data.values.length;
            for (var i=0;i<length;i++)
            {
                $scope.myData.push(data.values[i]);
            }
        });

    }])


    .factory('Grid', function () {
        // Service logic

        var viewUpdateCallback = function(){};
        var currentData = null;

        var prepareData = function(data){
            var gridData = { values : data.attributes,columnDefs : []}
            for (var prop in gridData.values[0]) {
                if (gridData.values[0].hasOwnProperty(prop)) {
                    gridData.columnDefs.push({field: prop, displayName: prop, enableCellEdit: true})
                }
            }
            return gridData;
        };

        // Public API here
        return {
            registerViewUpdateCallback : function(callback){
                viewUpdateCallback = callback;
            },
            showData : function(data){
                var gridData = prepareData(data);
                viewUpdateCallback(gridData);
                currentData = data;
            }
        }
    });