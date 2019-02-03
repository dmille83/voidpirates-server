
//var actor_equipmentslot = require('./EquipmentSlot.js');
var world_object = require('./Projectile.js');
var game_math = require('../../lib/math_functions.js');



if (typeof thisIsTheClient === "undefined")
{
	// INCLUDES ALL ???
	module.exports = {
		Weapon: Weapon,
	};
}
else
{
	window.Weapon = Weapon;
}



//===================== WEAPON PROTOTYPE ======================
function Weapon(projectile, rate, maxpower, powerdrain, powerregen)
{
	//actor_equipmentslot.EquipmentSlot.call(this); // call super constructor.

	// ====== CONSTRUCTOR ======
	this.actortype = 'weapon';
	this.projectile = projectile;

	this.rate = rate; // firing rate, delay between shots, the lower the better
	this.timeout = 0; // if above 0, you are in cooldown between shots

	this.power = maxpower;
	this.maxpower = maxpower;
	this.powerdrain = powerdrain; // get from projectile
	this.powerregen = powerregen;
}
// ====== WORLD OBJECT ======
//Weapon.prototype = new world_object.WorldObject();
//Weapon.prototype = Object.create(actor_equipmentslot.EquipmentSlot.prototype);
Weapon.prototype.constructor = Weapon;

// ====== GET/SET ======
Weapon.prototype.getDamage = function(shooterScore) {
	if (!shooterScore) shooterScore = 0;

	if (this.projectile.weapon)
		return this.projectile.weapon.projectile.damage; // + (this.projectile.weapon.projectile.damage * shooterScore/100);
	else
		return this.projectile.damage; // + (this.projectile.damage * shooterScore/100);
};

// ====== FUNCTIONS ======
Weapon.prototype.fire = function(shooter, shooterScore) {
	if (!shooterScore) shooterScore = 0;

	if (this.timeout <= 0)
	{
		//console.log(this.power + " / " + this.maxpower + " because drain is " + this.powerdrain);

		if (this.power >= this.powerdrain) {
			this.power -= this.powerdrain;

			var minimumFiringRate = 0.2;
			var calculatedFiringRate = this.rate; // - (shooterScore/1000);
			if (calculatedFiringRate >= minimumFiringRate)
				this.timeout = calculatedFiringRate;
			else if (this.rate > minimumFiringRate && calculatedFiringRate < minimumFiringRate)
				this.timeout = minimumFiringRate;
			else
				this.timeout = this.rate;


			//this.pushObjToGameStateRef(this.projectile.getCopy(shooter));
			var firedProjectile = this.projectile.getCopy(shooter);
			if (shooterScore)
			{
				// ???
				//if (firedProjectile.hasOwnProperty('weapon')) firedProjectile.weapon.projectile.damage = this.getDamage(shooterScore);
				//else firedProjectile.damage = this.getDamage(shooterScore);
			}
			this.pushObjToGameStateRef(firedProjectile);
		}
	}
};

Weapon.prototype.modWeaponEnergy = function(hpDiff)
{
	if (this.power + hpDiff > this.maxpower)
		this.power = this.maxpower;
	else if (this.timeout <= 0)
		this.power += hpDiff;

	if (this.power < 0) this.power = 0;
};

Weapon.prototype.update = function(dt, shooterScore) {
	if (!shooterScore) shooterScore = 0;

	if (this.timeout > 0) this.timeout -= dt;
	else if (this.timeout < 0) this.timeout = 0;

	if (this.power < 0) this.power = 0;
	else if (this.power < this.maxpower) this.power += this.powerregen*dt; // + (shooterScore/100)*dt;
	else if (this.power > this.maxpower) this.power = this.maxpower;
};


Weapon.prototype.getCopy = function(shooter) {
	var newProjectile = this.projectile.getCopy(shooter);
	return new Weapon(newProjectile, this.rate, this.maxpower, this.powerdrain, this.powerregen);
};
