// IMAGE RESOURCE LOADING:
/*
// tedious image loader
var img = new Image();
img.onload = function() {
	startGame();
};
img.src = url;
*/


// basic resource loader to handle all of this image loading automatically
(function() {
	var resourceCache = {};
	var loading = [];
	var readyCallbacks = [];

	// Load an image url or an array of image urls
	function load(urlOrArr) {
		if(urlOrArr instanceof Array) {
			urlOrArr.forEach(function(url) {
				_load(url);
			});
		}
		else {
			_load(urlOrArr);
		}
	}

	function _load(url) {
		if(resourceCache[url]) {
			return resourceCache[url];
		}
		else {
			var img = new Image();
			img.onload = function() {
				resourceCache[url] = img;

				if(isReady()) {
					readyCallbacks.forEach(function(func) { func(); });
				}
			};
			resourceCache[url] = false;
			img.src = url;
		}
	}

	function get(url) {
		return resourceCache[url];
	}

	function isReady() {
		var ready = true;
		for(var k in resourceCache) {
			if(resourceCache.hasOwnProperty(k) &&
			   !resourceCache[k]) {
				ready = false;
			}
		}
		return ready;
	}

	function onReady(func) {
		readyCallbacks.push(func);
	}

	window.resources = { 
		load: load,
		get: get,
		onReady: onReady,
		isReady: isReady
	};
})();

//THEN DO THIS:
/*
// load list of images.
resources.load([
	'img/sprites/player_ship.png',
	'img/sprites/missile.png'
]);
resources.onReady(init);
// To get an image once the game starts, we just do resources.get('img/sprites.png'). Easy!
*/