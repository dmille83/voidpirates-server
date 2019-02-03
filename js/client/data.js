
//var game_math = require('./js/lib/math_functions.js');

var canvasScreenScale = 0.75;

// Create the canvas
var canvas = document.getElementById('canvasScreenID'); //document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 1000*canvasScreenScale;
canvas.height = 800*canvasScreenScale; //520;
canvas.style.display='block';
canvas.style.margin='auto';
canvas.style.cursor='crosshair';
ctx.translate(canvas.width/2, canvas.height/2);
ctx.scale(canvasScreenScale, canvasScreenScale);
ctx.translate(-(canvas.width/2), -(canvas.height/2));
//document.body.appendChild(canvas);


// Create the HUD canvas
var canvasHUD = document.getElementById('canvasHUD'); //document.createElement("canvas");
var ctxHUD = canvasHUD.getContext("2d");
canvasHUD.width = 294; //204;
canvasHUD.height = 150; //150;
canvasHUD.style.display='inline-block';


// Create the Minimap canvas
var canvasMinimap = document.getElementById('canvasMinimap'); //document.createElement("canvas");
var ctxMinimap = canvasMinimap.getContext("2d");
canvasMinimap.width = 260; //204;
canvasMinimap.height = 260; //520;
canvasMinimap.style.display='inline-block';


var gameData = [];

var warningTimoutTimer;
var warningList = [];


var lastPacketReceived = Date.now(); // To guage interval between packets received.
var lagReloadDelay = 10;
var lagReloadRetry = 10;
var reloadOnServerTimeout = true;


// ====== RENDER ORIENTATION ======
var globalOrientWorldAroundPlayer = false;
var globalOrientWorldAroundPlayerScaleTerrain = 1.44;
// Set display settings that go with orientation
function setGlobalOrientation(orientOnPlayer)
{
	globalOrientWorldAroundPlayer = orientOnPlayer;
	console.log("globalOrientWorldAroundPlayer = " + globalOrientWorldAroundPlayer);
	if (globalOrientWorldAroundPlayer) {
		setControlKey("fire", "SPACE");
		setControlKey("brake", "DOWN");
		document.getElementById("keyboard-orientation").style.display = "";
		document.getElementById("mouse-orientation").style.display = "none";
	} else {
		setControlKey("fire", "DOWN");
		setControlKey("brake", "SPACE");
		document.getElementById("keyboard-orientation").style.display = "none";
		document.getElementById("mouse-orientation").style.display = "";
	}
}
//setGlobalOrientation(globalOrientWorldAroundPlayer); // if run here, page resources aren't finished loading, throws an error


// ====== MOUSE TRACKING ======
var mousePosition = [0,0];
var mouseAngle = 0;

// Mouse Position & Angle
function getMousePos(canvas, evt) 
{
	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}
canvas.addEventListener('mousemove', function(evt) 
{
	mousePosition = getMousePos(canvas, evt);
	mouseAngle = getAngle(canvas.width/2, -canvas.height/2, mousePosition.x, -mousePosition.y);
	
}, false);


// Mouse Clicks
var mouseButtonsDown = [false, false, false, false];
$(canvas).mousedown(function(event) {
  event.preventDefault();
  switch (event.which) {
	case 1:
	  //alert('Left Mouse button pressed.');
	  mouseButtonsDown[1] = true;
	  break;
	case 2:
	  //alert('Middle Mouse button pressed.');
	  mouseButtonsDown[2] = true;
	  break;
	case 3:
	  //alert('Right Mouse button pressed.');
	  mouseButtonsDown[3] = true;
	  break;
	default:
	  //alert('You have a strange Mouse!');
  }
  //return false;
});
$(canvas).mouseup(function(event) {
  switch (event.which) {
	case 1:
	  //alert('Left Mouse button released.');
	  mouseButtonsDown[1] = false;
	  break;
	case 2:
	  //alert('Middle Mouse button released.');
	  mouseButtonsDown[2] = false;
	  break;
	case 3:
	  //alert('Right Mouse button released.');
	  mouseButtonsDown[3] = false;
	  break;
	default:
	  //alert('You have a strange Mouse! (up)');
  }
  //return false;
});




