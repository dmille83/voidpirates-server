
var game_sprite = require('../../lib/sprite.js');
var game_math = require('../../lib/math_functions.js');


if (typeof thisIsTheClient === "undefined")
{
	module.exports = {
		WorldObject: WorldObject,
	};
}
else
{
	window.WorldObject = WorldObject;
}


function WorldObject()
{
	this.actortype = 'worldobject';

	// Position and Movement
	this.pos = [0, 0];
	this.speed = [0, 0];
	this.angle = 0;
	this.anglespeed = 0;

	// Gravity data
	this.mass = 1.0; // The effects of gravity will be multiplied times this value

	// Sprite and Collision data
	this.scale = 1.0; // For variable-size sprites

	this.maxhealth = 1; // Returns 0 for 'null'
	this.health = this.maxhealth; // Returns 0 for 'null'

	// Score (kills)
	this.score = 0;

	// Explosion requests
	this.fireexplosion = 0; // 'img/sprite/explosion.png';
	this.explosionondeath = false; // 'img/sprite/explosion.png';

	this.killme = false;

	// AI Vars
	this._currentenemytarget = false;
	//this._currentenemytargets = [];
	//this._lastenemyslain = false; // ???

	// Game State GET/SET
	//this._game_state_outputarray_ref = false;
}
// ====== GET AND SET ======
WorldObject.prototype.getDiameter = function(){
	if (this.hasOwnProperty('diameter'))
		return this.diameter;
	else if (this.getSprite() && this.getSprite().hasOwnProperty('size'))
		return this.getSprite().size[0] * this.scale; // For spherical collision-checks
	return 20; // default
};
WorldObject.prototype.getSprite = function(){ // "getSprite" ??? !!!
	if (this.hasOwnProperty('sprite')) return this.sprite;

	return false; // ??? // Add a "model missing" sprite?
};
WorldObject.prototype.getMass = function() {
	return this.mass;
};
WorldObject.prototype.getHealth = function(otherScore) {
	if (otherScore) {
		if (this.hasOwnProperty('armor'))
		{
			return this.armor.health + otherScore/10;
		}
		//else
		return this.health + otherScore/10;
	}

	if (this.hasOwnProperty('armor'))
	{
		return this.armor.health + this.getScore()/10;
	}
	//else
	return this.health + this.getScore()/10;
};
WorldObject.prototype.getMaxHealth = function(otherScore) {
	if (otherScore) {
		if (this.hasOwnProperty('armor'))
		{
			return this.armor.maxhealth + otherScore/10;
		}
		//else
		return this.maxhealth + otherScore/10;
	}

	if (this.hasOwnProperty('armor'))
	{
		return this.armor.maxhealth + this.getScore()/10;
	}
	//else
	return this.maxhealth + this.getScore()/10;
};
WorldObject.prototype.modHealth = function(hpDiff, damageSource) {
	if (this.isdead == false && this.killme == false)
	{
		if (hpDiff < 0)
		{
			if (this.fireexplosion <= 0) {
				this.fireexplosion = 1;

				var	explosionSprite;
				if (this.hasOwnProperty('explosionsprite'))
					explosionSprite = this.explosionsprite.getCopy();
				else
					explosionSprite = new game_sprite.Sprite('img/sprite/explosion.png', [0, 0], [128, 128], 50, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 0, true);
				this.pushNewExplosion(explosionSprite, this.pos, this.speed);
			}
		}


		if (this.getHealth() + hpDiff > this.getMaxHealth())
		{
			if (this.hasOwnProperty('armor'))
				this.armor.health = this.getMaxHealth() - this.getScore()/10 //this.armor.maxhealth;
			else
				this.health = this.getMaxHealth() - this.getScore()/10;
		}
		else
		{
			if (this.hasOwnProperty('armor'))
				this.armor.health += hpDiff;
			else
				this.health += hpDiff;

			//console.log("hp2: " + this.armor.health);
		}


		if (damageSource && hpDiff < 0) {
			this.lastattacktimeout = 12.0;
			this.lastattackerid = damageSource;

			//if (damageSource.actortype == "player")
			//	this._currentenemytarget = damageSource; // Attack last attacker
		}


		if (this.getHealth() <= 0)
		{
			this.playDeathEvent();
		}
	}
};
WorldObject.prototype.getProjectile = function(shooter) {
	if (this.projectile)
		return this.projectile.getCopy(shooter);
	else if (this.weapon && this.weapon.projectile)
		return this.weapon.projectile.getCopy(shooter);
	else
		return false;
};
WorldObject.prototype.getScore = function() {
	return this.score;
};

