/* copyright: olaf schnabel, eth zurich, 2004-2006 */

// global variables
var xlinkNS = "http://www.w3.org/1999/xlink";
var svgNS = "http://www.w3.org/2000/svg";
var msbNS = "http://www.carto.net/schnabel/mapsymbolbrewer";
var attribNS = "http://www.carto.net/schnabel";

var loadedData;
var sumData;
var sortedData;
var dataInfo;

var mapInfo;
var diamlInfo;
var scaleFactor;

var primitive;
var primitiveAttr;
var primitiveParameters;
var currentPrimitive;
var currPrim = 'false';

var arrangement;

var relation;

var styles;

// define styles for gui elements
var sliderStyles={"stroke":"lightsteelblue","stroke-width":5};
var tooltipTextStyles = {"font-family":"Arial,Helvetica","fill":"#688199","font-size":10,"text-rendering":"optimizeLegibility"};
var tooltipRectStyles = {"fill":"aliceblue","stroke":"#688199","stroke-width":1,"shape-rendering":"optimizeSpeed"};
var buttonTextStyles = {"font-family":"Arial,Helvetica","fill":"#333","font-size":10,"font-weight":"normal"};
var colorButtonTextStyles = {"font-family":"Arial,Helvetica","fill":"lavender","font-size":10,"font-weight":"normal"};
var buttonStyles = {"fill":"lightsteelblue","rx":5,"ry":5};
var buttonLightStyles = {"fill":"white","rx":5,"ry":5};
var buttonDarkStyles = {"fill":"#333","rx":5,"ry":5};
var cbTextStyles = {"font-family":"Arial,Helvetica","font-size":10,"font-weight":"normal","fill":"lavender","pointer-events":"none"};
var slBoxStyles = {"fill":"lightsteelblue","stroke":"lavender","rx":5,"ry":5};
var slScrollbarStyles = {};
var slSmallRectStyles = {"fill":"lightsteelblue","stroke":"lavender"};
var slHighlightStyles = {"fill":"aliceblue"};
var slTriangleStyles = {"fill":"lavender","stroke":"#666"};
var textboxStyles = {"fill":"lightsteelblue","stroke":"aliceblue","rx":5,"ry":5};
var textboxCursorStyles = {"stroke":"steelblue","stroke-width":1.5};
var textboxSelectStyles = {"fill":"steelblue","opacity":0.5};
var cpBgStyles = {"fill":"lightsteelblue"};

// for polar
var startAngle;
var directionAngle;
var distance;
var groupStartAngle;
var groupDirectionAngle;
var groupDistance;

// generated SVG geometry
var pathAttribute;

// for colors
var clickedColorButton;

// necessary for all gui elements
var myMapApp = new mapApp(false,undefined);

// necessary for map loading and export
var docurl = document.URL;
var splittedUrl=docurl.split('&');
// get sessionid from url
for (var i=0;i<splittedUrl.length;i++)
{
    var sessionidpos = splittedUrl[i].search(/sessionid=.+/);
    if (sessionidpos != -1) {var sessionid = splittedUrl[i].slice(sessionidpos+10,splittedUrl[i].length);break;}
}
// get uploadtype from url
for (var i=0;i<splittedUrl.length;i++)
{
    var uploadurl = splittedUrl[i].search(/uploadtype=.+/);
    if (uploadurl != -1) {var uploadtype = splittedUrl[i].slice(11,splittedUrl[i].length);break;}
}

// initialize function
function init()
{
    // initialize tooltip
    myMapApp.initTooltips("toolTip",tooltipTextStyles,tooltipRectStyles,10,20,3);
    // load data, mapinfo and diaml files and calc statistics
    // if testdata, load background map
    loadData();

    // save buttons in mapApp
    myMapApp.buttons = new Array();
    // save selectionlists in mapApp
    myMapApp.sl = new Array();
    // save textboxes in mapApp
    myMapApp.tb = new Array();
    // save colorpicker in mapApp
    myMapApp.cp = new Array();
    // save checkboxes in mapApp
    myMapApp.cb = new Array();
    // save radiobuttons in mapApp
    myMapApp.rb = new Array();
    // save sliders in mapApp
    myMapApp.slider = new Array();

    // load general gui elements
    myMapApp.buttons["aboutButton"] = new button('aboutButton','aboutButton',undefined,'rect','i',undefined,900,50,20,20,buttonTextStyles,buttonStyles,buttonLightStyles,buttonDarkStyles,1);
    myMapApp.buttons["helpButton"] = new button('helpButton','helpButton',undefined,'rect','?',undefined,930,50,20,20,buttonTextStyles,buttonStyles,buttonLightStyles,buttonDarkStyles,1);
    myMapApp.buttons["uploadButton"] = new button('uploadButton','uploadButton',undefined,'rect','','uploadSymbol',650,50,20,20,buttonTextStyles,buttonStyles,buttonLightStyles,buttonDarkStyles,1);
    myMapApp.buttons["diamlButton"] = new switchbutton('diamlButton','diamlButton',setDiamlButton,'rect','','diamlSymbol',710,50,20,20,buttonTextStyles,buttonStyles,buttonLightStyles,buttonDarkStyles,1);
    myMapApp.buttons["diamlButton"].setSwitchValue('on',false);
    myMapApp.buttons["exportButton"] = new switchbutton('exportButton','exportButton',activateExport,'rect','','exportSymbol',770,50,20,20,buttonTextStyles,buttonStyles,buttonLightStyles,buttonDarkStyles,1);

    // load gui elements for step 1
    myMapApp.buttons["simpleSymbol"] = new button('simpleSymbol','simpleSymbol',chooseSymbolType,'rect','Simple Symbol',undefined,0,110,100,20,buttonTextStyles,buttonStyles,buttonLightStyles,buttonDarkStyles,1);
    myMapApp.buttons["diagram"] = new button('diagram','diagram',chooseSymbolType,'rect','Diagram',undefined,120,110,100,20,buttonTextStyles,buttonStyles,buttonLightStyles,buttonDarkStyles,1);

    // load gui elements for step 2
    myMapApp.buttons["circle"] = new button('circle','circle',choosePrimitive,'rect',undefined,'circleSymbol',0,110,20,20,buttonTextStyles,buttonStyles,buttonLightStyles,buttonDarkStyles,1);
    myMapApp.buttons["ellipse"] = new button('ellipse','ellipse',choosePrimitive,'rect',undefined,'ellipseSymbol',25,110,20,20,buttonTextStyles,buttonStyles,buttonLightStyles,buttonDarkStyles,1);
    myMapApp.buttons["rectangle"] = new button('rectangle','rectangle',choosePrimitive,'rect',undefined,'rectSymbol',50,110,20,20,buttonTextStyles,buttonStyles,buttonLightStyles,buttonDarkStyles,1);
    myMapApp.buttons["regularPolygon"] = new button('regularPolygon','regularPolygon',choosePrimitive,'rect',undefined,'regPolySymbol',75,110,20,20,buttonTextStyles,buttonStyles,buttonLightStyles,buttonDarkStyles,1);
    myMapApp.buttons["sector"] = new button('sector','sector',choosePrimitive,'rect',undefined,'sectorSymbol',100,110,20,20,buttonTextStyles,buttonStyles,buttonLightStyles,buttonDarkStyles,1);
    myMapApp.buttons["ringSector"] = new button('ringSector','ringSector',choosePrimitive,'rect',undefined,'ringSectorSymbol',125,110,20,20,buttonTextStyles,buttonStyles,buttonLightStyles,buttonDarkStyles,1);
    myMapApp.buttons["ring"] = new button('ring','ring',choosePrimitive,'rect',undefined,'ringSymbol',150,110,20,20,buttonTextStyles,buttonStyles,buttonLightStyles,buttonDarkStyles,1);
    myMapApp.buttons["polyline"] = new button('polyline','polyline',choosePrimitive,'rect',undefined,'polylineSymbol',175,110,20,20,buttonTextStyles,buttonStyles,buttonLightStyles,buttonDarkStyles,1);
    myMapApp.buttons["curve"] = new button('curve','curve',choosePrimitive,'rect',undefined,'curveSymbol',200,110,20,20,buttonTextStyles,buttonStyles,buttonLightStyles,buttonDarkStyles,1);
    myMapApp.buttons["point"] = new button('point','point',choosePrimitive,'rect',undefined,'pointSymbol',225,110,20,20,buttonTextStyles,buttonStyles,buttonLightStyles,buttonDarkStyles,1);

// primitive "ringSector" gui elements
    var ringSectorAngleScaleArray = new Array("fixed","dataValue");
    myMapApp.sl["ringSectorAngleScale"] = new selectionList('ringSectorAngleScale','ringSectorAngleScale',ringSectorAngleScaleArray,100,80,195,16,5,2,buttonTextStyles,slBoxStyles,slScrollbarStyles,slSmallRectStyles,slHighlightStyles,slTriangleStyles,1,false,true,ringSectorAngleScaleFunction);
    var ringSectorRadiusScaleArray = new Array("fixed","dataValue","totalSum");
    myMapApp.sl["ringSectorRadiusScale"] = new selectionList('ringSectorRadiusScale','ringSectorRadiusScale',ringSectorRadiusScaleArray,100,80,255,16,5,3,buttonTextStyles,slBoxStyles,slScrollbarStyles,slSmallRectStyles,slHighlightStyles,slTriangleStyles,2,undefined,1,ringSectorRadiusScaleFunction);
    myMapApp.slider["ringSectorAngleValueSlider"] = new slider("ringSectorAngleValueSlider","ringSectorAngleValueSlider",80,232,1,160,232,359,45,sliderStyles,20,"sliderSymbol",setTextbox,true);
    myMapApp.tb["ringSectorAngleValueTextbox"] = new nrTextbox("ringSectorAngleValueTextbox","ringSectorAngleValueTextbox",45,1,359,170,223,25,16,12,buttonTextStyles,textboxStyles,textboxCursorStyles,textboxSelectStyles,setSlider);
    myMapApp.slider["ringSectorRadiusValueSlider"] = new slider("ringSectorRadiusValueSlider","ringSectorRadiusValueSlider",80,292,1,160,292,100,20,sliderStyles,20,"sliderSymbol",setTextbox,true);
    myMapApp.tb["ringSectorRadiusValueTextbox"] = new nrTextbox("ringSectorRadiusValueTextbox","ringSectorRadiusValueTextbox",20,1,100,170,283,25,16,12,buttonTextStyles,textboxStyles,textboxCursorStyles,textboxSelectStyles,setSlider);
    myMapApp.slider["ringSectorInnerRadiusSlider"] = new slider("ringSectorInnerRadiusSlider","ringSectorInnerRadiusSlider",80,322,1,160,322,100,50,sliderStyles,20,"sliderSymbol",setTextbox,true);
    myMapApp.tb["ringSectorInnerRadiusTextbox"] = new nrTextbox("ringSectorInnerRadiusTextbox","ringSectorInnerRadiusTextbox",50,1,100,170,313,25,16,12,buttonTextStyles,textboxStyles,textboxCursorStyles,textboxSelectStyles,setSlider);

// primitive "regularPolygon" gui elements
    myMapApp.slider["regularPolygonEdgeNrSlider"] = new slider("regularPolygonEdgeNrSlider","regularPolygonEdgeNrSlider",80,202,3,160,202,12,3,sliderStyles,20,"sliderSymbol",setTextbox,true);
    myMapApp.tb["regularPolygonEdgeNrTextbox"] = new nrTextbox("regularPolygonEdgeNrTextbox","regularPolygonEdgeNrTextbox",3,3,12,170,193,25,16,12,buttonTextStyles,textboxStyles,textboxCursorStyles,textboxSelectStyles,setSlider);
    myMapApp.slider["regularPolygonInnerRadiusSlider"] = new slider("regularPolygonInnerRadiusSlider","regularPolygonInnerRadiusSlider",80,232,1,160,232,100,100,sliderStyles,20,"sliderSymbol",setTextbox,true);
    myMapApp.tb["regularPolygonInnerRadiusTextbox"] = new nrTextbox("regularPolygonInnerRadiusTextbox","regularPolygonInnerRadiusTextbox",100,1,100,170,223,25,16,12,buttonTextStyles,textboxStyles,textboxCursorStyles,textboxSelectStyles,setSlider);

// primitive "ring" gui elements
    myMapApp.slider["ringInnerRadiusSlider"] = new slider("ringInnerRadiusSlider","ringInnerRadiusSlider",80,202,1,160,202,100,50,sliderStyles,20,"sliderSymbol",setTextbox,true);
    myMapApp.tb["ringInnerRadiusTextbox"] = new nrTextbox("ringInnerRadiusTextbox","ringInnerRadiusTextbox",50,1,100,170,193,25,16,12,buttonTextStyles,textboxStyles,textboxCursorStyles,textboxSelectStyles,setSlider);

// primitive "sector" gui elements
    var sectorAngleScaleArray = new Array("fixed","dataValue");
    myMapApp.sl["sectorAngleScale"] = new selectionList('sectorAngleScale','sectorAngleScale',sectorAngleScaleArray,100,80,195,16,5,2,buttonTextStyles,slBoxStyles,slScrollbarStyles,slSmallRectStyles,slHighlightStyles,slTriangleStyles,1,false,true,sectorAngleScaleFunction);
    var sectorRadiusScaleArray = new Array("fixed","dataValue","totalSum");
    myMapApp.sl["sectorRadiusScale"] = new selectionList('sectorRadiusScale','sectorRadiusScale',sectorRadiusScaleArray,100,80,275,16,5,3,buttonTextStyles,slBoxStyles,slScrollbarStyles,slSmallRectStyles,slHighlightStyles,slTriangleStyles,2,undefined,1,sectorRadiusScaleFunction);
    myMapApp.slider["sectorAngleValueSlider"] = new slider("sectorAngleValueSlider","sectorAngleValueSlider",80,232,1,160,232,359,45,sliderStyles,20,"sliderSymbol",setTextbox,true);
    myMapApp.tb["sectorAngleValueTextbox"] = new nrTextbox("sectorAngleValueTextbox","sectorAngleValueTextbox",45,1,359,170,223,25,16,12,buttonTextStyles,textboxStyles,textboxCursorStyles,textboxSelectStyles,setSlider);
    myMapApp.slider["sectorRadiusValueSlider"] = new slider("sectorRadiusValueSlider","sectorRadiusValueSlider",80,312,1,160,312,100,20,sliderStyles,20,"sliderSymbol",setTextbox,true);
    myMapApp.tb["sectorRadiusValueTextbox"] = new nrTextbox("sectorRadiusValueTextbox","sectorRadiusValueTextbox",20,1,100,170,303,25,16,12,buttonTextStyles,textboxStyles,textboxCursorStyles,textboxSelectStyles,setSlider);

// general simple symbol gui elements
    myMapApp.slider["primRotationSlider"] = new slider("primRotationSlider","primRotationSlider",80,362,-359,160,362,359,0,sliderStyles,20,"sliderSymbol",setTextbox,true);
    myMapApp.tb["primRotationTextbox"] = new nrTextbox("primRotationTextbox","primRotationTextbox",0,-359,359,170,353,25,16,12,buttonTextStyles,textboxStyles,textboxCursorStyles,textboxSelectStyles,setSlider);

    myMapApp.slider["primTranslationXSlider"] = new slider("primTranslationXSlider","primTranslationXSlider",80,392,-100,160,392,100,0,sliderStyles,20,"sliderSymbol",setTextbox,true);
    myMapApp.tb["primTranslationXTextbox"] = new nrTextbox("primTranslationXTextbox","primTranslationXTextbox",0,-100,100,170,383,25,16,12,buttonTextStyles,textboxStyles,textboxCursorStyles,textboxSelectStyles,setSlider);

    myMapApp.slider["primTranslationYSlider"] = new slider("primTranslationYSlider","primTranslationYSlider",80,422,-100,160,422,100,0,sliderStyles,20,"sliderSymbol",setTextbox,true);
    myMapApp.tb["primTranslationYTextbox"] = new nrTextbox("primTranslationYTextbox","primTranslationYTextbox",0,-100,100,170,413,25,16,12,buttonTextStyles,textboxStyles,textboxCursorStyles,textboxSelectStyles,setSlider);

    myMapApp.cb["primTranslationY"] = new checkBox('primTranslationY','primTranslationYCheckbox',225,392,"checkBoxRect","checkBoxCross",true,"prop.",cbTextStyles,10,5,undefined,showPropMenu);

    myMapApp.buttons["nextPrimitive"] = new button('nextPrimitive','nextPrimitive',nextMenu,'rect','Apply settings & \nadd an additional primitive',undefined,20,460,200,27,buttonTextStyles,buttonStyles,buttonLightStyles,buttonDarkStyles,1);
    myMapApp.buttons["nextMenuStep2"] = new button('nextMenuStep2','nextMenuStep2',nextMenu,'rect','Apply settings & go to next step',undefined,20,500,200,20,buttonTextStyles,buttonStyles,buttonLightStyles,buttonDarkStyles,1);

    // load gui elements for step 3
    myMapApp.buttons["centered"] = new button('centered','centered',chooseArrangement,'rect',undefined,'centeredSymbol',0,110,20,20,buttonTextStyles,buttonStyles,buttonLightStyles,buttonDarkStyles,1);
    myMapApp.buttons["grid"] = new button('grid','grid',chooseArrangement,'rect',undefined,'gridSymbol',25,110,20,20,buttonTextStyles,buttonStyles,buttonLightStyles,buttonDarkStyles,1);
    myMapApp.buttons["polar"] = new button('polar','polar',chooseArrangement,'rect',undefined,'polarSymbol',50,110,20,20,buttonTextStyles,buttonStyles,buttonLightStyles,buttonDarkStyles,1);
    myMapApp.buttons["linear"] = new button('linear','linear',chooseArrangement,'rect',undefined,'linearSymbol',75,110,20,20,buttonTextStyles,buttonStyles,buttonLightStyles,buttonDarkStyles,1);
    myMapApp.buttons["perpendicular"] = new button('perpendicular','perpendicular',chooseArrangement,'rect',undefined,'perpendicularSymbol',100,110,20,20,buttonTextStyles,buttonStyles,buttonLightStyles,buttonDarkStyles,1);
    myMapApp.buttons["triangular"] = new button('triangular','triangular',chooseArrangement,'rect',undefined,'triangularSymbol',125,110,20,20,buttonTextStyles,buttonStyles,buttonLightStyles,buttonDarkStyles,1);

    myMapApp.slider["polarGroupsSlider"] = new slider("polarGroupsSlider","polarGroupsSlider",80,197,1,160,197,20,1,sliderStyles,20,"sliderSymbol",setTextbox,true);
    myMapApp.tb["polarGroupsTextbox"] = new nrTextbox("polarGroupsTextbox","polarGroupsTextbox",1,1,20,170,188,25,16,12,buttonTextStyles,textboxStyles,textboxCursorStyles,textboxSelectStyles,setSlider);
    myMapApp.slider["polarTotalAngleSlider"] = new slider("polarTotalAngleSlider","polarTotalAngleSlider",80,227,1,160,227,360,360,sliderStyles,20,"sliderSymbol",setTextbox,true);
    myMapApp.tb["polarTotalAngleTextbox"] = new nrTextbox("polarTotalAngleTextbox","polarTotalAngleTextbox",360,1,360,170,218,25,16,12,buttonTextStyles,textboxStyles,textboxCursorStyles,textboxSelectStyles,setSlider);
    myMapApp.slider["polarCenterDistanceSlider"] = new slider("polarCenterDistanceSlider","polarCenterDistanceSlider",80,257,0,160,257,20,0,sliderStyles,20,"sliderSymbol",setTextbox,true);
    myMapApp.tb["polarCenterDistanceTextbox"] = new nrTextbox("polarCenterDistanceTextbox","polarCenterDistanceTextbox",0,0,20,170,248,25,16,12,buttonTextStyles,textboxStyles,textboxCursorStyles,textboxSelectStyles,setSlider);

    myMapApp.slider["rotationSlider"] = new slider("rotationSlider","rotationSlider",80,417,-359,160,417,359,0,sliderStyles,20,"sliderSymbol",setTextbox,true);
    myMapApp.tb["rotationTextbox"] = new nrTextbox("rotationTextbox","rotationTextbox",0,-359,359,170,408,25,16,12,buttonTextStyles,textboxStyles,textboxCursorStyles,textboxSelectStyles,setSlider);

    myMapApp.slider["translationXSlider"] = new slider("translationXSlider","translationXSlider",80,447,-100,160,447,100,0,sliderStyles,20,"sliderSymbol",setTextbox,true);
    myMapApp.tb["translationXTextbox"] = new nrTextbox("translationXTextbox","translationXTextbox",0,-100,100,170,438,25,16,12,buttonTextStyles,textboxStyles,textboxCursorStyles,textboxSelectStyles,setSlider);

    myMapApp.slider["translationYSlider"] = new slider("translationYSlider","translationYSlider",80,477,-100,160,477,100,0,sliderStyles,20,"sliderSymbol",setTextbox,true);
    myMapApp.tb["translationYTextbox"] = new nrTextbox("translationYTextbox","translationYTextbox",0,-100,100,170,468,25,16,12,buttonTextStyles,textboxStyles,textboxCursorStyles,textboxSelectStyles,setSlider);

    myMapApp.cb["translationY"] = new checkBox('translationY','translationYCheckbox',225,447,"checkBoxRect","checkBoxCross",true,"prop.",cbTextStyles,10,5,undefined,showPropMenu);

    myMapApp.buttons["nextMenuStep3"] = new button('nextMenuStep3','nextMenuStep3',nextMenu,'rect','Apply settings & go to next step',undefined,20,500,200,20,buttonTextStyles,buttonStyles,buttonLightStyles,buttonDarkStyles,1);

    // load gui elements for step 4
    myMapApp.cp["colorPicker"] = new colourPicker('colorPicker','colorPicker',0,200,250,120,cpBgStyles,buttonTextStyles,"sliderSymbol",true,true,true,true,true,true,0,360,20,"139,0,0,0.8","255,255,255,1",undefined);
    myMapApp.buttons["cpButton"] = new button('cpButton','cpButton',chooseColor,'rect','OK',undefined,210,299,25,16,buttonTextStyles,buttonStyles,buttonLightStyles,buttonDarkStyles,1);

    myMapApp.buttons["nextMenuStep4"] = new button('nextMenuStep4','nextMenuStep4',nextMenu,'rect','Apply settings & go to next step',undefined,20,500,200,20,buttonTextStyles,buttonStyles,buttonLightStyles,buttonDarkStyles,1);

    // load gui elements for step 5
    myMapApp.rb["radioInteractivity"] = new radioButtonGroup("radioInteractivity",addInteract);
    myMapApp.cb["nointeract"] = new checkBox('no','interact',5,360,"radioBorder","radioPoint",true,"none",cbTextStyles,12,5,myMapApp.rb["radioInteractivity"],undefined);
    myMapApp.cb["interact"] = new checkBox('yes','interact',5,380,"radioBorder","radioPoint",false,"show data on mouse over",cbTextStyles,12,5,myMapApp.rb["radioInteractivity"],undefined);

    myMapApp.buttons["nextMenuStep5"] = new button('nextMenuStep5','nextMenuStep5',nextMenu,'rect','Apply settings & go to "Map Export" menu',undefined,20,500,200,20,buttonTextStyles,buttonStyles,buttonLightStyles,buttonDarkStyles,1);

    // load gui elements for step 6

// after loading of the gui elements, deactive export button
    initLater();
}

