// 
// Comparative genome browser
// Jurriaan Jansen 2016-
// 
// This program needs the 'jquery-2.1.3.min.js' in order to work. 
 
// #### variables 


var changingLocation = false;
var konvaLayerHeight = 120;
var historyBrowser =  new Array();
var fistoryBrowser =  new Array();


// #### Functions


function makeCSVG(){
	blobURL = URL.createObjectURL(dallianceBrowsers[0].makeSVG({highlights: true,
		ruler: true ? dallianceBrowsers[0].rulerLocation : 'none'}));
	console.log(blobURL)
};

function getURLParameters(){
	var urlParams = [];
	var query  = window.location.search.substring(1);
	var urlINFO = query.split("&")
	for (var i = 1;i  < urlINFO.length;i++){ 
		urlParams.push(parseInt(urlINFO[i].split("=")[1]));
	};
	return (urlParams);
};


function loadPageFromURL(){
	urlParams = getURLParameters();
	var j = 0;
	console.log(urlParams);
	if (urlParams.length != 0){
		for (var i = 0;i  < dallianceBrowsers.length;i++){
			changingLocation = true;
			dallianceBrowsers[i].viewStart = parseInt(urlParams[j])
			dallianceBrowsers[i].viewEnd = parseInt(urlParams[j+1])
	 		dallianceBrowserPositions[i] = [parseInt(urlParams[j]),parseInt(urlParams[j+1])];
	 		j+=2
	 		changingLocation = false;
		};
	};
};


function arraysEqual(arr1, arr2) {
    if(arr1.length !== arr2.length)
        return false;
    for(var i = arr1.length; i--;) {
        if(arr1[i] !== arr2[i])
            return false;
    };
    return true;
};


function historySave(){
	fistoryBrowser = [];
	var urlBuild = "?";
	for (var i = 0;i  < dallianceBrowsers.length;i++){
		urlBuild += ("&b"+[i+1]+"s="+(dallianceBrowsers[i].viewStart | 0))
		urlBuild += ("&b"+[i+1]+"e="+(dallianceBrowsers[i].viewEnd | 0))
	};
	window.history.pushState('page', 'jjct', urlBuild);
	var temp = [];
	for (var i = 0;i  < dallianceBrowserPositions.length;i++){
		temp.push(dallianceBrowserPositions[i]);
	};
	historyBrowser.push(temp);
};


function historyBack(){	
	if (historyBrowser.length === 0){
		alert("No more history in this session.");
	} else {
		var url = getURLParameters();		
		var temp = []
		for (var i = 0;i  < dallianceBrowserPositions.length;i++){
			temp.push(dallianceBrowserPositions[i][0])
			temp.push(dallianceBrowserPositions[i][1])
		}
		if (arraysEqual(temp,url)){
			window.history.back();		
			fistoryBrowser.push(historyBrowser.pop())
		};
		var position = historyBrowser[historyBrowser.length - 1];
		for (var i = 0;i  < dallianceBrowsers.length;i++){
			changingLocation = true;
			dallianceBrowsers[i].setLocation(
				dallianceBrowsers[i].chr,
				position[i][0],
				position[i][1]
			);
			dallianceBrowserPositions[i] = [position[i][0], position[i][1]];
			changingLocation = false;
		};
	};
};


function historyForward(){
	if (fistoryBrowser.length === 0){
		alert("No forward history available.");
	} else {
		position = fistoryBrowser[fistoryBrowser.length - 1];
		for (var i = 0;i  < dallianceBrowsers.length;i++){
			changingLocation = true;
			dallianceBrowsers[i].setLocation(
				dallianceBrowsers[i].chr,
				position[i][0],
				position[i][1]
			);
			dallianceBrowserPositions[i] = [position[i][0], position[i][1]];
			changingLocation = false;
		};
		historyBrowser.push(fistoryBrowser.pop())
		window.history.forward();
	};
};


function backToOverview(){
	for (var i = 0;i  < dallianceBrowsers.length;i++){
		changingLocation = true;
		dallianceBrowsers[i].setLocation(
			dallianceBrowsers[i].chr,
 			1,
 			100000
 		);
 		dallianceBrowserPositions[i] = [(dallianceBrowsers[i].viewStart | 0), (dallianceBrowsers[i].viewEnd | 0)];
 		changingLocation = false;
	}
};


