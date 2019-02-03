
var globalPlayerWeaponHighestIndex = 11;



var game_sprite = require('../../lib/sprite.js');
var world_object = require('./WorldObject.js');
var actor_mine = require('./Mine.js');
var actor_projectile = require('./Projectile.js');
var game_math = require('../../lib/math_functions.js');

// ??? temp!
var this_weapon = require('./Weapon.js');



if (typeof thisIsTheClient === "undefined")
{
	// INCLUDES ALL ???
	module.exports = {
		Sun: Sun,
		Planet: Planet,
		Moon: Moon
	};
}
else
{
	window.Sun = Sun;
	window.Planet = Planet;
	window.Moon = Moon;
}



//===================== SOLARSYSTEM PROTOTYPE ======================
function SolarSystem()
{
	world_object.WorldObject.call(this); // call super constructor.

	this.actortype = 'solarsystem';
}
// ====== WORLD OBJECT ======
// subclass extends superclass
SolarSystem.prototype = Object.create(world_object.WorldObject.prototype);
SolarSystem.prototype.constructor = SolarSystem;

// ====== GET/SET ======
SolarSystem.prototype.getGravityRadius = function () {
	return (this.getDiameter()*1.0);
};

// ====== FUNCTIONS ======
SolarSystem.prototype.update = function (dt, worldSize) {
	if (this.fireexplosion > 0) this.fireexplosion -= dt;

	this.getSprite().update(dt);

	//this.processControls(dt);

	this.updatePosition(dt, worldSize);
};


SolarSystem.prototype.feedListOfTargets = function(listOfTargets, dt) {
	// Victims of this body's gravity
	this._listoftargets = [];
	for(var i in listOfTargets)
	{
		//if (!listOfTargets[i].pos) console.log(listOfTargets[i].pos);

		if (game_math.getActorDistance(this, listOfTargets[i]) <= this.getGravityRadius())
			this._listoftargets.push(listOfTargets[i]);
	}

	// Process our reaction to this set of targets now
	this.processControls(dt);
};

SolarSystem.prototype.processControls = function(dt) {
	this.applyGravityList(dt);
};

SolarSystem.prototype.updatePosition = function (dt, worldSize) {
	// do NOT move
};

SolarSystem.prototype.applyGravityList = function(dt) {
	for(var i in this._listoftargets)
	{
		if (game_math.getActorDistance(this, this._listoftargets[i]) <= this.getGravityRadius())
		{
			var magnitude = this.getGravityMagnitude(this._listoftargets[i])
			//console.log(magnitude);
			this.applyGravity(this._listoftargets[i], magnitude, dt);
		}
	}
};

SolarSystem.prototype.getGravityMagnitude = function(victim) {
	var gravityMag = (this.getGravityRadius() - game_math.getActorDistance(this, victim)) / (this.getGravityRadius() - this.getDiameter()/2);
	if (gravityMag > 1.0) gravityMag = 1.0;
	return gravityMag;
};

SolarSystem.prototype.applyGravity = function(victim, magnitude, dt) {
	var approachAngle = game_math.getAngle(victim.pos[0], victim.pos[1], this.pos[0], this.pos[1]); // returns radians
	victim.speed[0] += Math.sin(approachAngle*game_math.TO_RADIANS) * magnitude * victim.getMass() * this.getMass() * dt;
	victim.speed[1] += Math.cos(approachAngle*game_math.TO_RADIANS) * magnitude * victim.getMass() * this.getMass() * dt;
	//console.log("force: " + (magnitude * victim.getMass() * this.getMass()));

	this.applyOrbitBonusEffects(victim, dt);
};
SolarSystem.prototype.applyOrbitBonusEffects = function(victim, dt) {
	// Nothing by default
};


//===================== SUN PROTOTYPE ======================
function Sun(pos)
{
	//world_object.WorldObject.call(this); // call super constructor.
	SolarSystem.call(this); // call super constructor.

	// ====== CONSTRUCTOR ======
	this.actortype = 'sun';
	this.sprite = new game_sprite.Sprite('img/stage/sun/sun.png', [0, 0], [2048, 2048], 3, [0], 0);
	this.pos = pos;

	// Default sun attributes?
	this.mass = 200; //400;
	this.diameter = 1548;

	// Every so often, a pair of Wormholes will randomly open up
	this.wormholecooldown = 5.0;


	this._listoftargets = [];
};
// ====== WORLD OBJECT ======
// subclass extends superclass
Sun.prototype = Object.create(SolarSystem.prototype);
Sun.prototype.constructor = Sun;