// ====== FUNCTIONS ======
// The update() function will (usually?) stay constant, but some actors will overwrite the updatePosition() prototype with their own
WorldObject.prototype.update = function (dt, worldSize)
{
	// Functions
	this.getSprite().update(dt);

	this.processControls(dt);

	this.updatePosition(dt, worldSize);
};

WorldObject.prototype.updateLifespan = function (dt) {

	// Timers
	if (!isNaN(dt))
	{
		// Explosion Spacer
		if (this.fireexplosion > 0) this.fireexplosion -= dt;

		if (this.hasOwnProperty('_lootsteptimer')) if (this._lootsteptimer > 0) this._lootsteptimer -= dt;

		//if (this.hasOwnProperty('lastattacktimeout')) if (this.lastattacktimeout > 0) this.lastattacktimeout -= dt;

		// Lifespan
		if (this.hasOwnProperty('lifespan'))
		{
			//console.log(this.actortype + ' lifespan: ' + this.lifespan + ' - ' + dt);

			this.lifespan -= dt;
			if (this.lifespan <= 0 && !this.killme && !this.isdead) this.playDeathEvent();
		}
	}
}
WorldObject.prototype.processControls = function (dt)
{
	// Here goes whatever control schema or AI this WorldObject uses (if any)
	//console.log("default updateControls() was called...");
};
WorldObject.prototype.updatePosition = function (dt, worldSize)
{
	// Loop around closed universe
	if (worldSize && game_math.getDistance(0, 0, this.pos[0], this.pos[1]) > worldSize)
	{
		var wormholeSprite = new game_sprite.Sprite('img/sprite/wormhole.png', [0, 0], [75, 75], 20, [0, 1, 2, 3, 4, 5, 6 ,7 ,8 ,9 ,10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], 0, true);
		//this.pushNewExplosion(wormholeSprite, [this.pos[0]*0.99, this.pos[1]*0.99], [0, 0]);
		this.pushNewExplosion(wormholeSprite, [this.pos[0], this.pos[1]], [0, 0]);

		while (game_math.getDistance(0, 0, this.pos[0], this.pos[1]) > worldSize)
		{
			//this.pos[0] *= -0.99; // opposite side, and slightly inward
			//this.pos[1] *= -0.99;

			var myAngle = game_math.getAngle(0, 0, this.pos[0], this.pos[1]);
			var myDist = game_math.getDistance(0, 0, this.pos[0], this.pos[1]);
			this.pos[0] = Math.sin(myAngle*game_math.TO_RADIANS) * (worldSize - (myDist - worldSize)) * -0.99;
			this.pos[1] = Math.cos(myAngle*game_math.TO_RADIANS) * (worldSize - (myDist - worldSize)) * -0.99;
		}

		this.speed[0] *= 0.7; // decrease speed a bit
		this.speed[1] *= 0.7;

		//this.fireexplosion = 'img/sprite/wormhole.png'; // Special-effects
		//this.firewormhole = true;

		var wormholeSprite2 = new game_sprite.Sprite('img/sprite/wormhole.png', [0, 0], [75, 75], 20, [0, 1, 2, 3, 4, 5, 6 ,7 ,8 ,9 ,10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], 0, true);
		this.pushNewExplosion(wormholeSprite2, [this.pos[0], this.pos[1]], [0, 0]);


		//if (this.hasOwnProperty('id') && isNaN(this.id))  console.log(this.id + ' looped around the world');
	}

	this.pos[0] += this.speed[0] * dt;
	this.pos[1] += this.speed[1] * dt;

	this.angle += this.anglespeed * dt;
	if (this.angle <= -360) this.angle += 360;
	else if (this.angle >= 360) this.angle -= 360;


	//if (isNaN(this.pos[0])) console.log("actor broke");
	//if (isNaN(this.pos[1])) console.log("actor broke");
};


// ====== AI FUNCTIONS ======
WorldObject.prototype.feedListOfTargets = function(listOfTargets) {
	// For actors that need to act upon other actors
	//this._listoftarget = [];
	//for(var i in listOfTargets)
	//	this._listoftargets.push(listOfTargets[i]);
};

