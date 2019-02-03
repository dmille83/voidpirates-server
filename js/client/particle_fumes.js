// ================== PARTICLE FUNCTIONS ================== //
var globalUseParticles = true;
var globalUseParticleFilling = false;
var globalUseDualRockets = false;
var globalMaxParticleCount = 200;

var offsetDist = 15;
var offsetSpacing = 10;
var particleSpeed = 3;
var particleLifespan = 15;
var particleStartSize = 10;



/*
 *  Calculate player movement speed on client side.
 *  We only really care about getting the player's relative particle speeds "just right", since those are the ones they will be seeing the most clearly.
 */
var playerLastPos = [0, 0];
var playerLastSpeed = [0, 0];
function setPlayerLastSpeed()
{
    var playerSpeedX = player.x - playerLastPos[0];
    var playerSpeedY = player.y - playerLastPos[1];

    playerLastPos = [player.x, player.y];
    playerLastSpeed = [playerSpeedX, playerSpeedY];
}
function getParticleStartSpeed(entity, engineOffsetAngle)
{
    var entitySpeed = [0, 0];
    if (entity.x == player.x && entity.y == player.y) entitySpeed = playerLastSpeed;

    var speedX = (Math.sin((entity.angle + engineOffsetAngle) * TO_RADIANS) * particleSpeed) + entitySpeed[0];
    var speedY = (Math.cos((entity.angle + engineOffsetAngle) * TO_RADIANS) * particleSpeed) + entitySpeed[1];

    // var speedX = entitySpeed[0];
    // var speedY = entitySpeed[1];

    return [speedX, speedY];
}


