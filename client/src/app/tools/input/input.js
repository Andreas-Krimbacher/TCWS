/**
 * Created by nd on 11/1/13.
 */
angular.module('TCWS.tools.input', ['TCWS.dataStore','TCWS.settings','ui.select2'])
    .run(function($rootScope) {
        $rootScope.startInputService = 1;
    })


    .controller('InputCtrl', ['$scope','Editor',function ($scope,Editor) {

        $scope.inputServices = Editor.getInputServices();
        $scope.currentInputService = $scope.inputServices[$scope.startInputService];
        $scope.inputParamView = '/app/tools/input/paramView_' + $scope.currentInputService.type + '.tpl.html';
        $scope.inputParam = $scope.currentInputService.param;

        $scope.setInputService = function(input){
            $scope.currentInputService = input;
            $scope.inputParam = input.param;
            $scope.inputParamView = '/app/tools/input/paramView_' + input.type + '.tpl.html';
        };

    }])

    .controller('FileParamCtrl', ['$scope','Editor',function ($scope,Editor) {
        $scope.importFiles = function(){

            //hack, because ng-model dont work.
            var downloadFiles = $('#fileParamSelect').val().split(',');

            var length = downloadFiles.length;
            for (var i=0;i<length;i++)
            {
                var param = {
                    inputService : $scope.currentInputService,
                    config : {
                        layer: $scope.inputParam.files[downloadFiles[i]].layerId
                    }
                };

                Editor.importData(param).then(function(){
                        $scope.hasData = true;
                    },
                    function(errorMessage){
                        alert(errorMessage);
                    });
            }

        };

        var files = [];
        for (var prop in $scope.inputParam.files) {
            if ($scope.inputParam.files.hasOwnProperty(prop)) {
                files.push({id:prop,
                    text:$scope.inputParam.files[prop].name})
            }
        }

        $scope.selectOptions = {
            multiple: true,
            allowClear:true,
            data: files
        }

    }]);

