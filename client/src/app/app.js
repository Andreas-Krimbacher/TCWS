'use strict';

angular.module('TCWS', ['ngRoute','ngSanitize','ngAnimate','TCWS.editor'])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/editor', {
        templateUrl: '/app/editor/editor.tpl.html',
        controller: 'EditorCtrl'
      })
      .otherwise({
        redirectTo: '/editor'
      });
  })

.controller('MainCtrl', ['$scope',function ($scope) {

}]);