function comparativeOnClick(m, poly,comp){
	changingLocation = true;
	var topBrowser = dallianceBrowsers[comp.id.split("_")[1]-1];
	var botBrowser = dallianceBrowsers[comp.id.split("_")[2]-1];
	var topStartDifference = (m.rstart-(topBrowser.viewStart | 0));
	var botStartDifference = (m.qstart-(botBrowser.viewStart | 0));
	var offset = topStartDifference-botStartDifference;
	var topKonvaRangeCenter = ((parseInt(m.rend)+parseInt(m.rstart))/2);
	var botKonvaRangeCenter = ((parseInt(m.qend)+parseInt(m.qstart))/2);
	var topBrowserCenter = ((parseInt(topBrowser.viewEnd) + (topBrowser.viewStart)) /2);
	var botBrowserCenter = ((parseInt(botBrowser.viewEnd) + (botBrowser.viewStart)) /2);  
	var topBrowserDifference = topKonvaRangeCenter-topBrowserCenter;
	var botBrowserDifference = botKonvaRangeCenter-botBrowserCenter;
	if(document.getElementById("toggleAutoCenter").checked){
		topBrowser.setLocation(
			topBrowser.chr,
			(topBrowser.viewStart | 0) + topBrowserDifference,
			(topBrowser.viewEnd | 0) + topBrowserDifference
		);
		botBrowser.setLocation(
			botBrowser.chr,
			(botBrowser.viewStart | 0) + botBrowserDifference,
			(botBrowser.viewEnd | 0) + botBrowserDifference
		);
		dallianceBrowserPositions[comp.id.split("_")[1]-1] = [(topBrowser.viewStart | 0), (topBrowser.viewEnd | 0)];
		dallianceBrowserPositions[comp.id.split("_")[2]-1] = [(botBrowser.viewStart | 0), (botBrowser.viewEnd | 0)];
	} else {
		if (m.rstart > (topBrowser.viewEnd | 0) 
			&& m.rend >(topBrowser.viewEnd | 0) 
			|| m.rstart < (topBrowser.viewStart | 0)
			&& m.rend < (topBrowser.viewStart | 0)){
			topBrowser.setLocation(
				topBrowser.chr,
				(topBrowser.viewStart | 0) + offset,
				(topBrowser.viewEnd | 0) + offset
			);		
		} else{		
			botBrowser.setLocation(
				botBrowser.chr,
				(botBrowser.viewStart | 0) - offset,
				(botBrowser.viewEnd | 0) - offset
			);		
		};	
		dallianceBrowserPositions[comp.id.split("_")[1]-1] = [(topBrowser.viewStart | 0), (topBrowser.viewEnd | 0)];
		dallianceBrowserPositions[comp.id.split("_")[2]-1] = [(botBrowser.viewStart | 0), (botBrowser.viewEnd | 0)];
	};
	changingLocation = false;
};