// ====== FUNCTIONS ======
Sun.prototype.processControls = function(dt) {

	// The sun will occassionally spawn random wormholes in its solar-system
	if (this.wormholecooldown <= 0)
	{
		this.wormholecooldown = game_math.getRandomArbitrary(30.0, 300.0);
		//this.firewormholerandom = true;

		var randRadius = game_math.getRandomInt(this.getDiameter()/2 + 800, this.getDiameter()*3);
		var randAngle = game_math.getRandomArbitrary(0, 360);
		var randPosX = Math.sin(randAngle*game_math.TO_RADIANS) * randRadius;
		var randPosY = Math.cos(randAngle*game_math.TO_RADIANS) * randRadius;
		//this.pushNewWormholePair([randPosX, randPosY], game_math.getRandomInt(500, this.getDiameter()*3), game_math.getRandomArbitrary(20.0, 200.0), game_math.getRandomArbitrary(0, 360));
		this.pushNewWormholePair([randPosX, randPosY], game_math.getRandomInt(500, this.getDiameter()*3), 6, game_math.getRandomArbitrary(0, 360));
	}
	else this.wormholecooldown -= dt;

	this.applyGravityList(dt);

	// TODO: is this redundant?
	//this.respawnPlanets(dt); // This will check whether we need a new galaxy or not
};

Sun.prototype.applyOrbitBonusEffects = function(victim, dt) {
	if (victim.hasOwnProperty('armor'))
	{
		if (this.getGravityMagnitude(victim) >= 0.8) {
			var healthDamaged = -5 * dt;
			victim.modHealth(healthDamaged, false);

			if (this.fireexplosion <= 0)
			{
				this.fireexplosion = 0.1;
				var	explosionSprite = new game_sprite.Sprite('img/sprite/explosion-blue.png', [0, 0], [128, 128], 50, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 0, true);
				this.pushNewExplosion(explosionSprite, victim.pos, victim.speed);
			}
		}
	}
	if (victim.hasOwnProperty('weapon'))
	{
		victim.weapon.modWeaponEnergy(this.getGravityMagnitude(victim) * 400 * dt);
		victim.weapon.timeout -= this.getGravityMagnitude(victim) * 3 * dt;
	}
	if (victim.hasOwnProperty('weapon2'))
	{
		victim.weapon2.modWeaponEnergy(this.getGravityMagnitude(victim) * 400 * dt);
		victim.weapon2.timeout -= this.getGravityMagnitude(victim) * 3 * dt;
	}
	if (victim.hasOwnProperty('engine'))
	{
		var fuelDamaged = victim.engine.fueldrain * 10 * this.getGravityMagnitude(victim) * dt;
		victim.modFuel(-fuelDamaged, false);
		//console.log(fuelDamaged + "/" + victim.engine.fuel);
	}
};


// ====== SERVER BINARY RETRIEVAL ======
Sun.prototype.pullHudData = function () {
/*
x, y, angle, scale, urlIndex, spriteFrameIndex, healthPercent
*/

	return {
		x: 		this.pos[0],
		y: 		this.pos[1],
		angle: 	this.angle,
		scale: 	this.scale,

		sprite: 		this.getSpriteUrlIndex('sun_sprite_index_placeholder'),
		sprite_index: 	0, // -2 is for 'sun'

		health_percent: this.getHealth() / this.getMaxHealth(),

		engine_fire: 	[0, 0, 0, 0, 0]
	};
};



