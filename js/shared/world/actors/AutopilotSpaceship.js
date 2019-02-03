
//var world_object = require('./WorldObject.js');
var game_sprite = require('../../lib/sprite.js');
var actor_spaceship = require('./Spaceship.js');
var game_math = require('../../lib/math_functions.js');


if (typeof thisIsTheClient === "undefined")
{
    // INCLUDES ALL ???
    module.exports = {
        AutopilotSpaceship: AutopilotSpaceship,
    };
}
else
{
    window.AutopilotSpaceship = AutopilotSpaceship;
}



//===================== SPACESHIP PROTOTYPE ======================
function AutopilotSpaceship(ownerActor, ownerID, weapon, weapon2, engine, armor, pos, angle, smart)
{
    actor_spaceship.Spaceship.call(this, ownerID, weapon, weapon2, engine, armor, pos, angle); // call super constructor.
    this.ownerActor = ownerActor;
    this.smart = smart;

    this.suntoavoid = false;
};
// ====== WORLD OBJECT ======
// subclass extends superclass
AutopilotSpaceship.prototype = Object.create(actor_spaceship.Spaceship.prototype);
AutopilotSpaceship.prototype.constructor = AutopilotSpaceship;

// ====== GET AND SET ======
//...


// ====== FUNCTIONS ======
AutopilotSpaceship.prototype.feedListOfTargets = function(listOfTargets, dt) {

    //console.log(this._currentenemytarget);
    if (this.lastattackerid && this.lastattackerid.actortype == "player") this._currentenemytarget = this.lastattackerid; // Attack our last aggressor if we have nothing better to do (also keeps them from instantly forgetting their target if they and the target loop around the world even a SINGLE frame out-of-sync)
    if (this._currentenemytarget && (game_math.getActorDistance(this, this._currentenemytarget) > 1000 || this._currentenemytarget.isdead))
    {
        this._currentenemytarget = false;
    }

    this._currentloottarget = false; // clear current looting target

    for(var i in listOfTargets)
    {
        // AutopilotSpaceships defend their planet/moon instead of seeking out targets from afar
        if (this.ownerActor && this.ownerActor.health > 0 && !this.ownerActor.killme)
        {
            //if (game_math.getActorDistance(this.ownerActor, listOfTargets[i]) <= this.smart) // target enemies near the defended planet
            if (game_math.getActorDistance(this.ownerActor, listOfTargets[i]) <= this.smart || game_math.getActorDistance(this, listOfTargets[i]) < this.smart/5) // target enemies near the defended planet or REALLY close to this defending actor
                if (!this._currentenemytarget || game_math.getActorDistance(this.ownerActor, listOfTargets[i]) < game_math.getActorDistance(this.ownerActor, this._currentenemytarget)) // prioritize closer targets
                    if (listOfTargets[i].id != this.id && !listOfTargets[i].isdead) // do not attack dead targets, or targets that are part of the same "faction"
                        this._currentenemytarget = listOfTargets[i];
        }
        else
        {
            // If our boss dies, we go freelance!
            //this.smart = 1000; // ???
            if (!this._currentenemytarget || game_math.getActorDistance(this, listOfTargets[i]) < game_math.getActorDistance(this, this._currentenemytarget))
                if (listOfTargets[i].id != this.id && !listOfTargets[i].isdead)
                    this._currentenemytarget = listOfTargets[i];
        }






        if (game_math.getActorDistance(this, listOfTargets[i]) <= 150) // 150 is the looting radius on both client and server sides
        {
            if (!this._currentloottarget || game_math.getActorDistance(this, listOfTargets[i]) < game_math.getActorDistance(this, this._currentloottarget))
                if (listOfTargets[i].id != this.id && listOfTargets[i].isdead)
                    this._currentloottarget = listOfTargets[i];
        }
        // Then use a keypress to loot a slot from their stuff!

    }
    //console.log(this._currentenemytarget);




    // AI can loot dead enemies
    if (this._currentloottarget && this._lootsteptimer <= 0 && this.getHealth() > 0)
    {
        // Swap my weapon1
        if (this._currentloottarget.getDamage(this.getScore()) > this.getDamage(this.getScore()))
        {
            // Loot weapon from this._currentloottarget
            var myOldWeapon = this.weapon.getCopy(this);
            this.weapon = this._currentloottarget.weapon.getCopy(this);
            this._currentloottarget.weapon = myOldWeapon;
            this._lootsteptimer = 0.5;
            //console.log("AI loot: weapon1 <-> weapon1");
        }
        if (this._currentloottarget.getDamage2(this.getScore()) > this.getDamage(this.getScore()))
        {
            // Loot weapon2 from this._currentloottarget
            var myOldWeapon = this.weapon.getCopy(this);
            this.weapon = this._currentloottarget.weapon2.getCopy(this);
            this._currentloottarget.weapon2 = myOldWeapon;
            this._lootsteptimer = 0.5;
            //console.log("AI loot: weapon2 <-> weapon1");
        }

        // Swap my weapon2
        if (this._currentloottarget.getDamage(this.getScore()) > this.getDamage2(this.getScore()))
        {
            var tempWeapon = this.weapon;
            this.weapon = this.weapon2;
            this.weapon2 = tempWeapon;

            // Loot weapon from this._currentloottarget
            var myOldWeapon = this.weapon.getCopy(this);
            this.weapon = this._currentloottarget.weapon.getCopy(this);
            this._currentloottarget.weapon = myOldWeapon;
            this._lootsteptimer = 0.5;

            //console.log("AI loot: weapon1 <-> weapon2");
        }
        if (this._currentloottarget.getDamage2(this.getScore()) > this.getDamage2(this.getScore()))
        {
            var tempWeapon = this.weapon;
            this.weapon = this.weapon2;
            this.weapon2 = tempWeapon;

            // Loot weapon2 from this._currentloottarget
            var myOldWeapon = this.weapon.getCopy(this);
            this.weapon = this._currentloottarget.weapon2.getCopy(this);
            this._currentloottarget.weapon2 = myOldWeapon;
            this._lootsteptimer = 0.5;

            //console.log("AI loot: weapon2 <-> weapon2");
        }

        // Swap my armor/engine
        if (this._currentloottarget.getMaxHealth(this.getScore()) > this.getMaxHealth(this.getScore()))
        {
            // Loot armor from this._currentloottarget
            var myOldArmor = this.armor.getCopy();
            this.armor = this._currentloottarget.armor.getCopy();
            this._currentloottarget.armor = myOldArmor;
            this._lootsteptimer = 0.5;

            // Loot engine from this._currentloottarget
            var myOldEngine = this.engine.getCopy()
            this.engine = this._currentloottarget.engine.getCopy();
            this._currentloottarget.engine = myOldEngine;
            this._lootsteptimer = 0.5;
				
				this._currentloottarget.modHealth(-(this._currentloottarget.getHealth()), false);

            //console.log("AI loot: armor/engine <-> armor/engine");
        }
    }


};