function drawComparative(cache,comp,top, bottom){
	stage = new Konva.Stage({
		container: comp.id,
		// The -66 is there so the konva layer doesnt exceed the dalliance browser limit.
		width: window.innerWidth-66,
		height: konvaLayerHeight,
	});
	var layer = new Konva.Layer();
	var topWidth = top.viewEnd + 1 - top.viewStart;
	var bottomWidth = bottom.viewEnd + 1 - bottom.viewStart;
	var layerWidth = stage.getWidth();
	var layerHeight = stage.getHeight();
	// Only display the layers that will be visible on screen.
	var cachesplit  = [];
	for (var i=0;i < cache.length; i++){
		if (   (cache[i].rstart >= (top.viewStart | 0) && cache[i].rstart <= (top.viewEnd | 0)) 
		|| (cache[i].rend >= (top.viewStart | 0) && cache[i].rend <= (top.viewEnd | 0))
		|| (cache[i].qstart >= (bottom.viewStart | 0) && cache[i].qstart <= (bottom.viewEnd | 0))			
		|| (cache[i].qend >= (bottom.viewStart | 0) && cache[i].qend <= (bottom.viewEnd | 0))){
			cachesplit.push(cache[i]);
		};		
		//If the comparative layer is in the first position it is manually added here.
		if ((cache[i].rstart) <= (top.viewStart) && (cache[i].rend) >= (top.viewEnd) ||
			(cache[i].qstart) <= (bottom.viewStart) && (cache[i].qend) >= (bottom.viewEnd)){
			cachesplit.push(cache[i]);
		};
	};
	//Values in cachesplit will be presented onscreen.
	cachesplit.forEach(function(m) {
		rx1 = layerWidth * ((m.rstart - top.viewStart) / topWidth);
		rx2 = layerWidth * ((m.rend - top.viewStart) / topWidth);
		qx1 = layerWidth * ((m.qstart - bottom.viewStart) / bottomWidth);
		qx2 = layerWidth * ((m.qend - bottom.viewStart) / bottomWidth);
		y1 = 0;
		y2 = layerHeight;
		var colour
		if ((m.rend - m.rstart) * (m.qend - m.qstart) > 0) {
			colour = 'red'
		} else {
			colour = 'blue'
		}
		// Sets the color of the compare box to blue if the similarity is lower then 95,00%
		// if (m.id <= 95) {
		// 	colour = '#0900FF';
		// } else {
		// 	colour = '#FF0000';
		// }

		var points = [rx1, y1, qx1, y2, qx2, y2, rx2, y1];
		//		  while (points[0]<0 ||points[0]>layerWidth) {
		//		      var point=points.splice(0,2);
		//		      points.push(point);
		//		  }
		var poly = new Konva.Line({
			points: points,
			stroke: '#990000',
			fill: colour,
			strokeWidth: 1,
			closed: true,
			// draggable: true,
			// dragBoundFunc: function(pos) {
   //          	return {
   //              x: pos.x,
   //              y: this.getAbsolutePosition().y
   //          	}
   //      	}
		});
		poly.on('click', function() {
			comparativeOnClick(m, poly,comp);
		});
		poly.on('mouseover', function() {
			document.body.style.cursor = 'pointer';
			UnTip()
			Tip("<font face='Verdana' size='2'>"
				+ "<b>" + m.id + '%</b> identity'
				+ "<br>" + m.rstart +" "+ m.rend
				+ "<br>" + m.qstart +" "+ m.qend
				, 
				DELAY, 0, 
				FADEOUT, 0, 
				WIDTH, -300
			)
		});
		poly.on('mouseout', function() {
			document.body.style.cursor = 'default';
			UnTip()
		});

		layer.add(poly);
	});
	stage.add(layer);
};


function download(filename,text) {
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', filename);
	element.style.display = 'none';
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
};


function drawHoverDiv(b,event, feature, hit, tier){
	if (feature.orientation == "-"){
		complement = b.seq.replace(/A|T|G|C/g,function(c){
		    switch(c) {
		        case "A":
		        return "T";
		        case "T":
		        return "A";
		        case "C":
		        return "G";
		        case "G":
		        return "C";
		        default:
		        return "";
		    };
		});
		s = complement.split('').reverse().join('');		  
	} else {
		s = b.seq 
	};
	var infoTable =
	"<div class='table-responsive'>"+
	"<table class='table'>"+
	"<thread>"+
	"<tr>"+
		"<td><h5><b>Score</b></td> "+
		"<td><h5>"+feature.score+"</td>	"+
	"</tr>"+
	"<tr>  "+
		"<td><h5><b>Length</b></td> "+
		"<td><h5>"+(((feature.max)-(feature.min))+1)+"</td>	"+
	"</tr>"+
	"<tr>  "+
		"<td><h5><b>GC%</b></td> "+
		"<td><h5>"+getGCPercentage(b.seq).toFixed(4)+"</td>	"+
	"</tr>"+
	"<tr> "+
		"<td><h5><b>Gene</b></td> "+
		"<td><h5>"+feature.name2+"</td>	"+
	"</tr>"+
	"<tr>"+
		"<td><h5><b>Product</b></td> "+
		"<td><h5>"+feature.description+"</td>	"+
	"</tr>"+
	"<tr>"+
		"<td><h5><b>blast</b></td> "+
		"<td><h5>"+
		"<button class='btn btn-primary' type='submit'>blastn</button>"+
		"<button class='btn btn-primary' type='submit'>blastp</button>"+
		"<button class='btn btn-primary' type='submit'>blastx</button>"+
		"<button class='btn btn-primary' type='submit'>tblastn</button>"+
		"<button class='btn btn-primary' type='submit'>tblastx</button>"+
		"</td>"+
	"</tr>"+
	"</table>"+
	"</div>"+
	"<hr>"+
	"<div class='col-lg-12'>"+
	"<button type='button' class='btn btn-primary' data-toggle='collapse' data-target='#fasta'>Nucleotide Sequence</button>"+
	"<div id='fasta' class='collapse'>"+
		"<font face='Courier'>"+
		">"+feature.segment+"_"+feature.name2+"<br>"+
		s.replace(/(.{60})/g, "$1<br>")+
		"</div>"+
	"</div>"+
	"<div class='col-lg-12'>"+
	"<font face='Verdana'>"+
	"<button type='button' class='btn btn-primary' data-toggle='collapse' data-target='#translated'>Amino acid sequence</button>"+
	"<div id='translated' class='collapse'>"+
		"<font face='Courier'>"+
		">"+feature.segment+"_"+feature.name2+"<br>"+
		translate(s).replace(/(.{60})/g, "$1<br>")+
		"</div>"+
	"</div>";
	if(document.getElementById("showTooltip").checked){
		console.log();
		UnTip();
		Tip(infoTable,
			TITLE, feature.segment+" :"+feature.description,
			BGCOLOR, 'white',
			//[event.clientX,
			//event.clientY],
			FIX, [$(window).width()/2-275,$(window).scrollTop()+200],
			STICKY,	true,
			HEIGHT, 750,
			WIDTH, 550,
			CLICKSTICKY,true,
			CLOSEBTN,	true,
			EXCLUSIVE,	true
		);
	};
};


