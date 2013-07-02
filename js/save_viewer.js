/*

JavaScript Based Pokemon Save File viewer by Lyndon Armitage 2013
---
This will make use of HTML5's File API so will not work in older browsers.

*/

$(document).ready(function() {
	loadEvent();
});

function loadEvent() {
	var $container = $("#container");
	if(!supportsFileAPI()) {
		$container.text("Your browser does not support HTML5's File API. Please update to a better browser.");
	}
	else {
		// We support HTML5 File API so let's get cooking.
		alert("Yay File API Support");
		$container.html("<div id='inputLabel'>Save File:</div><input type='file' id='fileInput' name='savefile' />");
		var $fileIn = $container.find("#fileInput");
		$fileIn.bind("change", loadFile);
	}
}

/**
 * Function that returns true if the user's web browser supports the HTML5 File API
 * @returns {boolean}
 */
function supportsFileAPI() {
	if(window.File && window.FileReader && window.FileList && window.Blob) {
		return true;
	}
	else {
		return false;
	}
}

function readFile(savefile) {
	var reader = new FileReader();

	reader.onload = (function(theFile) {
		return function(e) {
			$("#container").append("<div id='saveName'>"+ theFile.name +" loaded</div>");
			parseSav(e.target.result);
		};
	})(savefile);
	reader.readAsBinaryString(savefile);
}

function loadFile(evt) {
	evt = evt.originalEvent || evt;
	alert(evt);
	console.log(evt);
	var savefile = evt.target.files[0];
	// save files are 32kb large and end in .sav
	if(savefile != null && savefile.size >= 32768 && savefile.name.endsWith(".sav")) {
		alert("Yay a valid save file!");
		readFile(savefile);
	}
	else {
		alert("That wasn't a valid save file");
	}
}

function parseSav(data) {
	// lets test getting the trainer name data
	// Currently just output the hex, it works so next step is to translate into text
	function getTrainerName() {
		var offset = 0x2598; // trainer name offset
		var size = 8;
		var output = "";
		for(var i = 0; i < size; i ++) {
			output += data.charCodeAt(offset + i).toString(16) + " ";
		}
		return output;
	}
	alert(getTrainerName());
}

/**
 * Ends with method for checking if a string ends with a bit of text
 * @param suffix
 * @returns {boolean}
 */
String.prototype.endsWith = function(suffix) {
	return this.indexOf(suffix, this.length - suffix.length) !== -1;
};