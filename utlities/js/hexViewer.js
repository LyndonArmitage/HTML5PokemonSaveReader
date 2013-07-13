
$(document).ready(function() {
	var $fileIn = $("#fileInput");
	var $gotoBox = $("#gotoBox");
	if(supportsFileAPI()) {
		$fileIn.bind("change", loadFile);
		$gotoBox.bind("keypress", searchTable);
		if(supportsStorage()) {
			$("#saveNotes").bind("click", saveNotes);
			$("#noteBox").bind("blur", setNote);
			$("#noteBox").bind("keypress", function(e) {
				if(e.keyCode === 13) {
					setNote(e);
				}
			});
			$("#clearNotes").bind("click", clearNotes);
		}
		else {
			$("#notesSection").remove();
		}
	}
	else {
		$("#container").html(
			"<h2>Your browser does not support the HTML5 File API</h2>" +
			"<div style='text-align: center'>This application makes use of the HTML5 File API to read local files.<br />" +
			"Please update your browser</div>"
		);
		$("#inputSection").remove();
	}


});

/**
 * Function that returns true if the user's web browser supports the HTML5 File API
 * @returns {boolean}
 */
function supportsFileAPI() {
	return window.File && window.FileReader && window.FileList && window.Blob;
}

/**
 * Function to check if Storage API is supported
 * @returns {boolean}
 */
function supportsStorage() {
	return window.localStorage != null && window.sessionStorage != null;
}

function loadFile(evt) {
	evt = evt.originalEvent || evt;
	var file = evt.target.files[0];
	if(file != null) {
		openFile(file);
	}
}

function openFile(file) {
	var reader = new FileReader();
	reader.onload = (function(theFile) {
		return function(e) {
			var container = document.getElementById("container");
			container.innerHTML = "";
			createDataTable(e.target.result, "Contents of " + theFile.name, container);
			if(supportsStorage()) {
				loadNotes(theFile.name);
				changeNote(null);
			}
		};
	})(file);
	reader.readAsBinaryString(file);
}

function int2HexString(i) {
	var str = i.toString(16);
	if(str.length < 2) {
		str = "0" + str;
	}
	return str.toUpperCase();
}

function createDataTable(data, heading, container) {
	var headingEl = document.createElement("h2");
	headingEl.id = "dataHeading";
	headingEl.appendChild(document.createTextNode(heading))
	container.appendChild(headingEl);

	var tableEl = document.createElement("table");
	tableEl.id = "dataTable";
	var topRow = document.createElement("tr");
	var topLeftTh = document.createElement("th");
	tableEl.appendChild(topRow);
	topRow.appendChild(topLeftTh);
	var columns = 16;
	for(var i = 0; i < columns; i ++) {
		var th = document.createElement("th");
		th.innerHTML = int2HexString(i);
		topRow.appendChild(th);
	}

	function getHex(offset) {
		return int2HexString(data.charCodeAt(offset));
	}

	var count = 0;
	while(count < data.length) {
		var tr = document.createElement("tr");
		var th = document.createElement("th");
		th.innerHTML = int2HexString(count);
		tr.appendChild(th);
		for(var i = 0;i < columns; i ++) {
			var td = document.createElement("td");
			td.className = "hex";
			td.setAttribute("pos", int2HexString(count));
			td.innerHTML = "<abbr name='"+ int2HexString(count) +"' title='"+int2HexString(count)+"'>" + getHex(count) + "</abbr>";
			tr.appendChild(td);
			count ++;
			if(count >= data.length) break;
		}
		tableEl.appendChild(tr);
	}

	container.appendChild(tableEl);

	$(".hex").bind("click", function() {
		var $abbr =  $(this).find("abbr");
		selectHex($abbr[0]);
		changeNote($abbr[0]);
	})
}

function selectHex(element) {
	var previous = document.getElementById("selectedHex");
	if(previous != null) {
		previous.id = "";
	}
	if(element != null) {
		element.id = "selectedHex";
		var gotoBox = document.getElementById("gotoBox");
		gotoBox.value = element.getAttribute("name");
		document.getElementById("gotoResult").innerHTML = "Found";
	}
}

function searchTable(event) {
	if(event.keyCode === 13) {
		var previous = document.getElementById("selectedHex");
		if(previous != null) {
			previous.id = "";
		}
		var elements = document.getElementsByName(event.target.value);
		if(elements.length > 0) {
			elements[0].scrollIntoView(true);
			elements[0].id = "selectedHex";
			document.getElementById("gotoResult").innerHTML = "Found";
		}
		else {
			document.getElementById("gotoResult").innerHTML = "Not Found";
		}
	}
}

function changeNote(element) {
	if(element != null) {
		document.getElementById("noteBox").value = element.getAttribute("note");
	}
	else {
		document.getElementById("noteBox").value = "";
	}
}

function setNote(event) {
	var fileInput = document.getElementById("fileInput");
	if(fileInput.files.length > 0) {
		var txt = document.getElementById("noteBox").value;
		var gotoBox = document.getElementById("gotoBox");
		var elementName = gotoBox.value;
		if(txt != null && txt.length > 0) {
			$(".hex [name="+ elementName +"]").attr("note", txt);
		}
		else {
			$(".hex [name="+ elementName +"]").removeAttr("note");
		}
	}
}

function saveNotes() {
	var fileInput = document.getElementById("fileInput");
	if(fileInput.files.length > 0) {
		var filename = fileInput.files[0].name;
		var notes = {};
		var hexes = document.getElementsByClassName("hex");
		for(var i = 0; i < hexes.length; i ++) {
			var hex = hexes.item(i);
			var $abbr = $(hex).find("abbr");
			if($abbr.attr("note")!= null) {
				console.log($abbr[0]);
				notes[$abbr.attr("name")] = $abbr.attr("note");
			}
		}
		console.log(notes);
		localStorage.setItem(filename, JSON.stringify(notes));
	}
}

function loadNotes(filename) {
	var notes = JSON.parse(localStorage.getItem(filename));
	if(notes != null) {
		for(var key in notes) {
			$(".hex [name="+ key +"]").attr("note", notes[key]);
		}
	}
}

function clearNotes() {
	var fileInput = document.getElementById("fileInput");
	if(fileInput.files.length > 0) {
		var filename = fileInput.files[0].name;
		if(confirm("Continuing will delete all notes for " +filename) == false) {
			return;
		}
		localStorage.removeItem(filename);
		var hexes = document.getElementsByClassName("hex");
		for(var i = 0; i < hexes.length; i ++) {
			var hex = hexes.item(i);
			var $abbr = $(hex).find("abbr");
			if($abbr.attr("note")!= null) {
				$abbr.removeAttr("note");
			}
		}
		changeNote(null);
	}
}