function featureListener(event, feature, hit, tier,browser){
    mouseClick(event, feature, hit, tier, browser);
    browser.clearHighlights();
    browser.highlightRegion(
		feature.segment,
		feature.min,
		feature.max+1
	);
};


function generateFastaFile(){
	var fastaname = "";
	var count = 0;
	downloadfasta = "";
	var mergedfasta = "";
	var undefinedcount = 0;
	for (var i = 0; i < dallianceBrowsers.length;i++){
		if(dallianceBrowsers[i].highlights[0] == undefined){
			undefinedcount++
		};
	};
	if(undefinedcount == dallianceBrowsers.length){
		alert("No genes selected.")
	} else {
		for (var i = 0; i < dallianceBrowsers.length;i++){
			if(dallianceBrowsers[i].highlights[0] != undefined){
				dallianceBrowsers[i].getSequenceSource().fetch(dallianceBrowsers[i].highlights[0].chr.toString()
				,dallianceBrowsers[i].highlights[0].min
				,dallianceBrowsers[i].highlights[0].max
				,null
				,function(a,b){		
					mergedfasta += ">"+b.name+"_"+b.start+"_"+b.end+"<br>"+b.seq.replace(/(.{60})/g, "$1<br>")+"<br>"
					downloadfasta += ">"+b.name+"_"+b.start+"_"+b.end+"\n"+b.seq.replace(/(.{60})/g, "$1\n")+"\n"
					count++
					fastaname += (b.name+"_")
					var controlbuttons = '<div><button class="btn btn-primary" onclick="download(\''+fastaname+'\',downloadfasta)" >download the '+count+' selected sequences as fasta</button></div><br>'
					UnTip()
					Tip("<font face='Courier'>"+controlbuttons+mergedfasta,
						BGCOLOR, 'white',
						TITLE, "Selected sequences",
						FIX, [$(window).width()/2-275,$(window).scrollTop()+200],
						STICKY,		true,
						HEIGHT, 750,
						WIDTH, 550,
						CLOSEBTN,	true,
						EXCLUSIVE,	true
					);				
				});
			}
		};
	};	
};


function getGCPercentage(sequence){
	var x = sequence.toUpperCase();
	var total = x.length;
	var c = x.match(/C/gi).length;
	var g = x.match(/G/gi).length;
	var gc_total = g+c;
	var gc_content = gc_total/total ;
	return(gc_content);
};


function loadJSON(path, success, error){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                if (success)
                    success(JSON.parse(xhr.responseText));
            } else {
                if (error)
                    error(xhr);
            }
        }
    };
    xhr.open("GET", path, true);
    xhr.send();
};


