angular.module('TCWS.tools.symbology', [])
    .run(function($rootScope) {
        $rootScope.startSymbologyView = 'polygon';
    })


    .controller('SymbologyCtrl', ['$scope',function ($scope) {
        $scope.currentSymbologyView = $scope.startSymbologyView;
        $scope.symbologyView = '/app/tools/symbology/symbology_' + $scope.currentSymbologyView + '.tpl.html';

        $scope.selectSymbologyView = function(type){
            $scope.currentSymbologyView = type;
            $scope.symbologyView = '/app/tools/symbology/symbology_' + $scope.currentSymbologyView + '.tpl.html';
        };
    }])

    .controller('SymbologyPointCtrl', ['$scope',function ($scope) {

    }])

    .controller('SymbologyLineCtrl', ['$scope',function ($scope) {

    }])

    .controller('SymbologyPolygonCtrl', ['$scope','DataStore','Editor',function ($scope,DataStore,Editor) {

        var colorScheme = ['#7FC97F','#BEAED4','#FDC086','#FFFF99','#386CB0'];

        var polygonStyles = {
            '1':{
                id : 1,
                name : 'Beautiful',
                subStyles : {
                    '1' : {
                        subStyleId : 1,
                        name : 'Qualitative',
                        fillColors : colorScheme
                    }
                }
            }
        };

        $scope.currentStyle = null;

        var polygonStyleList = [];
        var subStyleList = [];


        for (var prop in polygonStyles) {
            if (polygonStyles.hasOwnProperty(prop)) {
                polygonStyleList.push({id:polygonStyles[prop].id, text : polygonStyles[prop].name})
            }
        }

        $scope.selectOptionsPolygonStyle = {
            allowClear:true,
            data: polygonStyleList
        };

        $scope.selectOptionsSubStyle = {
            allowClear:true,
            data: subStyleList
        };

        $scope.$watch('polygonStyle', function (newValue, oldValue) {
            if(newValue){

                $scope.subStyleList = [];
                for (var prop in polygonStyles[$scope.polygonStyle.id].subStyles) {
                    if (polygonStyles[$scope.polygonStyle.id].subStyles.hasOwnProperty(prop)) {
                        $scope.subStyleList.push(
                            {
                                id : prop,
                                text : polygonStyles[$scope.polygonStyle.id].subStyles[prop].name
                            }
                        );
                    }
                }

                //Hack because options get not updated
                $('#symbologyPolygonSubStyle').select2({data : $scope.subStyleList})
            }
            else{
                $scope.spatialColumnList = [];
                $('#symbologyPolygonSubStyle').select2({data : []})
            }
        });

        $scope.$watch('subStyle', function (newValue, oldValue) {
            if(newValue){
                $scope.currentStyle = polygonStyles[$scope.polygonStyle.id].subStyles[$scope.subStyle.id];
            }
            else{
                $scope.currentStyle = null;
            }
        });

        //layer input

        var layerShortList = Editor.getLayerListShort();

        var layerList = [];
        $scope.columnList = [];

        var length = layerShortList.length;
        for (var i=0;i<length;i++)
        {
            layerList.push({id:layerShortList[i].id,text:layerShortList[i].name});
        }

        $scope.selectOptionsLayer = {
            allowClear:true,
            data: layerList
        };

        $scope.selectOptionsColumn = {
            allowClear:true,
            data: $scope.columnList
        };

        $scope.$watch('layer', function (newValue, oldValue) {
            if(newValue){
                $scope.layerData = DataStore.getLayer(newValue.id);

                $scope.columnList = [];
                for (var prop in $scope.layerData.labels) {
                    if ($scope.layerData.labels.hasOwnProperty(prop)) {
                        $scope.columnList.push({id:prop,text:$scope.layerData.labels[prop]});
                    }
                }

                //Hack because options get not updated
                $('#columnInput').select2({data : $scope.columnList})
            }
            else{
                $scope.columnList = [];
                $('#columnInput').select2({data : []})
            }
        });

        $scope.applySymbology = function(){
            Editor.applySymbology()
        };


    }])

    .controller('SymbologyTypoCtrl', ['$scope',function ($scope) {

    }]);