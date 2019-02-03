
var game_math = require('../../lib/math_functions.js');



if (typeof thisIsTheClient === "undefined")
{
    // INCLUDES ALL ???
    module.exports = {
        EquipmentSlot: EquipmentSlot,
    };
}
else
{
    window.EquipmentSlot = EquipmentSlot;
}



//===================== EquipmentSlot PROTOTYPE ======================
function EquipmentSlot()
{
    // ====== CONSTRUCTOR ======
    this.actortype = 'equipmentslot';
}
// ====== WORLD OBJECT ======
//EquipmentSlot.prototype = Object.create(world_object.WorldObject.prototype);
EquipmentSlot.prototype.constructor = EquipmentSlot;


// ====== FUNCTIONS ======
EquipmentSlot.prototype.pushObjToGameStateRef = function(obj) {
    /*
    switch(obj.actortype) {
        case 'projectile':
            missiles.push(obj);
            break;
        case 'explosion':
            explosions.push(obj);
            break;
        case 'player':
            avatars.push(obj);
            break;
        case 'solarsystem':
            solarsystems.push(obj);
            break;
        default:
            console.log("Unrecognized actortype: " + obj);
    }
    */
    console.log("Unrecognized actortype: " + obj);
};