//===================== PLANET PROTOTYPE ======================
function Planet(owner, orbitradius, orbitspeed)
{
	//world_object.WorldObject.call(this); // call super constructor.
	SolarSystem.call(this); // call super constructor.

	// ====== CONSTRUCTOR ======
	this.actortype = 'planet';
	this.owner = owner;
	this.orbitradius = orbitradius;
	this.orbitspeed = orbitspeed;
	this.orbitangle = game_math.getRandomInt(0, 360);


	var randomSprite = Math.random()*20;
	if (randomSprite <= 1) var tempSprite = new game_sprite.Sprite('img/stage/planet/planet1.png', [0, 0], [300, 300], 3, [0], 0);
	else if (randomSprite <= 2) var tempSprite = new game_sprite.Sprite('img/stage/planet/planet2.png', [0, 0], [300, 300], 3, [0], 0);
	else if (randomSprite <= 3) var tempSprite = new game_sprite.Sprite('img/stage/planet/planet3.png', [0, 0], [300, 300], 3, [0], 0);
	else if (randomSprite <= 4) var tempSprite = new game_sprite.Sprite('img/stage/planet/planet4.png', [0, 0], [300, 300], 3, [0], 0);
	else if (randomSprite <= 5) var tempSprite = new game_sprite.Sprite('img/stage/planet/planet5.png', [0, 0], [300, 300], 3, [0], 0);
	//else if (randomSprite <= 6) var tempSprite = new game_sprite.Sprite('img/stage/planet/planet6.png', [0, 0], [300, 300], 3, [0], 0); // moon texture
	else if (randomSprite <= 7) var tempSprite = new game_sprite.Sprite('img/stage/planet/planet7.png', [0, 0], [300, 300], 3, [0], 0);
	else if (randomSprite <= 8) var tempSprite = new game_sprite.Sprite('img/stage/planet/planet10.png', [0, 0], [300, 300], 3, [0], 0);
	else if (randomSprite <= 9) var tempSprite = new game_sprite.Sprite('img/stage/planet/planet11.png', [0, 0], [300, 300], 3, [0], 0);
	else if (randomSprite <= 10) var tempSprite = new game_sprite.Sprite('img/stage/planet/planet12.png', [0, 0], [300, 300], 3, [0], 0);
	else if (randomSprite <= 11) var tempSprite = new game_sprite.Sprite('img/stage/planet/planet13.png', [0, 0], [300, 300], 3, [0], 0);
	else if (randomSprite <= 12) var tempSprite = new game_sprite.Sprite('img/stage/planet/planet14.png', [0, 0], [300, 300], 3, [0], 0);
	else if (randomSprite <= 13) var tempSprite = new game_sprite.Sprite('img/stage/planet/planet15.png', [0, 0], [300, 300], 3, [0], 0);
	else if (randomSprite <= 14) var tempSprite = new game_sprite.Sprite('img/stage/planet/planet16.png', [0, 0], [300, 300], 3, [0], 0);
	else if (randomSprite <= 15) var tempSprite = new game_sprite.Sprite('img/stage/planet/planet17.png', [0, 0], [300, 300], 3, [0], 0);
	else if (randomSprite <= 16) var tempSprite = new game_sprite.Sprite('img/stage/planet/planet19.png', [0, 0], [300, 300], 3, [0], 0);
	else var tempSprite = new game_sprite.Sprite('img/stage/planet/planet20.png', [0, 0], [300, 300], 3, [0], 0) ;
	this.sprite = tempSprite;


	this.scale = Math.random()/2 + 0.5;
	this.mass = 50 * this.scale; //100 * this.scale;
	this.maxhealth = 900 * this.scale;
	this.health = this.maxhealth;


	// Set ID and armor/weapons to be spawned by this planet
	this.id = game_math.getRandomArbitrary(0.001, 99.999);
	this.weaponIndex = game_math.getRandomInt(0, globalPlayerWeaponHighestIndex);
	this.armorIndex = game_math.getRandomInt(0, 7);
	if (this.armorIndex == 4) this.weaponIndex = 0; // Carrier-looking sprites always get drones as their big weapon


	this.explosionondeath = true;



	this._listoftargets = [];
};
// ====== WORLD OBJECT ======
// subclass extends superclass
Planet.prototype = Object.create(SolarSystem.prototype);
Planet.prototype.constructor = Planet;