// load data, map info, diaml file and background map (if testdata)
function loadData()
{
    var getDataXML = new getXMLData(datafile,callbackData);
    getDataXML.getData();
    // load map info data in callbackData function
    // load diaml data in callbackMapInfo function
    // load map in callbackDiaML function (if testdata)
}

// if testdata, load a background map
function loadMap()
{
    if (uploadtype == "testdata")
    {
        var getMapXML = new getXMLData(mapfile,callbackMap);
        getMapXML.getData();
    }
    else
    {
        callbackMap('undefined');
    }
}

// write data in a global array loadedData and calc data statistics
function callbackData(obj)
{
    loadedData = new Array();
    dataInfo = new Array();
    dataInfo['negVal'] = 0;

    // all data nodes
    for (var i=0;i<obj.childNodes.length;i++)
    {

        if(obj.childNodes.item(i).hasAttributes())
        {
            var tag = obj.childNodes.item(i).nodeName;
            break;
        }
    }
    var nodes = obj.getElementsByTagName(tag);
    var nodeNr = nodes.length;

    // generate new array for attribute names
    var attr = new Array();
    for (var i=0; i<nodeNr;i++)
    {
        var attrNr = nodes.item(i).attributes.length;
        for (var j=0;j<attrNr;j++)
        {
            // in Batik: wrong order of the attributes, define 'x', 'y' and 'id' as fix names
            attr[attr.length]=nodes.item(i).attributes.item(j).name;
            //alert(nodes.item(i).attributes.item(j).name);
        }
        break;
    }
    // fill array with attribute content
    for (var i=0; i<nodeNr;i++)
    {
        loadedData[i] = new Array();
        for (var j=0;j<attrNr;j++)
        {
            loadedData[i][j] = new Array();
            loadedData[i][j]['name']= attr[j];
            // convert from string to number (but not id)
            if (j==2)
            //if (Number(nodes.item(i).attributes.item(j).value)=="NaN")
            {loadedData[i][j]['value']= nodes.item(i).attributes.item(j).value;}
            else
            {loadedData[i][j]['value']= Number(nodes.item(i).attributes.item(j).value);}
        }
    }
    // summarize values, check for negative values, calc max value (normal and absolute)
    sumData = new Array();
    dataInfo['valueNr']=attrNr-3;
    dataInfo['maxVal'] = 0;
    dataInfo['maxAbsVal'] = 0;

    for (var i=0; i<nodeNr;i++)
    {
        sumData[i] = new Array();
        sumData[i]['id'] = loadedData[i][2]['value'];
        sumData[i]['name']="sum";
        sumData[i]['value'] = 0;

        // without x, y, id
        for (var j=3;j<attrNr;j++)
        {
            if (loadedData[i][j]['value'] != "")
            {
                // check for negative values
                if (loadedData[i][j]['value'] < 0)
                {dataInfo['negVal']=1;}
                // calc max value
                dataInfo['maxVal'] = Math.max(dataInfo['maxVal'], loadedData[i][j]['value']);
                // summarize data
                sumData[i]['value']+=Math.abs(loadedData[i][j]['value']);
                // calc max value (absolute)
                dataInfo['maxAbsVal'] = Math.max(dataInfo['maxAbsVal'], Math.abs(loadedData[i][j]['value']));
            }
        }
    }
    // calc min value
    dataInfo['minVal'] = dataInfo['maxVal'];
    dataInfo['minAbsVal'] = dataInfo['maxAbsVal'];
    for (var i=0; i<nodeNr;i++)
    {
        // without x, y, id
        for (var j=3;j<attrNr;j++)
        {
            if (loadedData[i][j]['value'] != "")
            {
                // calc min value
                dataInfo['minVal'] = Math.min(dataInfo['minVal'], loadedData[i][j]['value']);
                // calc min value (absolute)
                dataInfo['minAbsVal'] = Math.min(dataInfo['minAbsVal'], Math.abs(loadedData[i][j]['value']));
            }
        }
    }

    // sort summarized values (maximum at begin, minimum at end)
    sumData.sort(sort_numbers);
    sumData.reverse();

    // get minSum and maxSum
    dataInfo['maxSum']=sumData[0]['value'];
    dataInfo['minSum']=sumData[sumData.length-1]['value'];
    // get sum of sum
    dataInfo['sumAll']=0;
    for (var i=0;i<sumData.length;i++)
    {dataInfo['sumAll']+=sumData[i]['value'];}

    // create sorted array
    sortedData = new Array();
    for (var i=0; i<nodeNr;i++)
    {
        for (var x=0; x<nodeNr;x++)
        {
            if (sumData[i]['id'] == loadedData[x][2]['value'])
            {
                sortedData[i] = new Array();
                for (var j=0;j<attrNr;j++)
                {
                    sortedData[i][j] = new Array();
                    sortedData[i][j]['name'] = loadedData[x][j]['name'];
                    sortedData[i][j]['value'] = loadedData[x][j]['value'];
                }
                break;
            }
        }
    }
    // load mapinfo data
    var getMapInfo = new getXMLData(mapinfofile,callbackMapInfo);
    getMapInfo.getData();
}

// helper function for array sorting
function sort_numbers(value1,value2)
{
    return value1['value']-value2['value'];
}

