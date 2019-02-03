
var game_sprite = require('../../lib/sprite.js');
var actor_mine = require('./Mine.js');
var game_math = require('../../lib/math_functions.js');

var actor_weapon = require('./Weapon.js'); // ???


if (typeof thisIsTheClient === "undefined")
{
    // INCLUDES ALL ???
    module.exports = {
        ContinuousMine: ContinuousMine,
    };
}
else
{
    window.ContinuousMine = ContinuousMine;
}



//===================== SPACESHIP PROTOTYPE ======================
function ContinuousMine(owner, sprite, explosionsprite, damage, lifespan, knockback, smart, idledelay, countdowntimer, inheritspeed, friendlyfire)
{
    actor_mine.Mine.call(this, owner, sprite, explosionsprite, damage, lifespan, knockback, smart, idledelay, countdowntimer, inheritspeed, friendlyfire); // call super constructor.
    this.fireexplosion = 0;
};
// ====== WORLD OBJECT ======
// subclass extends superclass
ContinuousMine.prototype = Object.create(actor_mine.Mine.prototype);
ContinuousMine.prototype.constructor = ContinuousMine;

// ====== GET AND SET ======
// ...

// ====== FUNCTIONS ======
ContinuousMine.prototype.strikeTarget = function(enemy) {
    if (enemy.actortype == "planet" || enemy.actortype == "moon") return false; // Will orbit planets/moons without striking them

    this.speed = [0, 0]; // lock in place while firing ???

    if (this.idledelay <= 0)
    {
        if (this.fireexplosion <= 0)
        {
            this.fireexplosion = 0.5; // Space out spawning of explosions by a manageable margin

            if (this.explosionsprite)
            {
                var newExplosion = this.getNewExplosion(this.explosionsprite.getCopy(), this.pos, this.speed);
                newExplosion.scale = (this.smart / newExplosion.getDiameter());
                this.pushObjToGameStateRef(newExplosion);

                if (game_math.getActorDistance(this, enemy) <= this.smart/2)
                {
                    enemy.modHealth(-this.damage, this.ownerActor);

                    //enemy.speed[0] *= 0.7;
                    //enemy.speed[1] *= 0.7;

                    this.lifespan -= 0.5;
                }
            }
        }


        if (this.knockback != 0) // Knockback weapon
        {
            var angleOfEnemy = game_math.getAngle(this.pos[0], this.pos[1], enemy.pos[0], enemy.pos[1]);

            var distanceMult = ((this.smart - game_math.getActorDistance(this, enemy)) / this.smart) * this.knockback; //(this.knockback * enemy.mass);

            if (this.knockback < 0 && game_math.getActorDistance(this, enemy) <= this.smart/3)
            {
                enemy.speed[0] *= 0.9; // Slow enemies pulled in by a negative knockback value so they don't just slingshot out the other side of the affected area.
                enemy.speed[1] *= 0.9;
            }
            else
            {
                enemy.speed[0] += Math.sin(angleOfEnemy*game_math.TO_RADIANS) * this.damage * enemy.getMass() * distanceMult;
                enemy.speed[1] += Math.cos(angleOfEnemy*game_math.TO_RADIANS) * this.damage * enemy.getMass() * distanceMult;
                //enemy.anglespeed += (game_math.getRandomArbitrary(-this.damage * 10, this.damage * enemy.getMass())) * distanceMult/10; // This was to nauseating
            }

        }

        //this.playDeathEvent();
    }
    else if (enemy.id != this.owner)
    {
        //if (this.explosionsprite) this.pushNewExplosion(this.explosionsprite.getCopy(), this.pos, this.speed);
        //this.playDeathEvent();

        this.idledelay = 0;
        this.countdowntimer = 0;
    }
};

ContinuousMine.prototype.getCopy = function(shooter) {
    if (this.explosionsprite)
        var newMine = new ContinuousMine(shooter, this.sprite.getCopy(), this.explosionsprite.getCopy(), this.damage, this.lifespan, this.knockback, this.smart, this.idledelay, this.countdowntimer, this.inheritspeed, this.friendlyfire);
    else
        var newMine = new ContinuousMine(shooter, this.sprite.getCopy(), false, this.damage, this.lifespan, this.knockback, this.smart, this.idledelay, this.countdowntimer, this.inheritspeed, this.friendlyfire);

    if (this.hasOwnProperty('weapon')) newMine.weapon = this.weapon.getCopy(shooter);
    return newMine;
};
