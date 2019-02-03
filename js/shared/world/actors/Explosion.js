
var world_object = require('./WorldObject.js');
var game_math = require('../../lib/math_functions.js');


if (typeof thisIsTheClient === "undefined")
{
	// INCLUDES ALL ???
	module.exports = {
		Explosion: Explosion,
	};
}
else
{
	window.Explosion = Explosion;
}



//===================== SPACESHIP PROTOTYPE ======================
function Explosion(sprite, pos, speed)
{
	world_object.WorldObject.call(this); // call super constructor.

	// ====== CONSTRUCTOR ======
	this.actortype = 'explosion';
	this.sprite = sprite;

	// Positioning and speed relative to shooter's sprite
	this.pos = [pos[0],pos[1]];
	this.angle = game_math.getRandomInt(0, 360);

	// Default explosion attributes?
	this.mass = 0;
};
// ====== WORLD OBJECT ======
// subclass extends superclass
Explosion.prototype = Object.create(world_object.WorldObject.prototype);
Explosion.prototype.constructor = Explosion;

// ====== FUNCTIONS ======
Explosion.prototype.processControls = function(dt) {
	//if (this.targetlock) this.pos = this.ownerActor.pos;


	//console.log("explosion sprite frame: " + this.getSprite()._index);
	if (this.getSprite()._index >= this.getSprite().frames.length - 1) {
		//console.log("kill explosion");
		this.playDeathEvent();
	}
};

Explosion.prototype.updatePosition = function (dt, worldSize)
{
	// Explosions do NOT loop around closed universe

	this.pos[0] += this.speed[0] * dt;
	this.pos[1] += this.speed[1] * dt;

	this.angle += this.anglespeed * dt;
	if (this.angle <= -360) this.angle += 360;
	else if (this.angle >= 360) this.angle -= 360;
};
