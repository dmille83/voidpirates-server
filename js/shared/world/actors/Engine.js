
var game_sprite = require('../../lib/sprite.js');
var game_math = require('../../lib/math_functions.js');


if (typeof thisIsTheClient === "undefined")
{
	// INCLUDES ALL ???
	module.exports = {
		Engine: Engine,
	};
}
else
{
	window.Engine = Engine;
}



//===================== Engine PROTOTYPE ======================
function Engine(fumefxsprite, fumefxtrailsprite, accelleration, deccelleration, maxspeed, anglechangespeed, maxfuel, fueldrain, fuelregen, spinreduction)
{
	// ====== CONSTRUCTOR ======
	this.actortype = 'engine';
	this.fumefxsprite = fumefxsprite;
	this.fumefxtrailsprite = fumefxtrailsprite;
	this.accelleration = accelleration;
	this.deccelleration = deccelleration;
	this.maxspeed = maxspeed;
	this.anglechangespeed = anglechangespeed;
	this.fuel = maxfuel;
	this.maxfuel = maxfuel;
	this.fueldrain = fueldrain;
	this.fuelregen = fuelregen;
	this.spinreduction = spinreduction;

	this.fire = [0, 0, 0, 0]; // index: [up, right, down, left]

	this.fireexplosion = 0;

	this.timeout = 0; // Cooldown timer if fuel runs completely dry
}
// ====== WORLD OBJECT ======
//...

// ====== GET/SET ======
Engine.prototype.getEngineFiring = function(direction) {
	if (this.fire[direction] > 0) return true;
	return false;
};

Engine.prototype.modFuel = function(hpDiff, damageSource)
{
	if (this.fuel + hpDiff > this.maxfuel)
		this.fuel = this.maxfuel;
	else
		this.fuel += hpDiff;

	if (this.fuel <= 0)
	{
		this.timeout = 2.0;
		this.fuel = 0;
	}
};

// ====== FUNCTIONS ======
Engine.prototype.fireEngine = function(direction, shooterScore) {
	if (!shooterScore) shooterScore = 0;

	this.fire[direction] = 1.0; // Full build instantly, but lingers when turned off

	// if (this.fireexplosion <= 0) {
	// 	this.fireexplosion = 1;
	// 	this.pushNewExplosion(this.fumefxtrailsprite.getCopy(), this.pos, [0,0]);
	// }
};

Engine.prototype.update = function(dt, shooterScore) {
	if (!shooterScore) shooterScore = 0;

	this.fumefxsprite.update(dt); // update sprite

	if (this.fireexplosion > 0) this.fireexplosion -= dt;

	// Burn fuel
	for (var i = 0; i < 4; i++)
	{
		if (this.fire[i] > 0)
		{
			//if (this.fuel > 0)
				this.modFuel(-this.fueldrain * dt);
			this.fire[i] -= 0.15;

			// ??? "Medium Stakes" Model: Don't regen while flying, but x4 regen the rest of the time.
			//this.timeout = 0.01; // Do NOT regen fuel WHILE using any of your engines
		}
		else
		{
			// ??? Fuel regen can go here for "cooldown" model, where using one your engines constantly is fine, but using 2 or more will start to build up "overheat"
			// ??? "Cooldown": allows players to almost freely use their thrusters, but if they don't pay attention to it their engines could cut out at a critical moment (especially when gravity is involved)!
			// ??? Engines in use burn fuel, while idle engines regenerate it (shared tank).

			if (this.timeout <= 0) // If not on cooldown from fully draining fuel
			{
				// Slowly regenerate fuel
				if (this.fuel < this.maxfuel + shooterScore)
				{
					this.modFuel(this.fuelregen*dt + (shooterScore/100)*dt);
				}
				else this.fuel = this.maxfuel + shooterScore;
			}
			//else console.log(this.timeout);
		}
	}

	// ??? Fuel regen can go here for "steady regen" model
	// ??? "Steady Regen": high stakes, short bursts with thrusters, extreme budget-munching to keep control, gravity SUCKS!
	// Slowly regenerate fuel
	// if (this.timeout <= 0) if (this.fuel < this.maxfuel) this.fuel += this.fuelregen * dt;


	if (this.timeout > 0) this.timeout -= 1 * dt;
	// if (this.fuel <= 0)
	// {
	// 	this.fuel = 0;
	// 	this.timeout = 2.0; // Cooldown penalty for fully draining fuel
	// }
};

Engine.prototype.getCopy = function() {
	return new Engine(this.fumefxsprite, this.fumefxtrailsprite, this.accelleration, this.deccelleration, this.maxspeed, this.anglechangespeed, this.maxfuel, this.fueldrain, this.fuelregen, this.spinreduction);
};
