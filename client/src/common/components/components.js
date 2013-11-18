angular.module('TCWS.components', ['ui.sortable'])

    .directive('tcwsLayerIcon', function() {

        return {
            restrict: 'E',
            templateUrl: '/common/components/layerIcon.tpl.html',
            replace: true,
            scope: {
                type: '=type'
            }
        };
    })

    .directive('tcwsLayerList', function() {

        return {
            restrict: 'E',
            templateUrl: '/common/components/layerList.tpl.html',
            replace: true,
            scope: { options: '=' },
            link: function (scope, elem, attrs) {


                scope.iconCount = 0;
                scope.icons = {
                    map : false,
                    grid : false,
                    remove : false
                };

                if((typeof scope.options.showLayerInMap == 'function') && (typeof scope.options.hideLayerInMap == 'function')){
                    scope.icons.map = true;
                    scope.iconCount++;
                }
                if(typeof scope.options.showLayerInGrid == 'function'){
                    scope.icons.grid = true;
                    scope.iconCount++;
                }
                if(typeof scope.options.removeLayer == 'function'){
                    scope.icons.remove = true;
                    scope.iconCount++;
                }


                scope.layerTypes = ['attribute','point','line','polygon','raster','base'];

                if(typeof scope.options.layerTypes == 'object') scope.layerTypes = scope.options.layerTypes;

                scope.layerLists = {
                    attribute : [],
                    point : [],
                    line : [],
                    polygon : [],
                    raster : [],
                    base : []
                };



                var calculateLayerLists = function(layerList){

                    scope.layerLists = {
                        attribute : [],
                        point : [],
                        line : [],
                        polygon : [],
                        raster : [],
                        base : []
                    };

                    var length = layerList.length;
                    for (var i=0;i<length;i++)
                    {
                        scope.layerLists[layerList[i].type].push(angular.copy(layerList[i]));
                    }

                    for (var prop in scope.layerLists) {
                        if (scope.layerLists.hasOwnProperty(prop)) {
                            scope.layerLists[prop].sort(function(a,b) {
                                return parseFloat(b.layerStackIndex) - parseFloat(a.layerStackIndex)
                            });
                        }
                    }
                };

                scope.$watch('options.layerList', function (newValue, oldValue) {
                    if(newValue){
                        calculateLayerLists(scope.options.layerList);
                    }
                });


                scope.toogleLayerInMap = function(layer){
                    if(layer.inMap){
                        scope.options.hideLayerInMap(layer.id);
                    }
                    else{
                        scope.options.showLayerInMap(layer.id);
                    }
                };

                scope.showLayerInGrid = function(layer){
                    scope.options.showLayerInGrid(layer.id);
                };

                scope.removeLayer = function(layer){
                    scope.options.removeLayer(layer.id);
                };

                scope.saveLayerToFile = function(layer){
                    scope.options.saveLayerToFile(layer.id);
                };


                scope.sortStop = {};
                var closure = function(type){
                    scope.sortStop[type] = function(e, ui){
                        var layerStackIndex = [];
                        var length = scope.layerLists[type].length;
                        for (var i=0;i<length;i++)
                        {
                            layerStackIndex.push(scope.layerLists[type][i].layerStackIndex);
                        }

                        layerStackIndex.sort().reverse();

                        for (var i=0;i<length;i++)
                        {
                            scope.layerLists[type][i].layerStackIndex = layerStackIndex[i];
                        }

                        scope.options.updateLayerStackIndex(angular.copy(scope.layerLists[type]));

                        if(!scope.$$phase) scope.$digest();
                    };
                };

                var length = scope.layerTypes.length;
                for (var k=0;k<length;k++)
                {
                    var type = scope.layerTypes[k];
                    closure(type);
                }

            }
        };
    });