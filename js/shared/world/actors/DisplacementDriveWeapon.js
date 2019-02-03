
var actor_weapon = require('./Weapon.js');
var world_object = require('./Projectile.js');
var game_math = require('../../lib/math_functions.js');
var game_sprite = require('../../lib/sprite.js');


if (typeof thisIsTheClient === "undefined")
{
    // INCLUDES ALL ???
    module.exports = {
        DisplacementDriveWeapon: DisplacementDriveWeapon,
    };
}
else
{
    window.DisplacementDriveWeapon = DisplacementDriveWeapon;
}



//===================== DisplacementDriveWeapon PROTOTYPE ======================
function DisplacementDriveWeapon(projectile, rate, maxpower, powerdrain, powerregen, distance)
{
    actor_weapon.Weapon.call(this, projectile, rate, maxpower, powerdrain, powerregen); // call super constructor.

    this.distance = distance;
    this.wormhole_numberofjumps = 1;
}
// ====== WORLD OBJECT ======
//DisplacementDriveWeapon.prototype = new world_object.WorldObject();
DisplacementDriveWeapon.prototype = Object.create(actor_weapon.Weapon.prototype);
DisplacementDriveWeapon.prototype.constructor = DisplacementDriveWeapon;


// ====== FUNCTIONS ======
DisplacementDriveWeapon.prototype.fire = function(shooter) {
    if (this.timeout <= 0)
    {
        if (this.power >= this.powerdrain) { // ??? BREAKS DRONES ???
            this.timeout = this.rate;
            this.power -= this.powerdrain;

            // var myBullet = this.projectile.getCopy(shooter);
            // if (myBullet.hasOwnProperty("wormhole_numberofjumps")) myBullet.wormhole_numberofjumps = 1; // For "Displacement Drive"
            // myBullet.strikeTarget(shooter);
            // this.pushObjToGameStateRef(myBullet);


            var wormholeExitSprite = new game_sprite.Sprite('img/sprite/wormhole.png', [0, 0], [75, 75], 20, [0, 1, 2, 3, 4, 5, 6 ,7 ,8 ,9 ,10, 11, 12, 13, 14], 0, true);
            this.pushNewExplosion(wormholeExitSprite, [shooter.pos[0], shooter.pos[1]], [0, 0]);

            this.pushNewWormholePair(shooter.pos, this.distance, this.wormhole_numberofjumps, game_math.getRandomArbitrary(0, 360), shooter);
        }
    }
};

DisplacementDriveWeapon.prototype.getCopy = function(shooter) {
    var newProjectile = this.projectile.getCopy(shooter);
    var newWeapon = new DisplacementDriveWeapon(newProjectile, this.rate, this.maxpower, this.powerdrain, this.powerregen, this.distance);
    newWeapon.wormhole_numberofjumps = 1;
    return newWeapon;
};
