
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
		$container.html("<div id='inputLabel'>Select Save File</div><input type='file' id='fileInput' name='savefile' style='display: none'/>");
		var $fileIn = $container.find("#fileInput");
		$fileIn.bind("change", loadFile);
		var $label = $container.find("#inputLabel");
		$label.bind("click", function() {
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

function readFile(savefile) {
	var reader = new FileReader();

	reader.onload = (function(theFile) {
		return function(e) {
			$("#container").append("<div id='saveName'>"+ theFile.name +" loaded</div>");
			var results = parseSav(e.target.result);
			console.log(results);
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