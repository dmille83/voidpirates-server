
var game_sprite = require('../../lib/sprite.js');
var world_object = require('./WorldObject.js');
var game_math = require('../../lib/math_functions.js');



if (typeof thisIsTheClient === "undefined")
{
	module.exports = {
		Spaceship: Spaceship,
	};
}
else
{
	window.Spaceship = Spaceship;
}



//===================== SPACESHIP PROTOTYPE ======================
function Spaceship(ownerID, weapon, weapon2, engine, armor, pos, angle)
{
	world_object.WorldObject.call(this); // call super constructor.

	// ====== CONSTRUCTOR ======
	this.actortype = 'player';

	this.id = ownerID;

	this.weapon = weapon;
	this.weapon2 = weapon2;
	this.engine = engine;
	this.armor = armor;
	this.pos = pos;
	this.angle = angle;

	this.score = 0;
	this.highscore = 0;

	this.explosionondeath = true; // fuel-explosion

	//this.fireenginefumetrail = 0;


	// Determines who gets the point for killing you. The timer is so that they still get a point if they kill you by knocking you into the sun or something (kill-by-proxy).
	this.lastattackerid = false;
	this.lastattacktimeout = 0;

	// Special variable for players and other killable actors that should leave behind lootable wreckage instead of being deleted right away
	this.isdead = false;

	// Player is logged out but still alive
	this.isloggedin = true;

	// AI Vars
	this._currentenemytarget = false;
	this._currentloottarget = false;
	this._lootsteptimer = 0;
	//this._lastenemyslain = false;

	// Key controls currently pressed
	this._controldata = [];



	// Spawn an explosion (wormhole sprite) effect upon appearing in game world ("Let's make an entrance!")
	var wormholeExitSprite = new game_sprite.Sprite('img/sprite/wormhole.png', [0, 0], [75, 75], 20, [0, 1, 2, 3, 4, 5, 6 ,7 ,8 ,9 ,10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], 0, true);
	this.pushNewExplosion(wormholeExitSprite, this.pos, this.speed);
}
// ====== WORLD OBJECT ======
// SOURCE:  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
// subclass extends superclass
Spaceship.prototype = Object.create(world_object.WorldObject.prototype);
Spaceship.prototype.constructor = Spaceship;


// ====== GET AND SET ======
Spaceship.prototype.popControlData = function() {
	var controls = this._controldata;
	this._controldata = [];
	return controls;
};
Spaceship.prototype.setControlData = function(newControlData) {
	this._controldata = newControlData;
	return true;
};
Spaceship.prototype.getSprite = function(){
	return this.armor.getSprite();
};
Spaceship.prototype.getMass = function() {
	return this.armor.getMass();
};
/*
Spaceship.prototype.getHealth = function() {
	return this.armor.getHealth();// + this.getScore();
};
Spaceship.prototype.getMaxHealth = function() {
	return this.armor.getMaxHealth();// + this.getScore();
};
Spaceship.prototype.modHealth = function(hpDiff, damageSource) {
	if (this.isdead == false)
	{
		if (hpDiff < 0)
		{
			if (this.fireexplosion <= 0) {
				this.fireexplosion = 1;
				var	explosionSprite = new game_sprite.Sprite('img/sprite/explosion.png', [0, 0], [128, 128], 50, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 0, true);
				this.pushNewExplosion(explosionSprite, this.pos, this.speed);
			}
		}

		//if (this.getHealth() + hpDiff > this.getMaxHealth())
		if (this.armor.health + hpDiff > this.armor.maxhealth)
			this.armor.health = this.armor.maxhealth;
		else
			this.armor.health += hpDiff;

		if (damageSource && hpDiff < 0) {
			this.lastattacktimeout = 12.0;
			this.lastattackerid = damageSource;
		}


		if (this.armor.health <= 0 && !this.killme)
		{
			this.playDeathEvent();
		}
	}
};
*/
Spaceship.prototype.getDamage = function() {
	// if (this.weapon.projectile.weapon)
	// 	return this.weapon.projectile.weapon.projectile.damage;
	// else
	// 	return this.weapon.projectile.damage;

	return this.weapon.getDamage(this.getScore());
};
Spaceship.prototype.getDamage2 = function() {
	// if (this.weapon2.projectile.weapon)
	// 	return this.weapon2.projectile.weapon.projectile.damage;
	// else
	// 	return this.weapon2.projectile.damage;

	return this.weapon2.getDamage(this.getScore());
};

