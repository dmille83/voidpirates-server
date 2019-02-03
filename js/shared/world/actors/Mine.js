
var game_sprite = require('../../lib/sprite.js');
var world_object = require('./WorldObject.js');
var game_math = require('../../lib/math_functions.js');

var actor_weapon = require('./Weapon.js'); // ???


if (typeof thisIsTheClient === "undefined")
{
    // INCLUDES ALL ???
    module.exports = {
        Mine: Mine,
    };
}
else
{
    window.Mine = Mine;
}



//===================== SPACESHIP PROTOTYPE ======================
function Mine(owner, sprite, explosionsprite, damage, lifespan, knockback, smart, idledelay, countdowntimer, inheritspeed, friendlyfire)
{
    world_object.WorldObject.call(this); // call super constructor.
    //actor_projectile.Projectile.call(this); // call super constructor.

    // ====== CONSTRUCTOR ======
    if (owner) this.ownerActor = owner;
    else this.ownerActor = new world_object.WorldObject();

    if (owner && owner.hasOwnProperty('id')) this.owner = owner.id;
    else this.owner = false;

    this.actortype = 'projectile';
    this.sprite = sprite;
    this.explosionsprite = explosionsprite;
    this.damage = damage;
    this.lifespan = lifespan + idledelay + countdowntimer;
    this.knockback = knockback;
    this.explosionondeath = true;
    this.smart = smart;
    this.idledelay = idledelay;
    this.countdowntimer = countdowntimer;
    this.inheritspeed = inheritspeed;
    this.friendlyfire = friendlyfire;

    // Default Mine attributes?
    this.mass = 10;

    this.isamine = true;

    // Positioning and speed relative to shooter's sprite
    var offsetFromShooter = -45; //30;
    this.pos = [(this.ownerActor.pos[0] + Math.sin(this.ownerActor.angle * game_math.TO_RADIANS) * offsetFromShooter), (this.ownerActor.pos[1] + Math.cos(-this.ownerActor.angle * game_math.TO_RADIANS) * offsetFromShooter)];
    this.angle = game_math.getRandomArbitrary(0.0, 360.0); //this.ownerActor.angle;
    if (this.inheritspeed) this.speed = [this.ownerActor.speed[0], this.ownerActor.speed[1]];
    else this.speed = [0, 0];


    this.triggerparticles = false; // for client-side particle effects


    // Variables used by the Mine's AI (if it has one)
    this._currentenemytargets = [];
};
// ====== WORLD OBJECT ======
// subclass extends superclass
Mine.prototype = Object.create(world_object.WorldObject.prototype);
Mine.prototype.constructor = Mine;

// ====== GET AND SET ======
// ...

// ====== FUNCTIONS ======
Mine.prototype.update = function (dt, worldSize)
{
    //this.getSprite().update(dt);

    //this.processControls(dt);

    this.updatePosition(dt, worldSize);
};


Mine.prototype.feedListOfTargets = function(listOfTargets, dt) {
    if (this.smart > 0) // If NOT smart (ie, a dumb bullet), do not acquire targets from the list
    {
        this._currentenemytargets = [];
        for(var i in listOfTargets)
        {
            if (game_math.getActorDistance(this, listOfTargets[i]) <= this.smart)
            {
                if ((listOfTargets[i].id != this.owner || this.friendlyfire) && !listOfTargets[i].isdead)
                {
					this._currentenemytargets.push(listOfTargets[i]);
				}
            }
        }
    }

    // Process our reaction to this set of targets now
    this.processControls(dt);
};

Mine.prototype.processControls = function(dt) {
    // Default Mine AI

    // Only start detonation/idle behavior after a delay
    if (this.idledelay > 0)
    {
		this.getSprite()._index = 1; // Lights on solid until idledelay ends and the Mine is armed

        this.idledelay -= dt;
        return;
    }

    if (this._currentenemytargets.length > 0)
    {
        this.getSprite().update(dt);
        this.countdowntimer -= dt;
        if (this.countdowntimer <= 0)
        {
            for (var i in this._currentenemytargets)
                this.strikeTarget(this._currentenemytargets[i]);

            //this.playDeathEvent();
        }
    }
    else this.getSprite()._index = 0;


    // ???
    // // Lifespan
    // this.lifespan -= dt;
    // if (this.lifespan <= 0) this.playDeathEvent();
};


Mine.prototype.strikeTarget = function(enemy) {
	if (enemy.actortype == "planet" || enemy.actortype == "moon") return false; // Will orbit planets/moons without striking them

    if (this.idledelay <= 0)
    {
        enemy.modHealth(-this.damage, this.ownerActor);

        if (this.explosionsprite)
        {
            var newExplosion = this.getNewExplosion(this.explosionsprite.getCopy(), this.pos, this.speed);
            newExplosion.scale = (this.smart / newExplosion.getDiameter());
            this.pushObjToGameStateRef(newExplosion);
        }


        if (this.knockback != 0) // Knockback weapon
        {
            var angleOfEnemy = game_math.getAngle(this.pos[0], this.pos[1], enemy.pos[0], enemy.pos[1]);

            var distanceMult = 1;
            if (this.smart > 0) distanceMult = ((this.smart - game_math.getActorDistance(this, enemy)) / this.smart) * (this.knockback / enemy.mass);

            // Caps
            if (distanceMult > 1) distanceMult = 1;
            if (distanceMult < 0.1) distanceMult = 0.1;

            enemy.speed[0] += Math.sin(angleOfEnemy*game_math.TO_RADIANS) * this.knockback * enemy.getMass() * distanceMult;
            enemy.speed[1] += Math.cos(angleOfEnemy*game_math.TO_RADIANS) * this.knockback * enemy.getMass() * distanceMult;
            //enemy.anglespeed += (game_math.getRandomArbitrary(-this.damage * 10, this.damage * enemy.getMass())) * distanceMult/10;

			//console.log("force: " + (this.damage * enemy.getMass() * distanceMult));
			//console.log("damage: " + this.damage);
        }

		this.playDeathEvent();
    }
	else if (enemy.id != this.owner)
	{
        if (this.explosionsprite) this.pushNewExplosion(this.explosionsprite.getCopy(), this.pos, this.speed);
		this.playDeathEvent();
	}
};


Mine.prototype.getCopy = function(shooter) {
    if (this.explosionsprite)
        var newMine = new Mine(shooter, this.sprite.getCopy(), this.explosionsprite.getCopy(), this.damage, this.lifespan, this.knockback, this.smart, this.idledelay, this.countdowntimer, this.inheritspeed, this.friendlyfire);
    else
        var newMine = new Mine(shooter, this.sprite.getCopy(), false, this.damage, this.lifespan, this.knockback, this.smart, this.idledelay, this.countdowntimer, this.inheritspeed, this.friendlyfire);

    if (this.hasOwnProperty('weapon')) newMine.weapon = this.weapon.getCopy(shooter);
    return newMine;
};


// ====== DEATH EVENT ======
Mine.prototype.playDeathEvent = function (instantdeath)
{
    // Call this function just before deleting the object from the game
    // e.g.: missiles explode before dying

    if (this.explosionondeath)
    {

        //if (this.fireexplosion <= 0) {
        //	this.fireexplosion = 1;
            //var	explosionSprite = new game_sprite.Sprite('img/sprite/explosion.png', [0, 0], [128, 128], 50, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 0, true);
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
    else
    {
        // spawn tiny explosion?
        // ...or just fade out?
    }

    this.killme = true;
};
