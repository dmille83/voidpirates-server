
//var world_object = require('./WorldObject.js');
var game_sprite = require('../../lib/sprite.js');
var actor_projectile = require('./Projectile.js');
var game_math = require('../../lib/math_functions.js');
var actor_weapon = require('./Weapon.js');


if (typeof thisIsTheClient === "undefined")
{
    // INCLUDES ALL ???
    module.exports = {
        Drone: Drone,
    };
}
else
{
    window.Drone = Drone;
}



//===================== SPACESHIP PROTOTYPE ======================
function Drone(owner, sprite, explosionsprite, damage, startspeed, lifespan, knockback, smart, maneuverability, accelleration, dumbfireaccelleration, inaccuracy, droneweapon)
{
    //world_object.WorldObject.call(this); // call super constructor.
    actor_projectile.Projectile.call(this, owner, sprite, explosionsprite, damage, startspeed, lifespan, knockback, smart, maneuverability, accelleration, dumbfireaccelleration, inaccuracy); // call super constructor.
    this.weapon = droneweapon;
    this.explosionondeath = true;

    this.isadrone = true;

    this.mass = 0;

    // Spawn an explosion (wormhole sprite) effect upon appearing in game world ("Let's make an entrance!")
    this.fireexplosion = 1;
    var wormholeExitSprite = new game_sprite.Sprite('img/sprite/wormhole.png', [0, 0], [75, 75], 20, [0, 1, 2, 3, 4, 5, 6 ,7 ,8 ,9 ,10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], 0, true);
    this.pushNewExplosion(wormholeExitSprite, this.pos, this.speed);
};
// ====== WORLD OBJECT ======
// subclass extends superclass
Drone.prototype = Object.create(actor_projectile.Projectile.prototype);
Drone.prototype.constructor = Drone;

// ====== GET AND SET ======
// Spaceship.prototype.getProjectile = function(shooter) {
//     return this.weapon.projectile.getCopy(shooter);
// };

// ====== FUNCTIONS ======
Drone.prototype.feedListOfTargets = function(listOfTargets, dt) {
    if (this.smart > 0) // If NOT smart (ie, a dumb bullet), do not acquire targets from the list
    {
        this._currentenemytarget = false;
        for(var i in listOfTargets)
        {
            // Drones defend their owner instead of seeking out targets from afar
            if (this.ownerActor && game_math.getActorDistance(this.ownerActor, listOfTargets[i]) <= this.smart)
            {
                if (!this._currentenemytarget || game_math.getActorDistance(this.ownerActor, listOfTargets[i]) < game_math.getActorDistance(this.ownerActor, this._currentenemytarget))
                    if (listOfTargets[i].id != this.owner && !listOfTargets[i].isdead)
                        this._currentenemytarget = listOfTargets[i];
            }
        }
    }

    // Process our reaction to this set of targets now
    this.processControls(dt);
};