// handle diaml definition
function callbackDiaML(obj)
{
    diamlInfo = new Array();
    var symbolchosen = false;

    // ******************* step 1: choose symbol type *******************

    for (var i=0;i<obj.childNodes.length;i++)
    {
        if(obj.childNodes.item(i).nodeName == 'simpleSymbol')
        {chooseSymbolType('simpleSymbol','','');symbolchosen = true;break;}
        if(obj.childNodes.item(i).nodeName == 'diagram')
        {chooseSymbolType('diagram','','');symbolchosen = true;break;}
    }
    if (symbolchosen==false)
    {alert('error: your DiaML file is not valid (no symbol type defined). please use the DiaML schema for validating.');}

    // ******************* read references *******************
    // (here is defined which primitive and style for each data value is used)

    var refArray=new Array();

    var obj_ss=obj.getElementsByTagName("simpleSymbol");
    var obj_dia=obj.getElementsByTagName("diagram");
    var dataRefs=obj.getElementsByTagName("dataRef");

    // get order of the data columns
    if (obj_ss.length > 0)
    {
        // get first data column name (for simple symbols there is only 1)
        var currAttrName=new Array();
        currAttrName[0]=sumData[0]['name']; // should be 'sum'
        var refAttrMatch=true;
    }
    if (obj_dia.length > 0)
    {
        // get data column names
        var currAttrName=new Array();
        for (var i=3;i<sortedData[0].length;i++)
        {
            currAttrName[(i-3)]=sortedData[0][i]['name']; // should be 'data1' or a self-defined name
        }
        var refAttrMatch=false;
        if (dataRefs.length<=currAttrName.length)
        {var refAttrMatch = true;}
    }

    // get all data references
    if (dataRefs.length>0 && refAttrMatch==true)
    {
        for (var j=0;j<dataRefs.length;j++)
        {
            // get the relation with the same content like the data column name

            refArray[j]=new Array();
            // should be 'sum' for simple symbols or 'data1' or a self-defined name for diagrams
            refArray[j]['dataRef']=dataRefs.item(j).firstChild.nodeValue;

            for (var i=0;i<currAttrName.length;i++)
            {
                if (refArray[j]['dataRef'] == currAttrName[i])
                {
                    // get style id and primitive id of the appropriate attribute name
                    var dataRefsParent = dataRefs.item(j).parentNode;
                    var dataRefsSiblings = dataRefsParent.childNodes;
                    for (var k=0;k<dataRefsSiblings.length;k++)
                    {
                        if (dataRefsSiblings.item(k).nodeType==1)
                        {
                            // can only be 1 styleRef or 1 primRef
                            if (dataRefsSiblings.item(k).nodeName == "styleRef")
                            {
                                refArray[j]['styleRef']=dataRefsSiblings.item(k).firstChild.nodeValue;
                            }
                            if (dataRefsSiblings.item(k).nodeName == "primitiveRef")
                            {
                                refArray[j]['primitiveRef']=dataRefsSiblings.item(k).firstChild.nodeValue;
                            }
                        }
                    }
                }
            }
        }
    }
    else
    {alert("error: number of data references in your DiaML file is higher than the number of data attributes or no data references defined in your DiaML file.");}

    // ******************* step 2: choose primitive *******************

    // read primitives of the diaml description
    var primitives=obj.getElementsByTagName("primitive");

    if (primitives.length < 1)
    {alert('error: your DiaML file is not valid (primitive not defined). please use the DiaML schema for validating.');}
    else
    {
        // for all primitive ids in the relation section of the diaML file
        for (var a=0;a<refArray.length;a++)
        {
            // for all primitives in the diaML description
            for (var i=0;i<primitives.length;i++)
            {
                // read primitive id
                if (primitives.item(i).hasAttributes())
                {var primId=primitives.item(i).getAttributeNS(null,"id");}

                // is it the correct primitive?
                if (primId==refArray[a]['primitiveRef'])
                {
                    // read primitive name and attributes
                    var primChildren=primitives.item(i).childNodes;
                    for (var j=0;j<primChildren.length;j++)
                    {
                        if(primChildren.item(j).nodeType==1)
                        {
                            switch(primChildren.item(j).nodeName)
                            {
                                case "circle":
                                case "ellipse":
                                case "rectangle":
                                case "ring":
                                case "sector":
                                case "ringSector":
                                case "regularPolygon":
                                case "point":
                                case "polyline":
                                case "curve":
                                    // if primitive button is activated
                                    if (myMapApp.buttons[primChildren.item(j).nodeName].activated == true)
                                    {
                                        choosePrimitive(primChildren.item(j).nodeName,'','');
                                        // check for attributes proportional, rotation, translationX, translationY

                                        // attribute proportional
                                        if (primChildren.item(j).hasAttributeNS(null,"proportional"))
                                        {
                                            var proportional = primChildren.item(j).getAttributeNS(null,"proportional");
                                            if (proportional != "length" && proportional != "area" && proportional != "volume" && proportional !="number") {alert("error: the attribute 'proportional' in your defined primitive is not valid.");}
                                        }
                                        else{alert("error: no attribute 'proportional' in your primitive defined (required).");}

                                        // attribute rotation (optional)
                                        if (primChildren.item(j).hasAttributeNS(null,"rotation"))
                                        {var rotation=primChildren.item(j).getAttributeNS(null,"rotation");}else{var rotation = 0;}

                                        // attribute translationX (optional)
                                        if (primChildren.item(j).hasAttributeNS(null,"translationX"))
                                        {var translationX=primChildren.item(j).getAttributeNS(null,"translationX");}else{var translationX=0;}

                                        // attribute translationY (optional)
                                        if (primChildren.item(j).hasAttributeNS(null,"translationY"))
                                        {var translationY=primChildren.item(j).getAttributeNS(null,"translationY");}else{var translationY=0;}

                                        // set primitive gui elements rotation, translationX, translationY
                                        // proportional is set automatically in other functions
                                        setSlider('primRotationTextbox',rotation,'');
                                        setTextbox('','primRotationSlider',rotation);
                                        setSlider('primTranslationXTextbox',translationX,'');
                                        setTextbox('','primTranslationXSlider',translationX);
                                        if (translationY != translationX)
                                        {
                                            myMapApp.cb["primTranslationY"].uncheck();
                                            showPropMenu('primTranslationY',undefined,'');
                                            setSlider('primTranslationYTextbox',translationY,'');
                                            setTextbox('','primTranslationYSlider',translationY);
                                        }

                                        // read properties of the primitive
                                        switch(primChildren.item(j).nodeName)
                                        {
                                            case "circle":
                                                // read radius
                                                var obj_r=primChildren.item(j).getElementsByTagName("r");
                                                if (obj_r.length > 0)
                                                {// since only 1 radius is allowed, take the first one
                                                    var r=obj_r.item(0).firstChild.nodeValue;
                                                    r=Math.abs(parseFloat(r));
                                                    // scale attribute
                                                    if (obj_r.item(0).hasAttributeNS(null,"scale"))
                                                    {
                                                        switch (obj_r.item(0).getAttributeNS(null,"scale"))
                                                        {
                                                            case "fixed":
                                                            case "dataValue":
                                                            case "partSum":
                                                            case "incremental":
                                                            case "totalSum":
                                                                var rScale = obj_r.item(0).getAttributeNS(null,"scale");
                                                                break;
                                                        }
                                                    }
                                                }
                                                else
                                                {alert("error: the attribute 'r' in your defined primitive does not exist.");}
                                                // set the gui elements for primitive circle (not necessary)

                                                // apply next primitive or go to next menu step
                                                if (a<(refArray.length-1))
                                                {nextMenu('nextPrimitive','','');}
                                                else
                                                {nextMenu('nextMenuStep2','','');}
                                                break;
                                            case "ellipse":
                                                // read rx, ry
                                                var obj_rx=primChildren.item(j).getElementsByTagName("rx");
                                                var obj_ry=primChildren.item(j).getElementsByTagName("ry");
                                                if (obj_rx.length > 0)
                                                {// since only 1 rx is allowed, take the first one
                                                    var rx=obj_rx.item(0).firstChild.nodeValue;
                                                    rx=Math.abs(parseFloat(rx));
                                                    // scale attribute
                                                    if (obj_rx.item(0).hasAttributeNS(null,"scale"))
                                                    {
                                                        switch (obj_rx.item(0).getAttributeNS(null,"scale"))
                                                        {
                                                            case "fixed":
                                                            case "dataValue":
                                                            case "partSum":
                                                            case "incremental":
                                                            case "totalSum":
                                                                var rxScale = obj_rx.item(0).getAttributeNS(null,"scale");
                                                                break;
                                                        }
                                                    }
                                                }
                                                else
                                                {alert("error: the attribute 'rx' in your defined primitive does not exist.");}
                                                if (obj_ry.length > 0)
                                                {// since only 1 ry is allowed, take the first one
                                                    var ry=obj_ry.item(0).firstChild.nodeValue;
                                                    ry=Math.abs(parseFloat(ry));
                                                    // scale attribute
                                                    if (obj_ry.item(0).hasAttributeNS(null,"scale"))
                                                    {
                                                        switch (obj_ry.item(0).getAttributeNS(null,"scale"))
                                                        {
                                                            case "fixed":
                                                            case "dataValue":
                                                            case "partSum":
                                                            case "incremental":
                                                            case "totalSum":
                                                                var ryScale = obj_ry.item(0).getAttributeNS(null,"scale");
                                                                break;
                                                        }
                                                    }
                                                }
                                                else
                                                {alert("error: the attribute 'ry' in your defined primitive does not exist.");}
                                                // set the gui elements for primitive ellipse (not done yet!!!)
                                                // apply next primitive or go to next menu step
                                                if (a<(refArray.length-1))
                                                {nextMenu('nextPrimitive','','');}
                                                else
                                                {nextMenu('nextMenuStep2','','');}
                                                break;
                                            case "rectangle":
                                                // read width, height, rectRx, rectRy
                                                var obj_w=primChildren.item(j).getElementsByTagName("width");
                                                var obj_h=primChildren.item(j).getElementsByTagName("height");
                                                var obj_rectRx=primChildren.item(j).getElementsByTagName("rectRx");
                                                var obj_rectRy=primChildren.item(j).getElementsByTagName("rectRy");
                                                if (obj_w.length > 0)
                                                {// since only 1 width is allowed, take the first one
                                                    var rectWidth=obj_w.item(0).firstChild.nodeValue;
                                                    rectWidth=Math.abs(parseFloat(rectWidth));
                                                    // scale attribute
                                                    if (obj_w.item(0).hasAttributeNS(null,"scale"))
                                                    {
                                                        switch (obj_w.item(0).getAttributeNS(null,"scale"))
                                                        {
                                                            case "fixed":
                                                            case "dataValue":
                                                            case "partSum":
                                                            case "incremental":
                                                            case "totalSum":
                                                                var widthScale = obj_w.item(0).getAttributeNS(null,"scale");
                                                                break;
                                                        }
                                                    }
                                                }
                                                else {alert("error: the attribute 'width' in your defined primitive does not exist.");}
                                                if (obj_h.length > 0)
                                                {// since only 1 height is allowed, take the first one
                                                    var rectHeight=obj_h.item(0).firstChild.nodeValue;
                                                    rectHeight=Math.abs(parseFloat(rectHeight));
                                                    // scale attribute
                                                    if (obj_h.item(0).hasAttributeNS(null,"scale"))
                                                    {
                                                        switch (obj_h.item(0).getAttributeNS(null,"scale"))
                                                        {
                                                            case "fixed":
                                                            case "dataValue":
                                                            case "partSum":
                                                            case "incremental":
                                                            case "totalSum":
                                                                var heightScale = obj_h.item(0).getAttributeNS(null,"scale");
                                                                break;
                                                        }
                                                    }
                                                }
                                                else {alert("error: the attribute 'height' in your defined primitive does not exist.");}
                                                if (obj_rectRx.length > 0)
                                                {// since only 1 rectRx is allowed, take the first one
                                                    var rectRx=obj_rectRx.item(0).firstChild.nodeValue;
                                                    rectRx=Math.abs(parseFloat(rectRx));
                                                }

                                                if (obj_rectRy.length > 0)
                                                {// since only 1 rectRy is allowed, take the first one
                                                    var rectRy=obj_rectRy.item(0).firstChild.nodeValue;
                                                    rectRy=Math.abs(parseFloat(rectRy));
                                                }

                                                // set the gui elements for primitive rectangle (not done yet!!!)
                                                // apply next primitive or go to next menu step
                                                if (a<(refArray.length-1))
                                                {nextMenu('nextPrimitive','','');}
                                                else
                                                {nextMenu('nextMenuStep2','','');}
                                                break;
                                            case "ring":
                                                // read r, innerR
                                                var obj_r=primChildren.item(j).getElementsByTagName("r");
                                                var obj_innerR=primChildren.item(j).getElementsByTagName("innerR");
                                                if (obj_r.length > 0)
                                                {// since only 1 r is allowed, take the first one
                                                    var r=obj_r.item(0).firstChild.nodeValue;
                                                    r=Math.abs(parseFloat(r));
                                                    // scale attribute
                                                    if (obj_r.item(0).hasAttributeNS(null,"scale"))
                                                    {
                                                        switch (obj_r.item(0).getAttributeNS(null,"scale"))
                                                        {
                                                            case "fixed":
                                                            case "dataValue":
                                                            case "partSum":
                                                            case "incremental":
                                                            case "totalSum":
                                                                var rScale = obj_r.item(0).getAttributeNS(null,"scale");
                                                                break;
                                                        }
                                                    }
                                                }
                                                else {alert("error: the attribute 'r' in your defined primitive does not exist.");}
                                                if (obj_innerR.length > 0)
                                                {// since only 1 innerR is allowed, take the first one
                                                    var innerR=obj_innerR.item(0).firstChild.nodeValue;
                                                    innerR=Math.abs(parseFloat(innerR));
                                                    if (innerR > 100) {innerR = 100;}
                                                }
                                                else {var innerR = 50;}
                                                // set the gui elements for primitive ring
                                                setSlider('ringInnerRadiusTextbox',innerR,'');
                                                setTextbox('','ringInnerRadiusSlider',innerR);

                                                // apply next primitive or go to next menu step
                                                if (a<(refArray.length-1))
                                                {nextMenu('nextPrimitive','','');}
                                                else
                                                {nextMenu('nextMenuStep2','','');}
                                                break;
                                            case "sector":
                                                // read r, angle
                                                var obj_r=primChildren.item(j).getElementsByTagName("r");
                                                var obj_angle=primChildren.item(j).getElementsByTagName("angle");
                                                if (obj_r.length > 0)
                                                {// since only 1 r is allowed, take the first one
                                                    var r=obj_r.item(0).firstChild.nodeValue;
                                                    r=Math.abs(parseFloat(r));
                                                    // scale attribute
                                                    if (obj_r.item(0).hasAttributeNS(null,"scale"))
                                                    {
                                                        switch (obj_r.item(0).getAttributeNS(null,"scale"))
                                                        {
                                                            case "fixed":
                                                            case "dataValue":
                                                            case "partSum":
                                                            case "incremental":
                                                            case "totalSum":
                                                                var rScale = obj_r.item(0).getAttributeNS(null,"scale");
                                                                break;
                                                        }
                                                    }
                                                }
                                                else {alert("error: the attribute 'r' in your defined primitive does not exist.");}
                                                if (obj_angle.length > 0)
                                                {// since only 1 angle is allowed, take the first one
                                                    var angle=obj_angle.item(0).firstChild.nodeValue;
                                                    angle=Math.abs(parseFloat(angle));
                                                    if (angle > 359.99){angle = 359.99;}
                                                    // scale attribute
                                                    if (obj_angle.item(0).hasAttributeNS(null,"scale"))
                                                    {
                                                        switch (obj_angle.item(0).getAttributeNS(null,"scale"))
                                                        {
                                                            case "fixed":
                                                            case "dataValue":
                                                            case "partSum":
                                                            case "incremental":
                                                            case "totalSum":
                                                                var angleScale = obj_angle.item(0).getAttributeNS(null,"scale");
                                                                break;
                                                        }
                                                    }
                                                }
                                                else {alert("error: the attribute 'angle' in your defined primitive does not exist.");}
                                                // set the gui elements for primitive sector
                                                sectorRadiusScaleFunction('sectorRadiusScale','',rScale);
                                                sectorAngleScaleFunction('sectorAngleScale','',angleScale);

                                                if (angleScale=="fixed" || angleScale=="dataValue")
                                                {
                                                    myMapApp.sl["sectorAngleScale"].selectElementByName(angleScale,sectorAngleScaleFunction);
                                                    if (angleScale=="fixed" && document.getElementById('sectorAngleValueTextbox').getAttributeNS(null,'display')=="inline")
                                                    {
                                                        setSlider('sectorAngleValueTextbox',angle,'');
                                                        setTextbox('','sectorAngleValueSlider',angle);
                                                    }
                                                    if (rScale=="fixed" && document.getElementById('sectorRadiusValueTextbox').getAttributeNS(null,'display')=="inline")
                                                    {
                                                        setSlider('sectorRadiusValueTextbox',r,'');
                                                        setTextbox('','sectorRadiusValueSlider',r);
                                                    }
                                                }

                                                // apply next primitive or go to next menu step
                                                if (a<(refArray.length-1))
                                                {nextMenu('nextPrimitive','','');}
                                                else
                                                {nextMenu('nextMenuStep2','','');}
                                                break;
                                            case "ringSector":
                                                // read r, angle, innerR, (fixWidth currently not implemented)
                                                var obj_r=primChildren.item(j).getElementsByTagName("r");
                                                var obj_angle=primChildren.item(j).getElementsByTagName("angle");
                                                var obj_innerR=primChildren.item(j).getElementsByTagName("innerR");
                                                var obj_fixWidth=primChildren.item(j).getElementsByTagName("fixWidth");

                                                if (obj_r.length > 0)
                                                {// since only 1 r is allowed, take the first one
                                                    var r=obj_r.item(0).firstChild.nodeValue;
                                                    r=Math.abs(parseFloat(r));
                                                    // scale attribute
                                                    if (obj_r.item(0).hasAttributeNS(null,"scale"))
                                                    {
                                                        switch (obj_r.item(0).getAttributeNS(null,"scale"))
                                                        {
                                                            case "fixed":
                                                            case "dataValue":
                                                            case "partSum":
                                                            case "incremental":
                                                            case "totalSum":
                                                                var rScale = obj_r.item(0).getAttributeNS(null,"scale");
                                                                break;
                                                        }
                                                    }
                                                }
                                                else {alert("error: the attribute 'r' in your defined primitive does not exist.");}
                                                if (obj_angle.length > 0)
                                                {// since only 1 angle is allowed, take the first one
                                                    var angle=obj_angle.item(0).firstChild.nodeValue;
                                                    angle=Math.abs(parseFloat(angle));
                                                    if (angle > 359.99){angle = 359.99;}
                                                    // scale attribute
                                                    if (obj_angle.item(0).hasAttributeNS(null,"scale"))
                                                    {
                                                        switch (obj_angle.item(0).getAttributeNS(null,"scale"))
                                                        {
                                                            case "fixed":
                                                            case "dataValue":
                                                            case "partSum":
                                                            case "incremental":
                                                            case "totalSum":
                                                                var angleScale = obj_angle.item(0).getAttributeNS(null,"scale");
                                                                break;
                                                        }
                                                    }
                                                }
                                                else {alert("error: the attribute 'angle' in your defined primitive does not exist.");}
                                                if (obj_innerR.length > 0)
                                                {// since only 1 innerR is allowed, take the first one
                                                    var innerR=obj_innerR.item(0).firstChild.nodeValue;
                                                    innerR=Math.abs(parseFloat(innerR));
                                                    if (innerR > 100) {innerR = 100;}
                                                }
                                                else
                                                {
                                                    if (obj_fixWidth.length > 0)
                                                    {// since only 1 fixWidth is allowed, take the first one
                                                        var fixWidth=obj_fixWidth.item(0).firstChild.nodeValue;
                                                        fixWidth=Math.abs(parseFloat(fixWidth));
                                                    }
                                                    // if both attributes are not defined, take innerR
                                                    else {var innerR = 50;}
                                                }
                                                // set the gui elements for primitive ringSector
                                                ringSectorRadiusScaleFunction('sectorRadiusScale','',rScale);
                                                ringSectorAngleScaleFunction('sectorAngleScale','',angleScale);
                                                if (angleScale=="fixed" || angleScale=="dataValue")
                                                {
                                                    myMapApp.sl["ringSectorAngleScale"].selectElementByName(angleScale,ringSectorAngleScaleFunction);
                                                    if (angleScale=="fixed" && document.getElementById('ringSectorAngleValueTextbox').getAttributeNS(null,'display')=="inline")
                                                    {
                                                        setSlider('ringSectorAngleValueTextbox',angle,'');
                                                        setTextbox('','ringSectorAngleValueSlider',angle);
                                                    }
                                                    if (rScale=="fixed" && document.getElementById('ringSectorRadiusValueTextbox').getAttributeNS(null,'display')=="inline")
                                                    {
                                                        setSlider('ringSectorRadiusValueTextbox',r,'');
                                                        setTextbox('','ringSectorRadiusValueSlider',r);
                                                    }
                                                }
                                                setSlider('ringSectorInnerRadiusTextbox',innerR,'');
                                                setTextbox('','ringSectorInnerRadiusSlider',innerR);

                                                // apply next primitive or go to next menu step
                                                if (a<(refArray.length-1))
                                                {nextMenu('nextPrimitive','','');}
                                                else
                                                {nextMenu('nextMenuStep2','','');}
                                                break;
                                            case "regularPolygon":
                                                // read r, edgeNr, innerR
                                                var obj_r=primChildren.item(j).getElementsByTagName("r");
                                                var obj_edgeNr=primChildren.item(j).getElementsByTagName("edgeNr");
                                                var obj_innerR=primChildren.item(j).getElementsByTagName("innerR");

                                                if (obj_r.length > 0)
                                                {// since only 1 r is allowed, take the first one
                                                    var r=obj_r.item(0).firstChild.nodeValue;
                                                    r=Math.abs(parseFloat(r));
                                                    // scale attribute
                                                    if (obj_r.item(0).hasAttributeNS(null,"scale"))
                                                    {
                                                        switch (obj_r.item(0).getAttributeNS(null,"scale"))
                                                        {
                                                            case "fixed":
                                                            case "dataValue":
                                                            case "partSum":
                                                            case "incremental":
                                                            case "totalSum":
                                                                var rScale = obj_r.item(0).getAttributeNS(null,"scale");
                                                                break;
                                                        }
                                                    }
                                                }
                                                else {alert("error: the attribute 'r' in your defined primitive does not exist.");}
                                                if (obj_edgeNr.length > 0)
                                                {// since only 1 edgeNr is allowed, take the first one
                                                    var edgeNr=obj_edgeNr.item(0).firstChild.nodeValue;
                                                    edgeNr=Math.abs(parseFloat(edgeNr));
                                                    if (edgeNr <= 3) {edgeNr = 3;}
                                                }
                                                else {alert("error: the attribute 'edgeNr' in your defined primitive does not exist.");}
                                                if (obj_innerR.length > 0)
                                                {// since only 1 innerR is allowed, take the first one
                                                    var innerR=obj_innerR.item(0).firstChild.nodeValue;
                                                    innerR=Math.abs(parseFloat(innerR));
                                                    if (innerR > 100) {innerR = 100;}
                                                }
                                                else
                                                {var innerR=100;}

                                                // set the gui elements for primitive regularPolygon
                                                setSlider('regularPolygonEdgeNrTextbox',edgeNr,'');
                                                setTextbox('','regularPolygonEdgeNrSlider',edgeNr);
                                                setSlider('regularPolygonInnerRadiusTextbox',innerR,'');
                                                setTextbox('','regularPolygonInnerRadiusSlider',innerR);

                                                // apply next primitive or go to next menu step
                                                if (a<(refArray.length-1))
                                                {nextMenu('nextPrimitive','','');}
                                                else
                                                {nextMenu('nextMenuStep2','','');}
                                                break;
                                            case "point":
                                                // read r
                                                var obj_r=primChildren.item(j).getElementsByTagName("r");

                                                if (obj_r.length > 0)
                                                {// since only 1 r is allowed, take the first one
                                                    var r=obj_r.item(0).firstChild.nodeValue;
                                                    r=Math.abs(parseFloat(r));
                                                }
                                                else {var r=1;}
                                                // set the gui elements for primitive point (not done yet!!!)

                                                // apply next primitive or go to next menu step
                                                if (a<(refArray.length-1))
                                                {nextMenu('nextPrimitive','','');}
                                                else
                                                {nextMenu('nextMenuStep2','','');}
                                                break;
                                            case "polyline":
                                                // apply next primitive or go to next menu step
                                                if (a<(refArray.length-1))
                                                {nextMenu('nextPrimitive','','');}
                                                else
                                                {nextMenu('nextMenuStep2','','');}
                                                break;
                                            case "curve":
                                                // apply next primitive or go to next menu step
                                                if (a<(refArray.length-1))
                                                {nextMenu('nextPrimitive','','');}
                                                else
                                                {nextMenu('nextMenuStep2','','');}
                                                break;
                                        }
                                    }
                                    break;
                                default:alert('error: your DiaML file is not valid (primitive not defined). please use the DiaML schema for validating.');break;
                            }
                        }
                    }
                }
            }
        }
    }

    // ******************* step 3: choose arrangement principle *******************
    if (obj_ss.length > 0)
    {
        // read attributes rotation, translationX and -Y
        if (obj_ss.item(0).hasAttributes())
        {
            // both attributes are currently set automatically with javascript functions
            if (obj_ss.item(0).hasAttributeNS(null,"minSize"))
            {var minSize=obj_ss.item(0).getAttributeNS(null,"minSize");}
            if (obj_ss.item(0).hasAttributeNS(null,"areaRatio"))
            {var areaRatio=obj_ss.item(0).getAttributeNS(null,"areaRatio");}
            // read transformation parameters for the whole symbol
            if (obj_ss.item(0).hasAttributeNS(null,"rotation"))
            {var rotation=obj_ss.item(0).getAttributeNS(null,"rotation");}
            if (obj_ss.item(0).hasAttributeNS(null,"translationX"))
            {var translationX=obj_ss.item(0).getAttributeNS(null,"translationX");}
            if (obj_ss.item(0).hasAttributeNS(null,"translationY"))
            {var translationY=obj_ss.item(0).getAttributeNS(null,"translationY");}
        }
        else {var rotation=0;var translationX=0;var translationY=0;}

        // simple arrangement
        var obj_sArr=obj_ss.item(0).getElementsByTagName("simpleArrangement");
        if (obj_sArr.length>0)
        {
            var arrPrincList=obj_sArr.item(0).childNodes;
            for (var i=0;i<arrPrincList.length;i++)
            {
                if (arrPrincList.item(i).nodeType==1)
                {
                    switch(arrPrincList.item(i).nodeName)
                    {
                        case "centered":
                        case "grid":
                            // if arrangement button is activated
                            if (myMapApp.buttons[arrPrincList.item(i).nodeName].activated == true)
                            {
                                chooseArrangement(arrPrincList.item(i).nodeName,'','');
                                // set gui elements (rotation, translationX and -Y)
                                setSlider('rotationTextbox',rotation,'');
                                setTextbox('','rotationSlider',rotation);
                                setSlider('translationXTextbox',translationX,'');
                                setTextbox('','translationXSlider',translationX);
                                if (translationY != translationX)
                                {
                                    myMapApp.cb["translationY"].uncheck();
                                    showPropMenu('translationY',undefined,'');
                                    setSlider('translationYTextbox',translationY,'');
                                    setTextbox('','translationYSlider',translationY);
                                }

                                // apply setting and go to next step
                                nextMenu('nextMenuStep3','','');
                            }
                            break;
                        default:alert('error: your DiaML file is not valid (arrangement principle not defined). please use the DiaML schema for validating.');break;
                    }
                }
            }
        }
        else {alert('error: your DiaML file is not valid (no arrangement type defined). please use the DiaML schema for validating.');}
    }
    else
    {
        if (obj_dia.length > 0)
        {
            // read attributes rotation, translationX and -Y
            if (obj_dia.item(0).hasAttributes())
            {
                // both attributes are currently set automatically with javascript functions
                if (obj_dia.item(0).hasAttributeNS(null,"minSize"))
                {var minSize=obj_dia.item(0).getAttributeNS(null,"minSize");}
                if (obj_dia.item(0).hasAttributeNS(null,"areaRatio"))
                {var areaRatio=obj_dia.item(0).getAttributeNS(null,"areaRatio");}
                // read transformation parameters for the whole symbol
                if (obj_dia.item(0).hasAttributeNS(null,"rotation"))
                {var rotation=obj_dia.item(0).getAttributeNS(null,"rotation");}
                if (obj_dia.item(0).hasAttributeNS(null,"translationX"))
                {var translationX=obj_dia.item(0).getAttributeNS(null,"translationX");}
                if (obj_dia.item(0).hasAttributeNS(null,"translationY"))
                {var translationY=obj_dia.item(0).getAttributeNS(null,"translationY");}
            }
            else {var rotation=0;var translationX=0;var translationY=0;}

            // diagram arrangement
            var obj_diaArr=obj_dia.item(0).getElementsByTagName("diagramArrangement");
            if (obj_diaArr.length>0)
            {
                var arrPrincList=obj_diaArr.item(0).childNodes;
                for (var i=0;i<arrPrincList.length;i++)
                {
                    if (arrPrincList.item(i).nodeType==1)
                    {
                        switch(arrPrincList.item(i).nodeName)
                        {
                            case "polar":
                            case "linear":
                            case "perpendicular":
                            case "triangular":
                                // if arrangement button is activated
                                if (myMapApp.buttons[arrPrincList.item(i).nodeName].activated == true)
                                {
                                    chooseArrangement(arrPrincList.item(i).nodeName,'','');
                                    // set gui elements (rotation, translationX and -Y)
                                    setSlider('rotationTextbox',rotation,'');
                                    setTextbox('','rotationSlider',rotation);
                                    setSlider('translationXTextbox',translationX,'');
                                    setTextbox('','translationXSlider',translationX);
                                    if (translationY != translationX)
                                    {
                                        myMapApp.cb["translationY"].uncheck();
                                        showPropMenu('translationY',undefined,'');
                                        setSlider('translationYTextbox',translationY,'');
                                        setTextbox('','translationYSlider',translationY);
                                    }

                                    // read arrangement principle attributes
                                    switch(arrPrincList.item(i).nodeName)
                                    {
                                        case "polar":
                                            // centerDistance, distance, groups, parts, totalAngle (optional)
                                            var obj_cDist=arrPrincList.item(i).getElementsByTagName("centerDistance");
                                            var obj_dist=arrPrincList.item(i).getElementsByTagName("distance");
                                            var obj_g=arrPrincList.item(i).getElementsByTagName("groups");
                                            var obj_parts=arrPrincList.item(i).getElementsByTagName("parts");
                                            var obj_totAngle=arrPrincList.item(i).getElementsByTagName("totalAngle");

                                            if (obj_cDist.length > 0)
                                            {// since only 1 centerDistance is allowed, take the first one
                                                var centerDistance=obj_cDist.item(0).firstChild.nodeValue;
                                                centerDistance=Math.abs(parseFloat(centerDistance));
                                            }
                                            else {var centerDistance=0;}

                                            if (obj_dist.length > 0)
                                            {// since only 1 distance is allowed, take the first one
                                                var distance=obj_dist.item(0).firstChild.nodeValue;
                                                distance=parseFloat(distance);
                                                if (obj_dist.item(0).hasAttributeNS(null,"from"))
                                                {
                                                    var distFrom=obj_dist.item(0).getAttributeNS(null,"from");
                                                    if (distFrom != "startpoint" && distFrom != "lastPrimitive")
                                                    {alert('error: attribute "from" in your tag "distance" is not valid. please use the DiaML schema for validating.');}
                                                }
                                            }
                                            else {var distance=0;}

                                            if (obj_g.length > 0)
                                            {// since only 1 group tag is allowed, take the first one
                                                var groups=obj_g.item(0).firstChild.nodeValue;
                                                groups=Math.abs(parseFloat(groups));
                                                if (groups < 1){groups=1;}
                                                if (obj_g.item(0).hasAttributeNS(null,"distance"))
                                                {
                                                    var gDist=obj_g.item(0).getAttributeNS(null,"distance");
                                                    gDist=parseFloat(gDist);
                                                }
                                            }
                                            else {var groups=1;}

                                            if (obj_parts.length > 0)
                                            {// since only 1 part tag is allowed, take the first one
                                                var parts=obj_parts.item(0).firstChild.nodeValue;
                                                parts=Math.abs(parseFloat(parts));
                                                if (parts < 1){parts=1;}
                                                if (obj_parts.item(0).hasAttributeNS(null,"arrangement"))
                                                {
                                                    var partsArr=obj_parts.item(0).getAttributeNS(null,"arrangement");
                                                    if (partsArr != "stacked" && partsArr != "row")
                                                    {alert('error: attribute "arrangement" in your tag "parts" is not valid. please use the DiaML schema for validating.');}
                                                }
                                            }
                                            else {var parts=1;}

                                            if (obj_totAngle.length > 0)
                                            {// since only 1 totalAngle tag is allowed, take the first one
                                                var totalAngle=obj_totAngle.item(0).firstChild.nodeValue;
                                                totalAngle=Math.abs(parseFloat(totalAngle));
                                                if (totalAngle >= 360){totalAngle=359;}
                                            }
                                            else {var totalAngle=360;}

                                            // set GUI elements
                                            setSlider('polarGroupsTextbox',groups,'');
                                            setTextbox('','polarGroupsSlider',groups);
                                            setSlider('polarTotalAngleTextbox',totalAngle,'');
                                            setTextbox('','polarTotalAngleSlider',totalAngle);
                                            setSlider('polarCenterDistanceTextbox',centerDistance,'');
                                            setTextbox('','polarCenterDistanceSlider',centerDistance);
                                            // parts and distance currently not set (only if rectangle is implemented)
                                            break;
                                        case "linear":
                                            // currently not implemented
                                            break;
                                        case "perpendicular":
                                            // currently not implemented
                                            break;
                                        case "triangular":
                                            // currently not implemented
                                            break;
                                    }

                                    // apply setting and go to next step
                                    nextMenu('nextMenuStep3','','');
                                }
                                break;
                            default:alert('error: your DiaML file is not valid (arrangement principle not defined). please use the DiaML schema for validating.');break;
                        }
                    }
                }
            }
            else {alert('error: your DiaML file is not valid (no arrangement type defined). please use the DiaML schema for validating.');}

        }
        else{alert('error: your DiaML file is not valid (no symbol type defined). please use the DiaML schema for validating.');}
    }

    // ******************* step 4: choose colors *******************
    var stylesList = obj.getElementsByTagName("style");
    styles = new Array();
    if (stylesList.length > 0)
    {
        for (var j=0;j<stylesList.length;j++)
        {
            if (stylesList.item(j).hasAttributes())
            {var styleId=stylesList.item(j).getAttributeNS(null,"id");}

            for (var i=0;i<refArray.length;i++)
            {
                // is it the correct style?
                if (styleId==refArray[i]['styleRef'])
                {
                    // read all style attributes like fill and stroke
                    var styleChildren=stylesList.item(j).childNodes;
                    for (var k=0;k<styleChildren.length;k++)
                    {
                        if (styleChildren.item(k).nodeType==1)
                        {
                            if(styleChildren.item(k).nodeName == "fill")
                            {var fillColor=styleChildren.item(k).firstChild.nodeValue;}
                            if(styleChildren.item(k).nodeName == "stroke")
                            {var strokeColor=styleChildren.item(k).firstChild.nodeValue;}
                            if(styleChildren.item(k).nodeName == "fill-opacity")
                            {
                                var fillOpacity=styleChildren.item(k).firstChild.nodeValue;
                                fillOpacity=parseFloat(fillOpacity);
                                if (fillOpacity>100){fillOpacity=100;}
                                if (fillOpacity<0){fillOpacity=0;}
                                fillOpacity=fillOpacity/100;
                            }
                            if(styleChildren.item(k).nodeName == "stroke-opacity")
                            {
                                var strokeOpacity=styleChildren.item(k).firstChild.nodeValue;
                                strokeOpacity=parseFloat(strokeOpacity);
                                if (strokeOpacity>100){strokeOpacity=100;}
                                if (strokeOpacity<0){strokeOpacity=0;}
                                strokeOpacity=strokeOpacity/100;
                            }
                            if (styleChildren.item(k).nodeName == "stroke-width")
                            {
                                var strokeWidth=styleChildren.item(k).firstChild.nodeValue;
                                strokeWidth=parseFloat(strokeWidth);
                                if (strokeWidth<=0){strokeWidth=0.1;}
                            }
                            if (styleChildren.item(k).nodeName == "stroke-linecap")
                            {
                                var strokeLinecap=styleChildren.item(k).firstChild.nodeValue;
                            }
                            if (styleChildren.item(k).nodeName == "stroke-dasharray")
                            {
                                var strokeDasharray=styleChildren.item(k).firstChild.nodeValue;
                            }
                            if (styleChildren.item(k).nodeName == "stroke-dashoffset")
                            {
                                var strokeDashoffset=styleChildren.item(k).firstChild.nodeValue;
                                strokeDashoffset=parseFloat(strokeDashoffset);
                            }
                            if (styleChildren.item(k).nodeName == "stroke-linejoin")
                            {
                                var strokeLinejoin=styleChildren.item(k).firstChild.nodeValue;
                            }
                            if (styleChildren.item(k).nodeName == "stroke-miterlimit")
                            {
                                var strokeMiterlimit=styleChildren.item(k).firstChild.nodeValue;
                                strokeMiterlimit=parseFloat(strokeMiterlimit);
                                if (strokeMiterlimit<1){strokeMiterlimit=4;}
                            }
                        }
                    }

                    // if style attributes are not defined
                    try {if(fillColor){throw 1;}else{throw 0;}}
                    catch(e){if (e==1){}else {var fillColor="darkred";}}
                    try {if(strokeColor){throw 1;}else{throw 0;}}
                    catch(e){if (e==1){}else {var strokeColor="#fff";}}
                    try {if(fillOpacity){throw 1;}else{throw 0;}}
                    catch(e){if (e==1){}else {var fillOpacity=0.8;}}
                    try {if(strokeOpacity){throw 1;}else{throw 0;}}
                    catch(e){if (e==1){}else {var strokeOpacity=1;}}
                    try {if(strokeWidth){throw 1;}else{throw 0;}}
                    catch(e){if (e==1){}else {var strokeWidth=1;}}

                    styles[i] = new Array();
                    styles[i]['id']="s"+i;
                    styles[i]['fill']= fillColor;
                    styles[i]['fill-opacity']=fillOpacity;
                    styles[i]['stroke']=strokeColor;
                    styles[i]['stroke-opacity']=strokeOpacity;
                    styles[i]['stroke-width']=strokeWidth;
                    // set style of the color buttons from style array
                    myMapApp.buttons["color"+i].buttonRect.setAttributeNS(null,"fill",styles[i]['fill']);
                    myMapApp.buttons["color"+i].buttonRect.setAttributeNS(null,"fill-opacity",styles[i]['fill-opacity']);
                }
            }
        }
        // apply colors
        nextMenu("nextMenuStep4",'','');
    }
    else
    {alert('error: your DiaML file is not valid (no style defined). please use the DiaML schema for validating.');}

    // ******************* step 5: read guides and interactivity *******************
    // read guides: currently not necessary!
    var guidesList = obj.getElementsByTagName("guides");
    if (guidesList.length>0)
    {
        // only one guides tag allowed in DiaML
        var guidesChildren = guidesList.item(0).childNodes;
        for (var i=0;i<guidesChildren.length;i++)
        {
            if (guidesChildren.item(i).nodeType==1)
            {
                if (guidesChildren.item(i).nodeName == "guideCircle")
                {
                    // read guideCircle with attribute r (>0 and 100)
                }
                if (guidesChildren.item(i).nodeName == "guideRegularPolygon")
                {
                    // read guideRegularPolygon with attributes edgeNr (>=3) and r (>0 and 100)
                }
                if (guidesChildren.item(i).nodeName == "guideLine")
                {
                    // read guideLine with attributes from and to (center, left, right, top, bottom, topRight, topLeft, bottomRight, bottomLeft)
                }
                if (guidesChildren.item(i).nodeName == "guideBgRectangle")
                {
                    // read guideBgRectangle with attributes fill and fill-opacity (0 and 100)
                }
                if (guidesChildren.item(i).nodeName == "guideBgRectangle")
                {
                    // read guideBgTriangle with attributes fill and fill-opacity (0 and 100)
                }
            }
        }
    }
    // read interactivity
    var labelDataList=obj.getElementsByTagName("labelData");
    if (labelDataList.length>0)
    {
        // only one labelData tag allowed in DiaML
        try {if (labelDataList.item(0).firstChild.nodeValue){throw 1;}else{throw 0;}}
        catch(e){if (e==1){var labelData=labelDataList.item(0).firstChild.nodeValue;}else {var labelData="no";}}
        // set radiobutton
        diamlInfo['labelData']=labelData;
        myMapApp.rb["radioInteractivity"].selectById(labelData,true);

        // apply guides and interactivity
        nextMenu("nextMenuStep5",'','');
    }
    else
    {alert('error: your DiaML file is not valid (no labelData defined). please use the DiaML schema for validating.');}

    // ******************* end status: step 6 - export *******************
}