AutopilotSpaceship.prototype.processControls = function (dt)
{
    dt *= 0.3; // Slow down AI ???

    // Actor AI
    var retreatDistance = (this.weapon.projectile.startspeed * this.weapon.projectile.lifespan) - 70;//400;
    if (!retreatDistance || retreatDistance <= 75) retreatDistance = 100;
    if (retreatDistance > 250) retreatDistance = 250;
    var slowDownThreshold = 100;
    var myAccelleration = (this.engine.accelleration * dt);


    // Pick ONE target to pursue
    var currentTarget = false;
    if (this.suntoavoid && game_math.getActorDistance(this, this.suntoavoid) <= 1800)
    {
        currentTarget = this.suntoavoid;
        retreatDistance = 1800;
        slowDownThreshold = 200;
    }
    else if (this._currentenemytarget)
    {
        // Attack enemy target
        currentTarget = this._currentenemytarget;

        //console.log("target 1");
    }
    else if (this.ownerActor && this.ownerActor.health > 0 && !this.ownerActor.killme)
    {
        // Follow owneractor if no enemy targets are nearby
        currentTarget = this.ownerActor;
        retreatDistance = 200;
        slowDownThreshold = 200;

        //console.log("target 2");
    }
    else //if (!currentTarget)
    {
        //console.log("target 3");
        if (this.speed[0] > 0) this.speed[0] -= this.engine.accelleration * dt;
        if (this.speed[0] < 0) this.speed[0] += this.engine.accelleration * dt;
        if (this.speed[1] > 0) this.speed[1] -= this.engine.accelleration * dt;
        if (this.speed[1] < 0) this.speed[1] += this.engine.accelleration * dt;
        return 0;
    }


    // Get data about target trajectory
    var targetX = currentTarget.pos[0] + currentTarget.speed[0];
    var targetY = currentTarget.pos[1] + currentTarget.speed[1];
    var thisX = this.pos[0] + this.speed[0];
    var thisY = this.pos[1] + this.speed[1];
    var targetDistance = game_math.getDistance(thisX, thisY, targetX, targetY);
    var targetDirection = game_math.getAngle(thisX, thisY, targetX, targetY);


    // Fire weapons when it is *sane* to do so
    if (this._currentenemytarget && this._currentenemytarget == currentTarget)
    {
        if (!this.hasOwnProperty('id')) this.id = this.owner; // So its child bullets won't hurt us

        var firingAngle = this.weapon.projectile.inaccuracy;
        if (!firingAngle || firingAngle < 15) firingAngle = 15;
        if (targetDistance <= retreatDistance + slowDownThreshold)
            if (Math.abs(game_math.getActorAngleOffset(this, this._currentenemytarget)) <= firingAngle)
			{
                this.weapon.fire(this, this.getScore());
				//this.weapon2.fire(this, this.getScore()); // all the AI firing one weapon at a time is chaotic enough already
			}

        // Swap weapons when drained (if it will actually help to do so)
        if (this.weapon.power <= this.weapon.powerdrain || this.weapon.timeout > 3.0)
		//if (this.weapon.power <= this.weapon.powerdrain || this.weapon.timeout > 0.1)  // all the AI firing one weapon at a time is chaotic enough already
        {
            if (this.weapon2.power > this.weapon2.powerdrain)
            {
                var tempWeapon = this.weapon;
                this.weapon = this.weapon2;
                this.weapon2 = tempWeapon;
            }
        }
    }


    // slightly delayed reaction times generate some "artificial stupidity"
    var thisActor = this;
    setTimeout(function() {

        // Check if engines are overheating
        if (thisActor.engine.fuel <= 0)
        {
            //console.log("An AI ran out of fuel! Haha!");
            thisActor.modHealth(-5 * dt);
            return 0;
        }


        // Rotate left or right
        if (game_math.getActorAngleOffset(thisActor, currentTarget) > 35)
        {
            // Fire engines (mostly for visual effect)
            thisActor.engine.fireEngine(3, thisActor.getScore()); // left engine
        }
        else if (game_math.getActorAngleOffset(thisActor, currentTarget) < -35)
        {
            // Fire engines (mostly for visual effect)
            thisActor.engine.fireEngine(1, thisActor.getScore()); // right engine
        }
        thisActor.angle = game_math.rotateToFaceAngle(thisActor.angle, targetDirection, thisActor.engine.anglechangespeed*dt);


        // Decellerate if necessary, otherwise advance or retreat
        if (targetDistance >= retreatDistance && targetDistance <= retreatDistance+slowDownThreshold)
        {
            if (currentTarget == thisActor.ownerActor)
            {
                // this bit helps them actually STOP when they are going home
                thisActor.speed[0] *= 0.6;
                thisActor.speed[1] *= 0.6;
                return;
            }

            if (thisActor.speed[0] > 0) thisActor.speed[0] -= thisActor.engine.accelleration * dt;
            if (thisActor.speed[0] < 0) thisActor.speed[0] += thisActor.engine.accelleration * dt;
            if (thisActor.speed[1] > 0) thisActor.speed[1] -= thisActor.engine.accelleration * dt;
            if (thisActor.speed[1] < 0) thisActor.speed[1] += thisActor.engine.accelleration * dt;
            return;
        }
        else if (targetDistance < retreatDistance) {
            myAccelleration *= -1;

            // Fire engines (mostly for visual effect)
            thisActor.engine.fireEngine(2, thisActor.getScore()); // front engine
        }
        else
        {
            // Fire engines (mostly for visual effect)
            thisActor.engine.fireEngine(0, thisActor.getScore()); // back engine
        }


        // Now change speed according to the calculations we just made
        if (thisX < targetX)
        {
            if (Math.abs(thisActor.speed[0] + myAccelleration) < thisActor.engine.maxspeed)
                thisActor.speed[0] += myAccelleration;
        }
        else
        {
            if (Math.abs(thisActor.speed[0] - myAccelleration) < thisActor.engine.maxspeed)
                thisActor.speed[0] -= myAccelleration;
        }

        if (thisY < targetY)
        {
            if (Math.abs(thisActor.speed[1] + myAccelleration) < thisActor.engine.maxspeed)
                thisActor.speed[1] += myAccelleration;
        }
        else
        {
            if (Math.abs(thisActor.speed[1] - myAccelleration) < thisActor.engine.maxspeed)
                thisActor.speed[1] -= myAccelleration;
        }


        // Fire engines (mostly for visual effect)
        //thisActor.engine.fireEngine(0, thisActor.getScore()); // back engine
        //thisActor.engine.fireEngine(1, thisActor.getScore()); // right engine
        //thisActor.engine.fireEngine(2, thisActor.getScore()); // front engine
        //thisActor.engine.fireEngine(3, thisActor.getScore()); // left engine

    }, 200); // game_math.getRandomInt(0, 500)

};


