'use strict';

angular.module('TCWS', ['ngRoute','ngSanitize','ngAnimate','TCWS.editor','TCWS.viewer'])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/editor', {
                templateUrl: '/app/editor/editor.tpl.html',
                controller: 'EditorCtrl'
            })
            .when('/viewer/:mapId', {
                templateUrl: '/app/viewer/viewer.tpl.html',
                controller: 'ViewerCtrl'
            })
            .otherwise({
                redirectTo: '/editor'
            });
    })
    .run(function ($location,$rootScope) {
        if($location.path().search('/viewer/') != -1) $rootScope.viewerMode = true;
        else $rootScope.viewerMode = false;
    })

    .controller('MainCtrl', ['$scope',function ($scope) {

    }]);

