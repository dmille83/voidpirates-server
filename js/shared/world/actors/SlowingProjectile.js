
var game_sprite = require('../../lib/sprite.js');
var actor_projectile = require('./Projectile.js');
var game_math = require('../../lib/math_functions.js');



// ??? temp!
var actor_weapon = require('./Weapon.js');


if (typeof thisIsTheClient === "undefined")
{
    // INCLUDES ALL ???
    module.exports = {
        SlowingProjectile: SlowingProjectile,
    };
}
else
{
    window.SlowingProjectile = SlowingProjectile;
}



//===================== SPACESHIP PROTOTYPE ======================
function SlowingProjectile(owner, sprite, explosionsprite, damage, startspeed, lifespan, knockback, smart, maneuverability, accelleration, dumbfireaccelleration, inaccuracy, slowdown)
{
    actor_projectile.Projectile.call(this, owner, sprite, explosionsprite, damage, startspeed, lifespan, knockback, smart, maneuverability, accelleration, dumbfireaccelleration, inaccuracy); // call super constructor.
    this.slowdown = slowdown;

    //this.triggerparticles = false; // for client-side particle effects
};
// ====== WORLD OBJECT ======
// subclass extends superclass
SlowingProjectile.prototype = Object.create(actor_projectile.Projectile.prototype);
SlowingProjectile.prototype.constructor = SlowingProjectile;

// ====== GET AND SET ======
// ...

// ====== FUNCTIONS ======
SlowingProjectile.prototype.feedListOfTargets = function(listOfTargets, dt) {
    if (this.smart > 0) // If NOT smart (ie, a dumb bullet), do not acquire targets from the list
    {
        this._currentenemytarget = false;
        for(var i in listOfTargets)
        {
            if (game_math.getActorDistance(this, listOfTargets[i]) <= this.smart)
            {
                if (!this._currentenemytarget || game_math.getActorDistance(this, listOfTargets[i]) < game_math.getActorDistance(this, this._currentenemytarget))
                    //if (listOfTargets[i].actortype != "projectile")
                        if (listOfTargets[i].id != this.owner) // && !listOfTargets[i].isdead) // THIS ONE WORKS ON DEAD STUFF TOO!
                            this._currentenemytarget = listOfTargets[i];
            }
        }
    }

    // Process our reaction to this set of targets now
    this.processControls(dt);
};

SlowingProjectile.prototype.strikeTarget = function(enemy) {
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
        //if (game_math.getRandomInt(0, 10) < 2)
        //    enemy.anglespeed += this.speed[0] * this.knockback/2 + this.speed[0] * this.knockback/2;

        if (this.knockback < 0)
        {
            enemy.speed[0] *= this.slowdown * (game_math.getActorDistance(enemy, this.ownerActor) / 500);
            enemy.speed[1] *= this.slowdown * (game_math.getActorDistance(enemy, this.ownerActor) / 500);
            //enemy.anglespeed *= this.slowdown;
        }
    }

    //var	explosionSprite = new game_sprite.Sprite('img/sprite/explosion.png', [0, 0], [128, 128], 50, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 0, true);
    if (this.explosionsprite) this.pushNewExplosion(this.explosionsprite.getCopy(), this.pos, this.speed);

    this.playDeathEvent();
};

SlowingProjectile.prototype.getCopy = function(shooter) {
    if (this.explosionsprite)
        var newSlowingProjectile = new SlowingProjectile(shooter, this.sprite.getCopy(), this.explosionsprite.getCopy(), this.damage, this.startspeed, this.lifespan, this.knockback, this.smart, this.maneuverability, this.accelleration, this.dumbfireaccelleration, this.inaccuracy, this.slowdown);
    else
        var newSlowingProjectile = new SlowingProjectile(shooter, this.sprite.getCopy(), false, this.damage, this.startspeed, this.lifespan, this.knockback, this.smart, this.maneuverability, this.accelleration, this.dumbfireaccelleration, this.inaccuracy, this.slowdown);

    if (this.hasOwnProperty('weapon')) newSlowingProjectile.weapon = this.weapon.getCopy(shooter);
    return newSlowingProjectile;
};