// ====== FUNCTIONS ======
Planet.prototype.modHealth = function(hpDiff, damageSource)
{
	if (hpDiff < 0) // !!! temp, until PROTOTYPE conversion "spawn explosion" is fixed
	{
		if (!this.hasOwnProperty("fireexplosion")) this.fireexplosion = 1; //game_state.spawnNewExplosion(this, true);
		else
		{
			if (this.fireexplosion <= 0) this.fireexplosion = 1;
		}

		// Spawn AI-driven defending ships
		if ((!this.hasOwnProperty("dronespawntimer") || this.dronespawntimer <= 0) && this.getHealth()-hpDiff > 0)
		{
			if (damageSource) {
				//console.log(this.actortype + " was damaged by a " + damageSource.actortype);
				this.dronespawntimer = game_math.getRandomInt(15, 90);
				this.spawnNewDrone(this.weaponIndex, this.armorIndex);
			}
			//else console.log(this.actortype + " damaged itself");
		}
	}

	if (this.health + hpDiff > this.maxhealth)
		this.health = this.maxhealth;
	else
		this.health += hpDiff;

	if (this.health <= 0 && !this.killme)
	{
		if (damageSource && this.actortype == "planet") {
			damageSource.modHealth(1000, false); // Total heal for planet-killing
			damageSource.addPoint(this.maxhealth/9);
		}
		this.playDeathEvent();
	}
};

Planet.prototype.getGravityRadius = function () {
	var gravRad = this.getDiameter()*4.5;
	if (gravRad < 200) gravRad = 200;
	return (gravRad);
};

Planet.prototype.applyOrbitBonusEffects = function(victim, dt) {
	if (victim.hasOwnProperty('armor'))
	{
		if (this.getGravityMagnitude(victim) > 0.8) {

			if (victim.getHealth() < victim.getMaxHealth() && victim.getHealth() > 0)
			{
				var healthRestored = victim.armor.healthregen * dt;
				if (!victim.lastattacktimeout || victim.lastattacktimeout <= 0) healthRestored *= 10;
				victim.modHealth(healthRestored, false);

				// Damage planet by amount the victim was healed
				if (victim.id != this.id) {				
					this.modHealth(-healthRestored, victim);
				}


				if (!this.firehealingexplosion || this.firehealingexplosion <= 0)
				{
					this.firehealingexplosion = 0.2;

					// Healing graphic on target
					var	explosionSprite = new game_sprite.Sprite('img/sprite/healing_exp.png', [0, 0], [20, 20], 10, [0, 1, 2], 0, true);
					var posXoffset = victim.pos[0] + game_math.getRandomInt(-victim.getDiameter()/2, victim.getDiameter()/2);
					var posYoffset = victim.pos[1] + game_math.getRandomInt(-victim.getDiameter()/2, victim.getDiameter()/2);
					var newExplosion = this.getNewExplosion(explosionSprite, [posXoffset, posYoffset], victim.speed);
					newExplosion.angle = victim.angle;
					this.pushObjToGameStateRef(newExplosion); //this.pushNewExplosion(explosionSprite, victim.pos, victim.speed);

					// Healing graphic on planet
					var	explosionSprite2 = new game_sprite.Sprite('img/sprite/healing_exp.png', [0, 0], [20, 20], 10, [0, 1, 2], 0, true);
					var posXoffset2 = this.pos[0] + game_math.getRandomInt(-this.getDiameter()/2, this.getDiameter()/2);
					var posYoffset2 = this.pos[1] + game_math.getRandomInt(-this.getDiameter()/2, this.getDiameter()/2);
					var newExplosion2 = this.getNewExplosion(explosionSprite2,  [posXoffset2, posYoffset2], [0,0]);
					newExplosion2.angle = victim.angle;
					this.pushObjToGameStateRef(newExplosion2);
				}
			}
			if (this.firehealingexplosion > 0) this.firehealingexplosion -= dt;

		}

		/*
		if (!this.hasOwnProperty("id")) this.id = game_math.getRandomArbitrary(0.001, 99.999);
		if (!this.hasOwnProperty("dronespawntimer") || this.dronespawntimer <= 0)
		{
			this.spawnNewDrone();
			this.dronespawntimer = 10; //game_math.getRandom(10, 30);
		}
		*/
	}
};

