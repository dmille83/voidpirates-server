
var actor_weapon = require('./Weapon.js');
var world_object = require('./Projectile.js');
var game_math = require('../../lib/math_functions.js');



if (typeof thisIsTheClient === "undefined")
{
    // INCLUDES ALL ???
    module.exports = {
        SelfTargetingWeapon: SelfTargetingWeapon,
    };
}
else
{
    window.SelfTargetingWeapon = SelfTargetingWeapon;
}



//===================== SelfTargetingWeapon PROTOTYPE ======================
function SelfTargetingWeapon(projectile, rate, maxpower, powerdrain, powerregen)
{
    actor_weapon.Weapon.call(this, projectile, rate, maxpower, powerdrain, powerregen); // call super constructor.
}
// ====== WORLD OBJECT ======
//SelfTargetingWeapon.prototype = new world_object.WorldObject();
SelfTargetingWeapon.prototype = Object.create(actor_weapon.Weapon.prototype);
SelfTargetingWeapon.prototype.constructor = SelfTargetingWeapon;


// ====== FUNCTIONS ======
SelfTargetingWeapon.prototype.fire = function(shooter) {
    if (this.timeout <= 0)
    {
        if (this.power >= this.powerdrain) { // ??? BREAKS DRONES ???
            this.timeout = this.rate;
            this.power -= this.powerdrain;

            var myBullet = this.projectile.getCopy(shooter);
            if (myBullet.hasOwnProperty("wormhole_numberofjumps")) {
                myBullet.wormhole_numberofjumps = 1; // For "Displacement Drive"
                myBullet.damage = 0; // Self-Targeting Wormhole weapons do not harm the shooter
            }
            myBullet.strikeTarget(shooter);
            //this.pushObjToGameStateRef(myBullet);
        }
    }
};

SelfTargetingWeapon.prototype.getCopy = function(shooter) {
    var newProjectile = this.projectile.getCopy(shooter);
    return new SelfTargetingWeapon(newProjectile, this.rate, this.maxpower, this.powerdrain, this.powerregen);
};
