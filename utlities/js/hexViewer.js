
$(document).ready(function() {
	var $fileIn = $("#fileInput");
	$fileIn.bind("change", loadFile);

	var $gotoBox = $("#gotoBox");
	$gotoBox.bind("keypress", searchTable);

});

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