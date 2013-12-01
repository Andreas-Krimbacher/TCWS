'use strict';

angular.module('TCWS.descriptionService', [])

    .factory('DescriptionService', function () {
        // Service logic

        //Input Services ################################################################################################


        var paramOECD = {dimensionConfig :
        {
            "country" : 0,
            "year" : 0,
            "age" : 'v',
            "concept" : 0,
            "sex" : 'h'
        },
            datasetNumber : 1
        };

        var usgsp = {dimensionConfig :
        {
            "year" : 0,
            "state" : 'v',
            "concept" : 'h'
        },
            datasetNumber : 0
        };

        var swiss = {dimensionConfig :
        {
            "year" : 0,
            "area" : 'v',
            "concept" : 'h'
        },
            datasetNumber : 0
        };

        var fileService_spatial = {files: {'1' : {layerId: 1, type: 'polygon', name: 'AUT 0', path: 'Areas/AUT/aut0.xml', fileType: 'GML'},
            '2' : {layerId: 2, type: 'polygon', name: 'AUT 1', path: 'Areas/AUT/aut1.xml', fileType: 'GML'},
            '3' : {layerId: 3, type: 'polygon', name: 'AUT 2', path: 'Areas/AUT/aut2.xml', fileType: 'GML'},
            '4' : {layerId: 4, type: 'polygon', name: 'CH 0', path: 'Areas/CH/ch0.xml', fileType: 'GML'},
            '5' : {layerId: 5, type: 'polygon', name: 'CH 1', path: 'Areas/CH/ch1.xml', fileType: 'GML'},
            '6' : {layerId: 6, type: 'polygon', name: 'CH 2', path: 'Areas/CH/ch2.xml', fileType: 'GML'},
            '10' : {layerId: 10, type: 'polygon', name: 'Swiss Districts', path: 'Areas/Swiss/district.xml', fileType: 'GML'},
            '12' : {layerId: 12, type: 'polygon', name: 'Swiss Cantons Polygon', path: 'Areas/Swiss/canton_nolake.xml', fileType: 'GML-OGR'}}};

        var fileService_attribute = {files: {'8' : {layerId: 8, type: 'attribute', name: 'oecd-canada', path: 'Attribute/oecd-canada.json', fileType: 'JSON-stat', param : paramOECD},
            '7' : {layerId: 7, type: 'attribute', name: 'us gsp', path: 'Attribute/us-gsp.json', fileType: 'JSON-stat', param : usgsp},
            '9' : {layerId: 9, type: 'attribute', name: 'Switzerland Pop Kant', path: 'Attribute/swiss_pop_cant_2012.json', fileType: 'JSON-stat', param : swiss},
            '11' : {layerId: 11, type: 'attribute', name: 'Swiss Pop Dist', path: 'Attribute/swiss_pop_dist_2012.csv', fileType: 'CSV'},
            '13' : {layerId: 13, type: 'attribute', name: 'Pop Cantons 2010,2011', path: 'Attribute/pop_swiss_2010_2011.csv', fileType: 'CSV'},
            '14' : {layerId: 14, type: 'attribute', name: 'Study Cantons 2010,2011', path: 'Attribute/study_swiss_2010_2011.csv', fileType: 'CSV'}}};

        var inputServices = { 'local_spatial' : {sourceId: 'local_spatial', name: 'Hosted Data Files', desc: 'Spatial Data', type : 'local' , param: fileService_spatial},
            'local_attribute' : {sourceId: 'local_attribute', name: 'Hosted Data Files', desc: 'Statistic Data', type : 'local' , param: fileService_attribute},
            'x3' : {sourceId: 'x3', name: 'Wikipedia', desc: 'Wikipedia Data Crawler Service.'},
            'x4' : {sourceId: 'x4', name: 'WFS OECD', desc: 'Data from OECD.'}};


        //Processing Services ################################################################################################

        var area =
        {
            methodId : '1',
            method : 'area',
            methodName : 'Calculate Area',
            methodGroup : 'measure',
            methodGroupName : 'Measure',
            requestParam :
            {
                methodGroup : 'measure',
                method : 'area'
            },
            resultInfo :
            {
                type : 'update'
            }
        };

        var centroid =
        {
            methodId : '1',
            method : 'centroid',
            methodName : 'Calculate Centroid',
            methodGroup : 'analyzeGeometry',
            methodGroupName : 'Analyze geometry',
            requestParam :
            {
                methodGroup : 'analyzeGeometry',
                method : 'centroid'
            },
            resultInfo :
            {
                type : 'new'
            }
        };

        var sas =
        {
            type : 'sas',
            serviceId : '1',
            name: 'Spatial Analysis Service',
            url : 'http://localhost:9000/services/SAS',
            methods :
            {
                '1' : area,
                '2' : centroid
            }
        };

        var classifyQuantile =
        {
            methodId : '1',
            method : 'quantile',
            methodName : 'Quantile Classification',
            methodGroup : 'classify',
            methodGroupName : 'Classify',
            requestParam :
            {
                methodGroup : 'classify',
                method : 'quantile',
                column : null,
                classCount : null
            },
            resultInfo :
            {
                type : 'update'
            }
        };

        var ccs =
        {
            type : 'ccs',
            serviceId : '2',
            name: 'Classify and Cluster Service',
            url : 'http://localhost:9000/services/CCS',
            methods :
            {
                '1' : classifyQuantile
            }
        };

        var dotMap =
        {
            methodId : '1',
            method : 'dotFromArea',
            methodName : 'Dot Map From Area',
            methodGroup : 'dotMap',
            methodGroupName : 'Dot Maps',
            requestParam :
            {
                methodGroup : 'dotMap',
                method : 'dotFromArea',
                attribute : null,
                keepAttribute : null,
                dotValue : null,
                dotDistance : null
            },
            resultInfo :
            {
                type : 'new'
            }
        };

        var cts =
        {
            type : 'cts',
            serviceId : '3',
            name: 'Cartographic Technique Service',
            url : 'http://localhost:9000/services/CTS',
            methods :
            {
                '1' : dotMap
            }
        };

        var processingServices = {'1' : sas, '2': ccs, '3': cts} ;


        //Symbology Repositories ################################################################################################

        var fileRepository = {
            variableStyle:
            {
                '1' : {
                    groupId: 1, groupName: 'Qualitative Color Scheme', path: 'Symbology/variableStyle1.json', fileType: 'JSON'
                }
            },
            pointSymbologys:
            {
                '1' : {
                    groupId: 1, groupName: 'Pie Charts', path: 'Symbology/point1.json', fileType: 'JSON'
                },
                '2' : {
                    groupId: 2, groupName: 'Dot Maps', path: 'Symbology/point2.json', fileType: 'JSON'
                }
            },
            polygonSymbologys:
            {
                '1' : {
                    groupId: 1, groupName: 'ColorBrewer', path: 'Symbology/polygon1.json', fileType: 'JSON'
                },
                '2' : {
                    groupId: 2, groupName: 'Simple Styles', path: 'Symbology/polygon2.json', fileType: 'JSON'
                }
            }
        };

        var symbologyRepositories = {
            'local' : {
                sourceId: 1, name: 'Hosted Symbology Files', desc: 'Symbology hosted on the Server. For free!', type : 'local' , param: fileRepository
            }
        };

        // Public API here
        return {
            getSymbologyRepositories : function(){
                return symbologyRepositories;
            },
            getInputServices : function(){
                return inputServices;
            },
            getProcessingServices : function(){
                return processingServices;
            }
        }
    });