Planet.prototype.updatePosition = function (dt, worldSize) {
	if (!dt) // ??? WHY?! WHY IS THIS SOMETIMES UNDEFINED!?
	{
		console.log("dt was found 'undefined' in solarsystem again...");
		return;
	}

	//this.modHealth(-30 * dt, 0); // !!! ??? Temp!

	if (this.hasOwnProperty("dronespawntimer") && this.dronespawntimer > 0) this.dronespawntimer -= dt;

	if (this.owner && this.owner.health > 0 && !this.owner.killme)
	{
		var tempPos = [this.pos[0], this.pos[1]];

		this.orbitangle += this.orbitspeed * dt;
		this.orbitangle = this.orbitangle % 360;
		this.pos = [(this.owner.pos[0] + Math.sin(this.orbitangle * game_math.TO_RADIANS) * this.orbitradius), (this.owner.pos[1] + Math.cos(-this.orbitangle * game_math.TO_RADIANS) * this.orbitradius)];
	}
	else if (!this.killme)
	{
		//this.playDeathEvent();
		this.modHealth(-10*dt, false);
	}
};


// ====== DEATH EVENT ======
Planet.prototype.playDeathEvent = function (instantdeath) {

	//console.log("I heard a sound, as if a thousand voices were screaming in terror, and were suddenly silenced...");

	// Call this function just before deleting the object from the game
	// e.g.: missiles explode before dying

	if (this.explosionondeath) {
		/*
		//if (this.fireexplosion <= 0) {
		//	this.fireexplosion = 1;
			var	explosionSprite = new game_sprite.Sprite('img/sprite/explosion.png', [0, 0], [128, 128], 50, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 0, true);
			this.pushNewExplosion(explosionSprite, this.pos, this.speed);
		//}
		*/

		for (var i = 0; i < 9; i++)
		{
			var newExpPos = [this.pos[0]+game_math.getRandomInt(-this.getDiameter(), this.getDiameter()), this.pos[1]+game_math.getRandomInt(-this.getDiameter(), this.getDiameter())];

			// Orange detonation-glow
			var	explosionSprite = new game_sprite.Sprite('img/sprite/explosion.png', [0, 0], [128, 128], game_math.getRandomInt(20, 50), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 0, true);
			var newExplosion = this.getNewExplosion(explosionSprite, newExpPos, this.speed);
			newExplosion.scale = this.scale * 1.5;
			this.pushObjToGameStateRef(newExplosion);

			// Blue fuel-glow
			var	explosionSprite = new game_sprite.Sprite('img/sprite/explosion-blue.png', [0, 0], [128, 128], game_math.getRandomInt(20, 50), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 0, true);
			var newExplosion = this.getNewExplosion(explosionSprite, newExpPos, this.speed);
			newExplosion.scale = this.scale * 1.5;
			this.pushObjToGameStateRef(newExplosion);
		}


		// Spawn Shrapnel
		for (var i = 0; i < this.maxhealth/20; i++)
		{

			var owner = false;
			var mineSprite = new game_sprite.Sprite('img/sprite/meteor001.png', [0, 0], [128, 128], 50, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 0, false);
			var explosionsprite = new game_sprite.Sprite('img/sprite/explosion.png', [0, 0], [128, 128], 50, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 0, true);
			var damage = game_math.getRandomInt(10, 30);
			var lifespan = game_math.getRandomArbitrary(25.0, 200.0);
			var knockback = 60;
			var smart = 0; //game_math.getRandomInt(90, 300);
			var idledelay = 0;
			var countdowntimer = 0; //game_math.getRandomArbitrary(0.01, 3.0);;
			var inheritSpeed = true;
			var friendlyfire = false;
			var newMine = new actor_mine.Mine(owner, mineSprite, explosionsprite, damage, lifespan, knockback, smart, idledelay, countdowntimer, inheritSpeed, friendlyfire);
			newMine.pos = [this.pos[0]+game_math.getRandomInt(-this.getDiameter(), this.getDiameter()), this.pos[1]+game_math.getRandomInt(-this.getDiameter(), this.getDiameter())];
			newMine.speed = [game_math.getRandomInt(-300, 300), game_math.getRandomInt(-300, 300)];
			newMine.anglespeed = game_math.getRandomInt(-60, 60);
			newMine.scale = game_math.getRandomInt(0.7, 1.3);
			newMine.damage = newMine.damage * newMine.scale;
			//newMine.triggerparticles = true; // for client-side particle effects
			this.pushObjToGameStateRef(newMine);


			/*
			if (!this.hasOwnProperty("id")) this.id = game_math.getRandomArbitrary(0.001, 99.999);
			var owner = this;
			var sprite = new game_sprite.Sprite('img/sprite/meteor001.png', [0, 0], [128, 128], 50, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 0, false);
			var explosionsprite = new game_sprite.Sprite('img/sprite/explosion.png', [0, 0], [128, 128], 50, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 0, true);
			var damage = game_math.getRandomInt(10, 50);
			var startspeed = 400;
			var lifespan =  200;
			var knockback = 0.5;
			var smart = 0;
			var maneuverability = 90;
			var accelleration = 0;
			var dumbfireaccelleration = 0;
			var inaccuracy = game_math.getRandomInt(0, 360);
			var newBullet = new actor_projectile.Projectile(owner, sprite, explosionsprite, damage, startspeed, lifespan, knockback, smart, maneuverability, accelleration, dumbfireaccelleration, inaccuracy);


			newBullet.pos = [this.pos[0]+game_math.getRandomInt(-this.getDiameter(), this.getDiameter()), this.pos[1]+game_math.getRandomInt(-this.getDiameter(), this.getDiameter())];
			newBullet.speed = [game_math.getRandomInt(-300, 300), game_math.getRandomInt(-300, 300)];
			newBullet.anglespeed = game_math.getRandomInt(-60, 60);
			newBullet.scale = game_math.getRandomInt(0.7, 1.3);
			newBullet.damage = newBullet.damage * newBullet.scale;
			newBullet.triggerparticles = false;

			this.pushObjToGameStateRef(newBullet);
			*/

		}

	}
	else
	{
		// spawn tiny explosion?
		// ...or just fade out?
	}

	this.killme = true;
};



