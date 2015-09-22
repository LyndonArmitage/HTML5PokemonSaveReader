
$(document).ready(function() {
	loadEvent();
});

function updateBG() {
	var $container = $("#container");
	setBackground($container[0], $container.width(), $container.height());
}

function loadEvent() {
	var $container = $("#container");
	updateBG();
	if(!supportsFileAPI()) {
		$container.html("<div id='error'>Your browser does not support HTML5's File API. Please update your browser or if already updated, consider leaving it to a better browser.</div>");
	}
	else {
		// We support HTML5 File API so let's get cooking.
		var $fileIn = $("#fileInput");
		$fileIn.bind("change", loadFile);
		$("#inputLabel").bind("click", function() {
			$fileIn.click();
		})
	}
}

/**
 * Function that returns true if the user's web browser supports the HTML5 File API
 * @returns {boolean}
 */
function supportsFileAPI() {
	return window.File && window.FileReader && window.FileList && window.Blob;
}

/**
 * Ends with method for checking if a string ends with a bit of text
 * @param suffix
 * @returns {boolean}
 */
String.prototype.endsWith = function(suffix) {
	return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

function error(msg) {
	$("#outputSection").html("<div id='error'>"+msg+"</div><div id='inputSection'><span id='inputLabel' class='btn center-btn'>Select another Save File</span><div class='upload-divisory'></div><div class='dragndrop-text'>or drag and drop here.</div><!--<div id='saveButton' class='btn'>Save Out File</div>--><input type='file' id='fileInput' name='savefile' style='display:none'></div>");
}

function readFile(savefile) {
	var reader = new FileReader();

	reader.onload = (function(theFile) {
		return function(e) {
			$("#outputSection").html("<div id='inputSection' class='active'><span id='inputLabel' class='btn center-btn active'>Select another Save File</span><div class='upload-divisory active'></div><span class='dragndrop-text active'>Too you can drag and drop here;</span><!--<div id='saveButton' class='btn'>Save Out File</div>--><input type='file' id='fileInput' name='savefile' style='display:none'></div><h2>"+ theFile.name +" loaded:</h2>");
			var results = parseSav(e.target.result);
			if(results.checksum === 0) {
				error("Invalid save file provided. Is it a Generation I save file?");
			}
			else {
				console.log(results);
				var resultsContents = "<ul class='tabs center'><li class='first current'><a href='#tabc1'>Trainer</a></li><li class=''><a href='#tabc2'>Items</a></li><li class=''><a href='#tabc3'>Party</a></li><li class='last'><a href='#tabc4'>Pokédex</a></li></ul><ul id='results'>"+
						"<tab id='tabc1' class='tab-content clearfix' style='display: block;'><li><b>Trainer Name:</b> " + results.trainerName + "</li>"+
						"<li><b>Trainer ID:</b> " + results.trainerID + "</li>"+
						"<li><b>Rival Name:</b> " + results.rivalName + "</li>"+
						"<li><b>Time Played:</b> " + results.timePlayed.hours +":"+ results.timePlayed.minutes + ":" + results.timePlayed.seconds + "</li>"+
						"<li><b>Money:</b> " + results.money + "</li>"+
						"<li><b>Checksum:</b> " + results.checksum + "</li>"+
						"<li><b>Current PC Box:</b> " + results.currentPCBox + "</li></tab>";

				function addItemList(label, items) {
					resultsContents += "<tab id='tabc2' class='tab-content clearfix' style='display: none;'><li><b>"+label+": </b>";
					if(items.count > 0) {
						var html = "<ul>";
						for(var i = 0; i < items.count; i ++) {
							var item = items.items[i];
							html += "<li><b>"+item.name+"</b> x"+item.count+"</li>";
						}
						html +="</ul>";
						resultsContents += html;
					}
					resultsContents += "</li></tab>";
				}

				addItemList("Bag Items", results.bagItemList);
				addItemList("PC Items", results.PCItemList);

				function addPokemonList(label, list) {
					resultsContents += "<tab id='tabc3' class='tab-content clearfix' style='display: none;'><li><b>"+label+":</b>";
					if(list.count > 0) {
						resultsContents += "<ol>";
						for(var i = 0; i < list.count; i ++) {
							resultsContents += "<li>";
							resultsContents += list.names[i];
							resultsContents += "<ul>";
							resultsContents += "<li><b>Species: </b>"+list.species[i]+"</li>";
							resultsContents += "<li><b>Original Trainer: </b>"+list.OTNames[i]+"</li>";
							resultsContents += "<li><b>Type 1: </b>"+list.pokemon[i].type1+"</li>";
							resultsContents += "<li><b>Type 2: </b>"+list.pokemon[i].type2+"</li>";
							resultsContents += "<li><b>Current HP: </b>"+list.pokemon[i].currentHp+"</li>";
							resultsContents += "<li><b>Exp: </b>"+list.pokemon[i].exp+"</li>";
							if(list.pokemon[i].isParty) {
								resultsContents += "<li><b>Level: </b>"+list.pokemon[i].partyLevel+"</li>";
							}
							else {
								resultsContents += "<li><b>Level: </b>"+list.pokemon[i].level+"</li>";
							}
							resultsContents += "</ul>";

							resultsContents += "</li>";
						}
						resultsContents += "</ol>";
					}
					resultsContents += "</li></tab>";
				}

				addPokemonList("Party Pok&#233;mon", results.partyList);
				addPokemonList("Current Box Pok&#233;mon", results.currentBoxList);

				function addPokedexList(label, list) {
					var num = 0;
					for(var i = 0; i < list.length; i ++) {
						if(list.charAt(i) == "1") {
							num ++;
						}
					}
					resultsContents += "<tab id='tabc4' class='tab-content clearfix' style='display: none;'><li><b>"+label+": </b>"+ num +"</li>";
				}

				addPokedexList("Pok&#233;dex Seen", results.seenList);
				addPokedexList("Pok&#233;dex Owned", results.ownedList);

				resultsContents += "</ul></tab>";
				$("#outputSection").append(resultsContents);

			}
			updateBG();
		};
	})(savefile);
	reader.readAsBinaryString(savefile);
}

function loadFile(evt) {
	evt = evt.originalEvent || evt;
	var savefile = evt.target.files[0];
	// save files are 32kb large and end in .sav
	if(savefile != null && savefile.size >= 32768 && savefile.name.endsWith(".sav")) {
		readFile(savefile);
	}
	else {
		error("Invalid save file provided. File size or extension is wrong.");
	}
}

/*
	Tabs menu from kickstart.js, which part of 99Lime.com HTML KickStart by Joshua Gatcke.
*/

jQuery(document).ready(function($){

	/*---------------------------------
		Tabs
	-----------------------------------*/
	// tab setup
	$('.tab-content').addClass('clearfix').not(':first').hide();
	$('ul.tabs').each(function(){
		var current = $(this).find('li.current');
		if(current.length < 1) { $(this).find('li:first').addClass('current'); }
		current = $(this).find('li.current a').attr('href');
		$(current).show();
	});

	// tab click
	$(document).on('click', 'ul.tabs a[href^="#"]', function(e){
		e.preventDefault();
		var tabs = $(this).parents('ul.tabs').find('li');
		var tab_next = $(this).attr('href');
		var tab_current = tabs.filter('.current').find('a').attr('href');
		$(tab_current).hide();
		tabs.removeClass('current');
		$(this).parent().addClass('current');
		$(tab_next).show();
		history.pushState( null, null, window.location.search + $(this).attr('href') );
		return false;
	});

 	// tab hashtag identification and auto-focus
    	var wantedTag = window.location.hash;
    	if (wantedTag != "")
    	{
			// This code can and does fail, hard, killing the entire app.
			// Esp. when used with the jQuery.Address project.
			try {
				var allTabs = $("ul.tabs a[href^=" + wantedTag + "]").parents('ul.tabs').find('li');
				var defaultTab = allTabs.filter('.current').find('a').attr('href');
				$(defaultTab).hide();
				allTabs.removeClass('current');
				$("ul.tabs a[href^=" + wantedTag + "]").parent().addClass('current');
				$("#" + wantedTag.replace('#','')).show();
			} catch(e) {
				// I have no idea what to do here, so I'm leaving this for the maintainer.
			}
    	}
});