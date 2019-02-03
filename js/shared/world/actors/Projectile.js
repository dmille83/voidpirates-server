
var game_sprite = require('../../lib/sprite.js');
var world_object = require('./WorldObject.js');
var game_math = require('../../lib/math_functions.js');



// ??? temp!
var actor_weapon = require('./Weapon.js');


if (typeof thisIsTheClient === "undefined")
{
	// INCLUDES ALL ???
	module.exports = {
		Projectile: Projectile,
	};
}
else
{
	window.Projectile = Projectile;
}



//===================== SPACESHIP PROTOTYPE ======================
function Projectile(owner, sprite, explosionsprite, damage, startspeed, lifespan, knockback, smart, maneuverability, accelleration, dumbfireaccelleration, inaccuracy)
{
	world_object.WorldObject.call(this); // call super constructor.

	// ====== CONSTRUCTOR ======
	if (owner) this.ownerActor = owner;
	else this.ownerActor = new world_object.WorldObject();

	if (owner && owner.hasOwnProperty('id')) this.owner = owner.id;
	else this.owner = false;

	this.actortype = 'projectile';
	this.sprite = sprite;
	this.explosionsprite = explosionsprite;
	this.damage = damage;
	//this.damageradius = damageradius;
	this.startspeed = startspeed;
	this.lifespan = lifespan;
	this.knockback = knockback; // Impact knocks target back
	this.explosionondeath = false;
	this.smart = smart; // Range at which a projectile can detect an available target
	this.maneuverability = maneuverability; // How fast a projectile can turn to chase a target
	this.accelleration = accelleration; // Rate at which a projectile can change its speed when chasing a target
	this.dumbfireaccelleration = dumbfireaccelleration; // Accelleration when no targets are detected (i.e.: a dumb-fire rocket)
	if (inaccuracy) this.inaccuracy = inaccuracy; // Divergence from cross-hairs when fired
	else this.inaccuracy = 0;

	// Default projectile attributes?
	this.mass = 10;
	this.friendlyfire = false; // Unlike Mines, bullets will NEVER hurt their shooter.


	//this.engine = ; // ??? give these an engine?


	// Positioning and speed relative to shooter's sprite
	var offsetFromShooter = 30; // Projectile starts out slightly ahead of shooter
	if (this.ownerActor && this.ownerActor.getSprite()) offsetFromShooter = this.ownerActor.getSprite().size[1] * 2/3;

	this.pos = [(this.ownerActor.pos[0] + Math.sin(this.ownerActor.angle * game_math.TO_RADIANS) * offsetFromShooter), (this.ownerActor.pos[1] + Math.cos(-this.ownerActor.angle * game_math.TO_RADIANS) * offsetFromShooter)];
	this.angle = this.ownerActor.angle + game_math.getRandomInt(-this.inaccuracy, this.inaccuracy);

	//var speedX = Math.sin(this.angle*game_math.TO_RADIANS) * (parseInt(startspeed) + Math.abs(game_math.getDistance(0, 0, this.ownerActor.speed[0], this.ownerActor.speed[1])));
	//var speedY = Math.cos(this.angle*game_math.TO_RADIANS) * (parseInt(startspeed) + Math.abs(game_math.getDistance(0, 0, this.ownerActor.speed[0], this.ownerActor.speed[1])));
	var speedX = Math.sin(this.angle*game_math.TO_RADIANS) * parseInt(startspeed) + this.ownerActor.speed[0];
	var speedY = Math.cos(this.angle*game_math.TO_RADIANS) * parseInt(startspeed) + this.ownerActor.speed[1];
	//var speedX = Math.sin(this.angle*game_math.TO_RADIANS) * parseInt(startspeed);
	//var speedY = Math.cos(this.angle*game_math.TO_RADIANS) * parseInt(startspeed);

	this.speed = [speedX, speedY];



	this.triggerparticles = true; // for client-side particle effects


	// Variables used by the projectile's AI (if it has one)
	this._currentenemytarget = false;
};
// ====== WORLD OBJECT ======
// subclass extends superclass
Projectile.prototype = Object.create(world_object.WorldObject.prototype);
Projectile.prototype.constructor = Projectile;

// ====== GET AND SET ======
// ...

// ====== FUNCTIONS ======
Projectile.prototype.update = function (dt, worldSize)
{
	this.getSprite().update(dt);

	//this.processControls(dt);

	this.updatePosition(dt, worldSize);
};