// ====== EDIT CONTROL KEYS ======
var userInputControls = {
	up: "w",
	down: "s",
	left: "a",
	right: "d",
	rleft: "LEFT",
	rright: "RIGHT",
	fire: "SPACE", //fire: "DOWN",
	brake: "DOWN", //brake: "SPACE",
	loot_weapon: "1",
	loot_weapon2: "2",
	loot_armor: "3",
	loot_engine: "4",
	swap_weapons: "TAB"
};
for (var ctrl in userInputControls)
	if (document.getElementById(ctrl))
		//document.getElementById(ctrl).title = userInputControls[ctrl];
		document.getElementById(ctrl).getElementsByClassName("btn-key-class")[0].innerHTML = userInputControls[ctrl].toUpperCase();

var newKeyControl;
function setUserInputControl(ctrl, changeSource)
{
	newKeyControl = ctrl;

	var ctrlText = ctrl;
	if (ctrlText == "rright") ctrlText = "rotate-right";
	if (ctrlText == "rleft") ctrlText = "rotate-left";
	postWarningMessage("orange", "press the key you want to set for " + ctrlText);
}
document.addEventListener('keydown', function(e) {
	var code = e.keyCode;
	var key;
	//console.log(code);

	if (newKeyControl)
	{
		switch(code) {
		case 32:
			event.preventDefault();
			key = 'SPACE'; break;
		case 37:
			event.preventDefault();
			key = 'LEFT'; break;
		case 38:
			event.preventDefault();
			key = 'UP'; break;
		case 39:
			event.preventDefault();
			key = 'RIGHT'; break;
		case 40:
			event.preventDefault();
			key = 'DOWN'; break;

		case 18:
			event.preventDefault();
			key = 'ALT'; break;

		case 9:
			event.preventDefault();
			key = 'TAB'; break;

		default:
			// Convert ASCII codes to letters
			key = String.fromCharCode(code);
		}
		//console.log(key);

		setControlKey(newKeyControl, key);
		newKeyControl = false;
	}
});
function setControlKey(ctrl, key)
{
	//document.getElementById(ctrl).title = key;
	document.getElementById(ctrl).getElementsByClassName("btn-key-class")[0].innerHTML = key.toUpperCase();

	switch (ctrl)
	{
		case 'up':
			userInputControls.up = key;
			break;
		case 'down':
			userInputControls.down = key;
			break;
		case 'left':
			userInputControls.left = key;
			break;
		case 'right':
			userInputControls.right = key;
			break;
		case 'rleft':
			userInputControls.rleft = key;
			break;
		case 'rright':
			userInputControls.rright = key;
			break;
		case 'brake':
			userInputControls.brake = key;
			break;
		case 'fire':
			userInputControls.fire = key;
			break;
		case 'loot_weapon':
			userInputControls.loot_weapon = key;
			break;
		case 'loot_weapon2':
			userInputControls.loot_weapon2 = key;
			break;
		case 'loot_armor':
			userInputControls.loot_armor = key;
			break;
		case 'loot_engine':
			userInputControls.loot_engine = key;
			break;
		case 'swap_weapons':
			userInputControls.swap_weapons = key;
			break;
		default:
			// do nothing?
	}

	var ctrlText = ctrl;
	if (ctrlText == "rright") ctrlText = "rotate-right";
	if (ctrlText == "rleft") ctrlText = "rotate-left";
	console.log("ctrl " + ctrlText + " set to " + key)
	postWarningMessage("orange", (ctrlText + " control set to " + key))
}

var terrainOffset = 0.8; // The backdrop will move more slowly than the sprites to give the scene an artificial feeling of depth
var terrainPattern;
var thermometerPattern;

var renderSimplifiedSun = false;

// This object holds some local data we need to track, like our ID, or the coordinates the screen should center itself on.
var player_id = '';
var player_last_health = 1;
var player = {
	x: 0,
	y: 0,
	health: 1,
	score: 0
};
var census = {
	ships: 0
};

var exhaustFumeList = [];
var statParticleArray = [];


// // Generate sprites for final death animation on this player's screen. ???
// var finalPlayerDeath = [];
// var finalPlayerDeathBlue = [];
// for (var i = 0; i < 9; i++)
// {
// 	finalPlayerDeath[i] = {
// 		sprite: new Sprite('img/sprite/explosion.png', [0, 0], [128, 128], getRandomInt(20, 50), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 0, true),
// 		angle: getRandomInt(0, 360)
// 	};
// 	finalPlayerDeathBlue[i] = {
// 		sprite: new Sprite('img/sprite/explosion-blue.png', [0, 0], [128, 128], getRandomInt(20, 50), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 0, true),
// 		angle: getRandomInt(0, 360)
// 	};
// }

