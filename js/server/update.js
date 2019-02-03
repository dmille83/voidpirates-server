
var game_math = require('../shared/lib/math_functions.js');
var game_sprite = require('../shared/lib/sprite.js');
var game_clock = require('../shared/lib/clock.js');

var game_state = require('./data.js');

//var game_server = require('../../server.js');




//=============== UPDATE WORLD ===============
function updateWorld(dt)
{
	if (isNaN(dt)) { return; }
		
	updateLifespans(dt);

	updateDeleted();
	
	updateRespawns(dt);

	updateTargets(dt);

	updatePositions(dt);

	updateCollisions(dt);
}


//===================== ACTORS WITH LIFESPANS ======================//
function updateLifespans(dt)
{
	updateListOfLifespans(game_state.avatars, dt);

	updateListOfLifespans(game_state.projectiles, dt);

	updateListOfLifespans(game_state.explosions, dt);

	updateListOfLifespans(game_state.solarsystems, dt);
}
function updateListOfLifespans(actorList, dt)
{
	for(var i in actorList)
	{
		actorList[i].updateLifespan(dt);

		//if (actorList[i].lifespan) console.log(actorList[i].actortype + ' ' + i + ' lifespan: ' + actorList[i].lifespan + ' - ' + dt);
	}

	//updateListOfDeleted(actorList);
}


//===================== DELETED ACTORS ======================//
function updateDeleted()
{
	updateListOfDeleted(game_state.avatars);

	updateListOfDeleted(game_state.projectiles);

	updateListOfDeleted(game_state.explosions);

	updateListOfDeleted(game_state.solarsystems);
}
function updateListOfDeleted(actorList)
{
	for(var actorID in actorList)
	{
		if (actorList[actorID].killme)
		{
			var actorType = actorList[actorID].actortype;
			
			// Have to use BOTH delete methods or actor object will still exist in memory? (memory leak?)
			delete actorList[actorID];
			actorList.splice(actorID, 1);

			
			if (actorType == "player") // && isNaN(actorID))
			{
				// Check if this ship is controlled by a human player
				if (game_state.findUserWithIP(actorID))
				{
					game_state.spawnNewPlayer(actorID); // Respawn
					console.log("Respawning player with ID: " + actorID + " (updateListOfDeleted1)");
					game_state.users[i].emit('tellusersglobalstuff', 'green', 'Respawning player ' + actorID + ' (updateListOfDeleted1)');
					game_state.users[i].broadcast.emit('tellusersglobalstuff', 'green', 'Respawning player ' + actorID + '');
					
				}
				else if(isNaN(actorID))
				{
					console.log("Player with ID " + actorID + " has no active User, so will not be respawned.");
				}
			}
			
			
			if (actorType == "planet")
				game_state.getCensusOfSolarSystem(game_state.solarsystems);
			
		}
		else
		{
			// NOT AN INSTANT RESPAWN (solar death)
			
			//if (actorList[actorID].actortype == "player" && actorList[actorID].isdead && game_state.findUserWithIP(actorID)) 
			//	console.log(actorList[actorID].lastattacktimeout)
			
			if (actorList[actorID].actortype == "player" && actorList[actorID].isdead && actorList[actorID].lastattacktimeout <= 15)
			{
				// Check if this ship is controlled by a human player
				var myUserRef = game_state.findUserWithIP(actorID);
				if (myUserRef) 
				{
					// Make loot-able copy of the "corpse"
					var tempActor = actorList[actorID];
					//tempActor.id = game_math.getRandomArbitrary(0.0001, 99.9999);
					actorList.splice(actorID, 1);
					actorList.push(tempActor);
					
					//delete actorList[actorID];
					//actorList.splice(actorID, 1);
					
					// TODO: Has to run respawn here or it triggers an insanity loop of respawning?
					game_state.spawnNewPlayer(actorID); // Respawn
					console.log("Respawning player with ID: " + actorID + " (updateListOfDeleted2)");
					myUserRef.emit('tellusersglobalstuff', 'green', 'Respawning player ' + actorID + ' (updateListOfDeleted2)');
					myUserRef.broadcast.emit('tellusersglobalstuff', 'green', 'Respawning player ' + actorID + '');
					
					incrRespawnCount(actorID);
					
				}
			}
		}
	}
	
	game_state.census_ships = game_state.getDataMemberCount(game_state.avatars);
}