/*
AutopilotSpaceship.prototype.modHealthAIprocessing = function(hpDiff, damageSource) {
    if (damageSource && hpDiff < 0) {
        this.lastattacktimeout = 12.0;
        this.lastattackerid = damageSource;

        if (damageSource.actortype == "player")
            this._currentenemytarget = damageSource; // Attack last attacker
    }
};
*/

/*
AutopilotSpaceship.prototype.modHealth = function(hpDiff, damageSource) {
    if (this.isdead == false)
    {
        if (hpDiff < 0)
        {
            if (this.fireexplosion <= 0) {
                this.fireexplosion = 1;
                var	explosionSprite = new game_sprite.Sprite('img/sprite/explosion.png', [0, 0], [128, 128], 50, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 0, true);
                this.pushNewExplosion(explosionSprite, this.pos, this.speed);
            }
        }

        if (this.armor.health + hpDiff > this.armor.maxhealth)
            this.armor.health = this.armor.maxhealth;
        else
            this.armor.health += hpDiff;

        if (damageSource && hpDiff < 0) {
            this.lastattacktimeout = 12.0;
            this.lastattackerid = damageSource;

            if (damageSource.actortype == "player")
                this._currentenemytarget = damageSource; // Attack last attacker
        }


        if (this.armor.health <= 0 && !this.killme)
        {
            this.playDeathEvent();
        }
    }
};
*/
