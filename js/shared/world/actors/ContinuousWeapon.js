/*
 *
 *	Continuous Weapons fire a steady stream of projectiles during the first half of their cooldown between shots.
 *
 */



var actor_weapon = require('./Weapon.js');
var world_object = require('./Projectile.js');
var game_math = require('../../lib/math_functions.js');



if (typeof thisIsTheClient === "undefined")
{
	// INCLUDES ALL ???
	module.exports = {
		ContinuousWeapon: ContinuousWeapon,
	};
}
else
{
	window.ContinuousWeapon = ContinuousWeapon;
}



//===================== ContinuousWeapon PROTOTYPE ======================
function ContinuousWeapon(projectile, rate, maxpower, powerdrain, powerregen)
{
	actor_weapon.Weapon.call(this, projectile, rate, maxpower, powerdrain, powerregen); // call super constructor.

	this.secondarytimeout = 0;
	this.shooter = false;
}
// ====== WORLD OBJECT ======
//ContinuousWeapon.prototype = new world_object.WorldObject();
ContinuousWeapon.prototype = Object.create(actor_weapon.Weapon.prototype);
ContinuousWeapon.prototype.constructor = ContinuousWeapon;


// ====== FUNCTIONS ======
ContinuousWeapon.prototype.fire = function(shooter) {
	if (this.timeout <= 0)
	{
		if (this.power >= this.powerdrain) {
			this.shooter = shooter;
			this.timeout = this.rate;
		//	this.power -= this.powerdrain;
		//	this.isfired = true;
		}
	}
};

ContinuousWeapon.prototype.modWeaponEnergy = function(hpDiff)
{
	if (this.power + hpDiff > this.maxpower)
		this.power = this.maxpower;
	else if (this.timeout <= 0)
		this.power += hpDiff;

	if (this.power < 0) this.power = 0;
};

ContinuousWeapon.prototype.update = function(dt, shooterScore) {
	if (!shooterScore) shooterScore = 0;

	if (this.timeout > 0)
	{
		if (this.timeout > this.rate/2 && this.power > 0)
		{
			if (this.secondarytimeout > 0) this.secondarytimeout -= dt;
			else
			{
				this.secondarytimeout = 0.05; //this.rate/10;

				//this.pushObjToGameStateRef(this.projectile.getCopy(this.shooter));
				var firedProjectile = this.projectile.getCopy(this.shooter);
				if (shooterScore)
				{
					if (firedProjectile.hasOwnProperty('weapon')) firedProjectile.weapon.projectile.damage = this.getDamage(shooterScore);
					else firedProjectile.damage = this.getDamage(shooterScore);
				}
				this.pushObjToGameStateRef(firedProjectile);

				this.power -= this.powerdrain * dt;
			}
		}

		this.timeout -= dt;
	}
	if (this.timeout < 0) this.timeout = 0;

	if (this.power < this.maxpower) this.power += this.powerregen * dt;
	if (this.power > this.maxpower) this.power = this.maxpower;
};


ContinuousWeapon.prototype.getCopy = function(shooter) {
	var newProjectile = this.projectile.getCopy(shooter);
	return new ContinuousWeapon(newProjectile, this.rate, this.maxpower, this.powerdrain, this.powerregen);
};