var spriteClientArray = [
	new ClientSprite(	'img/sprite/player_ship.png'		, [35,35], [0], 0),

	new ClientSprite(	'img/sprite/missile.png'			, [10,33], [0, 1], 0),
	new ClientSprite(	'img/sprite/bullet01.png'			, [2, 100], [0], 0),
	new ClientSprite(	'img/sprite/bullet03.png'			, [11,30], [0, 1, 2, 3], 0),
	new ClientSprite(	'img/sprite/rocket_exhaust.png'		, [11,30], [0, 1, 2, 3], 0),		//new ClientSprite(	'img/sprite/rocket_exhaust.png'		, [27,19], [0, 1], 0),
	new ClientSprite(	'img/sprite/explosion.png'			, [128,128], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 0),
	new ClientSprite(	'img/sprite/explosion-blue.png'		, [128,128], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 0),
	new ClientSprite(	'img/sprite/wormhole.png'			, [75,75], [0, 1, 2, 3, 4, 5, 6 ,7 ,8 ,9 ,10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], 0),
	new ClientSprite(	'img/sprite/mine.png'				, [15,15], [0, 1], 0),
	new ClientSprite(	'img/sprite/wormhole-mine.png'		, [15,15], [0, 1], 0),
	new ClientSprite(	'img/sprite/grav-mine.png'			, [15,15], [0, 1], 0),
	new ClientSprite(	'img/sprite/rocket-mine.png'		, [15,35], [0, 1], 0),
	new ClientSprite(	'img/sprite/gravwave01.png'			, [35,11], [0], 0),
	new ClientSprite(	'img/sprite/gravwave02.png'			, [35,11], [0, 1, 2], 0),
	new ClientSprite(	'img/sprite/gravwave_radial01.png'	, [128,128], [0, 1, 2, 3, 4], 0),
	new ClientSprite(	'img/sprite/shield01.png'			, [200,200], [0, 1, 2, 3], 0),

	new ClientSprite(	'img/sprite/meteor001.png'			, [23,23], [0], 0),

	new ClientSprite(	'img/stage/planet/planet1.png'		, [300,300], [0], 0),
	new ClientSprite(	'img/stage/planet/planet2.png'		, [300,300], [0], 0),
	new ClientSprite(	'img/stage/planet/planet3.png'		, [300,300], [0], 0),
	new ClientSprite(	'img/stage/planet/planet4.png'		, [300,300], [0], 0),
	new ClientSprite(	'img/stage/planet/planet5.png'		, [300,300], [0], 0),
	new ClientSprite(	'img/stage/planet/planet6.png'		, [300,300], [0], 0),
	new ClientSprite(	'img/stage/planet/planet7.png'		, [300,300], [0], 0),
	new ClientSprite(	'img/stage/planet/planet10.png'		, [300,300], [0], 0),
	new ClientSprite(	'img/stage/planet/planet11.png'		, [300,300], [0], 0),
	new ClientSprite(	'img/stage/planet/planet12.png'		, [300,300], [0], 0),
	new ClientSprite(	'img/stage/planet/planet13.png'		, [300,300], [0], 0),
	new ClientSprite(	'img/stage/planet/planet14.png'		, [300,300], [0], 0),
	new ClientSprite(	'img/stage/planet/planet15.png'		, [300,300], [0], 0),
	new ClientSprite(	'img/stage/planet/planet16.png'		, [300,300], [0], 0),
	new ClientSprite(	'img/stage/planet/planet17.png'		, [300,300], [0], 0),
	new ClientSprite(	'img/stage/planet/planet19.png'		, [300,300], [0], 0),
	new ClientSprite(	'img/stage/planet/planet20.png'		, [300,300], [0], 0),

	new SunSprite(1548),

	new ClientSprite(	'img/sprite/ship01.png'				, [54,55], [0], 0),
	new ClientSprite(	'img/sprite/ship02.png'				, [49,53], [0], 0),
	new ClientSprite(	'img/sprite/ship03.png'				, [57,39], [0], 0),
	new ClientSprite(	'img/sprite/ship04.png'				, [79,43], [0], 0),
	new ClientSprite(	'img/sprite/ship05.png'				, [80,61], [0], 0),
	new ClientSprite(	'img/sprite/ship06.png'				, [72,63], [0], 0),
	new ClientSprite(	'img/sprite/ship07.png'				, [71,49], [0], 0),

	new ClientSprite(	'img/sprite/healing_exp.png'		, [20,20], [0, 1, 2], 0),
	new ClientSprite(	'img/sprite/loot_exp.png'			, [85,85], [0, 1, 2, 3, 4, 5, 6, 7], 0),
	new ClientSprite(	'img/sprite/bullet02.png'			, [2, 30], [0], 0),
	new ClientSprite(	'img/sprite/gravwave04.png'			, [33, 5], [0], 0)
];


