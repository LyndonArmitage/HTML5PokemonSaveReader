/*

JavaScript Based Pokemon Save File viewer by Lyndon Armitage 2013
---
This will make use of HTML5's File API so will not work in older browsers.

*/

$(document).ready(function() {
	loadEvent();
});

function loadEvent() {
	var container = document.getElementById("container");
	if(!supportsFileAPI()) {
		container.innerHTML = "Your browser does not support HTML5's File API. Please update to a better browser.";
	}
	else {
		// We support HTML5 File API so let's get cooking.
		alert("Yay File API Support");
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