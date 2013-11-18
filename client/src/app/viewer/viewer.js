'use strict';

angular.module('TCWS.viewer', ['TCWS.map','TCWS.executionChain'])

    .controller('ViewerCtrl', ['$scope', '$rootScope','OpenLayersMap','$routeParams','$http','ServiceChain','ExecutionChain','$timeout','toaster',function ($scope,$rootScope, OpenLayersMap,$routeParams,$http,ServiceChain,ExecutionChain,$timeout,toaster) {
        $scope.displayMap = false;

        $http({
            url: 'http://localhost:9000/services/getMap',
            method: "GET",
            params : {mapId: $routeParams.mapId}
        }).then(function(result){
                var mapData = ExecutionChain.getMapDataFromXML(result.data);

                var executionChain = mapData.executionChain;
                var mapInfo = mapData.mapInfo;

                var length = executionChain.length;
                for (var i=0;i<length;i++)
                {
                    executionChain[i] = ExecutionChain.getConfigFromExecutionChainObject(executionChain[i]);
                }

                var layerListFilter = {
                    base : [],
                    overlay : []
                };

                length = mapInfo.layer.length;
                for (i=0;i<length;i++)
                {
                    if(mapInfo.layer[i].visibility == 'true'){
                        executionChain.push({
                            type : 'show',
                            config :
                            {
                                layerId : mapInfo.layer[i].id,
                                place : 'map',
                                type :  mapInfo.layer[i].type
                            },
                            desc : 'Show ' + mapInfo.layer[i].id + ' in Map'
                        });
                    }
                    if(mapInfo.layer[i].type == 'base') layerListFilter.base.push(mapInfo.layer[i]);
                    else layerListFilter.overlay.push(mapInfo.layer[i]);
                }

                ServiceChain.executeServiceChain(executionChain,toaster).then(function () {
                    $timeout(function() {
                        $scope.displayMap = true;
                        $timeout(function() {
                            $rootScope.$broadcast('updateMapSize');
                        },0);
                    },1500);

                    $timeout(function() {
                        $scope.$broadcast('toaster-remove-all');
                    },2500);

                });

                $scope.title = mapInfo.title;
                OpenLayersMap.setZoomAndCenter(parseFloat(mapInfo.map.zoom), [parseFloat(mapInfo.map.center.lng),parseFloat(mapInfo.map.center.lat)]);

                $rootScope.$broadcast('filterLayerList',layerListFilter);

            }, function(reason) {
                $scope.title = 'Map not found!';
            });

    }]);
