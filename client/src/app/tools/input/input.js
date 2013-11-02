/**
 * Created by nd on 11/1/13.
 */
angular.module('TCWS.tools.input', ['TCWS.dataStore'])

    .controller('InputCtrl', ['$scope','DataStore',function ($scope,DataStore) {

        $scope.hasData = false;

        $scope.getData = function(){
            DataStore.getDataFromFile('Areas/AUT/aut2.xml').then(function(){
                    $scope.hasData = true;
            },
            function(errorMessage){
                alert(errorMessage);
            });
        };

    }]);