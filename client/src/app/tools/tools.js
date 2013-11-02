/**
 * Created by nd on 11/1/13.
 */
angular.module('TCWS.tools', ['TCWS.tools.overview','TCWS.tools.input','TCWS.tools.preperation','TCWS.tools.symbology'])

    .controller('ToolsCtrl', ['$scope',function ($scope) {
        $scope.currentTool = 'overview';
        $scope.toolTemplate = '/app/tools/overview/overview.tpl.html';
        $scope.$broadcast('activateToolButton','overview');

        $scope.$on('setTool', function (event, toolName) {
            $scope.toolTemplate = '/app/tools/'+toolName+'/'+toolName+'.tpl.html';
            $scope.currentTool = toolName;
            $scope.$broadcast('activateToolButton',toolName);
        });

    }])

    .controller('NavbarCtrl', ['$scope',function ($scope) {
        $scope.currentTool = $scope.$parent.currentTool;

        $scope.$on('activateToolButton', function (event, toolName) {
            $scope.currentTool = toolName;
        });

        $scope.setCurrentTool = function(toolName){
            $scope.$emit('setTool', toolName);
        };
    }]);