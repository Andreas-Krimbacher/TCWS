/**
 * Created by nd on 11/1/13.
 */
angular.module('TCWS.tools', ['TCWS.tools.overview','TCWS.tools.input','TCWS.tools.preparation','TCWS.tools.symbology'])
    .run(function($rootScope,Editor) {
        $rootScope.startTool = 'preparation';

        var inputServices = Editor.getInputServices();

        Editor.importData({inputService: inputServices['1'], config:{layer:5}});
        Editor.importData({inputService: inputServices['1'], config:{layer:9}});
//        Editor.importData({inputService: inputServices['1'], config:{layer:3}});
//        Editor.importData({inputService: inputServices['1'], config:{layer:4}});
//        Editor.importData({inputService: inputServices['1'], config:{layer:7}});
//        Editor.importData({inputService: inputServices['1'], config:{layer:9}});

    })


.controller('ToolsCtrl', ['$scope','$rootScope',function ($scope,$rootScope) {
        $scope.currentTool = $rootScope.startTool;
        $scope.toolTemplate = '/app/tools/'+$scope.currentTool+'/'+$scope.currentTool+'.tpl.html';
        $scope.$broadcast('activateToolButton',$scope.currentTool);

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