//===================== (RE)SPAWN ACTORS ======================//
// TODO: this kind of operation is currently handled by the Sun, should the sun's checks be moved here?
function updateRespawns(dt)
{
	// PLAYER RESPAWNS HANDLED IMMEDIATELY
	//updateListOfRespawns_Players(); // TODO: sometimes triggers when it shouldnt?
	
	// THE REST ONLY OCCUR ON A PERIODIC
	// TIMER INTERVAL
	if (game_state.actorRespawnTimer >= 0)
	{
		game_state.actorRespawnTimer -= dt;
		return;
	}
	game_state.actorRespawnTimer = game_state.actorRespawnInterval;
	//console.log("Running periodic respawn check...");
	
	// echo globally the census data
	//socket.broadcast.emit('tellusersglobalstuff', 'green', 'There are currently ' + game_state.getDataMemberCount(game_state.users) + ' spaceships in this region');
	//console.log("------");
	//console.log('There are currently ' + game_state.getDataMemberCount(game_state.users) + ' players in this region');
	
	var lTime = game_clock.showClockTime();
	//console.log(lTime + " - " + game_state.getDataMemberCount(game_state.users) + " Player IPs in game: ");
	//for(var i in game_state.users) { console.log(game_state.users[i].request.connection.remoteAddress); }
	//console.log("------");
	
	// a player's stored IP address does not match their connection IP!
	for(var i in game_state.users) { 
		//if (game_state.userIPs[i] != game_state.users[i].request.connection.remoteAddress) 
		//	console.log(i + ": " + game_state.userIPs[i] + " != " + game_state.users[i].request.connection.remoteAddress); 
		
		if (game_state.userIPs[i] != game_state.getUserIP(i)) 
			console.log(i + ": " + game_state.userIPs[i] + " != " + game_state.getUserIP(i)); 
	}
	
	// RANDOM AI ACTORS
	updateListOfRespawns_AiPlayers();
	// SOLAR SYSTEMS
	updateListOfRespawns_SolarSystems();
	// WORMHOLES
	updateListOfRespawns_Wormholes();
	
}
function updateListOfRespawns(actorList, minCount)
{
	//for(var actorID in actorList) { }
}
function updateListOfRespawns_Players()
{
	var PlayerIP = "";
	for(var i in game_state.users) 
	{
		//PlayerIP = game_state.users[i].request.connection.remoteAddress;
		//PlayerIP = game_state.userIPs[i];
		var PlayerIP = game_state.getUserIP(game_state.users[i].id);
		
		if (!(PlayerIP in game_state.avatars))
		//if (!(game_state.avatars[PlayerIP]))
		{
			game_state.spawnNewPlayer(PlayerIP); // Respawn
			console.log("Respawning player with ID: " + PlayerIP + "");
			game_state.users[i].emit('tellusersglobalstuff', 'green', 'Respawning player ' + PlayerIP + '');
			game_state.users[i].broadcast.emit('tellusersglobalstuff', 'green', 'Respawning player ' + PlayerIP + '');
			
			incrRespawnCount(PlayerIP);
		}
	}
}
function updateListOfRespawns_AiPlayers()
{
	if (game_state.getDataMemberCount(game_state.avatars) <= 4) 
	{
		console.log("there are " + game_state.getDataMemberCount(game_state.avatars) + " players");
		game_state.spawnNewAIPlayerFleet(game_math.getRandomInt(4, 11));
	}
}
function updateListOfRespawns_SolarSystems()
{
	if (game_state.getDataMemberCount(game_state.solarsystems) <= 10) 
	{	
		var lonelySun = game_state.findTheSun();
		game_state.respawnPlanets(lonelySun, 5, 12, 1, 6);
	}
}
function updateListOfRespawns_Wormholes()
{
	// TODO: Handle spawning of periodic wormholes here instead of having the sun track this interval?
}

function incrRespawnCount(PlayerIP)
{
	if (!(PlayerIP in game_state.respawn_count)) game_state.respawn_count[PlayerIP] = 0;
	game_state.respawn_count[PlayerIP] += 1;
	console.log('Player ' + PlayerIP + ' has respawned ' + game_state.respawn_count[PlayerIP] + ' times')
}



//===================== TARGETS ======================//
function updateTargets(dt)
{
	updateListOfTargets(game_state.avatars, game_state.avatars, dt);
	updateListOfTargets(game_state.projectiles, game_state.avatars, dt);

	updateListOfTargets(game_state.solarsystems, game_state.avatars, dt);
	updateListOfTargets(game_state.solarsystems, game_state.projectiles, dt);

	updateListOfTargets(game_state.explosions, game_state.avatars, dt);
	updateListOfTargets(game_state.explosions, game_state.projectiles, dt);
}
function updateListOfTargets(monsterList, victimList, dt)
{
	for(var i in monsterList)
		monsterList[i].feedListOfTargets(victimList, dt);
}


