

//var world_object = require('../world/actors/WorldObject.js');


//============ MATH FUNCTION/ETC ============//
var TO_RADIANS = Math.PI/180;

function isInArray(value, array) {
	return array.indexOf(value) > -1;
}

function getDistance(x1, y1, x2, y2)
{
	// 2D
	var xd = x2-x1;
	var yd = y2-y1;
	return Math.sqrt(xd*xd + yd*yd);
}

function getAngle(x1, y1, x2, y2)
{
	//console.log("y2: " + y2 + " y1: " + y1 + " x2: " + x2 + " x1: " + x1);

	// angle in degrees (0 at top)
	return -((Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI) - 90);
}


// SOURCE:  http://stackoverflow.com/questions/1527803/generating-random-numbers-in-javascript-in-a-specific-range
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}
// SOURCE:  http://stackoverflow.com/questions/1527803/generating-random-numbers-in-javascript-in-a-specific-range
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}



//============= COLLISIONS ===============
//Circle formula: (x−h)^2+(y−k)^2=r^2
// h, k are the coordinates for the center of the circle

//Line formula: y=a+bx
// x, y are your coordinates
// a = the y-intercept
// b = slope

//Distance formula:
// (y2 - y1) / (x2 - x1) = distance

// SOURCE:  http://math.stackexchange.com/questions/275529/check-if-line-intersects-with-circles-perimeter
function circleIntersect(l1, l2, c, r)
{
	var circ = Math.abs( (l2[0] - l1[0])*c[0] + (l1[1] - l2[1])*c[1] + (l1[0] - l2[0])*l1[1] + l1[0]*(l2[1] - l1[1]) )
				/ Math.sqrt( Math.pow((l2[0] - l1[0]) , 2) + Math.pow((l1[1] - l2[1]) , 2) );

	//circ = circ / 0.9;

	console.log("circ: " + circ + " r: " + r);

	if (circ <= r)
	{
		if (getDistance(l1[0], l1[1], c[0], c[1]) > getDistance(l2[0], l2[1], c[0], c[1]))
		{
			if (getDistance(l1[0], l1[1], c[0], c[1]) <= (r+getDistance(l1[0], l1[1], l2[0], l2[1])))
				return true;
		}
		else
		{
			if (getDistance(l2[0], l2[1], c[0], c[1]) <= (r+getDistance(l1[0], l1[1], l2[0], l2[1])))
				return true;
		}
	}
	return false;
}

// SOURCE:  http://stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function

function lineIntersect(x1,y1,x2,y2, x3,y3,x4,y4) {
    var x=((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    var y=((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    if (isNaN(x)||isNaN(y)) {
        return false;
    } else {
        if (x1>=x2) {
            if (!(x2<=x&&x<=x1)) {return false;}
        } else {
            if (!(x1<=x&&x<=x2)) {return false;}
        }
        if (y1>=y2) {
            if (!(y2<=y&&y<=y1)) {return false;}
        } else {
            if (!(y1<=y&&y<=y2)) {return false;}
        }
        if (x3>=x4) {
            if (!(x4<=x&&x<=x3)) {return false;}
        } else {
            if (!(x3<=x&&x<=x4)) {return false;}
        }
        if (y3>=y4) {
            if (!(y4<=y&&y<=y3)) {return false;}
        } else {
            if (!(y3<=y&&y<=y4)) {return false;}
        }
    }
    return true;
}



//============= ACTOR AI TOOLS ===============
function getAngleOffset(angle1, x1, y1, x2, y2)
{
	// angle in degrees (0 at top)
	var angleFromOrigin = getAngle(x1, y1, x2, y2);
	var offsetAngle = angleFromOrigin - angle1 % 360;
	offsetAngle = offsetAngle > 180 ? 360 - offsetAngle : offsetAngle;
	offsetAngle = offsetAngle < -180 ? offsetAngle + 360 : offsetAngle;
	return offsetAngle;
}


function rotateToFaceAngle(a, b, s) // angle1, angle2, turning rate
{
	var d = Math.abs(a - b) % 360;
	var r = d > 180 ? 360 - d : d;

	a = a % 360;
	b = b % 360;

	if (d < s)
	{
		a = b;
	}
	else if (r > 0)
	{
		if ((a-b+360)%360>180) a += s; // SOURCE:  http://stackoverflow.com/questions/4370746/calculate-the-shortest-way-to-rotate-right-or-left
		else a -= s;
	}

	return a;
}

function getActorDistance(actor1, actor2) {
	return getDistance(actor1.pos[0], actor1.pos[1], actor2.pos[0], actor2.pos[1]);
}

function getActorAngleOffset(actor1, actor2) {
	//console.log(actor1.angle +" "+ actor1.pos[0] +" "+ actor1.pos[1] +" "+ actor2.pos[0] +" "+ actor2.pos[1]);
	//console.log(getAngleOffset(actor1.angle, actor1.pos[0], actor1.pos[1], actor2.pos[0], actor2.pos[1]));
	return getAngleOffset(actor1.angle, actor1.pos[0], actor1.pos[1], actor2.pos[0], actor2.pos[1]);
}




//============================ REGISTER PUBLIC RESOURCES ============================//
// Register the list of functions and variables we want to make publicly available
//module.exports.make = make;
//module.exports.avatars = avatars;

// OR

if (typeof thisIsTheClient === "undefined")
{
	module.exports = {
		TO_RADIANS: TO_RADIANS,
		isInArray: isInArray,
		getDistance: getDistance,
		getAngle: getAngle,
		getRandomArbitrary: getRandomArbitrary,
		getRandomInt: getRandomInt,
		getActorDistance: getActorDistance,
		getActorAngleOffset: getActorAngleOffset,
		rotateToFaceAngle: rotateToFaceAngle,

		circleIntersect: circleIntersect,
		lineIntersect: lineIntersect
	};
}
