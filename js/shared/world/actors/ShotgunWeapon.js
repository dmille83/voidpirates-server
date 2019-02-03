
var actor_weapon = require('./Weapon.js');
var world_object = require('./Projectile.js');
var game_math = require('../../lib/math_functions.js');



if (typeof thisIsTheClient === "undefined")
{
    // INCLUDES ALL ???
    module.exports = {
        ShotgunWeapon: ShotgunWeapon,
    };
}
else
{
    window.ShotgunWeapon = ShotgunWeapon;
}



//===================== ShotgunWeapon PROTOTYPE ======================
function ShotgunWeapon(projectile, rate, maxpower, powerdrain, powerregen, maxpellets, minpellets)
{
    actor_weapon.Weapon.call(this, projectile, rate, maxpower, powerdrain, powerregen); // call super constructor.

    this.maxpellets = maxpellets;
    this.minpellets = minpellets;
}
// ====== WORLD OBJECT ======
//ShotgunWeapon.prototype = new world_object.WorldObject();
ShotgunWeapon.prototype = Object.create(actor_weapon.Weapon.prototype);
ShotgunWeapon.prototype.constructor = ShotgunWeapon;


// ====== FUNCTIONS ======
ShotgunWeapon.prototype.fire = function(shooter) {
    if (this.timeout <= 0)
    {
        if (this.power >= this.powerdrain) { // ??? BREAKS DRONES ???
            this.timeout = this.rate;
            this.power -= this.powerdrain;

            //this.isfired = true;
            var bulletCount = game_math.getRandomInt(this.minpellets, this.maxpellets);
            for (var i = 0; i < bulletCount; i++)
                this.pushObjToGameStateRef(this.projectile.getCopy(shooter));
        }
    }
};

ShotgunWeapon.prototype.getCopy = function(shooter) {
    var newProjectile = this.projectile.getCopy(shooter);
    return new ShotgunWeapon(newProjectile, this.rate, this.maxpower, this.powerdrain, this.powerregen, this.maxpellets, this.minpellets);
};
