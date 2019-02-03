
var world_object = require('./WorldObject.js');
var game_math = require('../../lib/math_functions.js');
var game_state = require('../../../server/data.js');



if (typeof thisIsTheClient === "undefined")
{
	// INCLUDES ALL ???
	module.exports = {
		Armor: Armor,
	};
}
else
{
	window.Armor = Armor;
}



//===================== Armor PROTOTYPE ======================
function Armor(sprite, maxhealth, healthregen)
{
	// ====== CONSTRUCTOR ======
	this.sprite = sprite;
	this.maxhealth = maxhealth;
	this.health = maxhealth;
	this.healthregen = healthregen;

	this.mass = maxhealth/100;
}
// ====== WORLD OBJECT ======
//...

// ====== GET/SET ======
Armor.prototype.getSprite = function(){
	if (this.hasOwnProperty('sprite')) return this.sprite;

	return false; // ??? // Add a "model missing" sprite?
};
Armor.prototype.getMass = function() {
	return this.mass;
};
Armor.prototype.getHealth = function() {
	return this.health;
};
Armor.prototype.getMaxHealth = function() {
	return this.maxhealth;
};

// ====== FUNCTIONS ======
Armor.prototype.update = function(dt) {
	this.sprite.update(dt); // update sprite
};

Armor.prototype.getCopy = function() {
	return new Armor(this.sprite, this.maxhealth, this.healthregen);
};
