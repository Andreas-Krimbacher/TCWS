/**
 * Created by nd on 11/1/13.
 */
angular.module('TCWS.grid', ['ngGrid'])

    .controller('GridCtrl', ['$scope','Grid',function ($scope,Grid) {
        $scope.myData = [];
        $scope.gridOptions = {
            data: 'myData',
            columnDefs: 'colDefs'
            //enableColumnResize: true (not possible, bug)
        };

        Grid.registerViewUpdateCallback(function(data){
            if(data){
                $scope.myData = data.values;
                $scope.colDefs = data.columnDefs;
            }
            else{
                $scope.myData = [];
                $scope.colDefs = [];
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
                    gridData.columnDefs.push({field: prop, displayName: data.labels[prop], enableCellEdit: false})
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
            },
            removeData : function(){
                viewUpdateCallback(null);
            }
        }
    });