Spaceship.prototype.getWeaponSpriteUrl = function() {
	if (this.weapon.projectile.weapon)
		return this.weapon.projectile.weapon.projectile.getSprite().url;
	else
		return this.weapon.projectile.getSprite().url;
};
Spaceship.prototype.getWeapon2SpriteUrl = function() {
	if (this.weapon2.projectile.weapon)
		return this.weapon2.projectile.weapon.projectile.getSprite().url;
	else
		return this.weapon2.projectile.getSprite().url;
};


Spaceship.prototype.feedListOfTargets = function(listOfTargets, dt) {
	// Get the closest dead enemy that we may loot!

	/*
	if (this._lastenemyslain) // && this._lastenemyslain._lootsteptimer > 6)
	{
		// do not lose target yet ???
		this._currentenemytarget = this._lastenemyslain;
	}
	else
	{
		this._lastenemyslain = false;
		this._currentenemytarget = false;
	}
	*/


	/*
	this._currentenemytarget = false;

	for(var i in listOfTargets)
	{
		if (game_math.getActorDistance(this, listOfTargets[i]) <= 150)
		{
			if (!this._currentenemytarget || game_math.getActorDistance(this, listOfTargets[i]) < game_math.getActorDistance(this, this._currentenemytarget))
					if (listOfTargets[i].id != this.id && listOfTargets[i].isdead)
						this._currentenemytarget = listOfTargets[i];
		}
	}

	// Then use a keypress to loot a slot from their stuff!
	*/

	this._currentloottarget = false;

	for(var i in listOfTargets)
	{
		if (game_math.getActorDistance(this, listOfTargets[i]) <= 150) // 150 is the looting radius on both client and server sides
		{
			if (!this._currentloottarget || game_math.getActorDistance(this, listOfTargets[i]) < game_math.getActorDistance(this, this._currentloottarget))
					if (listOfTargets[i].id != this.id && listOfTargets[i].isdead)
						this._currentloottarget = listOfTargets[i];
		}
	}
	// Then use a keypress to loot a slot from their stuff!
};


Spaceship.prototype.update = function (dt, worldSize) {
	//this.getSprite().update(dt); // dealth with by armor update

	// Update equipment slots
	this.weapon.update(dt, this.getScore());
	this.weapon2.update(dt, this.getScore());
	this.engine.update(dt, this.getScore());
	this.armor.update(dt, this.getScore());

	if (this.isdead == false)
	{
		// Process controls
		this.processControls(dt);

		// Last attacker timeout (for determining who gets the point for killing you)
		if (this.lastattacktimeout > 0) this.lastattacktimeout -= dt;
		else this.lastattackerid = false;
	}
	else
	{
		this.speed[0] *= 0.8*dt;
		this.speed[1] *= 0.8*dt;


		if (this.fireexplosion <= 0) {
			this.fireexplosion = 4;
			var	explosionSprite = new game_sprite.Sprite('img/sprite/loot_exp.png', [0, 0], [85, 85], 35, [0, 1, 2, 3, 4, 5, 6, 7], 0, true);
			this.pushNewExplosion(explosionSprite, this.pos, this.speed);
		}


		this.lastattacktimeout -= dt; // set to 20 by this.playDeathEvent() to give other players time for looting
		if (this.lastattacktimeout <= 0 && !this.killme)
		{
			for (var i = 0; i < 9; i++)
			{
				// Orange detonation-glow
				var	explosionSprite = new game_sprite.Sprite('img/sprite/explosion.png', [0, 0], [128, 128], game_math.getRandomInt(20, 50), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 0, true);
				var newExplosion = this.getNewExplosion(explosionSprite, this.pos, this.speed);
				newExplosion.scale = this.scale * 1.5;
				this.pushObjToGameStateRef(newExplosion);

				// Blue fuel-glow
				var	explosionSprite = new game_sprite.Sprite('img/sprite/explosion-blue.png', [0, 0], [128, 128], game_math.getRandomInt(20, 50), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 0, true);
				var newExplosion = this.getNewExplosion(explosionSprite, this.pos, this.speed);
				newExplosion.scale = this.scale * 1.5;
				this.pushObjToGameStateRef(newExplosion);

				this.killme = true; // delete this wreckage
			}
		}
	}

	//if (this.fireexplosion > 0) this.fireexplosion -= dt;
	if (this._lootsteptimer > 0) this._lootsteptimer -= dt;
	//if (this.engine.fireexplosion > 0) this.engine.fireexplosion -= dt; // in engine.update()

	// Update position
	this.updatePosition(dt, worldSize);
};


