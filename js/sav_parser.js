/*

JavaScript Based Pokemon Save File viewer by Lyndon Armitage 2013
---
This will make use of HTML5's File API so will not work in older browsers.

*/

/**
 * Save Data Parser.<br/>
 * Will Take in a binary string and return an object representing the save data gleamed from it.<br/>
 * Currently only supports Generation 1 save files (Yellow, Red and Blue)
 * @param data
 * @returns {{trainerName: *, rivalName: *, trainerID: *, timePlayed: *, bagItemList: *, PCItemList: *, checksum: *}}
 */
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
		var offset = 0x2CED;
		return {
			hours : hex2int(offset, 1),
			minutes : hex2int(offset+2, 1),
			seconds : hex2int(offset+3, 1),
			frames : hex2int(offset+4, 1)
		};
	}

	function getBagItemList() {
		// Can hold 20 items making the size 42 because: Capacity * 2 + 2 = 42
		return getItemList(0x25C9, 20);
	}

	function getPCItemList() {
		// Can hold 50 items making the size 102 because: Capacity * 2 + 2 = 102
		// Offset seems to be 0x27E6 not 0x27E7 as said on bulbapedia
		return getItemList(0x27E6, 50);
	}

	function getChecksum() {
		return hex2int(0x3523, 1);
	}

	function getMoney() {
		// makes use of packed BCD
		// Represents how much money the character has.
		// The figure is a 6-digit number, 2 digits per byte, encoded as binary-coded decimal,
		// where each digit is allocated a full 4 bits.
		var offset = 0x25F3;
		var size = 3; // 3 bytes because each digit comes from a nibble
		var out = "";
		var shouldAdd = false;
		for(var i = 0; i < size; i ++) {
			var byteVal = data.charCodeAt(offset+i);
			var digit1 = byteVal >> 4;
			var digit2 = byteVal & 0xF;
			// Check if we should add 0s (for middle of number)
			if(shouldAdd || digit1 > 0) {
				out += digit1;
				shouldAdd = true;
			}
			if(shouldAdd || digit2 > 0) {
				out += digit2;
				shouldAdd = true;
			}
		}
		return out;
	}

	function getCasinoCoins() {
		// makes use of packed BCD
		// Represents how much coins the character has.
		// The figure is a 4-digit number, 2 digits per byte, encoded as binary-coded decimal,
		// where each digit is allocated a full 4 bits.
		var offset = 0x2850;
		var size = 2; // 3 bytes because each digit comes from a nibble
		var out = "";
		var shouldAdd = false;
		for(var i = 0; i < size; i ++) {
			var byteVal = data.charCodeAt(offset+i);
			var digit1 = byteVal >> 4;
			var digit2 = byteVal & 0xF;
			// Check if we should add 0s (for middle of number)
			if(shouldAdd || digit1 > 0) {
				out += digit1;
				shouldAdd = true;
			}
			if(shouldAdd || digit2 > 0) {
				out += digit2;
				shouldAdd = true;
			}
		}
		return out;
	}

	function getCurrentPCBox() {
		return lowNibble(hex2int(0x284C, 1)) + 1;
	}

	function getSeenList() {
		return getPokedexList(0x25B6);
	}

	function getOwnedList() {
		return getPokedexList(0x25A3);
	}

	function getPlayerPosition() {
		var obj = {
			x : hex2int(0x260E, 1),
			y : hex2int(0x260D, 1),
			mapNum : hex2int(0x260A, 1)
		};
		return obj;
	}

	function getPartyList() {
		return getPokemonList(0x2F2C, 6, true);
	}

	function getBoxList(boxNumber) {
		var boxMap = {
			1 : 0x4000,
			2 : 0x4462,
			3 : 0x48C4,
			4 : 0x4D26,
			5 : 0x5188,
			6 : 0x55EA,
			7 : 0x6000,
			8 : 0x6462,
			9 : 0x68C4,
			10 : 0x6D26,
			11 : 0x7188,
			12 : 0x75EA
		};
		var offset = boxMap[boxNumber];
		console.log("! " + offset.toString(16));
		return getPokemonList(offset, 20, false);
	}

	function getCurrentBoxList() {
		return getPokemonList(0x30C0, 20, false);
	}

	function getPokemonList(offset, capacity, isParty) {
		var size = isParty ? 44 : 33;
		var totalSize = capacity * (size + 23) + 2;
		var count = hex2int(offset, 1);

		var list = {
			count : hex2int(offset, 1),
			species : [],
			pokemon : [],
			OTNames : [],
			names : []
		};

		// we will use count here as it tells us the amount actually present so we don't need to look for 0xFF
		for(var i = 0; i < count; i ++) {
			list.species[i] = getSpeciesFromIndex(hex2int(offset + 1 + i, 1));
			list.pokemon[i] = new Pokemon((offset + 2 + capacity) + (i * size), isParty)
			list.OTNames[i] = getTextString( ((offset + 2 + capacity) + ((capacity-1) * size)) + size + (i*11) , 10);
			list.names[i] = getTextString( (((offset + 2 + capacity) + ((capacity-1) * size)) + size + ((capacity-1)*11)) + ((i+1)*11) , 10);
		}

		return list;
	}

	/**
	 * Returns a binary string where a 1 represents that the Pokemon with that index is present.
	 * @param offset
	 * @returns {string}
	 */
	function getPokedexList(offset) {
		var length = 19; // 19 bytes long = 152 possible bits
		var binaryString = "";
		for(var i = length; i > 0; i --) {
			var str = data.charCodeAt(offset + i).toString(2);
			var padding = "";
			if(str.length < 8) {
				var dif = 8 - str.length;
				while(dif > 0) {
					padding += "0";
					dif --;
				}
			}
			binaryString += str + padding;
		}
		return binaryString.split("").reverse().join("");
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
			0x00 : "Nothing", 0x01 : "Master Ball", 0x02 : "Ultra Ball", 0x03 : "Great Ball", 0x04 : "Pok&#233; Ball",
			0x05 : "Town Map", 0x06 : "Bicycle", 0x07 : "?????", 0x08 : "Safari Ball", 0x09 : "Pok&#233;dex",
			0x0A : "Moon Stone", 0x0B : "Antidote", 0x0C : "Burn Heal", 0x0D : "Ice Heal", 0x0E : "Awakening",
			0x0F : "Parlyz Heal", 0x10 : "Full Restore", 0x11 : "Max Potion", 0x12 : "Hyper Potion", 0x13 : "Super Potion",
			0x14 : "Potion", 0x15 : "BoulderBadge", 0x16 : "CascadeBadge", 0x17 : "ThunderBadge", 0x18 : "RainbowBadge",
			0x19 : "SoulBadge", 0x1A : "MarshBadge", 0x1B : "VolcanoBadge", 0x1C : "EarthBadge", 0x1D : "Escape Rope",
			0x1E : "Repel", 0x1F : "Old Amber", 0x20 : "Fire Stone", 0x21 : "Thunderstone", 0x22 : "Water Stone",
			0x23 : "HP Up", 0x24 : "Protein", 0x25 : "Iron", 0x26 : "Carbos", 0x27 : "Calcium",
			0x28 : "Rare Candy", 0x29 : "Dome Fossil", 0x2A : "Helix Fossil", 0x2B : "Secret Key", 0x2C : "?????",
			0x2D : "Bike Voucher", 0x2E : "X Accuracy", 0x2F : "Leaf Stone", 0x30 : "Card Key", 0x31 : "Nugget",
			0x32 : "PP Up", 0x33 : "Pok&#233; Doll", 0x34 : "Full Heal", 0x35 : "Revive", 0x36 : "Max Revive",
			0x37 : "Guard Spec.", 0x38 : "Super Repel", 0x39 : "Max Repel", 0x3A : "Dire Hit", 0x3B : "Coin",
			0x3C : "Fresh Water", 0x3D : "Soda Pop", 0x3E : "Lemonade", 0x3F : "S.S. Ticket", 0x40 : "Gold Teeth",
			0x41 : "X Attack", 0x42 : "X Defend", 0x43 : "X Speed", 0x44 : "X Special", 0x45 : "Coin Case",
			0x46 : "Oak's Parcel", 0x47 : "Itemfinder", 0x48 : "Silph Scope", 0x49 : "Pok&#233; Flute", 0x4A : "Lift Key",
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

	/**
	 * Returns how friendly Pikachu is to you
	 * @returns {*}
	 */
	function getPikachuFriendship() {
		return hex2int(0x271C, 1);
	}

	function hex2int(offset, size) {
		var val = "";
		for(var i = 0; i < size; i ++) {
			var d = data.charCodeAt(offset + i).toString(16);
			if(d.length < 2) d = "0" + d; // append leading 0, should not break anything from previous version
			val += d;
		}
		return parseInt(val, 16);
	}

	function lowNibble(val) {
		return val & 0x0F;
	}

	function highNibble(val) {
		return (val >> 4) & 0x0F;
	}

	function getPokemonType(index) {
		var types = {
			0x00: "Normal",
			0x01: "Fighting",
			0x02: "Flying",
			0x03: "Poison",
			0x04: "Ground",
			0x05: "Rock",
			0x07: "Bug",
			0x08: "Ghost",
			0x14: "Fire",
			0x15: "Water",
			0x16: "Grass",
			0x17: "Electric",
			0x18: "Psychic",
			0x19: "Ice",
			0x1A: "Dragon"
		};
		return types[index];
	}

	function getSpeciesFromIndex(index) {
		var species = {
			0x01: "	Rhydon", 0x02: "Kangaskhan", 0x03: "Nidoran♂", 0x04: "Clefairy", 0x05: "Spearow",
			0x06: "Voltorb", 0x07: "Nidoking", 0x08: "Slowbro", 0x09: "Ivysaur", 0x0A: "Exeggutor",
			0x0B: "Lickitung", 0x0C: "Exeggcute", 0x0D: "Grimer", 0x0E: "Gengar", 0x0F: "Nidoran♀",
			0x10: "Nidoqueen", 0x11: "Cubone", 0x12: "Rhyhorn", 0x13: "Lapras", 0x14: "Arcanine",
			0x15: "Mew", 0x16: "Gyarados", 0x17: "Shellder", 0x18: "Tentacool", 0x19: "Gastly",
			0x1A: "Scyther", 0x1B: "Staryu", 0x1C: "Blastoise", 0x1D: "Pinsir", 0x1E: "Tangela",
			0x1F: "Missingno.", 0x20: "Missingno.", 0x21: "Growlithe", 0x22: "Onix", 0x23: "Fearow",
			0x24: "Pidgey", 0x25: "Slowpoke", 0x26: "Kadabra", 0x27: "Graveler", 0x28: "Chansey",
			0x29: "Machoke", 0x2A: "Mr. Mime", 0x2B: "Hitmonlee", 0x2C: "Hitmonchan", 0x2D: "Arbok",
			0x2E: "Parasect", 0x2F: "Psyduck", 0x30: "Drowzee", 0x31: "Golem", 0x32: "Missingno.",
			0x33: "Magmar", 0x34: "Missingno.", 0x35: "Electabuzz", 0x36: "Magneton", 0x37: "Koffing",
			0x38: "Missingno.", 0x39: "Mankey", 0x3A: "Seel", 0x3B: "Diglett", 0x3C: "Tauros",
			0x3D: "Missingno.",
			0x3E: "Missingno.",
			0x3F: "Missingno.",
			0x40: "Farfetch'd",
			0x41: "Venonat",
			0x42: "Dragonite",
			0x43: "Missingno.",
			0x44: "Missingno.",
			0x45: "Missingno.",
			0x46: "Doduo",
			0x47: "Poliwag",
			0x48: "Jynx",
			0x49: "Moltres",
			0x4A: "Articuno",
			0x4B: "Zapdos",
			0x4C: "Ditto",
			0x4D: "Meowth",
			0x4E: "Krabby",
			0x4F: "Missingno.",
			0x50: "Missingno.",
			0x51: "Missingno.",
			0x52: "Vulpix",
			0x53: "Ninetales",
			0x54: "Pikachu",
			0x55: "Raichu",
			0x56: "Missingno.",
			0x57: "Missingno.",
			0x58: "Dratini",
			0x59: "Dragonair",
			0x5A: "Kabuto",
			0x5B: "Kabutops",
			0x5C: "Horsea",
			0x5D: "Seadra",
			0x5E: "Missingno.",
			0x5F: "Missingno.",
			0x60: "Sandshrew",
			0x61: "Sandslash",
			0x62: "Omanyte",
			0x63: "Omastar",
			0x64: "Jigglypuff",
			0x65: "Wigglytuff",
			0x66: "Eevee",
			0x67: "Flareon",
			0x68: "Jolteon",
			0x69: "Vaporeon",
			0x6A: "Machop",
			0x6B: "Zubat",
			0x6C: "Ekans",
			0x6D: "Paras",
			0x6E: "Poliwhirl",
			0x6F: "Poliwrath",
			0x70: "Weedle",
			0x71: "Kakuna",
			0x72: "Beedrill",
			0x73: "Missingno.",
			0x74: "Dodrio",
			0x75: "Primeape",
			0x76: "Dugtrio",
			0x77: "Venomoth",
			0x78: "Dewgong",
			0x79: "Missingno.",
			0x7A: "Missingno.",
			0x7B: "Caterpie",
			0x7C: "Metapod",
			0x7D: "Butterfree",
			0x7E: "Machamp",
			0x7F: "Missingno.",
			0x80: "Golduck",
			0x81: "Hypno",
			0x82: "Golbat",
			0x83: "Mewtwo",
			0x84: "Snorlax",
			0x85: "Magikarp",
			0x86: "Missingno.",
			0x87: "Missingno.",
			0x88: "Muk",
			0x89: "Missingno.",
			0x8A: "Kingler",
			0x8B: "Cloyster",
			0x8C: "Missingno.",
			0x8D: "Electrode",
			0x8E: "Clefable",
			0x8F: "Weezing",
			0x90: "Persian",
			0x91: "Marowak",
			0x92: "Missingno.",
			0x93: "Haunter",
			0x94: "Abra",
			0x95: "Alakazam",
			0x96: "Pidgeotto",
			0x97: "Pidgeot",
			0x98: "Starmie",
			0x99: "Bulbasaur",
			0x9A: "Venusaur",
			0x9B: "Tentacruel",
			0x9C: "Missingno.",
			0x9D: "Goldeen",
			0x9E: "Seaking",
			0x9F: "Missingno.",
			0xA0: "Missingno.",
			0xA1: "Missingno.",
			0xA2: "Missingno.",
			0xA3: "Ponyta",
			0xA4: "Rapidash",
			0xA5: "Rattata",
			0xA6: "Raticate",
			0xA7: "Nidorino",
			0xA8: "Nidorina",
			0xA9: "Geodude",
			0xAA: "Porygon",
			0xAB: "Aerodactyl",
			0xAC: "Missingno.",
			0xAD: "Magnemite",
			0xAE: "Missingno.",
			0xAF: "Missingno.",
			0xB0: "Charmander",
			0xB1: "Squirtle",
			0xB2: "Charmeleon",
			0xB3: "Wartortle",
			0xB4: "Charizard",
			0xB5: "Missingno.",
			0xB6: "Missingno.",
			0xB7: "Missingno.",
			0xB8: "Missingno.",
			0xB9: "Oddish",
			0xBA: "Gloom",
			0xBB: "Vileplume",
			0xBC: "Bellsprout",
			0xBD: "Weepinbell",
			0xBE: "Victreebel"
		};

		return species[index];
	}

	/**
	 * Constructor for new Pokemon
	 * @param startOffset
	 * @param isPartyMember
	 * @constructor
	 */
	function Pokemon(startOffset, isPartyMember) {
		this.index = hex2int(startOffset, 1);
		this.species = getSpeciesFromIndex(this.index); // derived from index
		this.currentHp = hex2int(startOffset + 0x01, 2);
		this.level = hex2int(startOffset + 0x03, 1);
		this.status = hex2int(startOffset + 0x04, 1);
		this.type1Index = hex2int(startOffset + 0x05, 1);
		this.type2Index = hex2int(startOffset + 0x06, 1);
		this.type1 = getPokemonType(this.type1Index);
		this.type2 = getPokemonType(this.type2Index);
		this.catchRate = hex2int(startOffset + 0x07, 1);
		this.move1Index = hex2int(startOffset + 0x08, 1);
		this.move2Index = hex2int(startOffset + 0x09, 1);
		this.move3Index = hex2int(startOffset + 0x0A, 1);
		this.move4Index = hex2int(startOffset + 0x0B, 1);
		this.ownerID = hex2int(startOffset + 0x0C, 2);
		this.exp = hex2int(startOffset + 0x0E, 3);
		this.hpEV = hex2int(startOffset + 0x11, 2);
		this.attackEV = hex2int(startOffset + 0x13, 2);
		this.defenseEV = hex2int(startOffset + 0x15, 2);
		this.speedEV = hex2int(startOffset + 0x17, 2);
		this.specialEV = hex2int(startOffset + 0x19, 2);
		this.IV = hex2int(startOffset + 0x1B, 2);
		this.move1PP = hex2int(startOffset + 0x1D, 1);
		this.move2PP = hex2int(startOffset + 0x1E, 1);
		this.move3PP = hex2int(startOffset + 0x1F, 1);
		this.move4PP = hex2int(startOffset + 0x20, 1);
		if(isPartyMember) {
			this.partyLevel = hex2int(startOffset + 0x21, 1);
			this.partyMaxHp = hex2int(startOffset + 0x22, 2);
			this.partyAttack = hex2int(startOffset + 0x24, 2);
			this.partyDefense = hex2int(startOffset + 0x26, 2);
			this.partySpeed = hex2int(startOffset + 0x28, 2);
			this.partySpecial = hex2int(startOffset + 0x2A, 2);
			this.isParty = true;
		}
		else {
			this.isParty = false;
		}
	}

	// return an object containing the data in an easy to manipulate format
	return {
		trainerName: getTrainerName(),
		rivalName: getRivalName(),
		trainerID: getTrainerID(),
		timePlayed : getTimePlayed(),
		bagItemList : getBagItemList(),
		PCItemList : getPCItemList(),
		checksum : getChecksum(),
		money : getMoney(),
		coins : getCasinoCoins(),
		currentPCBox : getCurrentPCBox(),
		seenList : getSeenList(),
		ownedList : getOwnedList(),
		playerPosition : getPlayerPosition(),
		pikachuFriendship: getPikachuFriendship(),
		partyList : getPartyList(),
		currentBoxList : getCurrentBoxList()
	};
}