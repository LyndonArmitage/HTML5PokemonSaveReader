
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
			$("#outputSection").html("<div id='inputSection' class='active'><span id='inputLabel' class='btn center-btn active'>Select another Save File</span><div class='upload-divisory active'></div><span class='dragndrop-text active'>Too you can drag and drop here;</span><!--<div id='saveButton' class='btn'>Save Out File</div>--><input type='file' id='fileInput' name='savefile' style='display:none'></div>");
			$("#savetitle").html(""+ theFile.name +"");
			$("#welcome").html("");
			var results = parseSav(e.target.result);
			if(results.checksum === 0) {
				error("Invalid save file provided. Is it a Generation I save file?");
			}
			else {
				console.log(results);
				var resultsContents = "<ul class='tabs center'><li class='first current'><a href='#tabc1'>Trainer</a></li><li class=''><a href='#tabc2'>Items</a></li><li class=''><a href='#tabc3'>Pokémons</a></li><li class='last'><a href='#tabc4'>Pokédex</a></li></ul><ul id='results'>"+
						"<tab id='tabc1' class='tab-content clearfix' style='display: block;'><li><b>Trainer Name:</b> " + results.trainerName + "</li>"+
						"<li><b>Trainer ID:</b> " + results.trainerID + "</li>"+
						"<li><b>Rival Name:</b> " + results.rivalName + "</li>"+
						"<li><b>Time Played:</b> " + results.timePlayed.hours +":"+ results.timePlayed.minutes + ":" + results.timePlayed.seconds + "</li>"+
						"<li><b>Money:</b> " + results.money + "</li>"+
						"<li><b>Checksum:</b> " + results.checksum + "</li>"+
						"<li><b>Current PC Box:</b> " + results.currentPCBox + "</li><span>Soon, you'll can get your badges and coins.</span></tab><tab id='tabc2' class='tab-content clearfix' style='display: none;'><ul class='tabs center'><li class='first current'><a href='#tab-items_bag'>Bag</a></li><li class=''><a href='#tab-items_pc'>PC</a></li></ul>";

				function addItemList(label, items) {
					if(items.count > 0) {
						var html = "<ul>";
						for(var i = 0; i < items.count; i ++) {
							var item = items.items[i];
							html += "<li><b>"+item.name+"</b> x"+item.count+"</li>";
						}
						html +="</ul>";
						resultsContents += html;
					}
					resultsContents += "</li>";

				}
							resultsContents += "<tab id='tab-items_bag' class='tab-content clearfix' style='display: inline;'>";
				addItemList("Bag Items", results.bagItemList);
							resultsContents += "</tab><tab id='tab-items_pc' class='tab-content clearfix' style='display: none;'>";
				addItemList("PC Items", results.PCItemList);
							resultsContents += "</tab>";

							resultsContents += "</tab><tab id='tabc3' class='tab-content clearfix' style='display: none;'><ul class='tabs center'><li class='first current'><a href='#tab-pokemons_party'>Party</a></li><li class=''><a href='#tab-pokemons_pc'>Bill's PC</a></li></ul><tab id='tab-pokemons_party' class='tab-content clearfix' style='display: inline;'>";

				function addPokemonList(label, list) {
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
					resultsContents += "</li>";
				}
				addPokemonList("Party Pok&#233;mon", results.partyList);
							resultsContents += "</tab><tab id='tab-pokemons_pc' class='tab-content clearfix' style='display: none;'>";
				addPokemonList("Current Box Pok&#233;mon", results.currentBoxList);

							resultsContents += "</tab></tab><tab id='tabc4' class='tab-content clearfix' style='display: none;'>";

				function addPokedexList(label, list) {
					var num = 0;
					for(var i = 0; i < list.length; i ++) {
						if(list.charAt(i) == "1") {
							num ++;
						}
					}
					resultsContents += "<li><b>"+label+": </b>"+ num +"</li>";
				}

				addPokedexList("Pok&#233;dex Seen", results.seenList);
				addPokedexList("Pok&#233;dex Owned", results.ownedList);

				resultsContents += "<span>Soon, will show each pokémon and you will can mark each one as seen/owned.</span></tab></ul>";
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