// write map information in a global array "mapInfo"
function callbackMapInfo(obj)
{
    mapInfo = new Array();

    // fill array with tag content
    for (var i=0;i<obj.childNodes.length;i++)
    {

        if(obj.childNodes.item(i).nodeName == 'originX')
        {mapInfo['originX']=obj.childNodes.item(i).firstChild.nodeValue;}
        if(obj.childNodes.item(i).nodeName == 'originY')
        {mapInfo['originY']=(-1)*obj.childNodes.item(i).firstChild.nodeValue;}
        if(obj.childNodes.item(i).nodeName == 'destX')
        {mapInfo['destX']=obj.childNodes.item(i).firstChild.nodeValue;}
        if(obj.childNodes.item(i).nodeName == 'destY')
        {mapInfo['destY']=(-1)*obj.childNodes.item(i).firstChild.nodeValue;}
    }

    // calculate map parameters
    mapInfo['width']=Math.abs(mapInfo['destX']-mapInfo['originX']);
    mapInfo['height']=Math.abs(mapInfo['originY']-mapInfo['destY']);
    mapInfo['area']=mapInfo['width']*mapInfo['height'];

    // if testdata, load background map
    loadMap();
}

// integrate background map, if testdataset is chosen
function callbackMap(obj)
{
    if (obj != 'undefined')
    {
        obj.setAttributeNS(null,"id","bgMap");
        obj.setAttributeNS(null,"overflow","visible");
    }
    var mainMap = document.getElementById("mainMap");
    var viewBoxAttr = mapInfo['originX']+" "+mapInfo['originY']+" "+mapInfo['width']+" "+mapInfo['height'];
    mainMap.setAttributeNS(null,"viewBox",viewBoxAttr);
    var bgMainMap = document.getElementById("bgMainMap");
    bgMainMap.setAttributeNS(null,"x",mapInfo['originX']);
    bgMainMap.setAttributeNS(null,"y",mapInfo['originY']);
    bgMainMap.setAttributeNS(null,"width",mapInfo['width']);
    bgMainMap.setAttributeNS(null,"height",mapInfo['height']);
    if (document.getElementById("bgMap"))
    {mainMap.removeChild(document.getElementById("bgMap"));}
    if (obj != 'undefined')
    {mainMap.appendChild(obj);}

    // load diaml data
    if (diamlfile != "")
    {
        var getDiaML = new getXMLData(diamlfile,callbackDiaML);
        getDiaML.getData();
    }
    else {diamlInfo = new Array();}
}

