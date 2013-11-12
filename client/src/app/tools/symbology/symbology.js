angular.module('TCWS.tools.symbology', ['TCWS.symbology'])
    .run(function($rootScope) {
        $rootScope.startSymbologyView = 'point';
    })


    .controller('SymbologyCtrl', ['$scope',function ($scope) {
        $scope.currentSymbologyView = $scope.startSymbologyView;
        $scope.symbologyView = '/app/tools/symbology/symbology_' + $scope.currentSymbologyView + '.tpl.html';

        $scope.selectSymbologyView = function(type){
            $scope.currentSymbologyView = type;
            $scope.symbologyView = '/app/tools/symbology/symbology_' + $scope.currentSymbologyView + '.tpl.html';
        };
    }])

    .controller('SymbologyPointCtrl', ['$scope','Symbology','DiaML','Editor','DataStore',function ($scope,Symbology,DiaML,Editor,DataStore) {

        var pointGroupSymbology = null;
        $scope.symbolSrc = '';

        $scope.currentStyle = null;

        var groupSymbologyList = [];
        $scope.pointSymbologyList = [];

        $scope.selectOptionsGroupSymbology = {
            allowClear:true,
            data: groupSymbologyList
        };

        $scope.selectOptionsPointSymbology = {
            allowClear:true,
            data:  $scope.pointSymbologyList
        };



        Symbology.getPointGroupSymbology().then(function(result){

            pointGroupSymbology = result;

            for (var prop in pointGroupSymbology) {
                if (pointGroupSymbology.hasOwnProperty(prop)) {
                    groupSymbologyList.push({id:pointGroupSymbology[prop].groupId, text : pointGroupSymbology[prop].groupName})
                }
            }

            $('#pointSymbology').select2({data : groupSymbologyList})
        });


        $scope.$watch('groupSymbology', function (newValue, oldValue) {
            if(newValue){

                $scope.pointSymbologyList = [];
                for (var prop in pointGroupSymbology[$scope.groupSymbology.id].symbologys) {
                    if (pointGroupSymbology[$scope.groupSymbology.id].symbologys.hasOwnProperty(prop)) {
                        $scope.pointSymbologyList.push(
                            {
                                id : prop,
                                text : pointGroupSymbology[$scope.groupSymbology.id].symbologys[prop].name
                            }
                        );
                    }
                }
                $scope.selectOptionsPointSymbology.data = $scope.pointSymbologyList;

                //Hack because options get not updated
                $('#pointSymbology').select2($scope.selectOptionsPointSymbology);
            }
            else{
                $scope.pointSymbologyList = [];
                $scope.selectOptionsPointSymbology.data = $scope.pointSymbologyList;
                $('#pointSymbology').select2($scope.selectOptionsPointSymbology);
            }
        });

        $scope.$watch('pointSymbology', function (newValue, oldValue) {
            if(newValue){
                $scope.currentStyle = pointGroupSymbology[$scope.groupSymbology.id].symbologys[$scope.pointSymbology.id];

                if($scope.currentStyle.DiaML.type == 'diagram'){
                    var diagrams = DiaML.getCanvasDiagrams($scope.currentStyle.DiaML.json, null);
                }
                $scope.symbolSrc = diagrams[0];

                $scope.columnCount = $scope.currentStyle.variableSymbology.length;
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
            data: $scope.columnList,
            multiple: true
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
                $scope.selectOptionsColumn.data = $scope.columnList;

                //Hack because options get not updated
                $('#columnInput').select2($scope.selectOptionsColumn);
            }
            else{
                $scope.columnList = [];
                $scope.selectOptionsColumn.data = $scope.columnList;
                $('#columnInput').select2($scope.selectOptionsColumn);
            }
        });

        $scope.applySymbology = function(){

            //hack, because ng-model dont work.
            var columns =  $('#columnInput').val().split(',');
            var length = columns.length;
            for (var i=0;i<length;i++)
            {
                $scope.currentStyle.variableSymbology[i].column = columns[i];
            }

            Editor.applySymbology($scope.layer.id,'point',$scope.currentStyle)
        };

    }])

    .controller('SymbologyLineCtrl', ['$scope',function ($scope) {

    }])

    .controller('SymbologyPolygonCtrl', ['$scope','DataStore','Editor','Symbology',function ($scope,DataStore,Editor,Symbology) {

        var polygonGroupSymbology = Symbology.getPolygonGroupSymbology();

        $scope.currentStyle = null;

        var groupSymbologyList = [];
        $scope.polygonSymbologyList = [];


        for (var prop in polygonGroupSymbology) {
            if (polygonGroupSymbology.hasOwnProperty(prop)) {
                groupSymbologyList.push({id:polygonGroupSymbology[prop].groupId, text : polygonGroupSymbology[prop].groupName})
            }
        }

        $scope.selectOptionsGroupSymbology = {
            allowClear:true,
            data: groupSymbologyList
        };

        $scope.selectOptionsPolygonSymbology = {
            allowClear:true,
            data: $scope.polygonSymbologyList
        };

        $scope.$watch('groupSymbology', function (newValue, oldValue) {
            if(newValue){

                $scope.polygonSymbologyList = [];
                for (var prop in polygonGroupSymbology[$scope.groupSymbology.id].symbologys) {
                    if (polygonGroupSymbology[$scope.groupSymbology.id].symbologys.hasOwnProperty(prop)) {
                        $scope.polygonSymbologyList.push(
                            {
                                id : prop,
                                text : polygonGroupSymbology[$scope.groupSymbology.id].symbologys[prop].name
                            }
                        );
                    }
                }
                $scope.selectOptionsPolygonSymbology.data = $scope.polygonSymbologyList;

                //Hack because options get not updated
                $('#polygonSymbology').select2($scope.selectOptionsPolygonSymbology);
            }
            else{
                $scope.polygonSymbologyList = [];
                $scope.selectOptionsPolygonSymbology.data = $scope.polygonSymbologyList;
                $('#polygonSymbology').select2($scope.selectOptionsPolygonSymbology);
            }
        });

        $scope.$watch('polygonSymbology', function (newValue, oldValue) {
            if(newValue){
                $scope.currentStyle = polygonGroupSymbology[$scope.groupSymbology.id].symbologys[$scope.polygonSymbology.id];
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
                $scope.selectOptionsColumn.data = $scope.columnList;

                //Hack because options get not updated
                $('#columnInput').select2($scope.selectOptionsColumn);
            }
            else{
                $scope.columnList = [];
                $scope.selectOptionsColumn.data = $scope.columnList;
                $('#columnInput').select2($scope.selectOptionsColumn);
            }
        });

        $scope.applySymbology = function(){

            $scope.currentStyle.variableSymbology[0].column = $scope.column.id;
            for (var prop in polygonGroupSymbology[$scope.groupSymbology.id].groupStyle) {
                if (polygonGroupSymbology[$scope.groupSymbology.id].groupStyle.hasOwnProperty(prop)) {

                    if(!$scope.currentStyle.style[prop]){
                        $scope.currentStyle.style[prop] = polygonGroupSymbology[$scope.groupSymbology.id].groupStyle[prop];
                    }

                }
            }

            Editor.applySymbology($scope.layer.id,'polygon',$scope.currentStyle)
        };


    }])

    .controller('SymbologyTypoCtrl', ['$scope',function ($scope) {

    }]);