//===================== POSITION ======================//
function updatePositions(dt)
{
	updateListOfPositions(game_state.explosions, dt);

	updateListOfPositions(game_state.projectiles, dt);

	updateListOfPositions(game_state.avatars, dt);

	updateListOfPositions(game_state.solarsystems, dt);
}
function updateListOfPositions(actorList, dt)
{
	for(var i in actorList)
		actorList[i].update(dt, game_state.worldSize);
}


//===================== COLLISIONS ======================//
function updateCollisions(dt)
{
	updateListOfCollisions(game_state.avatars, game_state.avatars);
	updateListOfCollisions(game_state.projectiles, game_state.avatars);
	updateListOfCollisions(game_state.projectiles, game_state.solarsystems);
	updateListOfCollisions(game_state.avatars, game_state.solarsystems);
	updateListOfCollisions(game_state.projectiles, game_state.projectiles);
}
function updateListOfCollisions(actorList, arrayOfObstacles)
{
	for(var i in actorList)
		for (var j in arrayOfObstacles)
			if (checkCollision(actorList[i], arrayOfObstacles[j]))
				collisionBehavior(actorList[i], arrayOfObstacles[j]);
}
function checkCollision(entity, obstacle)
{
	if (!entity || !obstacle) return false;

	var entDiam = 35, obDiam = 35;
	// if (entity.getDiameter()) entDiam = entity.getDiameter();
	// else
		entDiam = entity.getDiameter();

	// if (obstacle.diameter) obDiam = obstacle.diameter;
	// else
		obDiam = obstacle.getDiameter();


	//if (game_math.getDistance(entity.pos[0], entity.pos[1], obstacle.pos[0], obstacle.pos[1]) <= (entDiam/2 + obDiam/2))
	if (game_math.getDistance(entity.pos[0], entity.pos[1], obstacle.pos[0], obstacle.pos[1]) <= (obDiam/2))
	{
		return true;
	}
	return false;
}
function collisionBehavior(entity, obstacle)
{
	/*
	// The sun kills everything, period
	if (obstacle.actortype == "sun")
	{
		var dieOrDont = game_math.getRandomInt(0, 10);
		if (dieOrDont >= 5)
		{
			//entity.firewormhole = true; // ???
			game_state.spawnNewWormhole(entity.pos, game_math.getRandomInt(200, 1500), game_math.getRandomArbitrary(20, 200), entity);
		}
		else
		{
			// Destroy entity if it collided with this type of Obstacle
			game_state.spawnNewExplosion(entity, true, 'img/sprite/explosion.png');
			entity.playDeathEvent();
		}
	}
	*/


	// Entity behavior on collision
	if (entity.actortype == "projectile")
	{
		// Make sure projectile will not kill itself
		if (obstacle == entity) return false;
		if (obstacle.owner == entity.owner) return false;
		if (obstacle.ownerActor == entity.ownerActor) return false;

		// Prevent players from shooting themselves
		if (obstacle.id == entity.owner && !entity.friendlyfire) return false;

		// Obstacle behavior on collision with this type of Entity
		if (obstacle.actortype == "player")
		{
			// Prevent players from shooting themselves
			if (obstacle.id != entity.owner || entity.friendlyfire)
			{
				entity.strikeTarget(obstacle);
				//if (game_state.users[entity.owner]) game_state.users[entity.owner].emit('tellusersglobalstuff', 'blue', 'target has ' + obstacle.armor.health + ' health remaining'); // ???
			}
		}


		else if (obstacle.actortype == "sun")
		{
			//game_state.spawnNewWormhole(entity.pos, game_math.getRandomInt(200, 1500), game_math.getRandomArbitrary(20, 200), entity);

			// Destroy entity if it collided with this type of Obstacle
			//entity.strikeTarget(obstacle);

			var	explosionSprite = new game_sprite.Sprite('img/sprite/explosion.png', [0, 0], [128, 128], 50, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 0, true);
			entity.pushNewExplosion(explosionSprite, entity.pos, [0,0]);

			entity.playDeathEvent(true);
		}
		else if (obstacle.actortype == "moon" || obstacle.actortype == "planet")
		{
		//	if (!entity.countdowntimer) // Mines will orbit instead of exploding
				entity.strikeTarget(obstacle);
		}


		else if (obstacle.actortype == "projectile")
		{
			entity.strikeTarget(obstacle);
			obstacle.strikeTarget(entity);

			//obstacle.playDeathEvent();
			//entity.playDeathEvent(); // redundant
		}
		//elseif...
	}


	else if (entity.actortype == "player")
	{
		if (obstacle.actortype == "sun")
		{
			var dieOrDont = game_math.getRandomInt(0, 10);
			if (entity.isdead)
			{
				//entity.killme = true
				entity.lastattacktimeout = 0;
			}
			else if (dieOrDont <= 1)
			{
				//game_state.spawnNewWormhole(entity.pos, game_math.getRandomInt(obstacle.getDiameter()*1.1, obstacle.getDiameter()*1.5), game_math.getRandomArbitrary(5, 20), entity);
				//game_state.spawnNewWormhole([entity.pos[0] + 100, entity.pos[1] + 100], game_math.getRandomInt(obstacle.getDiameter()*1.1, obstacle.getDiameter()*1.5), game_math.getRandomArbitrary(5, 20)); // Make a second portal at their destination?
				//entity.strikeTarget(obstacle);
				obstacle.pushNewWormholePair(entity.pos, game_math.getRandomInt(obstacle.getDiameter()*1.1, obstacle.getDiameter()*1.8), game_math.getRandomArbitrary(5, 20), game_math.getRandomArbitrary(0, 360), entity);
			}
			else
			{
				// Destroy entity if it collided with this type of Obstacle
				//game_state.spawnNewExplosion(entity, true, 'img/sprite/explosion.png');
				entity.playDeathEvent(true);
			}
		}
		else if (obstacle.actortype == "player" && !obstacle.isdead && !entity.isdead)
		{
			if (obstacle != entity) {
				// entity.speed[0] += obstacle.speed[0] / 2;
				// entity.speed[1] += obstacle.speed[1] / 2;
				// obstacle.speed[0] *= 0.5;
				// obstacle.speed[1] *= 0.5;
				
				// entity.speed[0] *= 0.5;
				// entity.speed[1] *= 0.5;
				// obstacle.speed[0] += entity.speed[0] / 2;
				// obstacle.speed[1] += entity.speed[1] / 2;

				var obAngle = game_math.getAngle(obstacle.pos[0], obstacle.pos[1], entity.pos[0], entity.pos[1]);
				// var obOffset = 0;
				// entity.pos[0] += Math.sin(obAngle * game_math.TO_RADIANS) * (entity.getDiameter()/2 + obOffset);
				// entity.pos[1] += Math.cos(obAngle * game_math.TO_RADIANS) * (entity.getDiameter()/2 + obOffset);
				// obstacle.pos[0] += Math.sin(-obAngle * game_math.TO_RADIANS) * (obstacle.getDiameter()/2 + obOffset);
				// obstacle.pos[1] += Math.cos(-obAngle * game_math.TO_RADIANS) * (obstacle.getDiameter()/2 + obOffset);
				
				// entity.speed[0] *= -1
				// entity.speed[1] *= -1
				// obstacle.speed[0] *= -1
				// obstacle.speed[1] *= -1
				
				
				
				
				// Non-zero speed
				if (entity.speed[0] == 0) entity.speed[0] = 1
				if (entity.speed[1] == 0) entity.speed[1] = 1
				if (obstacle.speed[0] == 0) obstacle.speed[0] = 1
				if (obstacle.speed[1] == 0) obstacle.speed[1] = 1
				
				// Bounce
				var a1speed = -game_math.getDistance(0, 0, entity.speed[0], entity.speed[1])
				var a2speed = -game_math.getDistance(0, 0, obstacle.speed[0], obstacle.speed[1])
				var speedratio = a1speed / a2speed;
				
				var weightratio = 1
				//if (entity.weight !== 0 && obstacle.weight !== 0) { weightratio = entity.weight / obstacle.weight; }
				
				entity.speed[0] += Math.sin(-obAngle * game_math.TO_RADIANS) * (a1speed);
				entity.speed[1] += Math.cos(-obAngle * game_math.TO_RADIANS) * (a1speed);
				obstacle.speed[0] += Math.sin(obAngle * game_math.TO_RADIANS) * (a2speed);
				obstacle.speed[1] += Math.cos(obAngle * game_math.TO_RADIANS) * (a2speed);
				
				entity.speed[0] *= (1/speedratio * 1/weightratio);
				entity.speed[1] *= (1/speedratio * 1/weightratio);
				obstacle.speed[0] *= (speedratio * weightratio);
				obstacle.speed[1] *= (speedratio * weightratio);
				
				// Lose some speed
				entity.speed[0] *= 0.7;
				entity.speed[1] *= 0.7;
				obstacle.speed[0] *= 0.7;
				obstacle.speed[1] *= 0.7;
				
			}
		}
	}
	//elseif...
}


//============================ REGISTER PUBLIC RESOURCES ============================//
// Register the list of functions and variables we want to make publicly available
//module.exports.make = make;
//module.exports.avatars = avatars;

// OR

module.exports = {
	updateWorld: updateWorld
};