// calculate scale factor for symbol size
function calcScaleFactor(mapArea,allDataSum,areaRatio)
{
    // default of symbolAreaAll is 10 (percent of map area)
    var symbolAreaAll = mapArea / 100 * areaRatio;
    scaleFactor = symbolAreaAll / allDataSum;
    //var symbolArea = scaleFactor * symbolDataSum;
    return scaleFactor;
}

// helper function to delete children of a group
function deleteChildren(group)
{
    while (group.hasChildNodes())
    {
        group.removeChild(group.firstChild);
    }
}

// calculate symbol parameters
function calcSymbol()
{
    // set default transformation values for the whole symbol, if they do not exist
    try {if(diamlInfo['rotation']){throw 1;}else{throw 0;}}
    catch(e)
    {
        if (e==1){}
        else {setDiamlAttr('rotation',0);}
    }
    try {if(diamlInfo['translationX']){throw 1;}else{throw 0;}}
    catch(e)
    {
        if (e==1){}
        else {setDiamlAttr('translationX',0);}
    }
    try {if(diamlInfo['translationY']){throw 1;}else{throw 0;}}
    catch(e)
    {
        if (e==1){}
        else {setDiamlAttr('translationY',0);}
    }

    if (diamlInfo['symbolType'] == "simpleSymbol")
    {
        pathAttribute = new Array();
        for (var a=0;a<primitive.length;a++)
        {
            switch (primitive[a]['name'])
            {
                case "circle":
                    var symbolArea = new Array();
                    var radius = new Array();
                    pathAttribute[a] = new Array();
                    for (var i=0;i<sumData.length;i++)
                    {
                        symbolArea[i]=sumData[i]['value']*scaleFactor;
                        radius[i]=Math.sqrt(symbolArea[i]/Math.PI);
                        // calc SVG circle parameters and geometry
                        pathAttribute[a][i]=calcSVGCircleGeom(radius[i]);
                    }
                    // calc distances in x- and y-direction from center
                    distance=new Array();
                    for (var i=0;i<sumData.length;i++)
                    {
                        distance[i]=new Array();
                        for (var j=0;j<dataInfo['valueNr'];j++)
                        {
                            distance[i][j]=new Array();
                            distance[i][j]['x']= primitive[a]['translationX'] * mapInfo['width'] / 600;
                            distance[i][j]['y']= primitive[a]['translationY'] * mapInfo['width'] / 600;
                        }
                    }
                    break;
                case "ellipse": break;
                case "rectangle": break;
                case "ring":
                    var symbolArea = new Array();
                    var radius = new Array();
                    var innerRadius;
                    pathAttribute[a] = new Array();
                    for (var i=0;i<sumData.length;i++)
                    {
                        symbolArea[i]=sumData[i]['value']*scaleFactor;
                        radius[i]=Math.sqrt(symbolArea[i]/Math.PI);
                        innerRadius=primitiveAttr[a]['innerR']['value'];
                        // calc SVG circle parameters and geometry
                        pathAttribute[a][i]=calcSVGRingGeom(radius[i],innerRadius);
                    }
                    // calc distances in x- and y-direction from center
                    distance=new Array();
                    for (var i=0;i<sumData.length;i++)
                    {
                        distance[i]=new Array();
                        for (var j=0;j<dataInfo['valueNr'];j++)
                        {
                            distance[i][j]=new Array();
                            distance[i][j]['x']= primitive[a]['translationX'] * mapInfo['width'] / 600;
                            distance[i][j]['y']= primitive[a]['translationY'] * mapInfo['width'] / 600;
                        }
                    }
                    break;
                case "sector":
                    switch(primitiveAttr[a]['angle']['scale'])
                    {
                        case "fixed":
                            // read angle value
                            var angle = new Array();
                            for (var i=0;i<sumData.length;i++)
                            {
                                angle[i]=primitiveAttr[a]['angle']['value'];
                            }
                            // r="dataValue";
                            primitiveAttr[a]['r']['scale']="dataValue";
                            //calc radius from sumData value
                            var symbolArea = new Array();
                            var radius = new Array();
                            pathAttribute[a] = new Array();
                            for (var i=0;i<sumData.length;i++)
                            {
                                symbolArea[i]=sumData[i]['value']*scaleFactor;
                                radius[i]=Math.sqrt(360*symbolArea[i]/Math.PI/angle[i]);
                                // calc SVG sector parameters and geometry
                                pathAttribute[a][i]=calcSVGSectorGeom(1,angle[i],radius[i]);
                            }
                            // calc distances in x- and y-direction from center
                            distance=new Array();
                            for (var i=0;i<sumData.length;i++)
                            {
                                distance[i]=new Array();
                                for (var j=0;j<dataInfo['valueNr'];j++)
                                {
                                    distance[i][j]=new Array();
                                    distance[i][j]['x']= primitive[a]['translationX'] * mapInfo['width'] / 600;
                                    distance[i][j]['y']= primitive[a]['translationY'] * mapInfo['width'] / 600;
                                }
                            }
                            break;
                        case "dataValue":
                            // var r="fixed";
                            primitiveAttr[a]['r']['scale']="fixed";
                            // read radius value
                            var radius = new Array();
                            for (var i=0; i<sumData.length;i++)
                            {
                                radius[i]= primitiveAttr[a]['r']['value']*mapInfo['width']/600;
                                // 600px is map width
                            }
                            // calc angle
                            var angle = new Array();
                            pathAttribute[a] = new Array();
                            for (var i=0;i<sumData.length;i++)
                            {
                                angle[i]= 360 / dataInfo['maxSum'] * sumData[i]['value'];
                                // calc SVG sector parameters and geometry
                                pathAttribute[a][i]=calcSVGSectorGeom(1,angle[i],radius[i]);
                            }
                            // calc distances in x- and y-direction from center
                            distance=new Array();
                            for (var i=0;i<sumData.length;i++)
                            {
                                distance[i]=new Array();
                                for (var j=0;j<dataInfo['valueNr'];j++)
                                {
                                    distance[i][j]=new Array();
                                    distance[i][j]['x']= primitive[a]['translationX'] * mapInfo['width'] / 600;
                                    distance[i][j]['y']= primitive[a]['translationY'] * mapInfo['width'] / 600;
                                }
                            }
                            break;
                        default:break;
                    }
                    break;
                case "ringSector":
                    switch(primitiveAttr[a]['angle']['scale'])
                    {
                        case "fixed":
                            // read angle value
                            var angle = new Array();
                            for (var i=0;i<sumData.length;i++)
                            {
                                angle[i]=primitiveAttr[a]['angle']['value'];
                            }
                            // r="dataValue";
                            primitiveAttr[a]['r']['scale']="dataValue";
                            var innerRadius;
                            //calc radius from sumData value
                            var symbolArea = new Array();
                            var radius = new Array();
                            pathAttribute[a] = new Array();
                            for (var i=0;i<sumData.length;i++)
                            {
                                innerRadius=primitiveAttr[a]['innerR']['value'];
                                symbolArea[i]=sumData[i]['value']*scaleFactor;
                                radius[i]=Math.sqrt(360*symbolArea[i]/Math.PI/angle[i]);
                                // calc SVG sector parameters and geometry
                                pathAttribute[a][i]=calcSVGRingSectorGeom(angle[i],radius[i],innerRadius);
                            }
                            // calc distances in x- and y-direction from center
                            distance=new Array();
                            for (var i=0;i<sumData.length;i++)
                            {
                                distance[i]=new Array();
                                for (var j=0;j<dataInfo['valueNr'];j++)
                                {
                                    distance[i][j]=new Array();
                                    distance[i][j]['x']= primitive[a]['translationX'] * mapInfo['width'] / 600;
                                    distance[i][j]['y']= primitive[a]['translationY'] * mapInfo['width'] / 600;
                                }
                            }
                            break;
                        case "dataValue":
                            // var r="fixed";
                            primitiveAttr[a]['r']['scale']="fixed";
                            // read radius value
                            var radius = new Array();
                            var innerRadius;
                            for (var i=0; i<sumData.length;i++)
                            {
                                radius[i]= primitiveAttr[a]['r']['value']*mapInfo['width']/600;
                                // 600px is map width
                            }
                            // calc angle
                            var angle = new Array();
                            pathAttribute[a] = new Array();
                            for (var i=0;i<sumData.length;i++)
                            {
                                innerRadius=primitiveAttr[a]['innerR']['value'];
                                angle[i]= 360 / dataInfo['maxSum'] * sumData[i]['value'];
                                // calc SVG sector parameters and geometry
                                pathAttribute[a][i]=calcSVGRingSectorGeom(angle[i],radius[i],innerRadius);
                            }
                            // calc distances in x- and y-direction from center
                            distance=new Array();
                            for (var i=0;i<sumData.length;i++)
                            {
                                distance[i]=new Array();
                                for (var j=0;j<dataInfo['valueNr'];j++)
                                {
                                    distance[i][j]=new Array();
                                    distance[i][j]['x']= primitive[a]['translationX'] * mapInfo['width'] / 600;
                                    distance[i][j]['y']= primitive[a]['translationY'] * mapInfo['width'] / 600;
                                }
                            }
                            break;
                        default:break;
                    }
                    break;
                case "regularPolygon":
                    var symbolArea = new Array();
                    var radius = new Array();
                    var innerRadius;
                    var edgeNr;
                    pathAttribute[a] = new Array();
                    for (var i=0;i<sumData.length;i++)
                    {
                        symbolArea[i]=sumData[i]['value']*scaleFactor;
                        radius[i]=Math.sqrt(symbolArea[i]/Math.PI);
                        innerRadius=primitiveAttr[a]['innerR']['value'];
                        edgeNr=primitiveAttr[a]['edgeNr']['value'];
                        // calc SVG regular polygon parameters and geometry
                        pathAttribute[a][i]=calcSVGRegularPolygonGeom(radius[i],edgeNr,innerRadius);
                    }
                    // calc distances in x- and y-direction from center
                    distance=new Array();
                    for (var i=0;i<sumData.length;i++)
                    {
                        distance[i]=new Array();
                        for (var j=0;j<dataInfo['valueNr'];j++)
                        {
                            distance[i][j]=new Array();
                            distance[i][j]['x']= primitive[a]['translationX'] * mapInfo['width'] / 600;
                            distance[i][j]['y']= primitive[a]['translationY'] * mapInfo['width'] / 600;
                        }
                    }
                    break;
                case "point": break;
                case "polyline": break;
                case "curve": break;
                default: break;
            }
        }
        // draw SVG symbols
        drawSVGSymbols();
    }
    if (diamlInfo['symbolType'] == "diagram")
    {
        switch (primitive[0]['name'])
        {
            case "circle": break;
            case "ellipse": break;
            case "rectangle": break;
            case "ring": break;
            case "sector":
                switch(primitiveAttr[0]['angle']['scale'])
                {
                    case "fixed":
                        // wingchart
                        var angle = new Array();
                        // var r="dataValue";
                        primitiveAttr[0]['r']['scale']="dataValue";
                        try {if(diamlInfo['arrangement']){throw 1;}else{throw 0;}}
                        catch(e)
                        {
                            // if arrangement type exists
                            if (e==1)
                            {
                                // read arrangement attributes
                                try {if(arrangement['totalAngle']){throw 1;}else{throw 0;}}
                                catch(e)
                                {
                                    if (e==1){var totalAngle = Number(arrangement['totalAngle']);}
                                    else {var totalAngle = 360;}
                                }
                                try {if(arrangement['centerDistance']){throw 1;}else{throw 0;}}
                                catch(e)
                                {
                                    if (e==1){var centerDistance = Number(arrangement['centerDistance']);}
                                    else {var centerDistance = 0;}
                                }
                                try {if(arrangement['groups']){throw 1;}else{throw 0;}}
                                catch(e)
                                {
                                    if (e==1){var groups = Number(arrangement['groups']);}
                                    else {var groups = 1;}
                                }

                                // calc angles, start angles and direction angles
                                for (var i=0; i<sumData.length;i++)
                                {
                                    angle[i]=totalAngle/dataInfo['valueNr'];
                                }
                                //calc pie area and radii
                                var pieArea = new Array();
                                var radius = new Array();
                                startAngle = new Array();
                                directionAngle = new Array();
                                pathAttribute = new Array();
                                for (var i=0;i<sortedData.length;i++)
                                {
                                    pieArea[i]=new Array();
                                    radius[i]=new Array();
                                    startAngle[i] = new Array();
                                    directionAngle[i] = new Array();
                                    pathAttribute[i]=new Array();
                                    for (var j=0;j<dataInfo['valueNr'];j++)
                                    {
                                        pieArea[i][j]=sortedData[i][(j+3)]['value']*scaleFactor;
                                        radius[i][j]=Math.sqrt(360*pieArea[i][j]/Math.PI/angle[i]);
                                        // calc start angle of each sector
                                        if (j==0){startAngle[i][j]=0;}
                                        else {startAngle[i][j]=startAngle[i][(j-1)]+angle[i];}
                                        // calc direction angle of each sector (for translation)
                                        directionAngle[i][j]=startAngle[i][j] + (angle[i] / 2);
                                        // calc SVG sector parameters and geometry
                                        pathAttribute[i][j]=calcSVGSectorGeom(1,angle[i],radius[i][j]);
                                    }
                                }
                                if (groups == 1)
                                {
                                    // calc distances for each sector in x- and y-direction from center
                                    distance = new Array();
                                    for (var i=0;i<sortedData.length;i++)
                                    {
                                        distance[i]=new Array();
                                        for (var j=0;j<dataInfo['valueNr'];j++)
                                        {
                                            distance[i][j]=new Array();
                                            distance[i][j]['x'] = (centerDistance * Math.sin(directionAngle[i][j] * Math.PI / 180) * mapInfo['width'] / 600).toFixed(3);
                                            distance[i][j]['y'] = ((-1) * centerDistance * Math.cos(directionAngle[i][j] * Math.PI / 180) * mapInfo['width'] / 600).toFixed(3);
                                        }
                                    }
                                }
                                else
                                {
                                    // calc group angle
                                    var groupAngle = totalAngle / groups;
                                    // calc group start and direction angles
                                    groupStartAngle = new Array();
                                    var groupDirectionAngle = new Array();
                                    groupDistance=new Array();
                                    for (var g=0;g<groups;g++)
                                    {
                                        // calc group start angle
                                        if (g==0){groupStartAngle[g]=0;}
                                        else {groupStartAngle[g]=groupStartAngle[(g-1)]+groupAngle;}
                                        groupDirectionAngle[g] = groupStartAngle[g] + (groupAngle / 2);
                                        groupDistance[g]=new Array();
                                        groupDistance[g]['x'] = (centerDistance * Math.sin(groupDirectionAngle[g] * Math.PI / 180) * mapInfo['width'] / 600).toFixed(3);
                                        groupDistance[g]['y'] = ((-1) * centerDistance * Math.cos(groupDirectionAngle[g] * Math.PI / 180) * mapInfo['width'] / 600).toFixed(3);
                                    }
                                }
                            }
                            // if arrangement type does not exist
                            else
                            {
                                // read angle values from primitive definition
                                for (var i=0; i<sumData.length;i++)
                                {
                                    angle[i]= primitiveAttr[0]['angle']['value'];
                                }
                                //calc pie area and radii
                                var pieArea = new Array();
                                var radius = new Array();
                                pathAttribute = new Array();
                                for (var i=0;i<sortedData.length;i++)
                                {
                                    pieArea[i]=new Array();
                                    radius[i]=new Array();
                                    pathAttribute[i]=new Array();
                                    for (var j=0;j<dataInfo['valueNr'];j++)
                                    {
                                        pieArea[i][j]=sortedData[i][(j+3)]['value']*scaleFactor;
                                        radius[i][j]=Math.sqrt(360*pieArea[i][j]/Math.PI/angle[i]);
                                        // calc SVG sector parameters and geometry
                                        pathAttribute[i][j]=calcSVGSectorGeom(1,angle[i],radius[i][j]);
                                    }
                                }
                            }
                        }
                        // draw SVG symbols
                        drawSVGSymbols();
                        break;
                    case "dataValue":
                        // piechart or divided wingchart
                        // r="fixed" or "totalSum" or "partSum" (only available in arrangement in combination with groups)
                        // for default piecharts
                        // radius=totalSum or fixed
                        if (primitiveAttr[0]['r']['scale']=="fixed")
                        {
                            var radius = new Array();
                            for (var i=0; i<sumData.length;i++)
                            {
                                radius[i]= primitiveAttr[0]['r']['value']*mapInfo['width']/600;
                                // 600px is map width
                            }
                        }
                        else
                        {
                            primitiveAttr[0]['r']['scale']="totalSum";
                            // calc totalSum
                            var symbolArea = new Array();
                            var radius = new Array();
                            for (var i=0; i<sumData.length;i++)
                            {
                                symbolArea[i]=sumData[i]['value']*scaleFactor;
                                radius[i] = Math.sqrt(symbolArea[i]/Math.PI);
                            }
                        }
                        // calc angles
                        var angle = new Array();
                        startAngle = new Array();
                        directionAngle = new Array();
                        pathAttribute = new Array();
                        for (var i=0;i<sortedData.length;i++)
                        {
                            angle[i]=new Array();
                            startAngle[i]=new Array();
                            directionAngle[i]=new Array();
                            pathAttribute[i]=new Array();
                            for (var j=0;j<dataInfo['valueNr'];j++)
                            {
                                angle[i][j]=360 / sumData[i]['value'] * sortedData[i][(j+3)]['value'];
                                // calc start angle of each sector
                                if (j==0){startAngle[i][j]=0;}
                                else {startAngle[i][j]=startAngle[i][(j-1)]+angle[i][(j-1)];}
                                // calc direction angle of each sector (for translation)
                                directionAngle[i][j]=startAngle[i][j] + (angle[i][j] / 2);
                                // calc SVG sector parameters and geometry
                                pathAttribute[i][j]=calcSVGSectorGeom(1,angle[i][j],radius[i]);
                            }
                        }
                        try {if(diamlInfo['arrangement']){throw 1;}else{throw 0;}}
                        catch(e)
                        {
                            // if arrangement type exists
                            if (e==1)
                            {
                                // read arrangement attributes
                                try {if(arrangement['totalAngle']){throw 1;}else{throw 0;}}
                                catch(e)
                                {
                                    if (e==1){var totalAngle = Number(arrangement['totalAngle']);}
                                    else {var totalAngle = 360;}
                                }
                                try {if(arrangement['centerDistance']){throw 1;}else{throw 0;}}
                                catch(e)
                                {
                                    if (e==1){var centerDistance = Number(arrangement['centerDistance']);}
                                    else {var centerDistance = 0;}
                                }
                                try {if(arrangement['groups']){throw 1;}else{throw 0;}}
                                catch(e)
                                {
                                    if (e==1){var groups = Number(arrangement['groups']);}
                                    else {var groups = 1;}
                                }

                                if (groups == 1)
                                {
                                    // calc distances
                                    distance = new Array();
                                    for (var i=0;i<sortedData.length;i++)
                                    {
                                        distance[i]=new Array();
                                        for (var j=0;j<dataInfo['valueNr'];j++)
                                        {
                                            distance[i][j]=new Array();
                                            distance[i][j]['x'] = (centerDistance * Math.sin(directionAngle[i][j] * Math.PI / 180) * mapInfo['width'] / 600).toFixed(3);
                                            distance[i][j]['y'] = ((-1) * centerDistance * Math.cos(directionAngle[i][j] * Math.PI / 180) * mapInfo['width'] / 600).toFixed(3);
                                        }
                                    }
                                }
                                else
                                {
                                    // divided wingchart
                                    // radius=partSum
                                    primitiveAttr[0]['r']['scale']="partSum";
                                    var partSum=new Array();
                                    // calc partSum
                                    for (var i=0;i<sortedData.length;i++)
                                    {
                                        partSum[i]=new Array();
                                        var counter=0;
                                        for (var g=0;g<groups;g++)
                                        {
                                            partSum[i][g]=0;
                                            for (var j=counter;j<((g+1)*dataInfo['valueNr']/groups);j++)
                                            {
                                                partSum[i][g] += sortedData[i][(j+3)]['value'];
                                            }
                                            counter = (g+1) * dataInfo['valueNr'] / groups;
                                        }
                                    }
                                    // calc radius for each part
                                    var symbolArea = new Array();
                                    var radius = new Array();
                                    for (var i=0;i<sortedData.length;i++)
                                    {
                                        symbolArea[i]=new Array();
                                        radius[i]= new Array();
                                        var counter=0;
                                        for (var g=0;g<groups;g++)
                                        {
                                            symbolArea[i][g]=partSum[i][g]*scaleFactor;
                                            for (var j=counter;j<((g+1)*dataInfo['valueNr']/groups);j++)
                                            {
                                                radius[i][j]= Math.sqrt(symbolArea[i][g]/Math.PI);
                                            }
                                            counter = (g+1) * dataInfo['valueNr'] / groups;
                                        }
                                    }
                                    // calc group angle
                                    var groupAngle = totalAngle / groups;
                                    // calc group start and direction angles and group distance
                                    groupStartAngle = new Array();
                                    var groupDirectionAngle = new Array();
                                    groupDistance=new Array();
                                    for (var g=0;g<groups;g++)
                                    {
                                        // calc group start angle
                                        if (g==0){groupStartAngle[g]=0;}
                                        else {groupStartAngle[g]=groupStartAngle[(g-1)]+groupAngle;}
                                        groupDirectionAngle[g] = groupStartAngle[g] + (groupAngle / 2);
                                        groupDistance[g]=new Array();
                                        groupDistance[g]['x'] = (centerDistance * Math.sin(groupDirectionAngle[g] * Math.PI / 180) * mapInfo['width'] / 600).toFixed(3);
                                        groupDistance[g]['y'] = ((-1) * centerDistance * Math.cos(groupDirectionAngle[g] * Math.PI / 180) * mapInfo['width'] / 600).toFixed(3);
                                    }
                                    // calc sector angles and start angles (in each group)
                                    var angle = new Array();
                                    startAngle = new Array();
                                    pathAttribute = new Array();
                                    for (var i=0; i<sortedData.length;i++)
                                    {
                                        angle[i]=new Array();
                                        startAngle[i]=new Array();
                                        pathAttribute[i]=new Array();
                                        var counter=0;
                                        for (var g=0;g<groups;g++)
                                        {
                                            for (var j=counter;j<((g+1)*dataInfo['valueNr']/groups);j++)
                                            {
                                                angle[i][j] = groupAngle / partSum[i][g] * sortedData[i][(j+3)]['value'];
                                                // calc start angle of each sector
                                                if (j==0){startAngle[i][j]=0;}
                                                else {startAngle[i][j]=startAngle[i][(j-1)]+angle[i][(j-1)];}
                                                // calc SVG sector parameters and geometry
                                                pathAttribute[i][j]=calcSVGSectorGeom(1,angle[i][j],radius[i][j]);
                                            }
                                            counter = (g+1) * dataInfo['valueNr'] / groups;
                                        }
                                    }
                                }
                            }
                        }
                        // draw SVG symbols
                        drawSVGSymbols();
                        break;
                    default:break;
                }
                break;
            case "ringSector": break;
            case "regularPolygon": break;
            case "point": break;
            case "polyline": break;
            case "curve": break;
            default: break;
        }
    }
}