Projectile.prototype.feedListOfTargets = function(listOfTargets, dt) {
	if (this.smart > 0) // If NOT smart (ie, a dumb bullet), do not acquire targets from the list
	{
		this._currentenemytarget = false;
		for(var i in listOfTargets)
		{
			if (game_math.getActorDistance(this, listOfTargets[i]) <= this.smart)
			{
				if (!this._currentenemytarget || game_math.getActorDistance(this, listOfTargets[i]) < game_math.getActorDistance(this, this._currentenemytarget))
					//if (listOfTargets[i].actortype != "projectile")
						if (listOfTargets[i].id != this.owner && !listOfTargets[i].isdead)
							this._currentenemytarget = listOfTargets[i];
			}
		}
	}

	// Process our reaction to this set of targets now
	this.processControls(dt);
};

Projectile.prototype.processControls = function (dt)
{
	// Default projectile AI

	if (this._currentenemytarget) // A.K.A. "I'm a homing-missile"
	{
		// Pick the target?
		var angleOfEnemy = game_math.getAngle(this.pos[0], this.pos[1], this._currentenemytarget.pos[0], this._currentenemytarget.pos[1]);

		// Accellerate towards target (simple yet effective)
//		this.speed[0] += Math.sin(angleOfEnemy*game_math.TO_RADIANS) * this.accelleration * dt;
//		this.speed[1] += Math.cos(angleOfEnemy*game_math.TO_RADIANS) * this.accelleration * dt;


		//this.angle = angleOfEnemy;
		this.angle = game_math.rotateToFaceAngle(this.angle, angleOfEnemy, this.maneuverability);

		// Perform a controlled swerve
		var curSpeed = game_math.getDistance(0, 0, this.speed[0], this.speed[1]);
		this.speed[0] = Math.sin(this.angle*game_math.TO_RADIANS) * curSpeed;
		this.speed[1] = Math.cos(this.angle*game_math.TO_RADIANS) * curSpeed;



		// // Same as above, but with a speed cap
		// // Accellerate towards nearest enemy (much easier!)
		// var angleOfEnemy = game_math.getAngle(this.pos[0], this.pos[1], this._currentenemytarget.pos[0], this._currentenemytarget.pos[1]);
		 var maxspeed = 400;
		 if (this.speed[0] + Math.sin(angleOfEnemy*game_math.TO_RADIANS) * this.accelleration * dt < maxspeed)
		 	this.speed[0] += Math.sin(angleOfEnemy*game_math.TO_RADIANS) * this.accelleration * dt;
		 if (this.speed[1] + Math.cos(angleOfEnemy*game_math.TO_RADIANS) * this.accelleration * dt < maxspeed)
		 	this.speed[1] += Math.cos(angleOfEnemy*game_math.TO_RADIANS) * this.accelleration * dt;


		// // Pick a point ahead of the target?
		// var swerveThreshold = 0.5;
		// var xTarget = (this._currentenemytarget.pos[0] - this.pos[0]) * swerveThreshold;
		// var yTarget = (this._currentenemytarget.pos[1] - this.pos[1]) * swerveThreshold;
		// var angleOfEnemy = game_math.getAngle(0, 0, xTarget, yTarget);


		// // Pick a point on the opposite left/right side of the target? (WAVE MOTION GUN)
		// var swerveThreshold = 20;
		// var xTarget = (this._currentenemytarget.pos[0] - this.pos[0]) * swerveThreshold;
		// var yTarget = (this._currentenemytarget.pos[1] - this.pos[1]) * swerveThreshold;
		// var angleOfEnemy = game_math.getAngle(0, 0, xTarget, yTarget);
		// yTarget = Math.sin((angleOfEnemy)*game_math.TO_RADIANS) * swerveThreshold * dt;
		// yTarget = Math.cos((angleOfEnemy)*game_math.TO_RADIANS) * swerveThreshold * dt;
		// var angleOfEnemy = game_math.getAngle(0, 0, xTarget, yTarget);


		// // Point nose at nearest enemy and accellerate (much harder! wierd as hell to watch!)
		// this.angle = game_math.getAngle(this.pos[0], this.pos[1], this._currentenemytarget.pos[0], this._currentenemytarget.pos[1]);
		// // Accellerate forward (in current direction its nose is pointed)
		// this.speed[0] += Math.sin(this.angle*game_math.TO_RADIANS) * this.accelleration * dt;
		// this.speed[1] += Math.cos(this.angle*game_math.TO_RADIANS) * this.accelleration * dt;
		// // Reduce side-to-side drift while being propelled forward or back
		// if (this.speed[0]/(Math.cos((this.angle)*game_math.TO_RADIANS)) < 0) this.speed[0] += Math.cos((this.angle)*game_math.TO_RADIANS) * this.accelleration * dt;
		// else if (this.speed[0]/(Math.cos((this.angle)*game_math.TO_RADIANS)) > 0) this.speed[0] -= Math.cos((this.angle)*game_math.TO_RADIANS) * this.accelleration * dt;




		// Some missiles shoot even MORE bullets
		if (this.hasOwnProperty('weapon'))
		{
			//console.log('baby bullets!');
			if (!this.hasOwnProperty('id')) this.id = this.owner; // So its child bullets won't hurt us
			this.weapon.fire(this);
			//console.log(this.weapon.power);
			if (this.weapon.power <= this.weapon.projectile.damage)
				this.playDeathEvent();
			this.weapon.update(dt);
		}
	}
	else
	{
		// Accellerate forward (in current direction its nose is pointed)
		this.speed[0] += Math.sin(this.angle*game_math.TO_RADIANS) * this.dumbfireaccelleration * dt;
		this.speed[1] += Math.cos(this.angle*game_math.TO_RADIANS) * this.dumbfireaccelleration * dt;
	}


	// ...Then point the nose towards where we are going
	this.angle = game_math.getAngle(this.pos[0], this.pos[1], (this.pos[0]+this.speed[0]), (this.pos[1]+this.speed[1]));


	// ???
	// // Lifespan
	// this.lifespan -= dt;
	// if (this.lifespan <= 0) this.playDeathEvent();
};


