
var game_sprite = require('../../lib/sprite.js');
var actor_mine = require('./Mine.js');
var game_math = require('../../lib/math_functions.js');



// ??? temp!
var actor_weapon = require('./Weapon.js');


if (typeof thisIsTheClient === "undefined")
{
    // INCLUDES ALL ???
    module.exports = {
        WormholeMine: WormholeMine,
    };
}
else
{
    window.WormholeMine = WormholeMine;
}



//===================== SPACESHIP PROTOTYPE ======================
function WormholeMine(owner, sprite, explosionsprite, distance, lifespan, knockback, smart, idledelay, countdowntimer, inheritspeed, friendlyfire)
{
    actor_mine.Mine.call(this, owner, sprite, explosionsprite, distance/100, lifespan, knockback, smart, idledelay, countdowntimer, inheritspeed, friendlyfire); // call super constructor.
    //console.log("distance: " + this.distance + " damage: " + this.damage);

    this.distance = distance;
    this.wormhole_numberofjumps = 9;

    this.explosionondeath = true;
};
// ====== WORLD OBJECT ======
// subclass extends superclass
WormholeMine.prototype = Object.create(actor_mine.Mine.prototype);
WormholeMine.prototype.constructor = WormholeMine;

// ====== GET AND SET ======
// ...

// ====== FUNCTIONS ======
WormholeMine.prototype.feedListOfTargets = function(listOfTargets, dt) {
    // No targets for this type of Mine, so just use this to call processControls(dt)
    this.processControls(dt);
};

WormholeMine.prototype.processControls = function(dt) {
    // Default WormholeMine AI

    // Only start detonation/idle behavior after a delay
    if (this.idledelay > 0)
    {
        //console.log("idle: " + this.idledelay);
        this.idledelay -= dt;
    }
	else if (this.countdowntimer > 0)
    {
        //this.getSprite().update(dt);
		this.getSprite()._index = 0;

        //console.log("countdown: " + this.countdowntimer);
        this.countdowntimer -= dt;
    }
	else
	{
		//var wormholeLifespan = this.lifespan; //game_math.getRandomInt(5, 30); //(this.damage/100) * game_math.getRandomInt(3, 15);
        //console.log("pre-wormhole lifespan: " + this.lifespan);

        //var newPos = [this.pos[0], this.pos[1]];
        //var newDistance = this.distance;

        this.pushNewWormholePair(this.pos, this.distance, this.wormhole_numberofjumps, game_math.getRandomArbitrary(0, 360), false);
		this.playDeathEvent();
	}
};


WormholeMine.prototype.strikeTarget = function(enemy) {
	if (enemy.actortype == "planet" || enemy.actortype == "moon") return false; // Will orbit planets/moons without striking them

	if (enemy.id != this.owner || (this.friendlyfire && this.idledelay <= 0))
	{
        enemy.modHealth(-this.damage, this.ownerActor);



        //this.pushNewWormholePair(this.pos, this.distance, this.lifespan*2, game_math.getRandomArbitrary(0, 360), enemy);
        this.pushNewWormholePair(this.pos, this.distance, this.wormhole_numberofjumps, game_math.getRandomArbitrary(0, 360), enemy);
		this.playDeathEvent();
	}
};


WormholeMine.prototype.getCopy = function(shooter) {
    if (this.explosionsprite)
        var newWormholeMine = new WormholeMine(shooter, this.sprite.getCopy(), this.explosionsprite.getCopy(), this.distance, this.lifespan, this.knockback, this.smart, this.idledelay, this.countdowntimer, this.inheritspeed, this.friendlyfire);
    else
        var newWormholeMine = new WormholeMine(shooter, this.sprite.getCopy(), false, this.distance, this.lifespan, this.knockback, this.smart, this.idledelay, this.countdowntimer, this.inheritspeed, this.friendlyfire);

    if (this.hasOwnProperty('weapon')) newWormholeMine.weapon = this.weapon.getCopy(shooter);
    return newWormholeMine;
};


// ====== WORLD OBJECT ======
// subclass extends superclass
//WormholeMine.prototype.constructor = WormholeMine;