Spaceship.prototype.modFuel = function(hpDiff, damageSource) {
	this.engine.modFuel(hpDiff, damageSource);
	//if (this.engine.fuel <= 10) this.modHealth(-50); // wont work here !!!
};

Spaceship.prototype.processControls = function (dt) {
	// Here goes whatever control schema or AI this WorldObject uses (if any)

	var data = this.popControlData();

	if (this.engine.fuel > 0)
	{
		// Update movement speed and direction
		if (game_math.isInArray('UP', data))
		{
			this.moveUp(dt);
			this.engine.fireEngine(0, this.getScore());
		}

		if (game_math.isInArray('DOWN', data))
		{
			this.moveDown(dt);
			this.engine.fireEngine(2, this.getScore());
		}

		if (game_math.isInArray('RRIGHT', data))
		{
			this.rotateRight(dt);
			this.engine.fireEngine(1, this.getScore());
		}

		if (game_math.isInArray('RLEFT', data))
		{
			this.rotateLeft(dt);
			this.engine.fireEngine(3, this.getScore());
		}

		if (game_math.isInArray('RIGHT', data))
		{
			this.moveRight(dt);
			this.engine.fireEngine(1, this.getScore());
		}

		if (game_math.isInArray('LEFT', data))
		{
			this.moveLeft(dt);
			this.engine.fireEngine(3, this.getScore());
		}

		if (game_math.isInArray('BRAKE', data))
		{
			this.useBrakes(dt);

			// Set all to low burn first
			//for (var j = 0; j < 3; j++) for (var i = 0; i < 4; i++) this.engine.fireEngine(i, false);

			this.engine.fireEngine(0, this.getScore());
			this.engine.fireEngine(1, this.getScore());
			this.engine.fireEngine(2, this.getScore());
			this.engine.fireEngine(3, this.getScore());
		}
		
		
		// Get Mouse Angle
		var myAngleCommand = 0;
		var arrayLength = data.length;
		for (var i = 0; i < arrayLength; i++) {
			if (data[i].substring(0,5) == "ANGLE") {
				this.angle = parseInt(data[i].substring(5));
				this.anglespeed = 0; // disable other movement input
			}
		}
		
	}
	//else if (data.length > 0) this.modHealth(-5 * dt); // ???

	// Damage player if they overheat their engine ???
	if (this.engine.fuel <= 0) this.modHealth(-5 * dt);

	if (game_math.isInArray('k', data))
	{
		//this.modHealth(-250 * dt); // Suicide button

		//this.spawnNewDrone(game_math.getRandomInt(0, 11), game_math.getRandomInt(0, 7));

		//this.addPoint(10);
	}

	if (game_math.isInArray('FIRE', data)) this.fireWeapon(dt);
	
	if (game_math.isInArray('FIRE2', data)) this.fireWeapon2(dt);


	if (game_math.isInArray('SWAP_WEAPONS', data) && this._lootsteptimer <= 0)
	{
		this._lootsteptimer = 0.5;
		var tempWeapon = this.weapon;
		this.weapon = this.weapon2;
		this.weapon2 = tempWeapon;
	}

	// LOOT CONTROLS
	if (this._currentloottarget && this._lootsteptimer <= 0)
	{
		if (game_math.isInArray('LOOT_WEAPON', data))
		{
			// // Loot weapon from this._currentloottarget
			// var myOldWeapon = this.weapon.getCopy(this);
			// this.weapon = this._currentloottarget.weapon.getCopy(this);
			// this._currentloottarget.weapon = myOldWeapon;
			// this._lootsteptimer = 0.5;

			// Loot weapon from this._currentloottarget
			var myOldWeapon = this.weapon;
			this.weapon = this._currentloottarget.weapon;
			this._currentloottarget.weapon = myOldWeapon;
			this._lootsteptimer = 0.5;
		}
		if (game_math.isInArray('LOOT_WEAPON2', data))
		{
			// // Loot weapon2 from this._currentloottarget
			// var myOldWeapon = this.weapon.getCopy(this);
			// this.weapon = this._currentloottarget.weapon2.getCopy(this);
			// this._currentloottarget.weapon2 = myOldWeapon;
			// this._lootsteptimer = 0.5;

			// Loot weapon2 from this._currentloottarget
			var myOldWeapon = this.weapon;
			this.weapon = this._currentloottarget.weapon2;
			this._currentloottarget.weapon2 = myOldWeapon;
			this._lootsteptimer = 0.5;
		}
		if (game_math.isInArray('LOOT_ARMOR', data))
		{
			// // Loot armor from this._currentloottarget
			// var myOldArmor = this.armor.getCopy();
			// this.armor = this._currentloottarget.armor.getCopy();
			// this._currentloottarget.armor = myOldArmor;
			// this._lootsteptimer = 0.5;
			//
			// // Loot engine from this._currentloottarget
			// var myOldEngine = this.engine.getCopy()
			// this.engine = this._currentloottarget.engine.getCopy();
			// this._currentloottarget.engine = myOldEngine;
			// this._lootsteptimer = 0.5;

			// Loot armor from this._currentloottarget
			var myCurrentHealth = this.getHealth();
			var myOldArmor = this.armor.getCopy();
			this.armor = this._currentloottarget.armor.getCopy();
			this._currentloottarget.armor = myOldArmor;
			this._lootsteptimer = 0.5;
			this.modHealth(-(this.getHealth() - myCurrentHealth), false);

			// Loot engine from this._currentloottarget
			var myOldEngine = this.engine;
			this.engine = this._currentloottarget.engine;
			this._currentloottarget.engine = myOldEngine;
			this._lootsteptimer = 0.5;
		}
		// if (game_math.isInArray('LOOT_ENGINE', data))
		// {
		// 	// Loot engine from this._currentloottarget
		// 	var myOldEngine = this.engine.getCopy()
		// 	this.engine = this._currentloottarget.engine.getCopy();
		// 	this._currentloottarget.engine = myOldEngine;
		// 	this._lootsteptimer = 0.5;
		// }
	}

};


