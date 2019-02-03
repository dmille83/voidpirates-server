
var world_object = require('./WorldObject.js');
var game_sprite = require('../../lib/sprite.js');
var game_math = require('../../lib/math_functions.js');


// ??? temp!
var actor_weapon = require('./Weapon.js');


if (typeof thisIsTheClient === "undefined")
{
    // INCLUDES ALL ???
    module.exports = {
        Wormhole: Wormhole,
    };
}
else
{
    window.Wormhole = Wormhole;
}



//===================== SPACESHIP PROTOTYPE ======================
function Wormhole(pos, distance, lifespan, direction)
{
    world_object.WorldObject.call(this); // call super constructor.

    // ====== CONSTRUCTOR ======
    this.actortype = 'explosion';
    this.sprite = new game_sprite.Sprite('img/sprite/wormhole.png', [0, 0], [75, 75], 20, [0, 1, 2, 3, 4, 5, 6 ,7 ,8 ,9 ,10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], 0, false);

	this.pos = [pos[0], pos[1]];
    this.distance = distance;

    if (lifespan && lifespan > 10) this.lifespan = lifespan;
    else if (lifespan && lifespan <= 10) this.lifespan = (this.distance/100)*lifespan;
    else this.lifespan = (this.distance/100)*3; // 3 objects may pass through

    // Default Wormhole attributes?
    this.mass = 0;

	if (direction) this.direction = direction;
    else this.direction = game_math.getRandomArbitrary(0.0, 360.0);

    this.exitX = this.pos[0] + (Math.sin(this.direction*game_math.TO_RADIANS) * this.distance);
    this.exitY = this.pos[1] + (Math.cos(this.direction*game_math.TO_RADIANS) * this.distance);

    this.partner = false;

    // Variables used by the Wormhole's AI (if it has one)
    this._currentenemytargets = [];
};
// ====== WORLD OBJECT ======
// subclass extends superclass
Wormhole.prototype = Object.create(world_object.WorldObject.prototype);
Wormhole.prototype.constructor = Wormhole;

// ====== GET AND SET ======
Wormhole.prototype.setPartner = function (partner)
{
    this.partner = partner;
}
// ...

// ====== FUNCTIONS ======
Wormhole.prototype.update = function (dt, worldSize)
{
    this.getSprite().update(dt);

    //this.processControls(dt);

    this.updatePosition(dt, worldSize);
};


Wormhole.prototype.feedListOfTargets = function(listOfTargets, dt) {
	this._currentenemytargets = [];
	for(var i in listOfTargets)
	{
		//console.log(game_math.getActorDistance(this, listOfTargets[i]) + " / " + this.getDiameter());
		//if (game_math.getActorDistance(this, listOfTargets[i]) <= this.getDiameter()/2 + listOfTargets[i].getDiameter()/2)
        if (game_math.getActorDistance(this, listOfTargets[i]) <= this.getDiameter())
		{
			//console.log("wormhole was fed a target");
			this._currentenemytargets.push(listOfTargets[i]);
		}
	}

    // Process our reaction to this set of targets now
    this.processControls(dt);
};

Wormhole.prototype.processControls = function(dt) {
    // Default Wormhole AI

	//if (this._currentenemytargets.length > 0) this.scale = 1.5;
	//else if (this.scale > 1.0) this.scale -= 0.001;

	for (var i in this._currentenemytargets)
		this.strikeTarget(this._currentenemytargets[i]);

    // ???
    // // Lifespan
    // this.lifespan -= dt;
    // if (this.lifespan <= 0) this.playDeathEvent();
};


Wormhole.prototype.strikeTarget = function(enemy) {
    if (enemy.actortype == "sun" || enemy.actortype == "planet" || enemy.actortype == "moon") return false;
	
	// Reverse projectile paths to make hitting enemies through them easier?
	//if (enemy.actortype == "projectile") {
		enemy.speed[0] = -enemy.speed[0];
		enemy.speed[1] = -enemy.speed[1];
	//}

    // Offset to prevent portal-loop on exit
    var offset = this.getDiameter() + 75;
    //var offset = this.getDiameter()/2 + 25 + enemy.getDiameter()/2;
    //console.log(offset);

    var angleofExit = game_math.getAngle(0, 0, enemy.speed[0], enemy.speed[1]);
    var exitOffsetPosX = Math.sin(angleofExit*game_math.TO_RADIANS) * offset;
    var exitOffsetPosY = Math.cos(angleofExit*game_math.TO_RADIANS) * offset;


    var exitPosX = this.exitX;
    var exitPosY = this.exitY;
    if (this.partner)
    {
        exitPosX = this.partner.pos[0];
        exitPosY = this.partner.pos[1];
    }

    enemy.pos[0] = exitPosX + exitOffsetPosX; //(Math.sin(this.direction*game_math.TO_RADIANS) * this.distance) + exitPosX;
    enemy.pos[1] = exitPosY + exitOffsetPosY; //(Math.cos(this.direction*game_math.TO_RADIANS) * this.distance) + exitPosY;

    var wormholeExitSprite = new game_sprite.Sprite('img/sprite/wormhole.png', [0, 0], [75, 75], 20, [0, 1, 2, 3, 4, 5, 6 ,7 ,8 ,9 ,10, 11, 12, 13, 14], 0, true);
    this.pushNewExplosion(wormholeExitSprite, [enemy.pos[0], enemy.pos[1]], [0, 0]);

    if (enemy.actortype != "projectile")
    {
        this.lifespan -= this.distance/100; // Wormholes will linger for a while, but lose some of their duration each time they are used.
        if (this.partner) this.partner.lifespan -= this.distance/100;
        //console.log("wormhole lifspan remaining: " + this.lifespan);
    }
};


// Wormhole.prototype.getCopy = function(shooter) {
    // var newWormhole = new Wormhole(this.pos, this.distance, this.lifespan);
    // if (this.hasOwnProperty('weapon')) newWormhole.weapon = this.weapon.getCopy(shooter);
    // return newWormhole;
// };



// ====== DEATH EVENT ======
Wormhole.prototype.playDeathEvent = function (instantdeath) {
    // Call this function just before deleting the object from the game
    // e.g.: missiles explode before dying

    if (this.partner) this.partner.killme = true;

    this.killme = true;
};
