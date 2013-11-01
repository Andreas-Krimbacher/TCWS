'use strict';

angular.module('TCWS', ['ngRoute','ngSanitize','TCWS.editor','TCWS.map'])
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

