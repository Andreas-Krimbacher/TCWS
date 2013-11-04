'use strict';

angular.module('TCWS.settings', [])

    .factory('Settings', function () {
        // Service logic

        //Hardcoded Input Services

        var fileService = {files:[{layerId: 1, name: 'AUT 0', path: 'Areas/AUT/aut0.xml'},
            {layerId: 2, name: 'AUT 1', path: 'Areas/AUT/aut1.xml'},
            {layerId: 3, name: 'AUT 2', path: 'Areas/AUT/aut2.xml'},
            {layerId: 4, name: 'CH 0', path: 'Areas/CH/ch0.xml'},
            {layerId: 5, name: 'CH 1', path: 'Areas/CH/ch1.xml'},
            {layerId: 6, name: 'CH 2', path: 'Areas/CH/ch2.xml'}]}

        var inputServices = [{sourceId: 1, name: 'Hosted Data Files', desc: 'Files hosted on the Server. For free!', type : 'file' , param: fileService},
            {sourceId: 2, name: 'Wikipedia', desc: 'Wikipedia Data Crawler Service.'},
            {sourceId: 3, name: 'WFS OECD', desc: 'Data from OECD.'}]

        // Public API here
        return {
            getInputServices : function(){
                return inputServices;
            }

        }
    });