Spaceship.prototype.rotateLeft = function(dt) {
	this.anglespeed -= this.engine.anglechangespeed/this.armor.mass * dt;
};
Spaceship.prototype.rotateRight = function(dt) {
	this.anglespeed += this.engine.anglechangespeed/this.armor.mass * dt;
};
Spaceship.prototype.moveDown = function(dt) {
	var xAccel = (Math.sin(this.angle * game_math.TO_RADIANS) * this.engine.accelleration/this.armor.mass * dt);
	var yAccel = (Math.cos(this.angle * game_math.TO_RADIANS) * this.engine.accelleration/this.armor.mass * dt);

	if (Math.abs(this.speed[0] - xAccel) < this.engine.maxspeed)
		this.speed[0] -= xAccel;
	if (Math.abs(this.speed[1] - yAccel) < this.engine.maxspeed)
		this.speed[1] -= yAccel;

	this.reduceDrift(dt);
};
Spaceship.prototype.moveUp = function(dt) {
	var xAccel = (Math.sin(this.angle * game_math.TO_RADIANS) * this.engine.accelleration/this.armor.mass * dt);
	var yAccel = (Math.cos(this.angle * game_math.TO_RADIANS) * this.engine.accelleration/this.armor.mass * dt);

	if (Math.abs(this.speed[0] + xAccel) < this.engine.maxspeed)
		this.speed[0] += xAccel;
	if (Math.abs(this.speed[1] + yAccel) < this.engine.maxspeed)
		this.speed[1] += yAccel;

	this.reduceDrift(dt);
};
Spaceship.prototype.moveLeft = function(dt) {
	var xAccel = (Math.sin((this.angle-90) * game_math.TO_RADIANS) * this.engine.accelleration/this.armor.mass * dt);
	var yAccel = (Math.cos((this.angle-90) * game_math.TO_RADIANS) * this.engine.accelleration/this.armor.mass * dt);

	if (Math.abs(this.speed[0] + xAccel) < this.engine.maxspeed)
		this.speed[0] += xAccel;
	if (Math.abs(this.speed[1] + yAccel) < this.engine.maxspeed)
		this.speed[1] += yAccel;

	this.reduceDrift(dt);
};
Spaceship.prototype.moveRight = function(dt) {
	var xAccel = (Math.sin((this.angle+90) * game_math.TO_RADIANS) * this.engine.accelleration/this.armor.mass * dt);
	var yAccel = (Math.cos((this.angle+90) * game_math.TO_RADIANS) * this.engine.accelleration/this.armor.mass * dt);

	if (Math.abs(this.speed[0] + xAccel) < this.engine.maxspeed)
		this.speed[0] += xAccel;
	if (Math.abs(this.speed[1] + yAccel) < this.engine.maxspeed)
		this.speed[1] += yAccel;

	this.reduceDrift(dt);
};
Spaceship.prototype.useBrakes = function(dt) {
		var decellerationRate = this.engine.accelleration/this.armor.mass * this.engine.deccelleration;

		var positiveX = 1;
		if (this.speed[0] < 0) positiveX = -1;
		var positiveY = 1;
		if (this.speed[1] < 0) positiveY = -1;
		var positiveAngle = 1;
		if (this.anglespeed < 0) positiveAngle = -1;

		var speedX = Math.abs(this.speed[0]);
		var speedY = Math.abs(this.speed[1]);
		var speedAngle = Math.abs(this.anglespeed);

		if (speedX == 0) { }
		else if (speedX > 0 && speedX < decellerationRate * dt) speedX = 0;
		else speedX -= decellerationRate * dt;
		if (speedY == 0) { }
		else if (speedY > 0 && speedY < decellerationRate * dt) speedY = 0;
		else speedY -= decellerationRate * dt;
		if (speedAngle == 0) { }
		else if (speedAngle > 0 && speedAngle < this.engine.deccelleration * this.engine.anglechangespeed * dt) speedAngle = 0;
		else speedAngle -= this.engine.deccelleration * this.engine.anglechangespeed * dt;

		this.speed[0] = speedX * positiveX;
		this.speed[1] = speedY * positiveY;
		this.anglespeed = speedAngle * positiveAngle;
};
Spaceship.prototype.reduceDrift = function(dt) {
	if (this.engine.fire[1] <= 0 && this.engine.fire[3] <= 0)
	{
		// Reduce free-spinning while being propelled forward or back
		if (this.anglespeed > 0) this.anglespeed -= this.engine.anglechangespeed * this.engine.spinreduction * dt;
		else if (this.anglespeed < 0) this.anglespeed += this.engine.anglechangespeed * this.engine.spinreduction * dt;

		// Reduce side-to-side drift while being propelled forward or back
		//if ((Math.cos((this.angle+90) * game_math.TO_RADIANS) * this.speed[0]) > 0) this.speed[0] = Math.sin(this.angle*90 * game_math.TO_RADIANS) * this.speed[0] * 0.1 * dt;
	}

	/*
	// Fire fume trail from engine, if any
	if (this.engine.fumefxtrailsprite)
	{
		if (this.engine.fireexplosion <= 0) {
	 		this.engine.fireexplosion = 0.3;
	 		this.pushNewExplosion(this.engine.fumefxtrailsprite.getCopy(), this.pos, [0,0]);
		}
	}
	*/
};
Spaceship.prototype.fireWeapon = function(dt) {
	this.weapon.fire(this, this.getScore());

	//this.pushObjToGameStateRef()
};
Spaceship.prototype.fireWeapon2 = function(dt) {
	this.weapon2.fire(this, this.getScore());
};