Drone.prototype.processControls = function (dt)
{
    /*
    // Default projectile AI

    var retreatDistance = (this.weapon.projectile.startspeed * this.weapon.projectile.lifespan) - 50;//400;
    if (retreatDistance <= 75) retreatDistance = 100;
    if (retreatDistance > 500) retreatDistance = 500;

    var slowDownThreshold = 60;

    var currentTarget = false;
    if (this._currentenemytarget)
    {
        // Attack enemy taget
        currentTarget = this._currentenemytarget;
    }
    else
    {
        // Follow player if no enemy targets are nearby
        currentTarget = this.ownerActor;
        retreatDistance = 80;
        slowDownThreshold = 60;
    }


    if (currentTarget)
    {
        // Pick the target?
        var angleOfEnemy = game_math.getAngle(this.pos[0], this.pos[1], currentTarget.pos[0], currentTarget.pos[1]);

        // Point nose at nearest enemy (nearly impossible to avoid!)
        var curSpeed = game_math.getDistance(0, 0, this.speed[0], this.speed[1]);
        if (Math.abs(angleOfEnemy - this.angle) > 70)
        {
            // Perform a sharp swerve
            this.angle = game_math.rotateToFaceAngle(this.angle, angleOfEnemy, 5);
            this.speed[0] = Math.sin(this.angle*game_math.TO_RADIANS) * curSpeed;
            this.speed[1] = Math.cos(this.angle*game_math.TO_RADIANS) * curSpeed;


        }
        if (game_math.getActorDistance(this, currentTarget) < retreatDistance)
        {
            // Back away if too close
            this.angle = game_math.rotateToFaceAngle(this.angle, angleOfEnemy, 5);
            this.speed[0] -= Math.sin(this.angle*game_math.TO_RADIANS) * this.accelleration * dt;
            this.speed[1] -= Math.cos(this.angle*game_math.TO_RADIANS) * this.accelleration * dt;
        }
        else if (game_math.getActorDistance(this, currentTarget) < retreatDistance + slowDownThreshold)
        {
            // Slow down
            this.angle = angleOfEnemy;
            this.speed[0] *= (0.2) * dt;
            this.speed[1] *= (0.2) * dt;
        }
        else
        {
            // Perform a more gradual turn
            // Accellerate forward (in current direction its nose is pointed)
            this.speed[0] += Math.sin(angleOfEnemy*game_math.TO_RADIANS) * this.accelleration * dt;
            this.speed[1] += Math.cos(angleOfEnemy*game_math.TO_RADIANS) * this.accelleration * dt;

            // Reduce side-to-side drift while being propelled forward or back
            if (this.speed[0]/(Math.cos((angleOfEnemy)*game_math.TO_RADIANS)) < 0) this.speed[0] += Math.cos((this.angle)*game_math.TO_RADIANS) * this.accelleration * dt;
            else if (this.speed[0]/(Math.cos((angleOfEnemy)*game_math.TO_RADIANS)) > 0) this.speed[0] -= Math.cos((this.angle)*game_math.TO_RADIANS) * this.accelleration * dt;

            // ...Then point the nose towards where we are going
            this.angle = game_math.getAngle(this.pos[0], this.pos[1], (this.pos[0]+this.speed[0]), (this.pos[1]+this.speed[1]))
        }
    }

    if (this._currentenemytarget)
    {
        // Some missiles shoot even MORE bullets
        if (this.hasOwnProperty('weapon'))
        {
            //console.log('baby bullets!');
            if (!this.hasOwnProperty('id')) this.id = this.owner; // So its child bullets won't hurt us

            if (game_math.getActorDistance(this, this._currentenemytarget) <= retreatDistance + slowDownThreshold)
                this.weapon.fire(this);

            if (this.weapon.power <= this.weapon.powerdrain)
                this.playDeathEvent();

            //this.weapon.update(dt);
        }
    }
  	this.weapon.update(dt);
    */


    // Actor AI
    var retreatDistance = (this.weapon.projectile.startspeed * this.weapon.projectile.lifespan) - 70;//400;
    if (!retreatDistance || retreatDistance <= 75) retreatDistance = 100;
    if (retreatDistance > 250) retreatDistance = 250;
    var slowDownThreshold = 100;
    var myAccelleration = (this.accelleration * dt);


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
      retreatDistance = 150;
      slowDownThreshold = 100;

      //console.log("target 2");
    }
    else //if (!currentTarget)
    {
      //console.log("target 3");
      if (this.speed[0] > 0) this.speed[0] -= this.accelleration * dt;
      if (this.speed[0] < 0) this.speed[0] += this.accelleration * dt;
      if (this.speed[1] > 0) this.speed[1] -= this.accelleration * dt;
      if (this.speed[1] < 0) this.speed[1] += this.accelleration * dt;
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
          this.weapon.fire(this, this.getScore());

      // Swap weapons when drained (if it will actually help to do so)
      if (this.weapon.power <= this.weapon.powerdrain)
      {
        this.playDeathEvent();
      }
    }
    this.weapon.update(dt);


  // slightly delayed reaction times generate some "artificial stupidity"
  var thisActor = this;
  setTimeout(function() {

    // Rotate left or right
    thisActor.angle = game_math.rotateToFaceAngle(thisActor.angle, targetDirection, thisActor.maneuverability*dt);


    // Decellerate if necessary, otherwise advance or retreat
    if (targetDistance >= retreatDistance && targetDistance <= retreatDistance+slowDownThreshold)
    {
      // if (currentTarget == thisActor.ownerActor)
      // {
      //   // this bit helps them actually STOP when they are going home
      //   thisActor.speed[0] *= 0.6;
      //   thisActor.speed[1] *= 0.6;
      //   return;
      // }

      if (thisActor.speed[0] > 0) thisActor.speed[0] -= thisActor.accelleration * dt;
      if (thisActor.speed[0] < 0) thisActor.speed[0] += thisActor.accelleration * dt;
      if (thisActor.speed[1] > 0) thisActor.speed[1] -= thisActor.accelleration * dt;
      if (thisActor.speed[1] < 0) thisActor.speed[1] += thisActor.accelleration * dt;
      return;
    }
    else if (targetDistance < retreatDistance) {
      myAccelleration *= -1;
    }

    // Now change speed according to the calculations we just made
    var maxSpeed = 400;
    if (thisX < targetX)
    {
      if (Math.abs(thisActor.speed[0] + myAccelleration) < maxSpeed)
        thisActor.speed[0] += myAccelleration;
    }
    else
    {
      if (Math.abs(thisActor.speed[0] - myAccelleration) < maxSpeed)
        thisActor.speed[0] -= myAccelleration;
    }

    if (thisY < targetY)
    {
      if (Math.abs(thisActor.speed[1] + myAccelleration) < maxSpeed)
        thisActor.speed[1] += myAccelleration;
    }
    else
    {
      if (Math.abs(thisActor.speed[1] - myAccelleration) < maxSpeed) thisActor.speed[1] -= myAccelleration;
    }

  }, 200); // game_math.getRandomInt(0, 500)
};


Drone.prototype.strikeTarget = function(enemy) {
    if (enemy.actortype == "planet" || enemy.actortype == "moon") return false; // Will orbit planets/moons without striking them
    if (enemy.actortype == "player") return false;

    enemy.modHealth(-this.damage, this.ownerActor);

    if (this.knockback) // Knockback weapon
    {
        enemy.speed[0] += this.speed[0]/4;
        enemy.speed[1] += this.speed[1]/4;
        if (game_math.getRandomInt(0, 10) < 2)
            enemy.anglespeed += this.speed[0]/2 + this.speed[0]/2;
    }

    this.playDeathEvent();
};


Drone.prototype.addPoint = function(pointsEarned)
{
    this.ownerActor.addPoint(pointsEarned);
}


Drone.prototype.getCopy = function(shooter) {
    var newDrone = new Drone(shooter, this.sprite.getCopy(), this.explosionsprite.getCopy(), this.damage, this.startspeed, this.lifespan, this.knockback, this.smart, this.maneuverability, this.accelleration, this.dumbfireaccelleration);
    if (this.hasOwnProperty('weapon')) newDrone.weapon = this.weapon.getCopy(shooter);
    return newDrone;
};


// ====== DEATH EVENT ======
Drone.prototype.playDeathEvent = function (instantdeath) {
    // Call this function just before deleting the object from the game
    // e.g.: missiles explode before dying

    if (this.explosionsprite) this.pushNewExplosion(this.explosionsprite.getCopy(), this.pos, this.speed);

    this.killme = true;
};