function spawnExhaustFumes(entity, exhaustFumeList)
{
    // if (!entity.engine_fire)
    // {
    // 	console.log(entity);
    // 	return;
    // }

    if (entity.engine_fire[0])
    {
        var particleSpeed = getParticleStartSpeed(entity, 180);

        if (globalUseDualRockets)
        {
            exhaustFumeList.push({
                x: entity.x + (Math.sin((entity.angle + 180) * TO_RADIANS) * offsetDist) + (Math.sin((entity.angle + 90) * TO_RADIANS) * offsetSpacing),
                y: entity.y + (Math.cos((entity.angle + 180) * TO_RADIANS) * offsetDist) + (Math.cos((entity.angle + 90) * TO_RADIANS) * offsetSpacing),
                l: particleLifespan,
                d: entity.angle+180,
                c: 'o',
                e: '02',
                xs: particleSpeed[0],
                ys: particleSpeed[1]
            });

            exhaustFumeList.push({
                x: entity.x + (Math.sin((entity.angle + 180) * TO_RADIANS) * offsetDist) + (Math.sin((entity.angle - 90) * TO_RADIANS) * offsetSpacing),
                y: entity.y + (Math.cos((entity.angle + 180) * TO_RADIANS) * offsetDist) + (Math.cos((entity.angle - 90) * TO_RADIANS) * offsetSpacing),
                l: particleLifespan,
                d: entity.angle+180,
                c: 'o',
                e: '03',
                xs: particleSpeed[0],
                ys: particleSpeed[1]
            });
        }
        else
        {
            exhaustFumeList.push({
                x: entity.x + (Math.sin((entity.angle + 180) * TO_RADIANS) * offsetDist),
                y: entity.y + (Math.cos((entity.angle + 180) * TO_RADIANS) * offsetDist),
                l: particleLifespan,
                d: entity.angle+180,
                c: 'o',
                e: '01',
                xs: particleSpeed[0],
                ys: particleSpeed[1]
            });
        }
    }

    if (entity.engine_fire[1])
    {
        var particleSpeed = getParticleStartSpeed(entity, -90);

        if (false) //if (globalUseDualRockets)
        {
            exhaustFumeList.push({
                x: entity.x + (Math.sin((entity.angle-90) * TO_RADIANS) * offsetDist) + (Math.sin((entity.angle) * TO_RADIANS) * offsetSpacing),
                y: entity.y + (Math.cos((entity.angle-90) * TO_RADIANS) * offsetDist) + (Math.cos((entity.angle) * TO_RADIANS) * offsetSpacing),
                l: particleLifespan,
                d: entity.angle-90,
                c: 'o',
                e: '11',
                xs: particleSpeed[0],
                ys: particleSpeed[1]
            });

            exhaustFumeList.push({
                x: entity.x + (Math.sin((entity.angle-90) * TO_RADIANS) * offsetDist) + (Math.sin((entity.angle - 180) * TO_RADIANS) * offsetSpacing),
                y: entity.y + (Math.cos((entity.angle-90) * TO_RADIANS) * offsetDist) + (Math.cos((entity.angle - 180) * TO_RADIANS) * offsetSpacing),
                l: particleLifespan,
                d: entity.angle-90,
                c: 'o',
                e: '12',
                xs: particleSpeed[0],
                ys: particleSpeed[1]
            });
        }
        else
        {
            exhaustFumeList.push({
                x: entity.x + (Math.sin((entity.angle-90) * TO_RADIANS) * offsetDist),
                y: entity.y + (Math.cos((entity.angle-90) * TO_RADIANS) * offsetDist),
                l: particleLifespan,
                d: entity.angle-90,
                c: 'o',
                xs: particleSpeed[0],
                ys: particleSpeed[1]
            });
        }
    }

    if (entity.engine_fire[2])
    {
        var particleSpeed = getParticleStartSpeed(entity, 0);

        if (globalUseDualRockets)
        {
            exhaustFumeList.push({
                x: entity.x + (Math.sin((entity.angle) * TO_RADIANS) * offsetDist) + (Math.sin((entity.angle + 90) * TO_RADIANS) * offsetSpacing),
                y: entity.y + (Math.cos((entity.angle) * TO_RADIANS) * offsetDist) + (Math.cos((entity.angle + 90) * TO_RADIANS) * offsetSpacing),
                l: particleLifespan,
                d: entity.angle,
                c: 'o',
                e: '21',
                xs: particleSpeed[0],
                ys: particleSpeed[1]
            });

            exhaustFumeList.push({
                x: entity.x + (Math.sin((entity.angle) * TO_RADIANS) * offsetDist) + (Math.sin((entity.angle - 90) * TO_RADIANS) * offsetSpacing),
                y: entity.y + (Math.cos((entity.angle) * TO_RADIANS) * offsetDist) + (Math.cos((entity.angle - 90) * TO_RADIANS) * offsetSpacing),
                l: particleLifespan,
                d: entity.angle,
                c: 'o',
                e: '22',
                xs: particleSpeed[0],
                ys: particleSpeed[1]
            });
        }
        else
        {
            exhaustFumeList.push({
                x: entity.x + (Math.sin((entity.angle) * TO_RADIANS) * offsetDist),
                y: entity.y + (Math.cos((entity.angle) * TO_RADIANS) * offsetDist),
                l: particleLifespan,
                d: entity.angle,
                c: 'o',
                xs: particleSpeed[0],
                ys: particleSpeed[1]
            });
        }
    }

    if (entity.engine_fire[3])
    {
        var particleSpeed = getParticleStartSpeed(entity, 90);

        if (false) //if (globalUseDualRockets)
        {
            exhaustFumeList.push({
                x: entity.x + (Math.sin((entity.angle+90) * TO_RADIANS) * offsetDist) + (Math.sin((entity.angle) * TO_RADIANS) * offsetSpacing),
                y: entity.y + (Math.cos((entity.angle+90) * TO_RADIANS) * offsetDist) + (Math.cos((entity.angle) * TO_RADIANS) * offsetSpacing),
                l: particleLifespan,
                d: entity.angle+90,
                c: 'o',
                e: '31',
                xs: particleSpeed[0],
                ys: particleSpeed[1]
            });

            exhaustFumeList.push({
                x: entity.x + (Math.sin((entity.angle+90) * TO_RADIANS) * offsetDist) + (Math.sin((entity.angle - 180) * TO_RADIANS) * offsetSpacing),
                y: entity.y + (Math.cos((entity.angle+90) * TO_RADIANS) * offsetDist) + (Math.cos((entity.angle - 180) * TO_RADIANS) * offsetSpacing),
                l: particleLifespan,
                d: entity.angle+90,
                c: 'o',
                e: '32',
                xs: particleSpeed[0],
                ys: particleSpeed[1]
            });
        }
        else
        {
            exhaustFumeList.push({
                x: entity.x + (Math.sin((entity.angle+90) * TO_RADIANS) * offsetDist),
                y: entity.y + (Math.cos((entity.angle+90) * TO_RADIANS) * offsetDist),
                l: particleLifespan,
                d: entity.angle+90,
                c: 'o',
                xs: particleSpeed[0],
                ys: particleSpeed[1]
            });
        }
    }


    // Single jet for projectiles
    if (entity.engine_fire[4])
    {
        var offsetPosMargin = 0;
        var c = 'o';
        //if (entity.sprite == 6) return; // no particles for explosion sprites
        //if (entity.sprite == 7) return; // no particles for explosion sprites
        switch(entity.sprite)
        {
            case 5:
                //c = 'o';
                offsetPosMargin = 15;
                break;
            case 6:
                c = 'b';
                offsetPosMargin = 15;
                break;
            case 7:
                c = 'b';
                offsetPosMargin = 15;
                break;

            case 11:
                c = 'b';
                break;

            case 12:
                c = 'g';
                break;

            case 14:
                offsetPosMargin = 40;
                break;
            case 15:
                // if (getRandomInt(0, 10) < 5)
                //     c = 'b';
                // else
                    c = 'p';
                break;

            case 13:
                c = 'r';
                break;
            case 42:
                c = 'g'; //r
                break;
            default:
                c = 'o';
        }
        exhaustFumeList.push({
            x: entity.x + getRandomInt(-offsetPosMargin, offsetPosMargin), // + (Math.sin((entity.angle+180) * TO_RADIANS) * offsetDist),
            y: entity.y + getRandomInt(-offsetPosMargin, offsetPosMargin), // + (Math.cos((entity.angle+180) * TO_RADIANS) * offsetDist),
            l: particleLifespan,
            d: false,
            c: c,
            e: '0',
            xs: 0,
            ys: 0
        });
    }



    //console.log(exhaustFumeList.length);
    while (exhaustFumeList.length > globalMaxParticleCount) exhaustFumeList.splice(0, 1);
}