function mouseClick(event, feature, hit, tier,browser) {
	browser.getSequenceSource().fetch(feature.segment,feature.min,feature.max,null,function(a,b){
		drawHoverDiv(b,event, feature, hit, tier);
		}
	);
};


function mouseOut(event, tier) {
	UnTip();
	tipfeature = "";
};


function mouseOver(event,feature,hit,tier) {
	// var tierNum=tier.id.match(/\d+/)[0];
	// console.log(tier.id);
	// var types = tier.browser.sources;
	// console.log(types);


	//thisB.featurePopup(event,feature,hit,tier)
	UnTip()
	Tip("<b>"+feature.name2 + "</b>"+ '<br>' +
			(((feature.max)-(feature.min))+1) + ' bp<br>' +
			feature.description,
		DELAY, 0, 
		FADEOUT, 0, 
		WIDTH, -300
	)
};


function refreshBrowser(){
	for (var i =0; i < comparisons.length; i++){
		refreshComparative(document.getElementById(comparisons[i]), dallianceBrowsers[i], dallianceBrowsers[i+1]);
	};
};


function refreshComparative(comp, top, bottom) {
	var i = comparisons.indexOf(comp.id)
	if(cache[i] === undefined){
		loadJSON(jsonfiles[i],
		function(data) {
			cache[i] = data;
			drawComparative(cache[i], comp, top, bottom);
		},
		function(xhr) {
			console.error(xhr);
		}
		);
	}else{
		drawComparative(cache[i], comp, top, bottom);
	}
};


function setKonvaLayerHeight(){
	if (isNaN(document.getElementById('setKonvaLayerHeight').value)) {
		alert("'"+(document.getElementById('setKonvaLayerHeight').value)+"' is not a number.");
	} else {
		konvaLayerHeight = document.getElementById('setKonvaLayerHeight').value;
		refreshBrowser()
	};
};


function viewListener(browser,browserPositionIndex){
    //Check if browser changed the position since last change. Prevents unnecessary calculations.
    if ((dallianceBrowserPositions[browserPositionIndex] != (browser.viewStart | 0))||(dallianceBrowserPositions[browserPositionIndex+1] != (browser.viewEnd | 0))) {
        //Determine which comparative layers need to be refreshed.
        if (document.getElementById("toggleBrowserButton").checked){
	    	zoomAlignment(browser,browserPositionIndex);
			for (var i=0;i < comparisons.length;i++){
				var comp = document.getElementById(comparisons[i]);
				var top = dallianceBrowsers[comparisons[i].split("_")[1]-1];
				var bot = dallianceBrowsers[comparisons[i].split("_")[2]-1];
				refreshComparative(comp, top, bot);
			};
	    } else{
			for (var i=0;i < comparisons.length;i++){
				if ((browser.pageName.split("_")[1] == comparisons[i].split("_")[1]) || (browser.pageName.split("_")[1] == comparisons[i].split("_")[2])){
					var comp = document.getElementById(comparisons[i]);
					var top = dallianceBrowsers[comparisons[i].split("_")[1]-1];
					var bot = dallianceBrowsers[comparisons[i].split("_")[2]-1];
					refreshComparative(comp, top, bot);
	            };
	        dallianceBrowserPositions[browserPositionIndex] = [(browser.viewStart | 0), (browser.viewEnd | 0)];
	        };	    		
	    };	 
    };
};


function zoomAlignment(browser,browserPositionIndex) {
	if (changingLocation == false){
		changingLocation = true;
		var startDifference = (browser.viewStart | 0)-(dallianceBrowserPositions[browserPositionIndex][0]);
		var endDifference = (browser.viewEnd | 0)-(dallianceBrowserPositions[browserPositionIndex][1]);
		for(var i=0;i < dallianceBrowsers.length;i++){
			if (dallianceBrowsers[i]!=browser){				
				dallianceBrowsers[i].setLocation(
					dallianceBrowsers[i].chr,
					dallianceBrowserPositions[i][0] + startDifference,
					dallianceBrowserPositions[i][1] + endDifference
				);
				dallianceBrowserPositions[i] = [dallianceBrowserPositions[i][0] + startDifference,dallianceBrowserPositions[i][1] + endDifference];toggleAutoCenter				
			} else{
				//Nothing.
			};
		};
		dallianceBrowserPositions[browserPositionIndex] = [(browser.viewStart | 0),(browser.viewEnd | 0)];
		changingLocation = false;
	};
};