Projectile.prototype.strikeTarget = function(enemy) {
	enemy.modHealth(-this.damage, this.ownerActor);

	if (enemy.actortype == "projectile")
	{
		if (!enemy.killme && (enemy.isamine || enemy.isadrone)) this.ownerActor.addPoint(1); // Get a point for defusing a mine
		enemy.playDeathEvent();
	}

	if (this.knockback != 0) // Knockback weapon
	{
		enemy.speed[0] += this.speed[0] * this.knockback;
		enemy.speed[1] += this.speed[1] * this.knockback;
		if (game_math.getRandomInt(0, 10) < 2)
			enemy.anglespeed += this.speed[0] * this.knockback/2 + this.speed[0] * this.knockback/2;
	}

	//var	explosionSprite = new game_sprite.Sprite('img/sprite/explosion.png', [0, 0], [128, 128], 50, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 0, true);
	if (this.explosionsprite) this.pushNewExplosion(this.explosionsprite.getCopy(), this.pos, this.speed);
	//if (typeof this.explosionsprite === 'object') console.log(this); // ???
	//if (!isNaN(this.explosionsprite) && this.explosionsprite > 0) console.log(this); // ???

	this.playDeathEvent();
};

Projectile.prototype.getCopy = function(shooter) {
	if (this.explosionsprite) // && isNaN(this.explosionsprite))
		var newProjectile = new Projectile(shooter, this.sprite.getCopy(), this.explosionsprite.getCopy(), this.damage, this.startspeed, this.lifespan, this.knockback, this.smart, this.maneuverability, this.accelleration, this.dumbfireaccelleration, this.inaccuracy);
	else
		var newProjectile = new Projectile(shooter, this.sprite.getCopy(), false, this.damage, this.startspeed, this.lifespan, this.knockback, this.smart, this.maneuverability, this.accelleration, this.dumbfireaccelleration, this.inaccuracy);

	if (this.hasOwnProperty('weapon')) newProjectile.weapon = this.weapon.getCopy(shooter);
	return newProjectile;
};


// ====== DEATH EVENT ======
Projectile.prototype.playDeathEvent = function (instantdeath)
{
	// Call this function just before deleting the object from the game
	// e.g.: missiles explode before dying

	if (this.lifespan > 0)
	{
		//if (this.fireexplosion <= 0) {
		//	this.fireexplosion = 1;
			//var	explosionSprite = new game_sprite.Sprite('img/sprite/explosion.png', [0, 0], [128, 128], 50, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 0, true);
			//this.pushNewExplosion(explosionSprite, this.pos, this.speed);
			if (this.explosionsprite) this.pushNewExplosion(this.explosionsprite.getCopy(), this.pos, this.speed);
		//}

		/*
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
		*/
	}

	this.killme = true;
};