function renderParticles(exhaustFumeList, ctx, ignoreGlobalOrientation)
{
    var particleSize;

    ctx.save();
    // Orient world around player ???
    if (globalOrientWorldAroundPlayer && !ignoreGlobalOrientation) {
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.rotate(-player.angle * TO_RADIANS);
        ctx.translate(-canvas.width/2, -canvas.height/2);
    }

    // Green particles
    ctx.fillStyle = "rgba(0, 275, 0, 0.03)";
    for (var i in exhaustFumeList)
    {
        if (exhaustFumeList[i].c != 'g') continue;

        particleSize = (exhaustFumeList[i].l / particleLifespan) * particleStartSize * 4;

        ctx.beginPath();
        ctx.arc(exhaustFumeList[i].x - player.x+canvas.width/2, player.y+canvas.height/2 - exhaustFumeList[i].y, particleSize/2, 0, 2 * Math.PI);
        ctx.fill();
    }

    // Red particles
    ctx.fillStyle = "rgba(275, 0, 0, 0.03)";
    for (var i in exhaustFumeList)
    {
        if (exhaustFumeList[i].c != 'r') continue;

        particleSize = (exhaustFumeList[i].l / particleLifespan) * particleStartSize * 4;

        ctx.beginPath();
        ctx.arc(exhaustFumeList[i].x - player.x+canvas.width/2, player.y+canvas.height/2 - exhaustFumeList[i].y, particleSize/2, 0, 2 * Math.PI);
        ctx.fill();
    }

    // Blue particles (glow)
    ctx.fillStyle = "rgba(0, 175, 275, 0.03)";
    for (var i in exhaustFumeList)
    {
        if (exhaustFumeList[i].c != 'b') continue;

        particleSize = (exhaustFumeList[i].l / particleLifespan) * particleStartSize * 4;

        ctx.beginPath();
        ctx.arc(exhaustFumeList[i].x - player.x+canvas.width/2, player.y+canvas.height/2 - exhaustFumeList[i].y, particleSize/2, 0, 2 * Math.PI);
        ctx.fill();
    }

    // Blue particles (glow)
    ctx.fillStyle = "rgba(275, 0, 275, 0.03)";
    for (var i in exhaustFumeList)
    {
        if (exhaustFumeList[i].c != 'p') continue;

        particleSize = (exhaustFumeList[i].l / particleLifespan) * particleStartSize * 4;

        ctx.beginPath();
        ctx.arc(exhaustFumeList[i].x - player.x+canvas.width/2, player.y+canvas.height/2 - exhaustFumeList[i].y, particleSize/2, 0, 2 * Math.PI);
        ctx.fill();
    }

    // Orange particles (glow)
    ctx.fillStyle = "rgba(275, 175, 0, 0.03)";
    for (var i in exhaustFumeList)
    {
        if (exhaustFumeList[i].c != 'o') continue;

        particleSize = (exhaustFumeList[i].l / particleLifespan) * particleStartSize * 4;

        ctx.beginPath();
        ctx.arc(exhaustFumeList[i].x - player.x+canvas.width/2, player.y+canvas.height/2 - exhaustFumeList[i].y, particleSize/2, 0, 2 * Math.PI);
        ctx.fill();
    }





    if (globalUseParticleFilling)
    {
        // All particles (fill in gaps)
        ctx.fillStyle = "rgba(0, 0, 275, 0.1)";
        ctx.beginPath();
        var lastParticleColor = 'o';
        for (var i in exhaustFumeList)
        {
            if (exhaustFumeList[i-1])
            {
                var prevParticle = exhaustFumeList[i-1];

                if (lastParticleColor != prevParticle.c)
                {
                    lastParticleColor = prevParticle.c;
                    continue;
                }

                //if (prevParticle.e != exhaustFumeList[i].e) continue; // from same engine port
                //if (lastParticleFromSameEngine.e != exhaustFumeList[i].e) continue;

                var particlePosX = exhaustFumeList[i].x;
                var particlePosY = exhaustFumeList[i].y;

                if (getDistance(particlePosX, particlePosY, prevParticle.x, prevParticle.y) < particleStartSize * 8) //*(2/3))
                {
                    particleSize = (exhaustFumeList[i].l / particleLifespan) * 8; // particleStartSize; //8

                    while (getDistance(particlePosX, particlePosY, prevParticle.x, prevParticle.y) > 2) //particleStartSize
                    {
                        if (particlePosX > prevParticle.x) particlePosX--;
                        else if (particlePosX < prevParticle.x) particlePosX++;

                        if (particlePosY > prevParticle.y) particlePosY--;
                        else if (particlePosY < prevParticle.y) particlePosY++;

                        spanPosX = particlePosX - particleSize/2 - player.x + canvas.width/2;
                        spanPosY = player.y + canvas.height/2 - particlePosY - particleSize/2;

                        ctx.rect(spanPosX, spanPosY, particleSize, particleSize);
                    }
                }
            }
            //prevParticle = exhaustFumeList[i-1];
        }
        ctx.fill();
    }




    /*
    // White flame core (glow)
    ctx.fillStyle = "rgba(275, 275, 275, 1.0)";
    ctx.beginPath();
    for (var i in exhaustFumeList)
    {
        if (exhaustFumeList[i].l < particleLifespan - 4) continue;

        particleSize = ((exhaustFumeList[i].l - 10) / particleLifespan) * particleStartSize;

        ctx.beginPath();
        ctx.arc(exhaustFumeList[i].x - player.x+canvas.width/2, player.y+canvas.height/2 - exhaustFumeList[i].y, particleSize, 0, 2 * Math.PI);
        ctx.fill();
    }
    ctx.fill();
    */


    ctx.restore();
}


