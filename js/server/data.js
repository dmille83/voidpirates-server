
// Global Const Vars
var globalPlayerWeaponHighestIndex = 12;
var globalDroneWeaponLowestIndex = 5;

var globalMaxSpeedCap = 900;
var globalMaxAngleSpeedCap = 400;


var game_math = require('../shared/lib/math_functions.js');
var game_sprite = require('../shared/lib/sprite.js');


var world_object = require('../shared/world/actors/WorldObject.js');
var actor_spaceship = require('../shared/world/actors/Spaceship.js');
var actor_autopilotspaceship = require('../shared/world/actors/AutopilotSpaceship.js');
//var actor_equipmentslot = require('../shared/world/actors/EquipmentSlot.js');
var actor_weapon = require('../shared/world/actors/Weapon.js');
var actor_continuousweapon = require('../shared/world/actors/ContinuousWeapon.js');
var actor_shotgunweapon = require('../shared/world/actors/ShotgunWeapon.js');
var actor_selftargetingweapon = require('../shared/world/actors/SelfTargetingWeapon.js'); // ??? redundant to DisplacementDriveWeapon?
var actor_displacementdriveweapon = require('../shared/world/actors/DisplacementDriveWeapon.js'); // ??? redundant to SelfTargetingWeapon?
var actor_projectile = require('../shared/world/actors/Projectile.js');
var actor_slowingprojectile = require('../shared/world/actors/SlowingProjectile.js');
var actor_drone = require('../shared/world/actors/Drone.js');
var actor_mine = require('../shared/world/actors/Mine.js');
var actor_wormholemine = require('../shared/world/actors/WormholeMine.js');
var actor_continuousmine = require('../shared/world/actors/ContinuousMine.js');
var actor_wormholeprojectile = require('../shared/world/actors/WormholeProjectile.js');
var actor_explosion = require('../shared/world/actors/Explosion.js');
var actor_wormhole = require('../shared/world/actors/Wormhole.js');
var actor_engine = require('../shared/world/actors/Engine.js');
var actor_armor = require('../shared/world/actors/Armor.js');
var actor_solarsystem = require('../shared/world/actors/SolarSystem.js');


// Game state (actors)
var avatars = [];
var avatars_out = []; // logged out
var projectiles = [];
var explosions = [];
var solarsystems = [];

var thesun = {}; // referencing this does not work?
var census_ships = 0;

// Timers and Intervals
var actorRespawnTimer = 0; // seconds since last respawn check
var actorRespawnInterval = 10; //15 //20 // seconds between respawn checks


var highscore = 0; //920;


