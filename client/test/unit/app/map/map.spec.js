describe('Map module', function () {

    var openLayersMap;
    beforeEach(module('TCWS.map'));

    describe('map module service', function () {

        beforeEach(inject(function($injector) {
            openLayersMap = $injector.get('OpenLayersMap');
        }));

        it('should allow to add layers', function () {
            openLayersMap.addLayer({id:'123'});

            expect(openLayersMap.getLayers().length).toEqual(1);
        });
    });


    describe('map module controller', function () {
        var $scope;

        beforeEach(inject(function ($rootScope) {
            $scope = $rootScope.$new();
        }));




        it('should add a layer', inject(function($controller) {

            var locals = {
                $scope: $scope,
                layers: []
            };
            $controller('MapCtrl', locals);


            //verify the initial setup
            expect($scope.layers).toEqual([]);
            console.log($scope.layers);

            //execute and verify results
            $scope.addLayer('123');
            console.log($scope.layers);
            expect($scope.layers).toEqual(['123']);

        }));
    });
});
