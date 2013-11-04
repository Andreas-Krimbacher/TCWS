/**
 * Created by nd on 11/1/13.
 */
angular.module('TCWS.tools.input', ['TCWS.dataStore','TCWS.settings','ui.select2'])
    .controller('InputCtrl', ['$scope','Settings',function ($scope,Settings) {

        $scope.inputServices = Settings.getInputServices();
        $scope.currentInputService = null;

        $scope.setInputService = function(input){
            $scope.currentInputService = input;
            $scope.inputParam = input.param;
            $scope.inputParamView = '/app/tools/input/paramView_' + input.type + '.tpl.html';
        };

    }])

    .controller('FileParamCtrl', ['$scope','DataStore',function ($scope,DataStore) {
        $scope.importFiles = function(){

            //hack, because ng-model dont work.
            var downloadFiles = $('#fileParamSelect').val().split(',');

            var length = downloadFiles.length;
            for (var i=0;i<length;i++)
            {
                var param = {
                    sourceId : $scope.currentInputService.sourceId,
                    layerId : $scope.inputParam.files[downloadFiles[i]].layerId,
                    name : $scope.inputParam.files[downloadFiles[i]].name,
                    path : $scope.inputParam.files[downloadFiles[i]].path
                };

                DataStore.getDataFromFile(param).then(function(){
                        $scope.hasData = true;
                    },
                    function(errorMessage){
                        alert(errorMessage);
                    });
            }

        };

        var files = [];
        var length = $scope.inputParam.files.length;
        for (var i=0;i<length;i++)
        {
            files.push({id:i,
                text:$scope.inputParam.files[i].name})
        }

        $scope.selectOptions = {
            multiple: true,
            allowClear:true,
            data: files
        }

    }]);