//===================== MOON PROTOTYPE ======================
function Moon(owner, orbitradius, orbitspeed)
{
	Planet.call(this, owner, orbitradius, orbitspeed); // call super constructor.

	// ====== CONSTRUCTOR ======
	this.actortype = 'moon';
	//this.owner = owner;
	this.sprite = new game_sprite.Sprite('img/stage/planet/planet6.png', [0, 0], [300, 300], 3, [0], 0); // moon texture

	this.scale = Math.random()*owner.scale/4 + 0.02;
	this.mass = 100 * this.scale;
	this.maxhealth = 300 * this.scale;
	this.health = this.maxhealth;


	this.id = owner.id;
	this.weaponIndex = this.owner.weaponIndex;
	this.armorIndex = this.owner.armorIndex;
	// chance to get a different weapon than the normal one used by this planet
	if (game_math.getRandomInt(0, 10) > 5) this.weaponIndex = game_math.getRandomInt(0, globalPlayerWeaponHighestIndex);
	if (this.armorIndex == 4) this.weaponIndex = 0; // Carrier-looking sprites always get drones as their big weapon


	//this._listoftargets = [];
}
// ====== WORLD OBJECT ======
// subclass extends superclass
Moon.prototype = Object.create(Planet.prototype);
Moon.prototype.constructor = Moon;

// ====== FUNCTIONS ======
Moon.prototype.applyOrbitBonusEffects = function(victim, dt) {
	/*
	if (victim.actortype == "player")
	{
		//if (this.owner && this.owner.hasOwnProperty("id")) this.id = this.owner.id;
		//else if (!this.hasOwnProperty("id")) this.id = game_math.getRandomArbitrary(0.001, 99.999);
		//if (this.owner && !this.owner.hasOwnProperty("id")) this.owner.id = this.id;
		if (!this.hasOwnProperty("dronespawntimer") || this.dronespawntimer <= 0)
		{
			this.spawnNewDrone();
			this.dronespawntimer = game_math.getRandomInt(15, 90);
		}
	}
	*/
};