// calculate SVG circle parameters and geometry
function calcSVGCircleGeom(radius)
{
    radius = Number(radius);
    return radius;
}

// calculate SVG ring parameters and geometry
function calcSVGRingGeom(radius,innerRadius)
{
    radius = Number(radius);
    innerRadius = Number(innerRadius);

    var rx = radius;
    var ry = radius;

    var x = 0;
    var y = (-1)*ry;

    var x1up = x;
    var y1up = (-2)*ry;
    var x1down = x;
    var y1down = 2*ry;

    var rxin = rx*(innerRadius/100);
    var ryin = ry*(innerRadius/100);

    var x2up = x;
    var y2up = (-2)*ryin;
    var x2down = x;
    var y2down = 2*ryin;

    // calculate flags
    var x_axis_rotation = 0;
    var large_arc_flag = 0;
    var sweep_flag1 = 1; // positive (clockwise) direction
    var sweep_flag2 = 0; // negative (counter-clockwise) direction

    // create SVG sector geometry
    var pathAttribute = "M "+x+" "+y+" a "+rx+" "+ry+" "+x_axis_rotation+" "+large_arc_flag+","+sweep_flag1
        +" "+x1down+" "+y1down+" a "+rx+" "+ry+" "+x_axis_rotation+" "+large_arc_flag+","+sweep_flag1+" "+x1up+" "+y1up+" z"
        +" m 0 "+(ry-ryin)+" a "+rxin+" "+ryin+" "+x_axis_rotation+" "+large_arc_flag+","+sweep_flag2
        +" "+x2down+" "+y2down+" a "+rxin+" "+ryin+" "+x_axis_rotation+" "+large_arc_flag+","+sweep_flag2+" "+x2up+" "+y2up+" z";

    return pathAttribute;
}

// calculate SVG regular polygon parameters and geometry
function calcSVGRegularPolygonGeom(radius,edgeNumber,innerRadius)
{
    // for stars: duplicate number of polygon edges
    if (innerRadius < 100)
    {
        edgeNumber = edgeNumber * 2;
    }

    var angle = 360 / edgeNumber /180 * Math.PI;
    var coordx = new Array();
    var coordy = new Array();
    var polygon_coord = new Array();

    for (var n = 0; n < edgeNumber; n++)
    {
        // calculation of the angle of the current point
        var current_angle = angle * n;
        coordx[n] = (Math.cos(current_angle) * radius).toFixed(3); // 3 digits after the comma
        coordy[n] = (Math.sin(current_angle)*(-1) * radius).toFixed(3);
    }

    // for stars: apply inner radius
    if (innerRadius < 100)
    {
        for (var m = 0; m < edgeNumber; m+=2)
        {
            // each second point will change its coordinates because of the innerRadius
            coordx[m] = (coordx[m]*(innerRadius/100)).toFixed(3);
            coordy[m] = (coordy[m]*(innerRadius/100)).toFixed(3);
        }
    }

    // construction of the polygon points
    for (var m = 0; m < edgeNumber; m++)
    {
        // join the x and y coordinates of the polygon points
        polygon_coord[m] = coordx[m] + "," + coordy[m];
    }

    var shapeAttribute = polygon_coord.join(" ");
    return shapeAttribute;
}

// calculate SVG ring sector parameters and geometry
function calcSVGRingSectorGeom(angle,radius,innerRadius)
{
    if (angle > 359)
    {angle = 359;}

    // calculate angles in degree and in rad
    var angle_rad = angle / 180 * Math.PI;

    if (innerRadius > 100)
    {innerRadius = 100;}

    var rx = radius.toFixed(3);
    var ry = radius.toFixed(3);

    var inner_rx = rx*(innerRadius/100);
    var inner_ry = ry*(innerRadius/100);

    // center point
    var x = 0;
    var y = 0;

    var v = (-1) * (ry - inner_ry);
    var inner_x_start = 0;
    var inner_y_start = (-1) * inner_ry;

    // calculate end point coordinates of outer sector
    var xe = (Math.sin(angle_rad)*rx).toFixed(3); // 3 digits after the comma
    var ye = ((1-Math.cos(angle_rad))*ry).toFixed(3);

    // calculate end point coordinates of inner sector
    var inner_xe = (-1)*(Math.sin(angle_rad) * inner_rx).toFixed(3);
    var inner_ye = (-1)*((1-Math.cos(angle_rad)) * inner_ry).toFixed(3);

    var diffx = (-1)*(Math.sin(angle_rad))*(rx-inner_rx);
    var diffy = Math.cos(angle_rad)*(rx-inner_ry);

    // calculate flags
    var x_axis_rotation = 0;
    if (angle < 180)
    {var large_arc_flag = 0;}
    else
    {var large_arc_flag = 1;}
    var sweep_flag1 = 1; // positive (clockwise) direction
    var sweep_flag2 = 0; // negative (anti-clockwise) direction

    var shapeAttribute = "M "+inner_x_start+" "+inner_y_start+" v 0 "+v+" a "+rx+" "+ry+" "
        +x_axis_rotation+" "+large_arc_flag+","+sweep_flag1+" "+xe+" "+ye
        +" l "+diffx+" "+diffy
        +" a "+inner_rx+" "+inner_ry+" "+x_axis_rotation+" "+large_arc_flag+","+sweep_flag2
        +" "+inner_xe+" "+inner_ye;//+" z";
    return shapeAttribute;
}

// calculate SVG sector parameters and geometry
function calcSVGSectorGeom(connectCenter,angle,radius)
{
    angle = Number(angle);
    radius = Number(radius);

    if (angle > 359.99)
    {angle = 359.99;}
    if (angle < 0)
    {angle = Math.sqrt(angle*angle);}

    var rx = radius.toFixed(3);
    var ry = radius.toFixed(3);

    var x = 0;
    if (connectCenter == 1)
    {
        var y = 0;
        var v = (-1) * ry;
    }
    if (connectCenter == 0)
    {
        var y = (-1) * ry;
        var v = 0;
    }

    // calculate angles in degree and in rad
    var angle_rad = angle / 180 * Math.PI;

    // calculate end point coordinates
    var xe = (Math.sin(angle_rad)*rx).toFixed(3); // 3 digits after the comma
    var ye = ((1-Math.cos(angle_rad))*ry).toFixed(3);

    // calculate flags
    var x_axis_rotation = 0;
    if (angle < 180)
    {var large_arc_flag = 0;}
    else
    {var large_arc_flag = 1;}
    var sweep_flag = 1; // positive (clockwise) direction

    // create SVG sector geometry
    var pathAttribute = "M 0 0 v"+v+" a "+rx+" "+ry+" "+x_axis_rotation+" "+large_arc_flag+","+sweep_flag+" "+xe+" "+ye+" z";
    return pathAttribute;
}