Spaceship.prototype.pullPlayerHudData = function () {

	/*
	x, y, angle,        (for the screen)
	healthPercent,
	energyPercent,
	fuelPercent,

	maxhealth,
	damage,
	mass,
	accelleration
	score,
	weaponSpriteURLindex,
	droneSpriteURLindex,    (when applicable)
	*/

	/*
		0
	3		1
		2
	*/
	/*
	var engine_fire = -1;
	if (this.engine.fire[0]) engine_fire = 0;
	else if (this.engine.fire[1]) engine_fire = 1;
	else if (this.engine.fire[2]) engine_fire = 2;
	else if (this.engine.fire[3]) engine_fire = 3;
	else if (this.engine.fire[0]) engine_fire = 0;
	*/
	// var engine_fire = [];
	// if (this.engine.fire[0] > 0) engine_fire[0] = 1;
	// else engine_fire[0] = 0;
	//
	// if (this.engine.fire[1] > 0) engine_fire[1] = 1;
	// else engine_fire[1] = 0;
	//
	// if (this.engine.fire[2] > 0) engine_fire[2] = 1;
	// else engine_fire[2] = 0;
	//
	// if (this.engine.fire[3] > 0) engine_fire[3] = 1;
	// else engine_fire[3] = 0;

	var respawntimer = 0;
	if (this.isdead && this.lastattacktimeout > 0) respawntimer = this.lastattacktimeout/20;

	var currentEnemyLoot = [false, false, false, false, false, false, false, false];
	if (this._currentloottarget)
	{
		// Position
		currentEnemyLoot[0] = this._currentloottarget.pos[0];
		currentEnemyLoot[1] = this._currentloottarget.pos[1];
		// Weapon 1
		currentEnemyLoot[2] = this.getSpriteUrlIndex(this._currentloottarget.weapon.projectile.getSprite().url);
		currentEnemyLoot[3] = this.getSpriteUrlIndex(this._currentloottarget.getWeaponSpriteUrl());
		currentEnemyLoot[4] = this._currentloottarget.getDamage(this.getScore());
		// Weapon 2
		currentEnemyLoot[5] = this.getSpriteUrlIndex(this._currentloottarget.weapon2.projectile.getSprite().url);
		currentEnemyLoot[6] = this.getSpriteUrlIndex(this._currentloottarget.getWeapon2SpriteUrl());
		currentEnemyLoot[7] = this._currentloottarget.getDamage2(this.getScore());
		// Armor
		currentEnemyLoot[8] = this.getSpriteUrlIndex(this._currentloottarget.getSprite().url);
		// Armor health (int value, not a sprite)
		currentEnemyLoot[9] = this._currentloottarget.getMaxHealth(this.getScore()); // Add player's score so they can preview the actual bonus THEY will get.

		// Engine (int value, not a sprite)
		//currentEnemyLoot[7] = this._currentloottarget.engine.accelleration;
	}

	return {
		//id:						this.id, 
		lifespan: 				this.lifespan, 
		
		x: 						this.pos[0],
		y: 						this.pos[1],
		angle: 					this.angle,
		scale: 					this.scale,
		
		health_percent: 		this.getHealth() / this.getMaxHealth(),
		isdead:					this.isdead, 
		weapon_percent: 		this.weapon.power / this.weapon.maxpower,
		weapon2_percent: 		this.weapon2.power / this.weapon2.maxpower,
		engine_percent: 		this.engine.fuel / this.engine.maxfuel,
		
		score: 					this.score,
		//health_current: 		this.getHealth(),
		health_max: 			this.getMaxHealth(),
		mass: 					this.getMass(),
		engine_accelleration: 	this.engine.accelleration,
		engine_speed_max: 		this.engine.maxspeed,
		engine_angle_accell: 	this.engine.anglechangespeed,
		
		damage: 				this.getDamage(),
		weapon_drain: 			this.weapon.powerdrain / this.weapon.maxpower,
		weapon_rate: 			this.weapon.rate,
		weapon_timeout: 		1.0 - this.weapon.timeout / this.weapon.rate,
		
		damage2: 				this.getDamage2(),
		weapon2_drain: 			this.weapon2.powerdrain / this.weapon2.maxpower,
		weapon2_rate: 			this.weapon2.rate,
		weapon2_timeout: 		1.0 - this.weapon2.timeout / this.weapon2.rate,
		
		//engine_fire: 			engine_fire,
		//speedx: 				this.speed[0],
		//speedy: 				this.speed[1],
		//engine_fire: 			engine_fire,
		//engine_speed: 		game_math.getDistance(0,0, this.speed[0], this.speed[1]),
		
		weapon_sprite:			this.getSpriteUrlIndex(this.weapon.projectile.getSprite().url),
		drone_sprite:			this.getSpriteUrlIndex(this.getWeaponSpriteUrl()),
		
		loot_target: 			currentEnemyLoot,
		respawn_timer: 			respawntimer,
		
		highscore: 				this.highscore
	};
};



