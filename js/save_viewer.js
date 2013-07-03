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
	return window.File && window.FileReader && window.FileList && window.Blob;
}

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

function parseSav(data) {
	// lets test getting the trainer name data
	// Currently just output the hex, it works so next step is to translate into text
	function getTrainerName() {
		var offset = 0x2598; // trainer name offset
		var size = 8;
		return getTextString(offset, size);
	}

	function getRivalName() {
		var offset = 0x25F6; // rival name offset
		var size = 8;
		return getTextString(offset, size);
	}

	function getTrainerID() {
		var offset = 0x2605;
		var size = 2;
		return hex2int(offset, size);
	}

	function getTimePlayed() {
		var offset = 0x2CEE;
		return {
			hours : hex2int(offset, 1),
			minutes : hex2int(offset+1, 1),
			seconds : hex2int(offset+2, 1),
			frames : hex2int(offset+3, 1)
		};
	}

	function getPocketItemList() {
		// Can hold 20 items making the size 42 because: Capacity * 2 + 2 = 42
		return getItemList(0x25C9, 20);
	}

	function getPCItemList() {
		// Can hold 50 items making the size 102 because: Capacity * 2 + 2 = 102
		// Offset seems to be 0x27E6 not 0x27E7 as said on bulbapedia
		return getItemList(0x27E6, 50);
	}

	function getItemList(offset, maxSize) {

		// Two extra bytes:
		// The byte at offset 0x00 is the total Count of different items in the list
		// The byte following the last item entry, according to Count, must always be a terminator, which is byte value 0xFF.

		var obj = {
			count : hex2int(offset, 1),
			items : []
		};

		offset ++;
		// Each entry is 2 bytes large, first byte is the Count of that item, second is it's Index
		for(var i = 0; i < obj.count && i < maxSize; i ++) {
			var itemIndex = hex2int(offset+(i*2), 1);
			var itemCount = hex2int(offset+(i*2)+1, 1);
			var name = getItemNameFromHexIndex(data.charCodeAt(offset+(i*2)));
			obj.items.push({
				count : itemCount,
				index : itemIndex,
				name : name
			});
		}

		return obj;
	}

	function getTextString(offset, size) {
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

	function getItemNameFromHexIndex(hex) {
		var itemMap = {
			0x00 : "Nothing", 0x01 : "Master Ball", 0x02 : "Ultra Ball", 0x03 : "Great Ball", 0x04 : "Poké Ball",
			0x05 : "Town Map", 0x06 : "Bicycle", 0x07 : "?????", 0x08 : "Safari Ball", 0x09 : "Pokédex",
			0x0A : "Moon Stone", 0x0B : "Antidote", 0x0C : "Burn Heal", 0x0D : "Ice Heal", 0x0E : "Awakening",
			0x0F : "Parlyz Heal", 0x10 : "Full Restore", 0x11 : "Max Potion", 0x12 : "Hyper Potion", 0x13 : "Super Potion",
			0x14 : "Potion", 0x15 : "BoulderBadge", 0x16 : "CascadeBadge", 0x17 : "ThunderBadge", 0x18 : "RainbowBadge",
			0x19 : "SoulBadge", 0x1A : "MarshBadge", 0x1B : "VolcanoBadge", 0x1C : "EarthBadge", 0x1D : "Escape Rope",
			0x1E : "Repel", 0x1F : "Old Amber", 0x20 : "Fire Stone", 0x21 : "Thunderstone", 0x22 : "Water Stone",
			0x23 : "HP Up", 0x24 : "Protein", 0x25 : "Iron", 0x26 : "Carbos", 0x27 : "Calcium",
			0x28 : "Rare Candy", 0x29 : "Dome Fossil", 0x2A : "Helix Fossil", 0x2B : "Secret Key", 0x2C : "?????",
			0x2D : "Bike Voucher", 0x2E : "X Accuracy", 0x2F : "Leaf Stone", 0x30 : "Card Key", 0x31 : "Nugget",
			0x32 : "PP Up", 0x33 : "Poké Doll", 0x34 : "Full Heal", 0x35 : "Revive", 0x36 : "Max Revive",
			0x37 : "Guard Spec.", 0x38 : "Super Repel", 0x39 : "Max Repel", 0x3A : "Dire Hit", 0x3B : "Coin",
			0x3C : "Fresh Water", 0x3D : "Soda Pop", 0x3E : "Lemonade", 0x3F : "S.S. Ticket", 0x40 : "Gold Teeth",
			0x41 : "X Attack", 0x42 : "X Defend", 0x43 : "X Speed", 0x44 : "X Special", 0x45 : "Coin Case",
			0x46 : "Oak's Parcel", 0x47 : "Itemfinder", 0x48 : "Silph Scope", 0x49 : "Poké Flute", 0x4A : "Lift Key",
			0x4B : "Exp. All", 0x4C : "Old Rod", 0x4D : "Good Rod", 0x4E : "Super Rod", 0x4F : "PP Up",
			0x50 : "Ether", 0x51 : "Max Ether", 0x52 : "Elixir", 0x53 : "Max Elixir"
		};
		// Add all 5 of the HMs
		for(var i = 0; i < 5; i ++) {
			itemMap[0xC4+i] = "HM0" + (1+i);
		}
		// Add all 55 og the TMs
		for(i = 0; i < 55; i ++) {
			var num = (1+i);
			if(num < 10) num = "0" + num;
			itemMap[0xC9+i] = "TM" + num;
		}
		return itemMap[hex];
	}

	function hex2int(offset, size) {
		var val = "";
		for(var i = 0; i < size; i ++) {
			val += data.charCodeAt(offset + i).toString(16);
		}
		return parseInt(val, 16);
	}


	// return an object containing the data in an easy to manipulate format
	return {
		trainerName: getTrainerName(),
		rivalName: getRivalName(),
		trainerID: getTrainerID(),
		timePlayed : getTimePlayed(),
		pocketItemList : getPocketItemList(),
		PCItemList : getPCItemList()
	};
}

/**
 * Ends with method for checking if a string ends with a bit of text
 * @param suffix
 * @returns {boolean}
 */
String.prototype.endsWith = function(suffix) {
	return this.indexOf(suffix, this.length - suffix.length) !== -1;
};