// main draw function
function drawSVGSymbols()
{
    var mainMap = document.getElementById("mainMap");
    // delete all previously drawn symbols
    if (document.getElementById("symbolLayer"))
    {deleteChildren(document.getElementById("symbolLayer"));}
    else
    {
        // create symbol layer group
        var symbolGroup = document.createElementNS(svgNS,"g");
        symbolGroup.setAttributeNS(null,"id","symbolLayer");
        symbolGroup.setAttributeNS('http://www.w3.org/2000/xmlns/',"xmlns:attrib","http://www.carto.net/schnabel");
        mainMap.appendChild(symbolGroup);
    }
    for (var i=0;i<sortedData.length;i++)
    {
        // create group with id for each symbol in the map
        var symbol=document.createElementNS(svgNS,"g");
        symbol.setAttributeNS(null,"id","s"+i);
        symbol.setAttributeNS(attribNS,"attrib:id",sortedData[i][2]['value']);
        symbol.setAttributeNS(attribNS,"attrib:sum",sumData[i]['value']);
        var symbolTranslationX = sortedData[i][0]['value']+(diamlInfo['translationX'] * mapInfo['width'] / 600);
        var symbolTranslationY = (-1)*sortedData[i][1]['value']+(diamlInfo['translationY'] * mapInfo['width'] / 600);
        var transformAttribute="translate("+symbolTranslationX+" "+symbolTranslationY+"), rotate("+diamlInfo['rotation']+" "+(diamlInfo['translationX'] * mapInfo['width'] / 600)+" "+(diamlInfo['translationY'] * mapInfo['width'] / 600)+")";
        symbol.setAttributeNS(null,"transform",transformAttribute);
        document.getElementById("symbolLayer").appendChild(symbol);

        for (var a=0;a<primitive.length;a++)
        {
            switch (primitive[a]['name'])
            {
                case "circle":
                    if (diamlInfo['symbolType'] == "simpleSymbol")
                    {
                        var myPath = document.createElementNS(svgNS,"circle");
                        myPath.setAttributeNS(null,"r",pathAttribute[a][i]);
                        var primTranslationX = primitive[a]['translationX'] * mapInfo['width'] / 600;
                        var primTranslationY = primitive[a]['translationY'] * mapInfo['width'] / 600;
                        var transformAttribute="rotate("+primitive[a]['rotation']+" "+primTranslationX+" "+primTranslationY+"),translate("+primTranslationX+" "+primTranslationY+")";
                        myPath.setAttributeNS(null,"transform", transformAttribute);
                        // apply styles
                        myPath.setAttributeNS(null,"fill",styles[a]['fill']);
                        myPath.setAttributeNS(null,"fill-opacity",styles[a]['fill-opacity']);
                        myPath.setAttributeNS(null,"stroke",styles[a]['stroke']);
                        myPath.setAttributeNS(null,"stroke-opacity",styles[a]['stroke-opacity']);
                        myPath.setAttributeNS(null,"stroke-width",(styles[a]['stroke-width'] * mapInfo['width'] / 600));
                        document.getElementById("s"+i).appendChild(myPath);
                    }
                    // if diagram
                    else
                    {}
                    break;
                case "ellipse": break;
                case "rectangle": break;
                case "ring":
                    if (diamlInfo['symbolType'] == "simpleSymbol")
                    {
                        var myPath = document.createElementNS(svgNS,"path");
                        myPath.setAttributeNS(null,"d",pathAttribute[a][i]);
                        var primTranslationX = primitive[a]['translationX'] * mapInfo['width'] / 600;
                        var primTranslationY = primitive[a]['translationY'] * mapInfo['width'] / 600;
                        var transformAttribute="rotate("+primitive[a]['rotation']+" "+primTranslationX+" "+primTranslationY+"),translate("+primTranslationX+" "+primTranslationY+")";
                        myPath.setAttributeNS(null,"transform", transformAttribute);
                        // apply styles
                        myPath.setAttributeNS(null,"fill",styles[a]['fill']);
                        myPath.setAttributeNS(null,"fill-opacity",styles[a]['fill-opacity']);
                        myPath.setAttributeNS(null,"stroke",styles[a]['stroke']);
                        myPath.setAttributeNS(null,"stroke-opacity",styles[a]['stroke-opacity']);
                        myPath.setAttributeNS(null,"stroke-width",(styles[a]['stroke-width'] * mapInfo['width'] / 600));
                        document.getElementById("s"+i).appendChild(myPath);
                    }
                    // if diagram
                    else
                    {}
                    break;
                case "sector":
                    if (diamlInfo['symbolType'] == "simpleSymbol")
                    {
                        var myPath = document.createElementNS(svgNS,"path");
                        myPath.setAttributeNS(null,"d",pathAttribute[a][i]);
                        var primTranslationX = primitive[a]['translationX'] * mapInfo['width'] / 600;
                        var primTranslationY = primitive[a]['translationY'] * mapInfo['width'] / 600;
                        var transformAttribute="rotate("+primitive[a]['rotation']+" "+primTranslationX+" "+primTranslationY+"),translate("+primTranslationX+" "+primTranslationY+")";
                        myPath.setAttributeNS(null,"transform", transformAttribute);
                        // apply styles
                        myPath.setAttributeNS(null,"fill",styles[a]['fill']);
                        myPath.setAttributeNS(null,"fill-opacity",styles[a]['fill-opacity']);
                        myPath.setAttributeNS(null,"stroke",styles[a]['stroke']);
                        myPath.setAttributeNS(null,"stroke-opacity",styles[a]['stroke-opacity']);
                        myPath.setAttributeNS(null,"stroke-width",(styles[a]['stroke-width'] * mapInfo['width'] / 600));
                        document.getElementById("s"+i).appendChild(myPath);
                    }
                    // if diagram
                    else
                    {
                        // check if groups are necessary
                        try {if(arrangement['groups']){throw 1;}else{throw 0;}}
                        catch(e)
                        {
                            if (e==1)
                            {var groups = Number(arrangement['groups']);}
                            else
                            {var groups = 1;}
                        }

                        // divided wingchart and grouped wingchart
                        if (groups>1)
                        {
                            var counter=0;
                            // create groups
                            for (var g=0;g<groups;g++)
                            {
                                var myGroup = document.createElementNS(svgNS,"g");
                                myGroup.setAttributeNS(null,"id","s"+i+"g"+g);
                                var groupTransformAttribute = "rotate(0 0 0),translate("+groupDistance[g]['x']+" "+groupDistance[g]['y']+")";
                                myGroup.setAttributeNS(null,"transform",groupTransformAttribute);
                                document.getElementById("s"+i).appendChild(myGroup);
                                // create sectors
                                for (var j=counter;j<((g+1)*dataInfo['valueNr']/groups);j++)
                                {
                                    var myPath = document.createElementNS(svgNS,"path");
                                    myPath.setAttributeNS(null,"d",pathAttribute[i][j]);
                                    myPath.setAttributeNS(attribNS,"attrib:name",sortedData[i][(j+3)]['name']);
                                    myPath.setAttributeNS(attribNS,"attrib:value",sortedData[i][(j+3)]['value']);

                                    // check if startangle exists
                                    try {if(startAngle[i][j]){throw 1;}else{throw 0;}}
                                    catch(e)
                                    {
                                        if (e==1)
                                        {var primStartAngle = startAngle[i][j];}
                                        else{var primStartAngle = 0;}
                                    }
                                    // set transformation attribute for each sector
                                    var transformAttribute="translate(0 0),rotate("+primStartAngle+" 0 0)";
                                    myPath.setAttributeNS(null,"transform", transformAttribute);
                                    // apply styles
                                    myPath.setAttributeNS(null,"fill",styles[j]['fill']);
                                    myPath.setAttributeNS(null,"fill-opacity",styles[j]['fill-opacity']);
                                    myPath.setAttributeNS(null,"stroke",styles[j]['stroke']);
                                    myPath.setAttributeNS(null,"stroke-opacity",styles[j]['stroke-opacity']);
                                    myPath.setAttributeNS(null,"stroke-width", (styles[j]['stroke-width'] * mapInfo['width'] / 600));
                                    myGroup.appendChild(myPath);
                                }
                                counter = (g+1) * dataInfo['valueNr'] / groups;
                            }
                        }
                        // default piecharts and wingcharts
                        else
                        {
                            for (var j=0;j<dataInfo['valueNr'];j++)
                            {
                                var myPath = document.createElementNS(svgNS,"path");
                                myPath.setAttributeNS(null,"d",pathAttribute[i][j]);
                                myPath.setAttributeNS(attribNS,"attrib:name",sortedData[i][(j+3)]['name']);
                                myPath.setAttributeNS(attribNS,"attrib:value",sortedData[i][(j+3)]['value']);

                                // check if transformation parameters exist (if not (arrangement not applied), set translation and rotation zero)
                                try {if(distance[i][j]['x']){throw 1;}else{throw 0;}}
                                catch(e)
                                {
                                    if (e==1)
                                    {var primTranslationX = distance[i][j]['x'];}
                                    else{var primTranslationX = 0;}
                                }
                                try {if(distance[i][j]['y']){throw 1;}else{throw 0;}}
                                catch(e)
                                {
                                    if (e==1)
                                    {var primTranslationY = distance[i][j]['y'];}
                                    else{var primTranslationY = 0;}
                                }
                                try {if(diamlInfo['arrangement']){throw 1;}else{throw 0;}}
                                catch(e)
                                {
                                    // if arrangement type exists
                                    if (e==1)
                                    {
                                        try {if(startAngle[i][j]){throw 1;}else{throw 0;}}
                                        catch(e)
                                        {
                                            if (e==1)
                                            {var primStartAngle = startAngle[i][j];}
                                            else{var primStartAngle = 0;}
                                        }
                                    }
                                    else
                                    {var primStartAngle=0;}
                                }
                                // set transformation attribute for each sector
                                var transformAttribute="translate("+primTranslationX+" "+primTranslationY+"),rotate("+primStartAngle+" 0 0)";
                                myPath.setAttributeNS(null,"transform", transformAttribute);
                                // apply styles
                                myPath.setAttributeNS(null,"fill",styles[j]['fill']);
                                myPath.setAttributeNS(null,"fill-opacity",styles[j]['fill-opacity']);
                                myPath.setAttributeNS(null,"stroke",styles[j]['stroke']);
                                myPath.setAttributeNS(null,"stroke-opacity",styles[j]['stroke-opacity']);
                                myPath.setAttributeNS(null,"stroke-width", (styles[j]['stroke-width'] * mapInfo['width'] / 600));
                                document.getElementById("s"+i).appendChild(myPath);
                            }
                        }
                    }
                    break;
                case "ringSector":
                    if (diamlInfo['symbolType'] == "simpleSymbol")
                    {
                        var myPath = document.createElementNS(svgNS,"path");
                        myPath.setAttributeNS(null,"d",pathAttribute[a][i]);
                        var primTranslationX = primitive[a]['translationX'] * mapInfo['width'] / 600;
                        var primTranslationY = primitive[a]['translationY'] * mapInfo['width'] / 600;
                        var transformAttribute="rotate("+primitive[a]['rotation']+" "+primTranslationX+" "+primTranslationY+"),translate("+primTranslationX+" "+primTranslationY+")";
                        myPath.setAttributeNS(null,"transform", transformAttribute);
                        // apply styles
                        myPath.setAttributeNS(null,"fill",styles[a]['fill']);
                        myPath.setAttributeNS(null,"fill-opacity",styles[a]['fill-opacity']);
                        myPath.setAttributeNS(null,"stroke",styles[a]['stroke']);
                        myPath.setAttributeNS(null,"stroke-opacity",styles[a]['stroke-opacity']);
                        myPath.setAttributeNS(null,"stroke-width",(styles[a]['stroke-width'] * mapInfo['width'] / 600));
                        document.getElementById("s"+i).appendChild(myPath);
                    }
                    // if diagram
                    else
                    {}
                    break;
                case "regularPolygon":
                    if (diamlInfo['symbolType'] == "simpleSymbol")
                    {
                        var myPath = document.createElementNS(svgNS,"polygon");
                        myPath.setAttributeNS(null,"points",pathAttribute[a][i]);
                        var primTranslationX = primitive[a]['translationX'] * mapInfo['width'] / 600;
                        var primTranslationY = primitive[a]['translationY'] * mapInfo['width'] / 600;
                        var transformAttribute="rotate("+primitive[a]['rotation']+" "+primTranslationX+" "+primTranslationY+"),translate("+primTranslationX+" "+primTranslationY+")";
                        myPath.setAttributeNS(null,"transform", transformAttribute);
                        // apply styles
                        myPath.setAttributeNS(null,"fill",styles[a]['fill']);
                        myPath.setAttributeNS(null,"fill-opacity",styles[a]['fill-opacity']);
                        myPath.setAttributeNS(null,"stroke",styles[a]['stroke']);
                        myPath.setAttributeNS(null,"stroke-opacity",styles[a]['stroke-opacity']);
                        myPath.setAttributeNS(null,"stroke-width",(styles[a]['stroke-width'] * mapInfo['width'] / 600));
                        document.getElementById("s"+i).appendChild(myPath);
                    }
                    // if diagram
                    else
                    {}
                    break;
                case "point": break;
                case "polyline": break;
                case "curve": break;
                default: break;
            }
        }
    }
    // add interactivity (because it is lost every time we draw the map again
    if (diamlInfo['labelData'] == "yes")
    {myMapApp.rb["radioInteractivity"].selectById("yes",true);}
    else
    {myMapApp.rb["radioInteractivity"].selectById("no",true);}
}

// apply arrangement settings to SVG symbol
function applyArr2SVGSymbol()
{
    var mainMap = document.getElementById("mainMap");
    // delete all previously drawn symbols
    if (document.getElementById("symbolLayer"))
    {deleteChildren(document.getElementById("symbolLayer"));}
    else
    {
        // create symbol layer group
        var symbolGroup = document.createElementNS(svgNS,"g");
        symbolGroup.setAttributeNS(null,"id","symbolLayer");
        symbolGroup.setAttributeNS('http://www.w3.org/2000/xmlns/',"xmlns:attrib","http://www.carto.net/schnabel");
        mainMap.appendChild(symbolGroup);
    }

    for (var i=0;i<sortedData.length;i++)
    {
        // create group with id for each symbol in the map
        var symbol=document.createElementNS(svgNS,"g");
        symbol.setAttributeNS(null,"id","s"+i);
        symbol.setAttributeNS(attribNS,"attrib:id",sortedData[i][2]['value']);
        var symbolTranslationX = sortedData[i][0]['value']+(diamlInfo['translationX'] * mapInfo['width'] / 600);
        var symbolTranslationY = sortedData[i][1]['value']+(diamlInfo['translationY'] * mapInfo['width'] / 600);
        var transformAttribute="translate("+symbolTranslationX+" "+symbolTranslationY+"), rotate("+diamlInfo['rotation']+" "+symbolTranslationX+" "+symbolTranslationY+")";
        symbol.setAttributeNS(null,"transform",transformAttribute);
        document.getElementById("symbolLayer").appendChild(symbol);

        for (var a=0;a<primitive.length;a++)
        {
            switch (primitive[a]['name'])
            {
                case "circle": break;
                case "ellipse": break;
                case "rectangle": break;
                case "ring": break;
                case "sector":
                    if (diamlInfo['symbolType'] == "simpleSymbol")
                    {
                        var myPath = document.createElementNS(svgNS,"path");
                        myPath.setAttributeNS(null,"d",pathAttribute[i]);
                        myPath.setAttributeNS(attribNS,"attrib:"+sumData[i]['name'],sumData[i]['value']);
                        var primTranslationX = primitive[a]['translationX'] * mapInfo['width'] / 600;
                        var primTranslationY = primitive[a]['translationY'] * mapInfo['width'] / 600;
                        var transformAttribute="rotate("+primitive[a]['rotation']+" 0 0),translate("+primTranslationX+" "+primTranslationY+")";
                        myPath.setAttributeNS(null,"transform", transformAttribute);
                        // apply styles
                        myPath.setAttributeNS(null,"fill",styles[a]['fill']);
                        myPath.setAttributeNS(null,"fill-opacity",styles[a]['fill-opacity']);
                        myPath.setAttributeNS(null,"stroke",styles[a]['stroke']);
                        myPath.setAttributeNS(null,"stroke-opacity",styles[a]['stroke-opacity']);
                        myPath.setAttributeNS(null,"stroke-width",(styles[a]['stroke-width'] * mapInfo['width'] / 600));
                        document.getElementById("s"+i).appendChild(myPath);
                    }
                    else
                    {
                        for (var j=0;j<dataInfo['valueNr'];j++)
                        {
                            var myPath = document.createElementNS(svgNS,"path");
                            myPath.setAttributeNS(null,"d",pathAttribute[i][j]);
                            myPath.setAttributeNS(attribNS,"attrib:"+sortedData[i][(j+3)]['name'],sortedData[i][(j+3)]['value']);
                            var primTranslationX = distance[i][j]['x'];
                            var primTranslationY = distance[i][j]['y'];
                            var transformAttribute="rotate("+startangle[i][j]+" 0 0),translate("+primTranslationX+" "+primTranslationY+")";
                            myPath.setAttributeNS(null,"transform", transformAttribute);
                            // apply styles
                            myPath.setAttributeNS(null,"fill",styles[j]['fill']);
                            myPath.setAttributeNS(null,"fill-opacity",styles[j]['fill-opacity']);
                            myPath.setAttributeNS(null,"stroke",styles[j]['stroke']);
                            myPath.setAttributeNS(null,"stroke-opacity",styles[j]['stroke-opacity']);
                            myPath.setAttributeNS(null,"stroke-width", (styles[j]['stroke-width'] * mapInfo['width'] / 600));
                            document.getElementById("s"+i).appendChild(myPath);
                        }
                    }
                    break;
                case "ringSector": break;
                case "regularPolygon": break;
                case "point": break;
                case "polyline": break;
                case "curve": break;
                default: break;
            }
        }
    }
}