// ====== DEATH EVENT ======
Spaceship.prototype.playDeathEvent = function (instantdeath) {
	// Call this function just before deleting the object from the game
	// e.g.: missiles explode before dying
	if (!this.isdead)
	{

		// if (this.explosionondeath)
		// {
				for (var i = 0; i < 9; i++)
				{
					// Orange detonation-glow
					var	explosionSprite = new game_sprite.Sprite('img/sprite/explosion.png', [0, 0], [128, 128], game_math.getRandomInt(20, 50), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 0, true);
					var newExplosion = this.getNewExplosion(explosionSprite, this.pos, this.speed);
					newExplosion.scale = this.scale * 1.5;
					this.pushObjToGameStateRef(newExplosion);

					// Blue fuel-glow
					var	explosionSprite = new game_sprite.Sprite('img/sprite/explosion-blue.png', [0, 0], [128, 128], game_math.getRandomInt(20, 50), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 0, true);
					var newExplosion = this.getNewExplosion(explosionSprite, this.pos, this.speed);
					newExplosion.scale = this.scale * 1.5;
					this.pushObjToGameStateRef(newExplosion);
				}
		// }
		// else
		// {
		// 	// spawn tiny explosion?
		// 	// ...or just fade out?
		// }

		//this.armor.health = 0;
		this.armor.health -= this.getHealth(); // make sure health is displayed as 0;

		//this.modHealth(-10000, false);

		// Award point to last attacker
		if (this.lastattackerid) this.lastattackerid.addPoint(20 + this.getScore());
		//if (this.lastattackerid) this.lastattackerid._lastenemyslain = this;
		//console.log(this.lastattackerid._lastenemyslain);

		if (instantdeath)
			this.lastattacktimeout = 0;
		else if (this.lastattacktimeout > 0)
			this.lastattacktimeout = 20; // 20 sec before the wreckage disappears.
		// ??? Give killer "dibs" on looting them for the first 10 sec, then make it free-for-all?


		this.isdead = true;
		//this.killme = true;
	}
};