var spriteUrlIndex = [
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

	'sun_sprite_index_placeholder',

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


// ====== FINISH REGISTRATION OF PROTOTYPE ACTORS ======
// Set up "output to Game State" functions for Prototypes
// Register the *base* prototypes that will have to push new actors into the game world
// Objects that will *inherit* from the *base* classes listed below will not need to be registered
var registryOfBasePrototypes = [
	world_object.WorldObject.prototype,
	actor_weapon.Weapon.prototype,
	actor_mine.Mine.prototype,
	actor_wormhole.Wormhole.prototype,
	actor_explosion.Explosion.prototype
];
for (var i in registryOfBasePrototypes)
{
	registryOfBasePrototypes[i].getSpriteUrlIndex = function(url) {
		return spriteUrlIndex.indexOf(url);
	};
	registryOfBasePrototypes[i].pushObjToGameStateRef = function(obj) {
		switch(obj.actortype) {
			case 'projectile':
				projectiles.push(obj);
				break;
			case 'explosion':
				explosions.push(obj);
				break;
			case 'player':
				avatars.push(obj);
				break;
			case 'solarsystem':
				solarsystems.push(obj);
				break;
			default:
				console.log("Unrecognized actortype: " + obj.actortype);
		}
	};
	registryOfBasePrototypes[i].getNewExplosion = function(sprite, pos, speed) {
		return new actor_explosion.Explosion(sprite, pos, speed);
	};
	registryOfBasePrototypes[i].pushNewExplosion = function(sprite, pos, speed) {
		this.fireexplosion = 1.0; // ???
		this.pushObjToGameStateRef(new actor_explosion.Explosion(sprite, pos, speed));
	};
	registryOfBasePrototypes[i].getNewWormhole = function(pos, distance, lifespan, direction) {
		return new actor_wormhole.Wormhole(pos, distance, lifespan, direction);
	}
	registryOfBasePrototypes[i].pushNewWormholePair = function(pos, distance, lifespan, direction, target) {
		var tempExplosion = new actor_wormhole.Wormhole(pos, distance, lifespan, direction);

		var pos2x = Math.sin(tempExplosion.direction*game_math.TO_RADIANS) * (tempExplosion.distance) + tempExplosion.pos[0];
		var pos2y = Math.cos(tempExplosion.direction*game_math.TO_RADIANS) * (tempExplosion.distance) + tempExplosion.pos[1];
		var pos2 = [pos2x, pos2y];
		//var pos2 = [tempExplosion.exitX, tempExplosion.exitY];
		var tempExplosion2 = new actor_wormhole.Wormhole(pos2, distance, lifespan, direction+180);

		tempExplosion.setPartner(tempExplosion2);
		tempExplosion2.setPartner(tempExplosion);

		// Move target of WormHole immediately
		if (target) tempExplosion.strikeTarget(target);

		this.pushObjToGameStateRef(tempExplosion);
		this.pushObjToGameStateRef(tempExplosion2);
	};
	registryOfBasePrototypes[i].spawnNewDrone = function(weaponIndex, armorIndex) {

		/*
		var explosionSpriteOrange = new game_sprite.Sprite('img/sprite/explosion.png', [0, 0], [128, 128], 50, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 0, true);
		// Drone
		var owner = this;
		var sprite = new game_sprite.Sprite('img/sprite/player_ship.png', [0, 0], [35, 35], 0, [0], 0);
		var explosionsprite = explosionSpriteOrange.getCopy();
		var damage = 20;
		var startspeed = 10;
		var lifespan = game_math.getRandomInt(25, 60);
		var knockback = 3.0;
		var smart = game_math.getRandomInt(300, 1000);
		var maneuverability = game_math.getRandomInt(30, 100);
		var accelleration = 50;
		var dumbfireaccelleration = 0;
		var inaccuracy = 0;
		var droneweapon = spawnNewPlayerWeapon(game_math.getRandomInt(4, 11));

		var newDrone = new actor_drone.Drone(owner, sprite, explosionsprite, damage, startspeed, lifespan, knockback, smart, maneuverability, accelleration, dumbfireaccelleration, inaccuracy, droneweapon);
		this.pushObjToGameStateRef(newDrone);
		*/

		var smart = 500;
		spawnNewAIPlayer(this, this.id, this.pos, game_math.getRandomInt(0, 360), smart, weaponIndex, armorIndex);
	};
	registryOfBasePrototypes[i].respawnPlanets = function(dt) { 	//(minPlanetsPerSun, maxPlanetsPerSun, minMoonsPerPlanet, maxMoonsPerPlanet) {
		
		if (solarsystems.length <= 10)
		{
			if (!this.respawnsolarsystemcooldown || this.respawnsolarsystemcooldown <= 0)
			{
				this.respawnsolarsystemcooldown = 20;
				respawnPlanets(this, 5, 12, 1, 6);
				
				// Spawn some AI Players if outer space is looking a bit empty
				//if (getDataMemberCount(avatars) < 4) {
				//	console.log("there are " + getDataMemberCount(avatars) + " players");
				//	spawnNewAIPlayerFleet(game_math.getRandomInt(4, 11));
				//}
				
			}
			else this.respawnsolarsystemcooldown -= dt;
		}
		
	};
	registryOfBasePrototypes[i].updateHighScore = function() {
		//console.log("running new updateHighScore function");
		if (this.score > highscore) {
			//console.log("highscore is " + highscore + ", changing to " + this.score);			
			highscore = this.score;
			//console.log("highscore is now " + highscore);
		}
		return highscore;
	};

}
// ======================= END =========================


// Player registration
var users = [];
var userIPs = []; // TODO: not used yet, but an index of these may be handy if I can handle duplicate IPs well?
var respawn_count = [];

// World data
var gameTime = 0; // TODO: is this even used?
var terrainPattern;
var terrainOffset = 0.8;
var worldSize = 6000;




// Create starting world actors
function initializeWorld()
{
	console.log('');
	console.log('let there be light...');


	// Call spawning functions here:
	spawnNewSolarsystem([0, 0], 5, 12, 1, 6);

	
	//getCensusOfSolarSystem(solarsystems);


	console.log('...and there was light');
	console.log('');
}

function getCensusOfSolarSystem(actorList)
{
	var typesofpeepsfound = {};
	for (var peepname in actorList)
	{
		if (!typesofpeepsfound.hasOwnProperty(actorList[peepname].actortype)) typesofpeepsfound[actorList[peepname].actortype] = 0;
		typesofpeepsfound[actorList[peepname].actortype] += 1;
	}

	console.log("........................");
	for (var actortype in typesofpeepsfound)
		console.log("There are " + typesofpeepsfound[actortype] + " " + actortype + "(s)");
	console.log("........................");
}




// ================ PLAYER SPACESHIP ================//
function spawnNewPlayer(id)
{
	//var basicWeapon = spawnNewPlayerWeapon(-1); // for testing only!
	//var bigWeapon 	= spawnNewPlayerWeapon(12); // for testing only!
	//var bigWeapon 	= spawnNewPlayerWeapon(3); // for testing only!
	//var bigWeapon 	= spawnNewPlayerWeapon(2); // 2 or 3 or 6 (Wormhole Weapons) // for testing only!
	//var bigWeapon 	= spawnNewPlayerWeapon(11);

	var bigWeapon 	= spawnNewPlayerWeapon(game_math.getRandomInt(0, globalPlayerWeaponHighestIndex)); // Random
	var basicWeapon = spawnNewPlayerWeapon(99); // Bullets
	var basicArmor 	= spawnNewPlayerArmor(game_math.getRandomInt(0, 6));
	var basicEngine = spawnNewPlayerEngine(basicArmor.maxhealth*2, basicArmor.maxhealth*4); //spawnNewPlayerEngine(basicArmor.maxhealth, globalMaxSpeedCap);

	var spawnOffsetAngle = game_math.getRandomInt(0, 360);
	var pos = [(Math.sin(spawnOffsetAngle * game_math.TO_RADIANS) * 2000), (Math.cos(spawnOffsetAngle * game_math.TO_RADIANS) * 2000)];

	//if (game_math.getRandomInt(0, 10) > 5)
	for (var s in solarsystems)
		if (solarsystems[s].actortype != "sun" && game_math.getRandomInt(0, 10) >= 9)
			pos = [solarsystems[s].pos[0], solarsystems[s].pos[1]];

	avatars[id] = new actor_spaceship.Spaceship(id, bigWeapon, basicWeapon, basicEngine, basicArmor, pos, spawnOffsetAngle);
}


function spawnNewAIPlayer(ownerActor, id, pos, angle, smart, weaponIndex, armorIndex)
{
	//var bigWeapon 	= spawnNewPlayerWeapon(3); // for testing only !!!
	//var bigWeapon 	= spawnNewPlayerWeapon(0);

	var bigWeapon 	= spawnNewPlayerWeapon(weaponIndex); //game_math.getRandomInt(0, 10)// Random
	var basicWeapon = spawnNewPlayerWeapon(99); // Second weapon is always Bullets
	var basicArmor 	= spawnNewPlayerArmor(armorIndex); //game_math.getRandomInt(0, 8)
	var basicEngine = spawnNewPlayerEngine(basicArmor.maxhealth*2, basicArmor.maxhealth*4); //spawnNewPlayerEngine(basicArmor.maxhealth, globalMaxSpeedCap); //Math.round(basicArmor.maxhealth*(2/3))


	var newPos = [pos[0], pos[1]];


	// Weaken AI actors a bit
	// if (bigWeapon.projectile.hasOwnProperty('inaccuracy')) bigWeapon.projectile.inaccuracy += 15;
	// if (basicWeapon.projectile.hasOwnProperty('inaccuracy')) basicWeapon.projectile.inaccuracy += 15;


	// var suntoavoid = false;
	// if (ownerActor.owner.actortype == "sun") suntoavoid = ownerActor.owner;
	// else if (ownerActor.owner.owner.actortype == "sun") suntoavoid = ownerActor.owner.owner;

	setTimeout(function(){
		var newAIplayer = new actor_autopilotspaceship.AutopilotSpaceship(ownerActor, id, bigWeapon, basicWeapon, basicEngine, basicArmor, newPos, angle, smart);
	// newAIplayer.suntoavoid = suntoavoid;


		if (ownerActor.actortype == "player") {
			newAIplayer.ownerActor = false;
			newAIplayer.id = game_math.getRandomArbitrary(0.0001, 99.9999);
		}

		//for (var i in solarsystems)
		//	if (solarsystems[i].actortype == "sun")
		//		newAIplayer.suntoavoid = solarsystems[i];
		
		newAIplayer.suntoavoid = findTheSun();
		
		newAIplayer.lifespan = 120; // give it a lifespan until it receives player input

		avatars.push(newAIplayer);
	}, 2000);
}


function spawnNewPlayerEngine(minaccelleration, maxaccelleration)
{
	var fumefxsprite = new game_sprite.Sprite('img/sprite/rocket_exhaust.png', [0, 0], [27, 59], 30, [0, 1], 0, false);
	var fumefxtrailsprite = new game_sprite.Sprite('img/sprite/explosion-blue.png', [0, 0], [27, 59], 30, [0, 1], 0, true);
	var accelleration = game_math.getRandomInt(minaccelleration, maxaccelleration); //200, 900
	var deccelleration = 5.5; // multiple of accelleration, used for brakes
	var maxspeed = globalMaxSpeedCap; //game_math.getRandomInt(900, 1500);
	var anglechangespeed = accelleration;
	if (anglechangespeed > globalMaxAngleSpeedCap) anglechangespeed = globalMaxAngleSpeedCap; //accelleration/3; //game_math.getRandomInt(100, 300);
	var maxfuel = game_math.getRandomInt(300, 900);
	var fueldrain = game_math.getRandomInt(15, 30);
	var fuelregen = game_math.getRandomInt(5, fueldrain - 5);
	var spinreduction = game_math.getRandomArbitrary(0.1, 1.0);
	return new actor_engine.Engine(fumefxsprite, fumefxtrailsprite, accelleration, deccelleration, maxspeed, anglechangespeed, maxfuel, fueldrain, fuelregen, spinreduction);
}

function spawnNewPlayerArmor(armorIndex)
{
	var armorSprite;
	var armorHealth;
	var armorHealthRegen;

	switch (armorIndex)
	{
		case 1:
			armorSprite = new game_sprite.Sprite('img/sprite/ship01.png', [0, 0], [54, 55], 0, [0], 0);
			armorHealth = game_math.getRandomInt(200, 300);
			armorHealthRegen = armorHealth/60;
			break;
		case 2:
			armorSprite = new game_sprite.Sprite('img/sprite/ship02.png', [0, 0], [49, 53], 0, [0], 0);
			armorHealth = game_math.getRandomInt(40, 100);
			armorHealthRegen = armorHealth/20;
			break;
		case 3:
			armorSprite = new game_sprite.Sprite('img/sprite/ship03.png', [0, 0], [57, 39], 0, [0], 0);
			armorHealth = game_math.getRandomInt(100, 200);
			armorHealthRegen = armorHealth/45;
			break;
		case 4:
			armorSprite = new game_sprite.Sprite('img/sprite/ship04.png', [0, 0], [79, 43], 0, [0], 0);
			armorHealth = game_math.getRandomInt(40, 100);
			armorHealthRegen = armorHealth/20;
			break;
		case 5:
			armorSprite = new game_sprite.Sprite('img/sprite/ship05.png', [0, 0], [80, 61], 0, [0], 0);
			armorHealth = game_math.getRandomInt(100, 200);
			armorHealthRegen = armorHealth/40;
			break;
		case 6:
			armorSprite = new game_sprite.Sprite('img/sprite/ship06.png', [0, 0], [72, 63], 0, [0], 0);
			armorHealth = game_math.getRandomInt(300, 400);
			armorHealthRegen = armorHealth/60;
			break;
		default:
			armorSprite = new game_sprite.Sprite('img/sprite/ship07.png', [0, 0], [71, 49], 0, [0], 0);
			armorHealth = game_math.getRandomInt(40, 80);
			armorHealthRegen = armorHealth/15;
		//	break;
		//default:
		//	armorSprite = new game_sprite.Sprite('img/sprite/player_ship.png', [0, 0], [35, 35], 0, [0], 0); // Only used for Drones
	}


	// var armorHealth = game_math.getRandomInt(40, 300);
	// var armorHealthRegen = armorHealth/60;
	return new actor_armor.Armor(armorSprite, armorHealth, armorHealthRegen);
}

function spawnNewPlayerWeapon(weaponChoice)
{
	// Some common items we may use below
	var explosionSpriteOrange = new game_sprite.Sprite('img/sprite/explosion.png', [0, 0], [128, 128], 50, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 0, true);
	var explosionSpriteBlue = new game_sprite.Sprite('img/sprite/explosion-blue.png', [0, 0], [128, 128], 50, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 0, true);
	var continuousWeaponRate = game_math.getRandomArbitrary(0.075, 0.075);
	var continuousWeaponDrain = game_math.getRandomArbitrary(3, 15);
	
	//weaponChoice = -1; // for testing only!
	
	var basicWeapon;
	switch(weaponChoice){
		case -1:
			// Planet-Breaker (for testing purposes only!)
			var owner = false;
			var sprite = new game_sprite.Sprite('img/sprite/bullet01.png', [0, 0], [2, 100], 0, [0], 0);
			var explosionsprite = false; //explosionSpriteOrange.getCopy();
			var damage = 9999;
			var startspeed = 2000;
			var lifespan =  0.3;
			var knockback = 0;
			var smart = 20;
			var maneuverability = 90;
			var accelleration = 0;
			var dumbfireaccelleration = 0;
			var inaccuracy = 0; //game_math.getRandomInt(0, 15);

			//var newBullet = new actor_projectile.Projectile(false, bulletSprite, explosionSpriteOrange.getCopy(), game_math.getRandomInt(5, 20), 400, 3, false, 100, 90, 2000, 0, 0);
			var newBullet = new actor_projectile.Projectile(owner, sprite, explosionsprite, damage, startspeed, lifespan, knockback, smart, maneuverability, accelleration, dumbfireaccelleration, inaccuracy);

			var rate = game_math.getRandomArbitrary(0.1, 0.8);
			var maxpower = game_math.getRandomInt(100, 500);
			var powerdrain = game_math.getRandomInt(10, 40);
			var powerregen = powerdrain * 0.5; // (2/3); //game_math.getRandomInt(10, 40);

			var basicBulletWeapon = new actor_weapon.Weapon(newBullet, rate, maxpower, powerdrain, powerregen);
			basicWeapon = basicBulletWeapon;
			break;


		case 0:
			var owner = false;
			var sprite = new game_sprite.Sprite('img/sprite/player_ship.png', [0, 0], [35, 35], 0, [0], 0);
			var explosionsprite = explosionSpriteOrange.getCopy();
			var damage = 1;
			var startspeed = 10;
			var lifespan = game_math.getRandomInt(15, 40);
			var knockback = 3.0;
			var smart = 600; //game_math.getRandomInt(500, 1000);
			var maneuverability = game_math.getRandomInt(30, 100);
			var accelleration = 150;
			var dumbfireaccelleration = 0;
			var inaccuracy = 0;
			var droneweapon = spawnNewPlayerWeapon(game_math.getRandomInt(globalDroneWeaponLowestIndex, globalPlayerWeaponHighestIndex+1));

			var newDrone = new actor_drone.Drone(owner, sprite, explosionsprite, damage, startspeed, lifespan, knockback, smart, maneuverability, accelleration, dumbfireaccelleration, inaccuracy, droneweapon);

			var rate = game_math.getRandomArbitrary(2.0, 8.0);
			var maxpower = game_math.getRandomInt(100, 200);
			var powerdrain = game_math.getRandomInt(10, 50);
			var powerregen = game_math.getRandomInt(2, 8);

			var basicPlayerDroneWeapon = new actor_weapon.Weapon(newDrone, rate, maxpower, powerdrain, powerregen);

			basicWeapon = basicPlayerDroneWeapon;
			break;


		case 1:
			// Mine
			var owner = false;
			var mineSprite = new game_sprite.Sprite('img/sprite/mine.png', [0, 0], [15, 15], 5, [0, 1], 0);
			var explosionsprite = explosionSpriteOrange.getCopy();
			var damage = game_math.getRandomInt(20, 90);
			var lifespan = game_math.getRandomArbitrary(25.0, 200.0);
			var knockback = 60;
			var smart = game_math.getRandomInt(90, 300);
			var idledelay = game_math.getRandomArbitrary(1.0, 3.0);
			var countdowntimer = smart/200; //game_math.getRandomArbitrary(0.01, 3.0);;
			var inheritSpeed = true;
			var friendlyfire = false;

			var newMine = new actor_mine.Mine(owner, mineSprite, explosionsprite, damage, lifespan, knockback, smart, idledelay, countdowntimer, inheritSpeed, friendlyfire);

			var rate = game_math.getRandomArbitrary(1.5, 8.0);
			var maxpower = game_math.getRandomInt(100, 200);
			var powerdrain = game_math.getRandomInt(10, 50);
			var powerregen = game_math.getRandomInt(2, 8);

			var basicMineWeapon = new actor_weapon.Weapon(newMine, rate, maxpower, powerdrain, powerregen);

			basicWeapon = basicMineWeapon;
			break;


		case 2:
			// WormholeMine
			var owner = false;
			var sprite = new game_sprite.Sprite('img/sprite/wormhole-mine.png', [0, 0], [15, 15], 5, [0, 1], 0);
			var explosionsprite = explosionSpriteBlue.getCopy();
			var distance = game_math.getRandomInt(1000, 2500);
			var lifespan = game_math.getRandomArbitrary(25.0, 40.0);
			var knockback = 0.0;
			var smart = game_math.getRandomInt(50, 90);
			var idledelay = game_math.getRandomArbitrary(0.01, 0.5); //game_math.getRandomArbitrary(1.0, 3.0);
			var countdowntimer = game_math.getRandomArbitrary(5.0, 40.0); //game_math.getRandomArbitrary(0.01, 1.0);
			var inheritSpeed = true;
			var friendlyfire = false;

			var newWormholeMine = new actor_wormholemine.WormholeMine(owner, sprite, explosionsprite, distance, lifespan, knockback, smart, idledelay, countdowntimer, inheritSpeed, friendlyfire);

			var rate = game_math.getRandomArbitrary(0.5, 4.0);
			var maxpower = game_math.getRandomInt(100, 200);
			var powerdrain = game_math.getRandomInt(10, 50);
			var powerregen = game_math.getRandomInt(2, 8);

			var basicMineWeapon = new actor_weapon.Weapon(newWormholeMine, rate, maxpower, powerdrain, powerregen);

			basicWeapon = basicMineWeapon;
			break;


		case 3:

			// Displacement Drive (SelfTargetingWeapon with a WormholeMine)
			var owner = false;
			//var sprite = new game_sprite.Sprite('img/sprite/wormhole-mine.png', [0, 0], [15, 15], 5, [0, 1], 0);
			var sprite = new game_sprite.Sprite('img/sprite/wormhole.png', [0, 0], [75, 75], 20, [0, 1, 2, 3, 4, 5, 6 ,7 ,8 ,9 ,10, 11, 12, 13, 14], 0, true);
			//var explosionsprite = explosionSpriteBlue.getCopy();
			var explosionsprite = new game_sprite.Sprite('img/sprite/wormhole.png', [0, 0], [75, 75], 20, [0, 1, 2, 3, 4, 5, 6 ,7 ,8 ,9 ,10, 11, 12, 13, 14], 0, true);
			var distance = game_math.getRandomInt(500, 1000);
			var lifespan = game_math.getRandomArbitrary(25.0, 40.0);
			var knockback = 0.0;
			var smart = game_math.getRandomInt(50, 90);
			var idledelay = 0;
			var countdowntimer = 1;
			var inheritSpeed = true;
			var friendlyfire = true;

			var newWormholeMine = new actor_wormholemine.WormholeMine(owner, sprite, explosionsprite, distance, lifespan, knockback, smart, idledelay, countdowntimer, inheritSpeed, friendlyfire);

			/*
			// WormholeProjectile
			var owner = false;
			var sprite = new game_sprite.Sprite('img/sprite/rocket-mine.png', [0, 0], [15, 35], 5, [0, 1], 0);
			var explosionsprite = explosionSpriteOrange.getCopy();
			var distance = game_math.getRandomInt(600, 1500);
			var startspeed = 300;
			var lifespan = 6;
			var knockback = 0.3;
			var smart = 500;
			var maneuverability = 1;
			var accelleration = 200;
			var dumbfireaccelleration = 200;
			var inaccuracy = 0;

			var newMissile = new actor_wormholeprojectile.WormholeProjectile(owner, sprite, explosionsprite, distance, startspeed, lifespan, knockback, smart, maneuverability, accelleration, dumbfireaccelleration, inaccuracy);
			*/

			var rate = game_math.getRandomArbitrary(1.0, 4.0);
			var maxpower = game_math.getRandomInt(100, 200);
			var powerdrain = game_math.getRandomInt(10, 50);
			var powerregen = game_math.getRandomInt(2, 8);

			var basicMineWeapon = new actor_selftargetingweapon.SelfTargetingWeapon(newWormholeMine, rate, maxpower, powerdrain, powerregen);
			//var basicMineWeapon = new actor_displacementdriveweapon.DisplacementDriveWeapon(newWormholeMine, rate, maxpower, powerdrain, powerregen, distance);

			basicWeapon = basicMineWeapon;
			break;


		case 4:
			// Mine (Inverse Gravity Nova)
			var sprite = new game_sprite.Sprite('img/sprite/grav-mine.png', [0, 0], [15, 15], 5, [0, 1], 0);
			var explosionsprite = new game_sprite.Sprite('img/sprite/gravwave_radial01.png', [0, 0], [128, 128], 10, [0, 1, 2, 3, 4], 0, true);
			var damage = game_math.getRandomInt(1, 4);
			var lifespan = game_math.getRandomArbitrary(15.0, 40.0);
			var knockback = game_math.getRandomInt(-20, -60);
			var smart = game_math.getRandomInt(300, 600);
			var idledelay = game_math.getRandomArbitrary(0.1, 2.0);
			var countdowntimer = smart/game_math.getRandomInt(250, 500); //game_math.getRandomArbitrary(0.01, 3.0);;
			var inheritSpeed = true;
			var friendlyfire = false;

			var newMine = new actor_continuousmine.ContinuousMine(false, sprite, explosionsprite, damage, lifespan, knockback, smart, idledelay, countdowntimer, inheritSpeed, friendlyfire);

			var rate = game_math.getRandomArbitrary(1.5, 8.0);
			var maxpower = game_math.getRandomInt(100, 200);
			var powerdrain = game_math.getRandomInt(10, 50);
			var powerregen = game_math.getRandomInt(2, 8);

			var basicMineWeapon = new actor_weapon.Weapon(newMine, rate, maxpower, powerdrain, powerregen);

			basicWeapon = basicMineWeapon;
			break;


		// Everything below this index can be used by Drones

		case 5:
			// Missile
			var owner = false
			var sprite = new game_sprite.Sprite('img/sprite/missile.png', [0, 0], [10, 33], 5, [0, 1], 0);
			var explosionsprite = explosionSpriteOrange.getCopy();
			var damage = game_math.getRandomInt(10, 40);
			var startspeed = 400;
			var lifespan = 4;
			var knockback = 0.3;
			var smart = 500;
			var maneuverability = 1;
			var accelleration = 200;
			var dumbfireaccelleration = 200;
			var inaccuracy = 0;

			var newMissile = new actor_projectile.Projectile(owner, sprite, explosionsprite, damage, startspeed, lifespan, knockback, smart, maneuverability, accelleration, dumbfireaccelleration, inaccuracy);

			var rate = game_math.getRandomArbitrary(1.0, 4.0);
			var maxpower = game_math.getRandomInt(100, 600);
			var powerdrain = game_math.getRandomInt(10, 80);
			var powerregen = game_math.getRandomInt(2, 20);

			var basicMissileWeapon = new actor_weapon.Weapon(newMissile, rate, maxpower, powerdrain, powerregen);

			basicWeapon = basicMissileWeapon;
			break;


		case 6:
			// WormholeProjectile
			var owner = false;
			var sprite = new game_sprite.Sprite('img/sprite/rocket-mine.png', [0, 0], [15, 35], 5, [0, 1], 0);
			var explosionsprite = explosionSpriteOrange.getCopy();
			var distance = game_math.getRandomInt(600, 1500);
			var startspeed = 300;
			var lifespan = 6;
			var knockback = 0.3;
			var smart = 500;
			var maneuverability = 0.5;
			var accelleration = 200;
			var dumbfireaccelleration = 200;
			var inaccuracy = 0;

			var newMissile = new actor_wormholeprojectile.WormholeProjectile(owner, sprite, explosionsprite, distance, startspeed, lifespan, knockback, smart, maneuverability, accelleration, dumbfireaccelleration, inaccuracy);

			var rate = game_math.getRandomArbitrary(0.3, 2.0);
			var maxpower = game_math.getRandomInt(100, 600);
			var powerdrain = game_math.getRandomInt(10, 80);
			var powerregen = game_math.getRandomInt(2, 20);

			var basicMissileWeapon = new actor_weapon.Weapon(newMissile, rate, maxpower, powerdrain, powerregen);

			basicWeapon = basicMissileWeapon;
			break;


		case 7:
			// ShotgunWeapon
			var owner = false;
			//var sprite = new game_sprite.Sprite('img/sprite/bullet01.png', [0, 0], [2, 100], 0, [0], 0);
			var sprite = new game_sprite.Sprite('img/sprite/bullet02.png', [0, 0], [2, 30], 0, [0], 0);
			//var sprite = new game_sprite.Sprite('img/sprite/bullet03.png', [0, 0], [11,30], 20, [0, 1, 2, 3], 0);
			var explosionsprite = explosionSpriteOrange.getCopy();
			var damage = game_math.getRandomInt(1, 5);
			var startspeed = 1100;
			var lifespan = game_math.getRandomArbitrary(0.2, 0.6);
			var knockback = 0;
			var smart = 90;
			var maneuverability = 2000;
			var accelleration = 0;
			var dumbfireaccelleration = 0;
			var inaccuracy = 15;

			var newBullet = new actor_projectile.Projectile(owner, sprite, explosionsprite, damage, startspeed, lifespan, knockback, smart, maneuverability, accelleration, dumbfireaccelleration, inaccuracy);

			var rate = game_math.getRandomArbitrary(0.5, 1.5); //game_math.getRandomArbitrary(0.5, 2.0);
			var maxpower = game_math.getRandomInt(100, 500);
			var powerdrain = game_math.getRandomInt(10, 50);
			var powerregen = game_math.getRandomInt(5, 20);

			var minpellets = 1;
			var maxpellets = 6;

			var basicBulletWeapon = new actor_shotgunweapon.ShotgunWeapon(newBullet, rate, maxpower, powerdrain, powerregen, minpellets, maxpellets);

			basicWeapon = basicBulletWeapon;
			break;


		case 8:
			// ContinuousWeapon (Flamethrower)
			var owner = false;
			var sprite = new game_sprite.Sprite('img/sprite/explosion-blue.png', [0, 0], [128, 128], 35, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 0, true);
			var explosionsprite = explosionSpriteOrange.getCopy();
			var damage = game_math.getRandomInt(2, 9);
			var startspeed = 300;
			var lifespan = 0.3;
			var knockback = 0;
			var smart = 0;
			var maneuverability = 0;
			var accelleration = 0;
			var dumbfireaccelleration = 0;
			var inaccuracy = 30;

			var newFlameBullet = new actor_projectile.Projectile(owner, sprite, explosionsprite, damage, startspeed, lifespan, knockback, smart, maneuverability, accelleration, dumbfireaccelleration, inaccuracy);

			var rate = game_math.getRandomArbitrary(0.5, 6.0);
			var maxpower = game_math.getRandomInt(100, 400);
			var powerdrain = game_math.getRandomInt(60, 100);
			var powerregen = game_math.getRandomInt(2, 10);

			var basicBulletWeapon = new actor_continuousweapon.ContinuousWeapon(newFlameBullet, rate, maxpower, powerdrain, powerregen);
			//var basicBulletWeapon = new actor_weapon.Weapon(newFlameBullet, continuousWeaponRate, game_math.getRandomInt(100, 400), continuousWeaponDrain, game_math.getRandomInt(2, 10));

			basicWeapon = basicBulletWeapon;
			break;


		case 9:
			// ContinuousWeapon (Repeller)
			var owner = false;
			var sprite = new game_sprite.Sprite('img/sprite/gravwave01.png', [0, 0], [35, 11], 0, [0], 0, true);
			var explosionsprite = false; //explosionSpriteOrange.getCopy();
			var damage = game_math.getRandomInt(1, 5);
			var startspeed = game_math.getRandomInt(400, 800);
			var lifespan = 0.7;
			var knockback = 0.2;
			var smart = 0;
			var maneuverability = 0;
			var accelleration = 0;
			var dumbfireaccelleration = 0;
			var inaccuracy = game_math.getRandomInt(0, 25);
			var slowdown = 0.7;

			var gravWave = new actor_slowingprojectile.SlowingProjectile(owner, sprite, explosionsprite, damage, startspeed, lifespan, knockback, smart, maneuverability, accelleration, dumbfireaccelleration, inaccuracy, slowdown);

			var rate = continuousWeaponRate;
			var maxpower = game_math.getRandomInt(1000, 4000);
			var powerdrain = continuousWeaponDrain;
			var powerregen = game_math.getRandomInt(2, 10);

			//var basicBulletWeapon = new actor_continuousweapon.ContinuousWeapon(gravWave, game_math.getRandomArbitrary(0.5, 6.0), game_math.getRandomInt(100, 400), game_math.getRandomInt(60, 100), game_math.getRandomInt(2, 10));
			var basicBulletWeapon = new actor_weapon.Weapon(gravWave, rate, maxpower, powerdrain, powerregen);

			basicWeapon = basicBulletWeapon;
			break;


		case 10:
			// ContinuousWeapon (Puller)
			var owner = false;
			var sprite = new game_sprite.Sprite('img/sprite/gravwave02.png', [0, 0], [35, 11], 30, [0, 1, 2], 0, false);
			var explosionsprite = false; //explosionSpriteOrange.getCopy();
			var damage = 0.1; // This is really low because it CRIPPLES anyone it catches from defending against enemy fire.
			var startspeed = game_math.getRandomInt(400, 800);
			var lifespan = 0.7;
			var knockback = -0.3;
			var smart = 300;
			var maneuverability = 4;
			var accelleration = 0;
			var dumbfireaccelleration = 0;
			var inaccuracy = 0 //game_math.getRandomInt(0, 30); //15
			var slowdown = 0.7;

			var gravWave = new actor_slowingprojectile.SlowingProjectile(owner, sprite, explosionsprite, damage, startspeed, lifespan, knockback, smart, maneuverability, accelleration, dumbfireaccelleration, inaccuracy, slowdown);
			//var basicBulletWeapon = new actor_continuousweapon.ContinuousWeapon(gravWave, game_math.getRandomArbitrary(0.5, 6.0), game_math.getRandomInt(100, 400), game_math.getRandomInt(60, 100), game_math.getRandomInt(2, 10));

			var rate = continuousWeaponRate;
			var maxpower = game_math.getRandomInt(1000, 4000);
			var powerdrain = continuousWeaponDrain;
			var powerregen = game_math.getRandomInt(10, 20);

			var basicBulletWeapon = new actor_weapon.Weapon(gravWave, rate, maxpower, powerdrain, powerregen);
			basicWeapon = basicBulletWeapon;
			break;


		case 11:
			// ShotgunWeapon (force wave)
			var owner = false;
			//var sprite = new game_sprite.Sprite('img/sprite/explosion-blue.png', [0, 0], [128, 128], 50, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 0, true);
			//var sprite = new game_sprite.Sprite('img/sprite/gravwave01.png', [0, 0], [35, 11], 0, [0], 0, true);
			var sprite = new game_sprite.Sprite('img/sprite/gravwave04.png', [0, 0], [33, 5], 0, [0], 0, true);
			var explosionsprite = explosionSpriteOrange.getCopy();
			var damage = game_math.getRandomInt(1, 5);
			var startspeed = 1100;
			var lifespan = game_math.getRandomArbitrary(0.2, 0.6);
			var knockback = 0.22;
			var smart = 0;
			var maneuverability = 0;
			var accelleration = 0;
			var dumbfireaccelleration = 0;
			var inaccuracy = 55;

			var newBullet = new actor_projectile.Projectile(owner, sprite, explosionsprite, damage, startspeed, lifespan, knockback, smart, maneuverability, accelleration, dumbfireaccelleration, inaccuracy);

			var rate = game_math.getRandomArbitrary(1, 4.0);
			var maxpower = game_math.getRandomInt(100, 500);
			var powerdrain = game_math.getRandomInt(30, 50);
			var powerregen = game_math.getRandomInt(2, 10);

			var minpellets = 7;
			var maxpellets = 11;

			var basicBulletWeapon = new actor_shotgunweapon.ShotgunWeapon(newBullet, rate, maxpower, powerdrain, powerregen, minpellets, maxpellets);

			basicWeapon = basicBulletWeapon;
			break;


		case 12:
			// Shield (force shield)
			var owner = false;
			//var sprite = new game_sprite.Sprite('img/sprite/explosion-blue.png', [0, 0], [128, 128], 50, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 0, true);
			//var sprite = new game_sprite.Sprite('img/sprite/gravwave01.png', [0, 0], [35, 11], 0, [0], 0, true);
			//var sprite = new game_sprite.Sprite('img/sprite/gravwave_radial01.png', [0, 0], [128, 128], 10, [0, 1, 2, 3, 4], 0, true);
			var sprite = new game_sprite.Sprite('img/sprite/shield01.png', [0, 0], [200, 200], 30, [0, 1, 2, 3], 0, false);
			var explosionsprite = false; //explosionSpriteOrange.getCopy();
			var damage = 0; //game_math.getRandomInt(0.1, 0.1);
			var startspeed = 63;
			var lifespan = 0.1; //game_math.getRandomArbitrary(0.15, 0.3);
			//var knockback = -0.01; // ShotgunWeapon
			var knockback = 0; // ContinuousWeapon
			var smart = 0;
			var maneuverability = 0;
			var accelleration = 0;
			var dumbfireaccelleration = 0;
			var inaccuracy = 180;

			var slowdown = 0.1;

			var newBullet = new actor_projectile.Projectile(owner, sprite, explosionsprite, damage, startspeed, lifespan, knockback, smart, maneuverability, accelleration, dumbfireaccelleration, inaccuracy);
			//var newBullet = new actor_slowingprojectile.SlowingProjectile(owner, sprite, explosionsprite, damage, startspeed, lifespan, knockback, smart, maneuverability, accelleration, dumbfireaccelleration, inaccuracy, slowdown);

			/*
			var rate = 0.1; // ShotgunWeapon
			var maxpower = game_math.getRandomInt(100, 500);
			var powerdrain = game_math.getRandomInt(2, 8);
			var powerregen = game_math.getRandomInt(5, 10);
			var minpellets = 1;
			var maxpellets = 6;
			var basicShieldWeapon = new actor_shotgunweapon.ShotgunWeapon(newBullet, rate, maxpower, powerdrain, powerregen, minpellets, maxpellets);
			*/

			var rate = game_math.getRandomArbitrary(6.0, 20.0); // ContinuousWeapon
			var maxpower = game_math.getRandomInt(100, 400);
			var powerdrain = game_math.getRandomInt(60, 100);
			var powerregen = game_math.getRandomInt(2, 10);
			var basicShieldWeapon = new actor_continuousweapon.ContinuousWeapon(newBullet, rate, maxpower, powerdrain, powerregen);

			basicWeapon = basicShieldWeapon;
			break;


		default:
			// Bullet
			var owner = false;
			//var sprite = new game_sprite.Sprite('img/sprite/bullet01.png', [0, 0], [2, 100], 0, [0], 0);
			//var sprite = new game_sprite.Sprite('img/sprite/bullet02.png', [0, 0], [2, 30], 0, [0], 0);
			var sprite = new game_sprite.Sprite('img/sprite/bullet03.png', [0, 0], [11,30], 20, [0, 1, 2, 3], 0);
			var explosionsprite = false; //explosionSpriteOrange.getCopy();
			var damage = game_math.getRandomInt(5, 20);
			var startspeed = 1100;
			var lifespan =  0.3;
			var knockback = 0;
			var smart = 50;
			var maneuverability = 90;
			var accelleration = 0;
			var dumbfireaccelleration = 0;
			var inaccuracy = 0; //game_math.getRandomInt(0, 15);

			var newBullet = new actor_projectile.Projectile(owner, sprite, explosionsprite, damage, startspeed, lifespan, knockback, smart, maneuverability, accelleration, dumbfireaccelleration, inaccuracy);

			var rate = game_math.getRandomArbitrary(0.2, 0.8);
			var maxpower = game_math.getRandomInt(100, 500);
			var powerdrain = game_math.getRandomInt(10, 40);
			var powerregen = powerdrain * 0.5; // (2/3); //game_math.getRandomInt(10, 40);

			var basicBulletWeapon = new actor_weapon.Weapon(newBullet, rate, maxpower, powerdrain, powerregen);

			basicWeapon = basicBulletWeapon;
	}
	return basicWeapon;
}





// ================ SOLAR SYSTEMS ================//

function spawnNewSolarsystem(pos, minPlanetsPerSun, maxPlanetsPerSun, minMoonsPerPlanet, maxMoonsPerPlanet)
{
	var newSun = new actor_solarsystem.Sun(pos);
	thesun = newSun; // global reference to the sun
	solarsystems.push(newSun);
//	respawnPlanets(newSun, minPlanetsPerSun, maxPlanetsPerSun, minMoonsPerPlanet, maxMoonsPerPlanet); // TODO: is this redundant due to periodic Sun.respawnPlanets() and game_state_update.updateRespawns()?
	
	// Spawn a few AI-driven players, just for fun
	spawnNewAIPlayerFleet(game_math.getRandomInt(4, 11));
}

function respawnPlanets(lonelySun, minPlanetsPerSun, maxPlanetsPerSun, minMoonsPerPlanet, maxMoonsPerPlanet)
{
	console.log("respawning solar system");
	//console.log(lonelySun);

	var planetCount = Math.random()*(maxPlanetsPerSun - minPlanetsPerSun) + minPlanetsPerSun;
	for (var i = 0; i < planetCount; i++)
	{
		//var orbitRadius = lonelySun.getDiameter()/2 + 800 + Math.random()*lonelySun.getDiameter()*3;
		var orbitRadius = game_math.getRandomInt(lonelySun.getDiameter()/2 + 1200, worldSize - 800);
		var orbitSpeed = game_math.getRandomArbitrary(4, 8) * ((worldSize - 800) - orbitRadius)/(worldSize - 800);
		if (game_math.getRandomInt(0, 10) <= 5) orbitSpeed *= -1
		var newPlanet = new actor_solarsystem.Planet(lonelySun, orbitRadius, orbitSpeed);

		//newPlanet.id = game_math.getRandomArbitrary(0.001, 99.999); // ???
		//newPlanet.weaponIndex = game_math.getRandomInt(0, 10);
		//newPlanet.armorIndex = game_math.getRandomInt(0, 7);

		var moonCount = Math.random()*(maxMoonsPerPlanet - minMoonsPerPlanet) + minMoonsPerPlanet;
		for (var j = 0; j < moonCount; j++)
		{
			var orbitRadius2 = newPlanet.getDiameter()/2 + Math.random()*newPlanet.getDiameter()*2;
			var orbitSpeed2 = game_math.getRandomInt(0, 16);
			if (game_math.getRandomInt(0, 10) <= 5) orbitSpeed2 *= -1
			var newMoon = new actor_solarsystem.Moon(newPlanet, orbitRadius2, orbitSpeed2);

			// newMoon.id = newPlanet.id; // ???
			// if (newPlanet.armorIndex == 4)
			// 	newMoon.weaponIndex = 0; // Carrier-looking sprites always get drones as their big weapon
			// else if (game_math.getRandomInt(0, 10) > 5)
			// 	newMoon.weaponIndex = game_math.getRandomInt(0, globalPlayerWeaponHighestIndex);
			// else
			// 	newMoon.weaponIndex = newPlanet.weaponIndex;
			// newMoon.armorIndex = newPlanet.armorIndex;

			solarsystems.push(newMoon);
		}

		solarsystems.push(newPlanet);
	}

	getCensusOfSolarSystem(solarsystems);
}



//spawnNewAIPlayerFleet(game_math.getRandomInt(4, 11));
function spawnNewAIPlayerFleet(aiPlayerCount)
{
	/*
	// Find the sun
	var theSun;
	for (var i in solarsystems)
		if (solarsystems[i].actortype == "sun")
			theSun = solarsystems[i];
	*/
	
	// Choose a planet to start from
	var pos = [game_math.getRandomInt(-worldSize, worldSize), game_math.getRandomInt(-worldSize, worldSize)];
	
	// Spawn a few AI-driven players, just for fun
	for (var i = 1; i <= aiPlayerCount; i++)
	{
		// Choose a planet to start from
		pos = [game_math.getRandomInt(-worldSize, worldSize), game_math.getRandomInt(-worldSize, worldSize)];
		
		/*
		for (var s in solarsystems)
			if (solarsystems[s].actortype != "sun" && game_math.getRandomInt(0, 10) >= 9)
				pos = [solarsystems[s].pos[0], solarsystems[s].pos[1]];
		*/
		
		//game_math.getRandomArbitrary(0.001, 999.999)
		spawnNewAIPlayer(false, i, pos, game_math.getRandomInt(0, 360), worldSize, game_math.getRandomInt(0, globalPlayerWeaponHighestIndex), game_math.getRandomInt(0, 7));
		
		//spawnNewAIPlayer(this, this.id, this.pos, game_math.getRandomInt(0, 360), smart, weaponIndex, armorIndex);
	}
	console.log("Spawned " + aiPlayerCount + " AI-driven players, just for fun")
	//console.log("there are " + getDataMemberCount(avatars) + " players"); // count accuracy is slightly delayed?
}



//===================== FIND/SEARCH FUNCTIONS ======================//
function getDataMemberCount(data)
{
	var dataCount = 0
	for(var i in data)
		dataCount += 1
	
	return dataCount;
}

function findActorWithID(myID, data)
{
	for(var propertyName in data)
		if (data[propertyName].id && data[propertyName].id == myID)
			return data[propertyName];

	return null;
}

function findUserWithIP(myIP)
{
	//for(var i in users)
	//	if (users[i].request.connection.remoteAddress == myIP)
	//		return users[i];
	
	for(var i in users)
		if (getUserIP(i) == myIP)
			return users[i];
		
	return null;
}

function getUserIP(socketID)
{
	//return socketID; // aka game_state.users[socketID].id - THIS ONE DOES NOT ALLOW SHIP RECOVERY AFTER A PAGE REFRESH...
	//return userIPs[socketID]; // Get IP Address - THIS TABLE SEEMS TO HAVE A DELAY...
	//return users[socketID].request.connection.remoteAddress; // Get IP Address - TODO: DOES THIS ONE FAIL OCCASSIONALLY?
	if (users[socketID]) return users[socketID].request.connection.remoteAddress; // Get IP Address
	return false;
}

function findTheSun()
{
	var lonelySun;
	for (var i in solarsystems)
		if (solarsystems[i].actortype == "sun")
			lonelySun = solarsystems[i];
	
	return lonelySun;
}

/*
function getUserCount()
{
	var userCount = 0;
	for(var playerID in game_state.avatars) {
		// Check if this ship is controlled by a human player
		//var isAUser = false
		//if (findUserWithIP(actorID)) { isAUser = true; }
		if (isNaN(playerID)) { userCount++; }
	}
	return userCount;
}
*/


//============================ REGISTER PUBLIC RESOURCES ============================//
// Register the list of functions and variables we want to make publicly available
//module.exports.make = make;
//module.exports.avatars = avatars;

// OR

module.exports = {
	users: users,
	userIPs: userIPs, 
	respawn_count: respawn_count, 
	
	avatars: avatars,
	avatars_out: avatars_out, 
	projectiles: projectiles,
	solarsystems: solarsystems,
	explosions: explosions,
	
	thesun: thesun, 
	census_ships: census_ships, 
	
	worldSize: worldSize,

	initializeWorld: initializeWorld,
	spawnNewPlayer: spawnNewPlayer,
	spawnNewAIPlayer: spawnNewAIPlayer,
	spawnNewAIPlayerFleet: spawnNewAIPlayerFleet, 
	//spawnNewSolarsystem: spawnNewSolarsystem,
	respawnPlanets: respawnPlanets, 
	
	actorRespawnTimer: actorRespawnTimer,
	actorRespawnInterval: actorRespawnInterval,

	getCensusOfSolarSystem: getCensusOfSolarSystem,
	
	getDataMemberCount: getDataMemberCount, 
	findActorWithID: findActorWithID, 
	findUserWithIP: findUserWithIP, 
	getUserIP: getUserIP, 
	findTheSun: findTheSun, 

	highscore: highscore
};