function translate(dna){
	var aasequence = ""
	for (i=0;i <dna.length;i++){
		if ( i && (i % 3 === 0)|| i == 0) {
			var codon = dna[i]+dna[i+1]+dna[i+2];
				switch(codon) {
					case('AAA'):
						aasequence += 'K';
						break;
					case('AAT'):
						aasequence += 'N';
						break;					
					case('AAG'):
						aasequence += 'K';
						break;					
					case('AAC'):
						aasequence += 'N';
						break;	
					case('ATA'):
						aasequence += 'I';
						break;
					case('ATT'):
						aasequence += 'I';
						break;
					case('ATG'):
						aasequence += 'M';
						break;
					case('ATC'):
						aasequence += 'I';
						break;
					case('AGA'):
						aasequence += 'R';
						break;
					case('AGT'):
						aasequence += 'S';
						break;
					case('AGG'):
						aasequence += 'R';
						break;
					case('AGC'):
						aasequence += 'S';
						break;										
					case('ACA'):
						aasequence += 'T';
						break;
					case('ACT'):
						aasequence += 'T';
						break;
					case('ACG'):
						aasequence += 'T';
						break;
					case('ACC'):
						aasequence += 'T';
						break;
					case('TAA'):
						aasequence += '*';
						break;
					case('TAT'):
						aasequence += 'Y';
						break;
					case('TAG'):
						aasequence += '&';
						break;
					case('TAC'):
						aasequence += 'Y';
						break;
					case('TTA'):
						aasequence += 'L';
						break;
					case('TTT'):
						aasequence += 'F';
						break;
					case('TTG'):
						aasequence += 'L';
						break;
					case('TGA'):
						aasequence += '$';
						break;
					case('TGT'):
						aasequence += 'C';
						break;
					case('TGG'):
						aasequence += 'W';
						break;
					case('TGT'):
						aasequence += 'C';
						break;
					case('TGC'):
						aasequence += 'C';
						break;
					case('TCA'):
						aasequence += 'S';
						break;
					case('TCT'):
						aasequence += 'S';
						break;
					case('TCG'):
						aasequence += 'S';
						break;
					case('TCC'):
						aasequence += 'S';
						break;
					case('GAA'):
						aasequence += 'E';
						break;
					case('GAT'):
						aasequence += 'D';
						break;
					case('GAG'):
						aasequence += 'E';
						break;
					case('GAC'):
						aasequence += 'D';
						break;
					case('GTA'):
						aasequence += 'V';
						break;
					case('GTT'):
						aasequence += 'V';
						break;
					case('GTG'):
						aasequence += 'V';
						break;
					case('GTC'):
						aasequence += 'V';
						break;
					case('GGA'):
						aasequence += 'G';
						break;
					case('GGT'):
						aasequence += 'G';
						break;
					case('GGG'):
						aasequence += 'G';
						break;
					case('GGC'):
						aasequence += 'G';
						break;
					case('GCA'):
						aasequence += 'A';
						break;
					case('GCT'):
						aasequence += 'A';
						break;
					case('GCG'):
						aasequence += 'A';
						break;
					case('GCC'):
						aasequence += 'A';
						break;
					case('CAA'):
						aasequence += 'Q';
						break;
					case('CAT'):
						aasequence += 'H';
						break;
					case('CAG'):
						aasequence += 'Q';
						break;
					case('CAC'):
						aasequence += 'H';
						break;
					case('CTA'):
						aasequence += 'L';
						break;
					case('CTT'):
						aasequence += 'L';
						break;
					case('CTG'):
						aasequence += 'L';
						break;
					case('CTC'):
						aasequence += 'L';
						break;
					case('CGA'):
						aasequence += 'R';
						break;
					case('CGT'):
						aasequence += 'R';
						break;
					case('CGG'):
						aasequence += 'R';
						break;
					case('CGC'):
						aasequence += 'R';
						break;
					case('CCA'):
						aasequence += 'P';
						break;
					case('CCT'):
						aasequence += 'P';
						break;
					case('CCG'):
						aasequence += 'P';
						break;
					case('CCC'):
						aasequence += 'P';
						break;
					default:
						break;
				}
			
		}
	}
	return(aasequence);
}