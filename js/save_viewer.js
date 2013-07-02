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
			var code = data.charCodeAt(offset + i);
			if(code == 0x50) break; // terminate string
			output += getChar(code);
		}
		return output;
	}

	function getChar(hex) {
		var charMap = {
			0x50 : "\0", 0x7F : " ",

			0x80 : "A", 0x81 : "B", 0x82 : "C", 0x83 : "D", 0x84 : "E",
			0x85 : "F", 0x86 : "G", 0x87 : "H", 0x88 : "I", 0x89 : "J",
			0x8A : "K", 0x8B : "L", 0x8C : "M", 0x8D : "N", 0x8E : "O",
			0x8F : "P", 0x90 : "Q", 0x91 : "R", 0x92 : "S", 0x93 : "T",
			0x94 : "U", 0x95 : "V", 0x96 : "W", 0x97 : "X", 0x98 : "Y",
			0x99 : "Z", 0x9A : "(", 0x9B : ")", 0x9C : ":", 0x9D : ";",
			0x9E : "[", 0x9F : "]",

			0xA0 : "a", 0xA1 : "b", 0xA2 : "c", 0xA3 : "d", 0xA4 : "e",
			0xA5 : "f", 0xA6 : "g", 0xA7 : "h", 0xA8 : "i", 0xA9 : "j",
			0xAA : "k", 0xAB : "l", 0xAC : "m", 0xAD : "n", 0xAE : "o",
			0xAF : "p", 0xB0 : "q", 0xB1 : "r", 0xB2 : "s", 0xB3 : "t",
			0xB4 : "u", 0xB5 : "v", 0xB6 : "w", 0xB7 : "x", 0xB8 : "y",
			0xB9 : "z",

			0xE1 : "PK", 0xE2 : "MN", 0xE3 : "-",
			0xE6 : "?", 0xE7 : "!", 0xE8 : ".",

			0xF1 : "*",
			0xF3 : "/", 0xF4 : ",",

			0xF6 : "0", 0xF7 : "1", 0xF8 : "2", 0xF9 : "3", 0xFA : "4",
			0xFB : "5", 0xFC : "6", 0xFD : "7", 0xFE : "8", 0xFF : "9"
		};
		return charMap[hex];
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