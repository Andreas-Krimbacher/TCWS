/**
 * Created by nd on 11/1/13.
 */
angular.module('TCWS.grid', ['ngGrid'])

    .controller('GridCtrl', ['$scope','Grid',function ($scope,Grid) {

        var afterSelectionChange = function(rowItem, event){

            if(!rowItem[0]) rowItem = [rowItem];

            var length = rowItem.length;
            for (var i=0;i<length;i++)
            {
                if(!rowItem[i].entity._featureId) return;

                var feature = {featureId : rowItem[i].entity._featureId, layerId : layerId};

                if(rowItem[i].selected) $scope.$emit('featureSelectedInGrid', feature);
                else $scope.$emit('featureUnSelectedInGrid', feature);
            }


        };

        var layerId = null;

        $scope.gridData = [];
        $scope.colDefs = [];
        $scope.gridOptions = {
            data: 'gridData',
            columnDefs: 'colDefs',
            afterSelectionChange : afterSelectionChange
            //enableColumnResize: true (not possible, bug)
        };

        Grid.registerViewUpdateCallback(function(data){
            if(data){
                layerId = data.layerId;
                $scope.gridData = data.values;
                $scope.colDefs = data.columnDefs;
            }
            else{
                layerId = null;
                $scope.gridData = [];
                $scope.colDefs = [];
            }
        });

    }])


    .factory('Grid', function () {
        // Service logic

        var viewUpdateCallback = function(){};
        var currentData = null;

        var prepareData = function(data){
            var gridData = { values : data.attributes,columnDefs : [], layerId : data.id}

            if(data.type != 'attribute'){
                var length = data.gmlData.features.length;
                for (var i=0;i<length;i++)
                {
                    gridData.values[i]._featureId = data.gmlData.features[i].getId();
                }
            }
            
            for (var prop in data.labels) {
                if (data.labels.hasOwnProperty(prop)) {
                    gridData.columnDefs.push({field: prop, displayName: data.labels[prop], enableCellEdit: true})
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