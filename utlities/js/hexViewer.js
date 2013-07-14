
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
			$(window).on('beforeunload', saveNotes); // save when they close or navigate away
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
	setDebugDiv(element);
}

function setDebugDiv(element) {
	var $debugDiv = $("#debugData");
	function hexString2ascii(hex) {
		var str = '';
		for (var i = 0; i < hex.length; i += 2)
			str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
		return str;
	}
	function hexString2int(hex) {
		var str = '';
		for (var i = 0; i < hex.length; i += 2)
			str += parseInt(hex.substr(i, 2), 16);
		return str;
	}
	function hexString2binary(hex) {
		return parseInt(hex, 16).toString(2);
	}
	if(element != null) {
		$debugDiv.html(
			"<span class='label'>As Text: </span><span>"+ hexString2ascii(element.innerHTML) +"</span><br/>" +
			"<span class='label'>As Integer: </span><span>"+ hexString2int(element.innerHTML) +"</span><br/>" +
			"<span class='label'>As Binary: </span><span>"+ hexString2binary(element.innerHTML) +"</span><br/>"
		);
	}
	else {
		$debugDiv.html("");
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
			changeNote(elements[0]);
			document.getElementById("gotoResult").innerHTML = "Found";
			setDebugDiv(elements[0]);
		}
		else {
			document.getElementById("gotoResult").innerHTML = "Not Found";
			setDebugDiv(null);
		}
	}
}

function changeNote(element) {
	if(element != null) {
		$("#noteBox").val(element.getAttribute("note"));
	}
	else {
		$("#noteBox").val("");
	}
}

function setNote() {
	var fileInput = document.getElementById("fileInput");
	if(fileInput.files.length > 0) {
		var txt = document.getElementById("noteBox").value;
		var gotoBox = document.getElementById("gotoBox");
		var elementName = gotoBox.value;
		var $abbr = $(".hex abbr[name="+ elementName +"]");
		if(txt != null && txt.length > 0) {
			$abbr.attr("note", txt);
			$abbr.addClass("noted");
		}
		else {
			$abbr.removeAttr("note");
			$abbr.removeClass("noted");
		}
	}
}

function saveNotes() {
	var fileInput = document.getElementById("fileInput");
	if(fileInput.files.length > 0) {
		var filename = fileInput.files[0].name;
		var $abbrs = $(".hex abbr.noted");
		if($abbrs.size() > 0) {
			var notes = {};
			$abbrs.each(function() {
				var $abbr = $(this);
				if($abbr.attr("note") != null) {
					notes[$abbr.attr("name")] = $abbr.attr("note");
				}
			});
			console.log("Notes saved");
			localStorage.setItem(filename, JSON.stringify(notes));
		}
		else {
			localStorage.removeItem(filename);
		}

	}
}

function loadNotes(filename) {
	var notes = JSON.parse(localStorage.getItem(filename));
	if(notes != null) {
		for(var key in notes) {
			var $abbr = $(".hex abbr[name="+ key +"]");
			$abbr.attr("note", notes[key]);
			$abbr.addClass("noted");
		}
		console.log("Notes loaded");
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
		$(".hex abbr.noted").removeAttr("note");
		$(".hex abbr.noted").removeClass("noted");
		changeNote(null);
	}
}