function updateExhaustFumePositions(exhaustFumeList)
{
    setPlayerLastSpeed();

    // Update particle positions
    for (var i in exhaustFumeList)
    {
        exhaustFumeList[i].l--;
        if (exhaustFumeList[i].l <= 0 || getDistance(exhaustFumeList[i].x, exhaustFumeList[i].y, player.x, player.y) > canvas.width * (3/2)) {
            exhaustFumeList.splice(i, 1);
            continue;
        }

        /*
        if (exhaustFumeList[i].d != false)
        {
            exhaustFumeList[i].x += (Math.sin(exhaustFumeList[i].d * TO_RADIANS) * particleSpeed);
            exhaustFumeList[i].y += (Math.cos(exhaustFumeList[i].d * TO_RADIANS) * particleSpeed);
        }
        */
        exhaustFumeList[i].x += exhaustFumeList[i].xs;
        exhaustFumeList[i].y += exhaustFumeList[i].ys;


        // If particles are spaced too far apart (which looks wierd), pull them closer together
        if (exhaustFumeList[i-1])
        {
            /*
            // Wrong, but FREAKING HILARIOUS!
            while (getDistance(exhaustFumeList[i].x, exhaustFumeList[i].y, exhaustFumeList[i-1].x, exhaustFumeList[i-1].y) > particleStartSize*(2/3))
            {
                if (exhaustFumeList[i].x > exhaustFumeList[i-1].x) exhaustFumeList[i].x--;
                else if (exhaustFumeList[i].x < exhaustFumeList[i-1].x) exhaustFumeList[i].x++;

                if (exhaustFumeList[i].y > exhaustFumeList[i-1].y) exhaustFumeList[i].y--;
                else if (exhaustFumeList[i].y < exhaustFumeList[i-1].y) exhaustFumeList[i].y++;
            }
            */

            // if (getDistance(exhaustFumeList[i].x, exhaustFumeList[i].y, exhaustFumeList[i-1].x, exhaustFumeList[i-1].y) > particleStartSize) //*(2/3))
            // {
            // 	exhaustFumeList.splice(i, 0, {
            // 		x: exhaustFumeList[i].x, // + (Math.sin((player.angle+180) * TO_RADIANS) * offsetDist),
            // 		y: exhaustFumeList[i].y, // + (Math.cos((player.angle+180) * TO_RADIANS) * offsetDist),
            // 		l: exhaustFumeList[i].l,
            // 		d: false,
            // 		c: exhaustFumeList[i].c
            // 	});
            // }
        }
    }
}



