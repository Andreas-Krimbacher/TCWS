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

        var showLayerInMap = function(layerId){
            Editor.addLayerToMap(layerId);
        };

        var hideLayerInMap = function(layerId){
            Editor.removeLayerFromMap(layerId);
        };

        var showLayerInGrid = function(layerId){
            Editor.showLayerInGrid(layerId);
        };

        var removeLayer = function(layerId){
            Editor.removeLayer(layerId);
        };

        var updateLayerStackIndex = function(layerArray){
            Editor.updateLayerStackIndexFromArray(layerArray);
        };

        var saveLayerToFile = function(layerId){
            var gmlString = DataStore.getLayerAsGML(layerId);
            $http({
                url: 'http://localhost:9000/services/saveFile',
                method: "POST",
                params : {path : 'NewFile/',fileName: layerId + '.xml'},
                data: gmlString,
                headers: {'Content-Type': 'application/xml'}
            });
        };

        $scope.overlayLayerListOptions = {
            layerList : Editor.getLayerListShort(),
            hideLayerInMap : hideLayerInMap,
            showLayerInMap : showLayerInMap,
            showLayerInGrid : showLayerInGrid,
            removeLayer : removeLayer,
            updateLayerStackIndex : updateLayerStackIndex,
            saveLayerToFile : saveLayerToFile
        };



        var hideBaseLayerInMap = function(baseMapId){
            OpenLayersMap.removeBaseMap(baseMapId);
        };

        var showBaseLayerInMap = function(baseMapId){
            OpenLayersMap.setBaseMap(baseMapId);
        };

        $scope.baseLayerListOptions = {
            layerList : OpenLayersMap.getBaseMaps(),
            hideLayerInMap : hideBaseLayerInMap,
            showLayerInMap : showBaseLayerInMap,
            disableSort : true
        };

        $scope.$on('updateLayerList', function () {
            $scope.overlayLayerListOptions.layerList =  Editor.getLayerListShort();
            $scope.baseLayerListOptions.layerList = OpenLayersMap.getBaseMaps();
        });

    }])

    .controller('OverviewPublishCtrl', ['$scope','ExecutionChain','Editor','OpenLayersMap','$http',function ($scope,ExecutionChain,Editor,OpenLayersMap,$http) {
        var layerShortList = Editor.getLayerListShort();
        var baseLayerList = OpenLayersMap.getBaseMaps();

        $scope.layersSelect = [];
        $scope.visibility = {};
        $scope.layers = [];

        var layerList = [];
        var length = layerShortList.length;
        for (var i=0;i<length;i++)
        {
            layerList.push({id:layerShortList[i].id, text : layerShortList[i].name});
            if(layerShortList[i].inMap){
                $scope.layersSelect.push(layerShortList[i].id);
                $scope.layers.push(layerShortList[i]);
                $scope.visibility[layerShortList[i].id] = true;
            }
        }

        length = baseLayerList.length;
        for (i=0;i<length;i++)
        {
            layerList.push({id:baseLayerList[i].id, text : baseLayerList[i].name});
            if(baseLayerList[i].inMap){
                $scope.layersSelect.push(baseLayerList[i].id);
                $scope.layers.push(baseLayerList[i]);
                $scope.visibility[baseLayerList[i].id] = true;
            }
        }

        $scope.layerSelectOptions = {
            multiple: true,
            allowClear:true,
            data: layerList
        };


        $("#publishLayerSelect").on("change", function(e) {
            $scope.layers = [];

            var length = e.val.length;
            for (var i=0;i<length;i++)
            {
                var length2 = layerShortList.length;
                for (var k=0;k<length2;k++)
                {
                    if(layerShortList[k].id == e.val[i]){
                        $scope.layers.push(layerShortList[k]);
                        $scope.visibility[layerShortList[k].id] = true;
                    }
                }
                length2 = baseLayerList.length;
                for (k=0;k<length2;k++)
                {
                    if(baseLayerList[k].id == e.val[i]) $scope.layers.push(baseLayerList[k]);
                }
            }

            $scope.layers.sort(function(a,b) {
                var orderA;
                var orderB;

                if(a.type == 'point') orderA = 1;
                if(a.type == 'line') orderA = 2;
                if(a.type == 'polygon') orderA = 3;
                if(a.type == 'raster') orderA = 4;
                if(a.type == 'base') orderA = 5;

                if(b.type == 'point') orderB = 1;
                if(b.type == 'line') orderB = 2;
                if(b.type == 'polygon') orderB = 3;
                if(b.type == 'raster') orderB = 4;
                if(b.type == 'base') orderB = 5;


                return orderA-orderB;
            });

            $scope.$digest();
        });

        $scope.publish = function(){
            var zoomCenter = OpenLayersMap.getCenterAndZoom();

            var mapInfo = {
                title : $scope.title,
                impress : $scope.impress,
                id : $scope.title.replace(/\W|_/g,'_'),
                map : {
                    zoom : zoomCenter.zoom,
                    center : {
                        lat : zoomCenter.lat,
                        lng : zoomCenter.lng
                    }
                },
                layer : []
            };

            var executionChains = [];
            var length = $scope.layers.length;
            for (var i=0;i<length;i++)
            {
                if(!$scope.visibility[$scope.layers[i].id]) $scope.visibility[$scope.layers[i].id] = false;
                mapInfo.layer.push({id : $scope.layers[i].id, type : $scope.layers[i].type, visibility : $scope.visibility[$scope.layers[i].id]});
                if($scope.layers[i].type != 'base') executionChains.push(ExecutionChain.getExecutionChainRecursive($scope.layers[i].id));
            }

            var executionChain = ExecutionChain.mergeExecutionChains(executionChains);

            var mapXML = ExecutionChain.getMapXML(mapInfo,executionChain);


            $http({
                url: 'http://localhost:9000/services/saveMap',
                method: "POST",
                params : {fileName: mapInfo.id + '.xml'},
                data: mapXML,
                headers: {'Content-Type': 'application/xml'}
            }).then(function(){
                    $scope.url = 'http://localhost:9000/#/viewer/' + mapInfo.id;
             });



        };



    }]);