// generate DiaML string
function generateDiaml()
{
    // create root element
    var diamlstring = '<symbol xmlns="http://www.carto.net/schnabel/mapsymbolbrewer" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.carto.net/schnabel/mapsymbolbrewer http://www.carto.net/schnabel/mapsymbolbrewer/schemas/diaml.xsd">';

    // create style definitions
    for (var i=0;i<styles.length;i++)
    {
        diamlstring += '<style id="'+styles[i]['id']+'"><fill>'+styles[i]['fill']+'</fill><fill-opacity unit="percent">'+styles[i]['fill-opacity']*100+'</fill-opacity><stroke>'+styles[i]['stroke']+'</stroke><stroke-opacity unit="percent">'+styles[i]['stroke-opacity']*100+'</stroke-opacity><stroke-width unit="pixel">'+styles[i]['stroke-width']+'</stroke-width></style>';
    }

    // create primitive definitions
    for (var j=0;j<primitive.length;j++)
    {
        diamlstring += '<primitive id="'+primitive[j]['id']+'"><'+primitive[j]['name'];
        switch (primitive[j]['name'])
        {
            case "circle":
                diamlstring+=' proportional="'+primitive[j]['proportional']+'"';
                if (diamlInfo['symbolType']=="simpleSymbol")
                {diamlstring += ' translationX="'+primitive[j]['translationX']+'" translationY="'+primitive[j]['translationY']+'"';}
                diamlstring += '>';
                diamlstring+='<r scale="'+primitiveAttr[j]['r']['scale']+'">'+primitiveAttr[j]['r']['value']+'</r>';
                break;
            case "ellipse":
                diamlstring+=' proportional="'+primitive[j]['proportional']+'"';
                if (diamlInfo['symbolType']=="simpleSymbol")
                {diamlstring += ' rotation="'+primitive[j]['rotation']+'" translationX="'+primitive[j]['translationX']+'" translationY="'+primitive[j]['translationY']+'"';}
                diamlstring += '>';
                diamlstring+='<rx scale="'+primitiveAttr[j]['rx']['scale']+'">'+primitiveAttr[j]['rx']['value']+'</rx>';
                diamlstring+='<ry scale="'+primitiveAttr[j]['ry']['scale']+'">'+primitiveAttr[j]['ry']['value']+'</ry>';
                break;
            case "rectangle":
                diamlstring+=' proportional="'+primitive[j]['proportional']+'"';
                if (diamlInfo['symbolType']=="simpleSymbol")
                {diamlstring += ' rotation="'+primitive[j]['rotation']+'" translationX="'+primitive[j]['translationX']+'" translationY="'+primitive[j]['translationY']+'"';}
                diamlstring += '>';
                diamlstring+='<width scale="'+primitiveAttr[j]['width']['scale']+'">'+primitiveAttr[j]['width']['value']+'</width>';
                diamlstring+='<height scale="'+primitiveAttr[j]['height']['scale']+'">'+primitiveAttr[j]['height']['value']+'</height>';
                // optional
                diamlstring+='<rectRx>'+primitiveAttr[j]['rectRx']['value']+'</rectRx>';
                diamlstring+='<rectRy>'+primitiveAttr[j]['rectRy']['value']+'</rectRy>';
                break;
            case "ring":
                diamlstring+=' proportional="'+primitive[j]['proportional']+'"';
                if (diamlInfo['symbolType']=="simpleSymbol")
                {diamlstring += ' translationX="'+primitive[j]['translationX']+'" translationY="'+primitive[j]['translationY']+'"';}
                diamlstring += '>';
                diamlstring+='<r scale="'+primitiveAttr[j]['r']['scale']+'">'+primitiveAttr[j]['r']['value']+'</r>';
                diamlstring+='<innerR unit="percent">'+primitiveAttr[j]['innerR']['value']+'</innerR>';
                break;
            case "sector":
                diamlstring+=' proportional="'+primitive[j]['proportional']+'"';
                if (diamlInfo['symbolType']=="simpleSymbol")
                {diamlstring += ' rotation="'+primitive[j]['rotation']+'" translationX="'+primitive[j]['translationX']+'" translationY="'+primitive[j]['translationY']+'"';}
                diamlstring += '>';
                diamlstring += '<r scale="'+primitiveAttr[j]['r']['scale']+'">'+primitiveAttr[j]['r']['value']+'</r>';
                diamlstring += '<angle scale="'+primitiveAttr[j]['angle']['scale']+'">'+primitiveAttr[j]['angle']['value']+'</angle>';
                break;
            case "ringSector":
                diamlstring+=' proportional="'+primitive[j]['proportional']+'"';
                if (diamlInfo['symbolType']=="simpleSymbol")
                {diamlstring += ' rotation="'+primitive[j]['rotation']+'" translationX="'+primitive[j]['translationX']+'" translationY="'+primitive[j]['translationY']+'"';}
                diamlstring += '>';
                diamlstring += '<r scale="'+primitiveAttr[j]['r']['scale']+'">'+primitiveAttr[j]['r']['value']+'</r>';
                diamlstring += '<angle scale="'+primitiveAttr[j]['angle']['scale']+'">'+primitiveAttr[j]['angle']['value']+'</angle>';
                // here switch between the following 2 primitive attributes
                diamlstring+='<innerR unit="percent">'+primitiveAttr[j]['innerR']['value']+'</innerR>';
                if (primitiveAttr[j]['fixWidth'])
                {diamlstring+='<fixWidth unit="pixel">'+primitiveAttr[j]['fixWidth']['value']+'</fixWidth>';}
                break;
            case "regularPolygon":
                diamlstring+=' proportional="'+primitive[j]['proportional']+'"';
                if (diamlInfo['symbolType']=="simpleSymbol")
                {diamlstring += ' rotation="'+primitive[j]['rotation']+'" translationX="'+primitive[j]['translationX']+'" translationY="'+primitive[j]['translationY']+'"';}
                diamlstring += '>';
                diamlstring += '<r scale="'+primitiveAttr[j]['r']['scale']+'">'+primitiveAttr[j]['r']['value']+'</r>';
                diamlstring+='<edgeNr>'+primitiveAttr[j]['edgeNr']['value']+'</edgeNr>';
                diamlstring+='<innerR unit="percent">'+primitiveAttr[j]['innerR']['value']+'</innerR>';
                break;
            case "point":
                diamlstring += '>';
                diamlstring += '<r scale="'+primitiveAttr[j]['r']['scale']+'">'+primitiveAttr[j]['r']['value']+'</r>';
                break;
            case "polyline":
                diamlstring += '>';
                diamlstring+='<points />';
                break;
            case "curve":
                diamlstring += '>';
                diamlstring+='<points />';
                break;
            default: break;
        }
        diamlstring += '</'+primitive[j]['name']+'>';
        diamlstring+='</primitive>';
    }

    // create simple symbol or diagram definition
    diamlstring +='<'+diamlInfo['symbolType']+' translationX="'+diamlInfo['translationX']+'" translationY="'+diamlInfo['translationY']+'" rotation="'+diamlInfo['rotation']+'" minSize="'+diamlInfo['minSize']+'" areaRatio="'+diamlInfo['areaRatio']+'">';

    // create arrangement
    if (diamlInfo['symbolType']=="simpleSymbol")
    {diamlstring += '<simpleArrangement>';}
    else{diamlstring += '<diagramArrangement>';}
    diamlstring+='<'+diamlInfo['arrangement']+'>';
    switch (diamlInfo['arrangement'])
    {
        case "centered": break;
        case "grid":
            diamlstring+='<unitDistance>'+arrangement['unitDistance']+'</unitDistance>';
            diamlstring+='<unitValue>'+arrangement['unitValue']+'</unitValue>';
            diamlstring+='<unitsPerRow>'+arrangement['unitsPerRow']+'</unitsPerRow>';
            break;
        case "polar":
            diamlstring+='<groups>'+arrangement['groups']+'</groups>';
            diamlstring+='<centerDistance>'+arrangement['centerDistance']+'</centerDistance>';
            diamlstring+='<totalAngle unit="degree">'+arrangement['totalAngle']+'</totalAngle>';
            for (var j=0;j<primitive.length;j++)
            {
                if (primitive[j]['name'] == 'rectangle')
                {
                    diamlstring+='<distance from="lastPrimitive">'+arrangement['distance']+'</distance>';
                    diamlstring+='<parts arrangement="'+arrangement['partArrangement']+'">'+arrangement['parts']+'</parts>';
                }
            }
            break;
        case "linear":
            diamlstring+='<groups distance="'+arrangement['groupDistance']+'">'+arrangement['groups']+'</groups>';
            diamlstring+='<distance from="'+arrangement['distanceFrom']+'">'+arrangement['distance']+'</distance>';
            diamlstring+='<parts arrangement="'+arrangement['partArrangement']+'">'+arrangement['parts']+'</parts>';
            break;
        case "perpendicular": break;
        case "triangular": break;
    }
    diamlstring+='</'+diamlInfo['arrangement']+'>';
    if (diamlInfo['symbolType']=="simpleSymbol")
    {diamlstring += '</simpleArrangement>';}
    else{diamlstring += '</diagramArrangement>';}

    // relations between data, primitive and style
    if (diamlInfo['symbolType'] == 'simpleSymbol')
    {var nr=primitive.length;}
    else {var nr = dataInfo['valueNr'];}
    for (var i=0;i<nr;i++)
    {
        if (diamlInfo['symbolType'] == 'simpleSymbol')
        {diamlstring+='<simpleRelation>';}
        else {diamlstring+='<diagramRelation>';}

        diamlstring+='<dataRef>'+relation[i]['dataRef']+'</dataRef>';
        diamlstring+='<primitiveRef>'+relation[i]['primitiveRef']+'</primitiveRef>';
        diamlstring+='<styleRef>'+relation[i]['styleRef']+'</styleRef>';

        if (diamlInfo['symbolType'] == 'simpleSymbol')
        {diamlstring+='</simpleRelation>';}
        else {diamlstring+='</diagramRelation>';}
    }

    // guides
    diamlstring+='<guides>';
    for (var k=0;k<guides.length;k++)
    {
        switch (guides['type'])
        {
            case "guideBgRectangle":
                diamlstring+='<guideBgRectangle fill="'+guides[k]['fill']+'" fill-opacity="'+guides[k]['fill-opacity']+'" />';
                break;
            case "guideBgTriangle":
                diamlstring+='<guideBgTriangle fill="'+guides[k]['fill']+'" fill-opacity="'+guides[k]['fill-opacity']+'" />';
                break;
            case "guideCircle":
                diamlstring+='<guideCircle r="'+guides[k]['r']+'" unit="percent" />';
                break;
            case "guideLine":
                diamlstring+='<guideLine from="'+guides[k]['from']+'" to="'+guides[k]['to']+'" />';
                break;
            case "guideRegularPolygon":
                diamlstring+='<guideRegularPolygon r="'+guides[k]['r']+'" unit="percent" edgeNr="'+guides[k]['edgeNr']+'" />';
                break;
            default: break;
        }
    }
    diamlstring+='</guides>';

    // label data (interactivity)
    diamlstring+='<labelData>'+diamlInfo['labelData']+'</labelData>';

    diamlstring+='</'+diamlInfo['symbolType']+'>';
    diamlstring+='</symbol>';

    return diamlstring;
}

// export function
function exportIt()//groupId,evt,buttonText)
{
    var diamlexportstring = generateDiaml();
    diamlexportstring = "diaml<***>"+sessionid+"<***>"+diamlexportstring;
    var svgmapexportstring = serializeNode(document.getElementById("mainMap"));
    if (diamlInfo['labelData'] == "yes")
    {svgmapexportstring = "svgmapi<***>"+sessionid+"<***>"+svgmapexportstring;}
    else
    {svgmapexportstring = "svgmap<***>"+sessionid+"<***>"+svgmapexportstring;}
    var svglayerexportstring = serializeNode(document.getElementById("symbolLayer"));
    svglayerexportstring = "svglayer<***>"+sessionid+"<***>"+svglayerexportstring;

    var postDiaml = new postXMLData("export.php",diamlexportstring,callBackDiamlDescription);
    postDiaml.sendData();
    var postSVGMap = new postXMLData("export.php",svgmapexportstring,callBackSVGMap);
    postSVGMap.sendData();
    var postSVGLayer = new postXMLData("export.php",svglayerexportstring,callBackSVGLayer);
    postSVGLayer.sendData();

}

// callback of the export function (diaml)
function callBackDiamlDescription(obj)
{
    // delete old links
    if (document.getElementById("exportDiaMLFile"))
    {deleteChildren(document.getElementById("exportDiaMLFile"));}

    var breakpt = obj.firstChild.nodeValue.indexOf("upload");
    var endpt = obj.firstChild.nodeValue.length;
    var linktext1 = document.createTextNode(obj.firstChild.nodeValue.slice(0,breakpt));
    var linktext2 = document.createTextNode(obj.firstChild.nodeValue.slice(breakpt,endpt));

    var tspan1 = document.createElementNS(svgNS,"tspan");
    tspan1.setAttributeNS(null,"dy",0);
    tspan1.appendChild(linktext1);
    var tspan2 = document.createElementNS(svgNS,"tspan");
    tspan2.setAttributeNS(null,"x",0);
    tspan2.setAttributeNS(null,"dy",10);
    tspan2.appendChild(linktext2);

    document.getElementById("exportDiaMLFile").appendChild(tspan1);
    document.getElementById("exportDiaMLFile").appendChild(tspan2);
    document.getElementById("exportDiaMLFile").parentNode.setAttributeNS(xlinkNS,"href",obj.firstChild.nodeValue+".txt");

    // for Swiss World Atlas interactive
    document.getElementById("exportSWAi").parentNode.setAttributeNS(xlinkNS,"href","http://localhost:8080/cgi-bin/atlas/upload/diaml?location="+obj.firstChild.nodeValue);
}

// callback of the export function (svg map)
function callBackSVGMap(obj)
{
    // delete old links
    if (document.getElementById("exportSVGMap"))
    {deleteChildren(document.getElementById("exportSVGMap"));}

    var breakpt = obj.firstChild.nodeValue.indexOf("upload");
    var endpt = obj.firstChild.nodeValue.length;
    var linktext1 = document.createTextNode(obj.firstChild.nodeValue.slice(0,breakpt));
    var linktext2 = document.createTextNode(obj.firstChild.nodeValue.slice(breakpt,endpt));

    var tspan1 = document.createElementNS(svgNS,"tspan");
    tspan1.setAttributeNS(null,"dy",0);
    tspan1.appendChild(linktext1);
    var tspan2 = document.createElementNS(svgNS,"tspan");
    tspan2.setAttributeNS(null,"x",0);
    tspan2.setAttributeNS(null,"dy",10);
    tspan2.appendChild(linktext2);

    document.getElementById("exportSVGMap").appendChild(tspan1);
    document.getElementById("exportSVGMap").appendChild(tspan2);
    document.getElementById("exportSVGMap").parentNode.setAttributeNS(xlinkNS,"href",obj.firstChild.nodeValue+".txt");
}

// callback of the export function (svg layer)
function callBackSVGLayer(obj)
{
    // delete old links
    if (document.getElementById("exportSVGLayer"))
    {deleteChildren(document.getElementById("exportSVGLayer"));}

    var breakpt = obj.firstChild.nodeValue.indexOf("upload");
    var endpt = obj.firstChild.nodeValue.length;
    var linktext1 = document.createTextNode(obj.firstChild.nodeValue.slice(0,breakpt));
    var linktext2 = document.createTextNode(obj.firstChild.nodeValue.slice(breakpt,endpt));

    var tspan1 = document.createElementNS(svgNS,"tspan");
    tspan1.setAttributeNS(null,"dy",0);
    tspan1.appendChild(linktext1);
    var tspan2 = document.createElementNS(svgNS,"tspan");
    tspan2.setAttributeNS(null,"x",0);
    tspan2.setAttributeNS(null,"dy",10);
    tspan2.appendChild(linktext2);

    document.getElementById("exportSVGLayer").appendChild(tspan1);
    document.getElementById("exportSVGLayer").appendChild(tspan2);
    document.getElementById("exportSVGLayer").parentNode.setAttributeNS(xlinkNS,"href",obj.firstChild.nodeValue+".txt");
}

// helper function for export function to serialize the svg dom nodes and export it as string (printNode for all browsers)
function serializeNode (node) {
    if (typeof XMLSerializer != 'undefined') {
        return new XMLSerializer().serializeToString(node);
    }
    else if (typeof node.xml != 'undefined') {
        return node.xml;
    }
    else if (typeof printNode != 'undefined') {
        return printNode(node);
    }
    else if (typeof Packages != 'undefined') {
        try {
            var stringWriter = new java.io.StringWriter();
            Packages.org.apache.batik.dom.util.DOMUtilities.writeNode(
                node, stringWriter);
            return stringWriter.toString();
        }
        catch (e) {
            alert("Sorry, your SVG viewer does not support the export function.");
            return '';
        }
    }
    else {
        alert("Sorry, your SVG viewer does not support the export function.");
        return '';
    }
}


var guides = new Array();
guides[0] = new Array();
guides[0]['type'] = 'guideBgRectangle';
guides[0]['fill'] = "lightgrey";
guides[0]['fill-opacity'] = 1;
guides[1] = new Array();
guides[1]['type']='guideBgTriangle';
guides[1]['fill'] = "lightgrey";
guides[1]['fill-opacity'] = 1;
guides[2] = new Array();
guides[2]['type']='guideCircle';
guides[2]['r'] = 50;
guides[3] = new Array();
guides[3]['type']='guideLine';
guides[3]['from'] = "bottomLeft";
guides[3]['to'] = "topRight";
guides[4] = new Array();
guides[4]['type']='guideRegularPolygon';
guides[4]['r'] = 50;
guides[4]['edgeNr'] = 6;

