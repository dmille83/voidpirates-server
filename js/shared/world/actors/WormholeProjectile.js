
var game_sprite = require('../../lib/sprite.js');
var actor_projectile = require('./Projectile.js');
var game_math = require('../../lib/math_functions.js');



if (typeof thisIsTheClient === "undefined")
{
	// INCLUDES ALL ???
	module.exports = {
		WormholeProjectile: WormholeProjectile,
	};
}
else
{
	window.WormholeProjectile = WormholeProjectile;
}



//===================== SPACESHIP PROTOTYPE ======================
function WormholeProjectile(owner, sprite, explosionsprite, distance, startspeed, lifespan, knockback, smart, maneuverability, accelleration, dumbfireaccelleration, inaccuracy)
{
	this.distance = distance;
	actor_projectile.Projectile.call(this, owner, sprite, explosionsprite, distance/100, startspeed, lifespan, knockback, smart, maneuverability, accelleration, dumbfireaccelleration, inaccuracy); // call super constructor.
	//this.damage = damage/100;
	//console.log("distance: " + this.distance + " damage: " + this.damage);

	this.wormhole_numberofjumps = 3;
};
// ====== WORLD OBJECT ======
// subclass extends superclass
WormholeProjectile.prototype = Object.create(actor_projectile.Projectile.prototype);
WormholeProjectile.prototype.constructor = WormholeProjectile;

// ====== GET AND SET ======
// ...

// ====== FUNCTIONS ======
WormholeProjectile.prototype.strikeTarget = function(enemy) {
	//if (enemy.actortype == "planet" || enemy.actortype == "moon") return false; // Will orbit planets/moons without striking them

	enemy.modHealth(-this.damage, this.ownerActor);

	//var	explosionSprite = new game_sprite.Sprite('img/sprite/explosion-blue.png', [0, 0], [128, 128], 50, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 0, true);
	this.pushNewExplosion(this.explosionsprite.getCopy(), this.pos, this.speed);

	//var wormholeLifespan = this.lifespan; //(this.damage/100) * 3;
	//console.log("pre-wormhole lifespan: " + this.lifespan);
	//this.pushNewWormholePair(this.pos, this.distance, this.lifespan*2, game_math.getRandomArbitrary(0, 360), enemy);
	this.pushNewWormholePair(this.pos, this.distance, this.wormhole_numberofjumps, game_math.getRandomArbitrary(0, 360), enemy);
	this.playDeathEvent();
};

WormholeProjectile.prototype.getCopy = function(shooter) {
	var newWormholeProjectile = new WormholeProjectile(shooter, this.sprite.getCopy(), this.explosionsprite.getCopy(), this.distance, this.startspeed, this.lifespan, this.knockback, this.smart, this.maneuverability, this.accelleration, this.dumbfireaccelleration);
	if (this.hasOwnProperty('weapon')) newWormholeProjectile.weapon = this.weapon.getCopy(shooter);
	return newWormholeProjectile;
};


// ====== DEATH EVENT ======
WormholeProjectile.prototype.playDeathEvent = function (instantdeath)
{
	// Call this function just before deleting the object from the game
	// e.g.: missiles explode before dying

	if (this.lifespan > 0)
	{
		//if (this.fireexplosion <= 0) {
		//	this.fireexplosion = 1;
			//var	explosionSprite = new game_sprite.Sprite('img/sprite/explosion-blue.png', [0, 0], [128, 128], 50, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 0, true);
			this.pushNewExplosion(this.explosionsprite.getCopy(), this.pos, this.speed);
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
