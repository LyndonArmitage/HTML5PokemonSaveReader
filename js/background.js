/**
 Background Generator

 This will generate a good looking background for the Save File Editor using a few sprites and a canvas
**/

/**
 * Returns image data to be used as the background to an element
 * @param width
 * @param height
 */
function setBackground(element ,width, height) {

	function isSupported(){
		var elem = document.createElement('canvas');
		return !!(elem.getContext && elem.getContext('2d'));
	}

	// Returns a random integer between min and max
	// Using Math.round() will give you a non-uniform distribution!
	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	function prob(value) {
		return getRandomInt(0, 100) < value;
	}

	function create2DArray(rows) {
		var arr = [];
		for (var i=0;i<rows;i++) {
			arr[i] = [];
		}
		return arr;
	}

	function generateMap(mapWidth, mapHeight) {
		var map = create2DArray(mapWidth);
		var DEAD = false;
		var ALIVE = true;

		function getLiveNeighbours(x, y) {
			var live = 0;
			if(x < mapWidth-1 && map[x+1][y] == ALIVE) {
				// right
				live ++;
			}
			if(x > 0 && map[x-1][y] == ALIVE) {
				// left
				live ++;
			}
			if(y < mapHeight-1 && map[x][y+1] == ALIVE) {
				// up
				live ++;
			}
			if(y > 0 && map[x][y-1] == ALIVE) {
				// down
				live ++;
			}
			if(y < mapHeight-1 && x < mapWidth-1 && map[x+1][y+1] == ALIVE) {
				// top right
				live ++;
			}
			if(y > 0 && x < mapWidth-1 && map[x+1][y-1] == ALIVE) {
				// bottom right
				live ++;
			}
			if(y < mapHeight-1 && x > 0 && map[x-1][y+1] == ALIVE) {
				// top left
				live ++;
			}
			if(y > 0 && x > 0 && map[x-1][y-1] == ALIVE) {
				// bottom left
				live ++;
			}
			return live;
		}

		// set everything to random
		for(var x = 0; x < mapWidth; x ++) {
			for(var y = 0; y < mapHeight; y ++) {
				if(prob(10)) {
					map[x][y] = ALIVE;
				}
				else {
					map[x][y] = DEAD;
				}
			}
		}

		var iterations = 10;
		while(iterations > 0) {
			var newMap = create2DArray(mapWidth);
			for(var x = 0; x < mapWidth; x ++) {
				for(var y = 0; y < mapHeight; y ++) {
					var cell = map[x][y];
					if(cell == ALIVE) {
						if(getLiveNeighbours(x, y) < 2) {
							newMap[x][y]  = DEAD;
						}
						else {
							newMap[x][y] = ALIVE;
						}
					}
					else {
						if(getLiveNeighbours(x, y) > 2) {
							newMap[x][y] = ALIVE;
						}
						else {
							newMap[x][y] = DEAD;
						}
					}
				}
			}
			map = newMap;
			iterations --;
		}


	return map;
	}

	function drawBackground(canvas, tileMap) {
		var ctx = canvas.getContext("2d");
		var tileSize = 8;

		// run the map generator
		var map = generateMap(canvas.width / tileSize, canvas.height / tileSize);

		for(var x = 0; x < canvas.width / tileSize; x ++) {
			for(var y = 0; y < canvas.height / tileSize; y ++) {
				if(map[x][y] == true) {
					ctx.drawImage(tileMap,16, 104, tileSize, tileSize, x*tileSize, y*tileSize, tileSize, tileSize);
				}
				else {
					ctx.drawImage(tileMap,104, 64, tileSize, tileSize, x*tileSize, y*tileSize, tileSize, tileSize);
				}
			}
		}




	}

	if(isSupported()) {
		var canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;
		var tileMap = new Image();
		tileMap.onload = function() {
			drawBackground(canvas, this);
			element.style.background = "url(" + canvas.toDataURL() + ") repeat";
		}
		tileMap.src = "imgs/tiles.png";
	}
	else {
		element.style.background = "url('../imgs/fallback.png') repeat;";
	}



}