WorldObject.prototype.addPoint = function(pointsEarned)
{
	if (!isNaN(pointsEarned))
	{
		this.score += pointsEarned;
		this.score = Math.round(this.score);
		this.highscore = this.updateHighScore(); // updates game_state.highscore

		//if (enemy && enemy.score) this.score += enemy.score;

		// Then update hats...

		//if (enemySlain) this._lastenemyslain = enemySlain; // ???
		//console.log(enemySlain);
	}
}


// ====== DEATH EVENT ======
WorldObject.prototype.playDeathEvent = function (instantdeath) {
	// Call this function just before deleting the object from the game
	// e.g.: missiles explode before dying

	if (this.explosionondeath)
	{
		/*
		//if (this.fireexplosion <= 0) {
		//	this.fireexplosion = 1;
			var	explosionSprite = new game_sprite.Sprite('img/sprite/explosion.png', [0, 0], [128, 128], 50, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 0, true);
			this.pushNewExplosion(explosionSprite, this.pos, this.speed);
		//}
		*/

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

	}
	else
	{
		// spawn tiny explosion?
		// ...or just fade out?
	}

	this.killme = true;
};


// ====== SERVER BINARY RETRIEVAL ======
WorldObject.prototype.pullHudData = function () {
/*
x, y, angle, scale, urlIndex, spriteFrameIndex, healthPercent
*/

/*
var engine_fire = -1;
if (this.engine.fire[0] > 0 && this.engine.fire[1] > 0 && this.engine.fire[2] > 0 && this.engine.fire[3] > 0) engine_fire = 4;
else if (this.engine.fire[0] > 0 && this.engine.fire[1] > 0) engine_fire = 5;
else if (this.engine.fire[0] > 0 && this.engine.fire[3] > 0) engine_fire = 6;
else if (this.engine.fire[2] > 0 && this.engine.fire[1] > 0) engine_fire = 7;
else if (this.engine.fire[2] > 0 && this.engine.fire[3] > 0) engine_fire = 8;
else if (this.engine.fire[0] > 0) engine_fire = 0;
else if (this.engine.fire[1] > 0) engine_fire = 1;
else if (this.engine.fire[2] > 0) engine_fire = 2;
else if (this.engine.fire[3] > 0) engine_fire = 3;
*/

	var engine_fire = [0, 0, 0, 0, 0];
	if (this.engine)
	{
		if (this.engine.fire[0] > 0) engine_fire[0] = 1;

		if (this.engine.fire[1] > 0) engine_fire[1] = 1;

		if (this.engine.fire[2] > 0) engine_fire[2] = 1;

		if (this.engine.fire[3] > 0) engine_fire[3] = 1;
	}
	else if (this.actortype == "projectile" && this.triggerparticles) engine_fire[4] = 1;
	else if (this.actortype == "explosion") engine_fire[4] = 1;


	return {
		//actortype: this.actortype, // ??? !!! TEMP! FOR DEBUGGING!
		id:		this.id, 
		
		x: 		this.pos[0],
		y: 		this.pos[1],
		angle: 	this.angle,
		scale: 	this.scale,

		sprite: 		this.getSpriteUrlIndex(this.getSprite().url),
		sprite_index: 	this.getSprite()._index,

		health_percent: this.getHealth() / this.getMaxHealth(),
		
		score: this.score, 

		engine_fire: 	engine_fire			// tells us whether to spawn any particle effects on client-side
	};
};



// ====== GAME STATE GET/SET ======
// WorldObject.prototype.setGameStateRef = function(ref) {
// 	this._game_state_outputarray_ref = ref;
// };
// registryOfBasePrototypes[i].getSpriteIndex = function(spriteUrlIndex) {
// 	return spriteUrlIndex.indexOf(this.getSprite().url);
// };
WorldObject.prototype.getSpriteUrlIndex = function(url) {

};
WorldObject.prototype.pushObjToGameStateRef = function(obj) {
	if (this._game_state_outputarray_ref)
	{
		if (typeof this._game_state_outputarray_ref.isArray())
		this._game_state_outputarray_ref.push(obj);
	}
};
WorldObject.prototype.pushNewExplosion = function(sprite, pos, speed) {

};
WorldObject.prototype.getNewExplosion = function(sprite, pos, speed) {

};
WorldObject.prototype.pushNewWormhole = function(pos, distance, lifespan, direction) {

};
WorldObject.prototype.pushNewWormholePair= function(pos, distance, lifespan, direction, target) {

};
WorldObject.prototype.spawnNewDrone = function() {

};
WorldObject.prototype.respawnPlanets = function() {

};
WorldObject.prototype.updateHighScore = function() {
	
};
