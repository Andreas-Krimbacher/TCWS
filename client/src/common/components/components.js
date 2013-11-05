angular.module('TCWS.components', [])

// A simple directive to display a gravatar image given an email
    .directive('tcwsLayerIcon', function() {

        return {
            restrict: 'E',
            templateUrl: '/common/components/layerIcon.tpl.html',
            replace: true,
            scope: {
                type: '=type'
            }
        };
    })