function spawnParticleZone(particleArray, zoneStart, zoneEnd, particleCount, particleColor, particleSpeed, particleLifespan)
{
    for (var i = 0; i < particleCount; i++)
    {
        particleArray.push({
            x: getRandomInt(zoneStart[0], zoneEnd[0]),
            y: getRandomInt(zoneStart[1], zoneEnd[1]),
            l: particleLifespan,
            c: particleColor,
            xs: particleSpeed[0],
            ys: particleSpeed[1]
        });
    }
}
function renderParticleZone(arrayOfParticles, ctx)
{
    ctx.save();

    var particleSize;

    // Green particles
    ctx.fillStyle = "rgba(0, 275, 0, 0.5)";
    for (var i in arrayOfParticles)
    {
        if (arrayOfParticles[i].c != 'g') continue;

        //particleSize = (arrayOfParticles[i].l / particleLifespan) * particleStartSize * 4;
        particleSize = 3;

        ctx.beginPath();
        ctx.arc(arrayOfParticles[i].x, arrayOfParticles[i].y, particleSize/2, 0, 2 * Math.PI);
        ctx.fill();
    }

    // Green particles
    ctx.fillStyle = "rgba(275, 275, 0, 0.5)";
    for (var i in arrayOfParticles)
    {
        if (arrayOfParticles[i].c != 'y') continue;

        //particleSize = (arrayOfParticles[i].l / particleLifespan) * particleStartSize * 4;
        particleSize = 3;

        ctx.beginPath();
        ctx.arc(arrayOfParticles[i].x, arrayOfParticles[i].y, particleSize/2, 0, 2 * Math.PI);
        ctx.fill();
    }

    ctx.restore();
}
function updateExhaustFumePositions(arrayOfParticles)
{
    // Update particle positions
    for (var i in arrayOfParticles)
    {
        arrayOfParticles[i].l--;
        if (arrayOfParticles[i].l <= 0 || getDistance(arrayOfParticles[i].x, arrayOfParticles[i].y, player.x, player.y) > canvas.width * (3/2)) {
            arrayOfParticles.splice(i, 1);
            continue;
        }
        arrayOfParticles[i].x += arrayOfParticles[i].xs;
        arrayOfParticles[i].y += arrayOfParticles[i].ys;
    }
}