var serverSideSpriteArray = [
	'img/sprite/player_ship.png',

	'img/sprite/missile.png',
	'img/sprite/bullet01.png',
	'img/sprite/bullet03.png',
	'img/sprite/rocket_exhaust.png',
	'img/sprite/explosion.png',
	'img/sprite/explosion-blue.png',
	'img/sprite/wormhole.png',
	'img/sprite/mine.png',
	'img/sprite/wormhole-mine.png',
	'img/sprite/grav-mine.png',
	'img/sprite/rocket-mine.png',
	'img/sprite/gravwave01.png',
	'img/sprite/gravwave02.png',
	'img/sprite/gravwave_radial01.png',
	'img/sprite/shield01.png',

	'img/sprite/meteor001.png',

	'img/stage/planet/planet1.png',
	'img/stage/planet/planet2.png',
	'img/stage/planet/planet3.png',
	'img/stage/planet/planet4.png',
	'img/stage/planet/planet5.png',
	'img/stage/planet/planet6.png',
	'img/stage/planet/planet7.png',
	'img/stage/planet/planet10.png',
	'img/stage/planet/planet11.png',
	'img/stage/planet/planet12.png',
	'img/stage/planet/planet13.png',
	'img/stage/planet/planet14.png',
	'img/stage/planet/planet15.png',
	'img/stage/planet/planet16.png',
	'img/stage/planet/planet17.png',
	'img/stage/planet/planet19.png',
	'img/stage/planet/planet20.png',

	//'sun_sprite_index_placeholder'

	'img/sprite/ship01.png',
	'img/sprite/ship02.png',
	'img/sprite/ship03.png',
	'img/sprite/ship04.png',
	'img/sprite/ship05.png',
	'img/sprite/ship06.png',
	'img/sprite/ship07.png',

	'img/sprite/healing_exp.png',
	'img/sprite/loot_exp.png',
	'img/sprite/bullet02.png',
	'img/sprite/gravwave04.png'
];
var clientSideResources = [
	'img/stage/starfield.png',
	'img/hud/thermometer.png',
	//'img/stage/sun/sun.png',
	'img/stage/penumbra.png'
];



function renderStartupMessage()
{
	ctx.fillStyle = terrainPattern;
	ctx.fillRect(-canvas.width/2, -canvas.height/2, canvas.width*2, canvas.height*2);
	drawTextLine(ctx, [canvas.height/2 - 250, canvas.width/2 - 50], "CONNECTING...", 80, "white");
}



// ====== INITIALIZE GAME WORLD RESOURCES (CLIENT SIDE) AND CONTACT SERVER ======
function init() {
	terrainPattern = ctx.createPattern(resources.get('img/stage/starfield.png'), 'repeat');
	thermometerPattern = ctx.createPattern(resources.get('img/hud/thermometer.png'), 'no-repeat');
	
	lastPacketReceived = Date.now();
	
	lastTime = Date.now(); // dt is unused on the client side... for now.
	beginUserGame();	//main();
}
var newGameIsLoaded = false;
function loadNewGameSessionData() {
	if (!newGameIsLoaded) {
		newGameIsLoaded = true;
		window.scrollTo(0, 0);
		
		setGlobalOrientation(globalOrientWorldAroundPlayer); // default
		
		// Show startup message
		renderStartupMessage();
		
		// load list of images.
		resources.load(serverSideSpriteArray.concat(clientSideResources)); // This has to wait until the javascript is loaded (and the "Begin Game" button is clicked), otherwise it has no idea what "resources.load(...)" refers to
		resources.onReady(init); // To get an image once the game starts, we just do resources.get('img/sprites.png'). Easy!

		$("#game-outer-menu-wrapper").show();
		//$("#begin-game-button").parent().parent().hide();
		$("#instructions-wrapper-01").hide();
	}
}
//$("#game-outer-menu-wrapper").hide();


