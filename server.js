
var game_state_update = require('./js/server/update.js');

var game_state = require('./js/server/data.js');

var game_math = require('./js/shared/lib/math_functions.js');



// =========== SERVER IO =============
function addNewUser(socket)
{
	// USING IP ADDRESS - TODO: WHICH OF THESE IS THE MOST RELIABLE?
	//var PlayerIP = socket.id
	var PlayerIP = socket.request.connection.remoteAddress; // Get IP Address
	//console.log('New connection from IP ' + PlayerIP);
	
	//if (PlayerIP in game_state.avatars) 
	if (game_state.avatars[PlayerIP]) 
	{
		// Alert other user(s) with same IP
		var thereIsAnother = false
		/*
		for (var i in game_state.users) {
			if (game_state.users[i].request.connection.remoteAddress == PlayerIP) {
				thereIsAnother = true
				game_state.users[i].emit('tellusersglobalstuff', 'red', 'Another player with the same IP as you (' + PlayerIP + ') has logged into the game!');
			}
		}
		*/
		if (game_state.findUserWithIP(PlayerIP)) {
			thereIsAnother = true
		}
		
		// Add a new user
		game_state.users[socket.id] = socket;
		
		// TODO: Store user IP (in case of missing IP bug)
		game_state.userIPs[socket.id] = socket.request.connection.remoteAddress; //PlayerIP;
		
		
		console.log('IP ' + PlayerIP + ' is already logged into the game!');
		if (thereIsAnother == true) {
			socket.emit('tellusersglobalstuff', 'red', 'A player with the IP ' + PlayerIP + ' is already logged into the game!');
			//game_state.users[socket.id].emit('tellusersglobalstuff', 'red', 'Another player with the same IP as you (' + PlayerIP + ') has attempted to log into the game!');
		} else {
			socket.emit('tellusersglobalstuff', 'red', 'Welcome back ' + PlayerIP + ' !');
		}
		
		if (game_state.avatars[PlayerIP].hasOwnProperty('lifespan')) {
			socket.emit('tellusersglobalstuff', 'green', 'Your countdown to self-destruct due to idle-ness has been canceled with ' + Math.round(game_state.avatars[PlayerIP].lifespan) + ' seconds to spare!');
			delete game_state.avatars[PlayerIP].lifespan; // remove lifespan countdown from avatar
		}
		
	} 
	else 
	{
		// Add a new user
		game_state.users[socket.id] = socket;
		
		if (PlayerIP in game_state.avatars_out) 
		{
			game_state.avatars[PlayerIP] = game_state.avatars_out[PlayerIP];
			delete game_state.avatars_out[PlayerIP];
		} 
		else 
		{
			console.log('IP ' + PlayerIP + ' is a new player, creating an avatar for them...');
			game_state.spawnNewPlayer(PlayerIP);
		}
	}
	
	
	var iUserCount = game_state.getDataMemberCount(game_state.users);
	var iAiCount = game_state.getDataMemberCount(game_state.avatars) - iUserCount;
	
	// Send ID to new player so their client knows which ship to control
	game_state.users[socket.id].emit('sendyouyoursocketid', PlayerIP); // only sends data to the (single) user who just requested it
	
	console.log('connection - socket ID: ' + PlayerIP + ' - There are now '+iUserCount+' users active.');
	
	// echo globally that this client has joined
	socket.broadcast.emit('tellusersglobalstuff', 'white', PlayerIP + ' has joined - There are ' + iUserCount + ' users online');
	
	// Send this data to the new client as well (the first message skips them for some reason)
	game_state.users[socket.id].emit('tellusersglobalstuff', 'white', 'You have joined using the IP ' + PlayerIP + ' - There are ' + iUserCount + ' users online');
	
	// echo globally some census data
	socket.broadcast.emit('tellusersglobalstuff', 'white', 'There are ' + iAiCount + ' non-player ships currently in space');
	// Send this data to the new client as well (the first message skips them for some reason)
	game_state.users[socket.id].emit('tellusersglobalstuff', 'white', 'There are ' + iAiCount + ' non-player ships currently in space');
	
	/*
	// Spawn some AI Players if outer space is looking a bit empty
	if (game_state.getDataMemberCount(game_state.avatars) < 4) 
	{
		game_state.spawnNewAIPlayerFleet(game_math.getRandomInt(4, 11));
		game_state.users[socket.id].emit('tellusersglobalstuff', 'white', 'We spawned some AI enemies, just for you!');
	}
	*/
	
}
function removeUser(socket)
{
	// USING IP ADDRESS
	//var PlayerIP = socket.id
	//var PlayerIP = socket.request.connection.remoteAddress; // Get IP Address
	//var PlayerIP = game_state.userIPs[socket.id];
	var PlayerIP = game_state.getUserIP(socket.id);
	
	// kill their avatar so it will play the death animation and then be flagged for deletion
	if (PlayerIP in game_state.avatars) {
		
		//game_state.avatars[PlayerIP].lifespan = 120 // will die after 120 seconds if not renewed by player input
		
		game_state.avatars_out[PlayerIP] = game_state.avatars[PlayerIP]
		delete game_state.avatars[PlayerIP];
	}
	
	var iUserCount = game_state.getDataMemberCount(game_state.users);
	var iAiCount = game_state.getDataMemberCount(game_state.avatars) - iUserCount;
	
	// log to the console that this user has left
	console.log('User "' + PlayerIP + '" has disconnected. '+iUserCount+' users are still connected');
	// echo globally that this client has left
	socket.broadcast.emit('tellusersglobalstuff', 'red', PlayerIP + ' has disconnected - There are ' + iUserCount + ' users online');
	// echo globally some census data
	socket.broadcast.emit('tellusersglobalstuff', 'white', 'There are ' + iAiCount + ' non-player ships currently in space');
	
	// How many players are logged out?
	var iAiCount_out = game_state.getDataMemberCount(game_state.avatars_out);
	socket.broadcast.emit('tellusersglobalstuff', 'red', 'There are ' + iAiCount_out + ' users logged out');
	console.log('There are ' + iAiCount_out + ' users logged out');
	
	// delete player from keyboard control listener queue
	delete game_state.users[socket.id];
	delete game_state.userIPs[socket.id];
}


/*
// SOURCE:  http://stackoverflow.com/questions/17040015/how-do-i-uniquely-identify-a-browser-or-client-whenever-its-connected-to-serv
var server = require('http').createServer(function(req, res)
{
	//===========================
	// SOURCE:  http://stackoverflow.com/questions/18310394/no-access-control-allow-origin-node-apache-port-issue

	// Website you wish to allow to connect
    //res.setHeader('Access-Control-Allow-Origin', 'http://localhost');
	res.setHeader('Access-Control-Allow-Origin', 'http://sandbox-dane.com/games/voidpirates/');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
	//===========================
});
*/


var app = require('express')();
app.use(function (req, res, next) 
{
    //===========================
	// SOURCE:  http://stackoverflow.com/questions/18310394/no-access-control-allow-origin-node-apache-port-issue

	// Website you wish to allow to connect
    //res.setHeader('Access-Control-Allow-Origin', 'http://localhost');
	res.setHeader('Access-Control-Allow-Origin', 'http://sandbox-dane.com/games/voidpirates/');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
	//===========================

    // Pass to next layer of middleware
    next();
});
var server = require('http').Server(app);

app.get('/', (request, response) => {  
	response.write("<p>Welcome to the VoidPirates server!</p><p><a href='http://sandbox-dane.com/games/voidpirates/'>Play the VoidPirates Game</a></p>");
});

//server.listen(80,'0.0.0.0');
//server.listen(1337,'0.0.0.0');
server.listen(process.env.PORT || 1337)
console.log("Server is listening");


var io = require('socket.io').listen(server);
io.sockets.on('connection', function(socket)
{
	// when the user connects.. perform this
	addNewUser(socket); // Add a new user (paired with an avatar)

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		removeUser(socket); // remove the username from global usernames list
	});

	// User sends their commands to the server
	socket.on('sendtheservermydata', function (data) {
		//game_state.userCommands[socket.id] = data;

		//console.log(data);
		//console.log(game_state.avatars[socket.id]);

		/*
		// USING SOCKET.ID
		if (game_state.avatars[socket.id]) // !!! PROTOTYPE
			game_state.avatars[socket.id].setControlData(data);
		*/
		
		
		// USING IP ADDRESS
		//var PlayerIP = socket.id
		//var PlayerIP = socket.request.connection.remoteAddress; // Get IP Address
		//var PlayerIP = game_state.userIPs[socket.id];
		var PlayerIP = game_state.getUserIP(socket.id);
		//if (game_state.avatars[PlayerIP]) {
		if (PlayerIP in game_state.avatars) {
			game_state.avatars[PlayerIP].setControlData(data);
			
			if (game_state.avatars[PlayerIP].hasOwnProperty('lifespan')) {
				socket.emit('tellusersglobalstuff', 'green', 'Your countdown to self-destruct due to idle-ness has been canceled with ' + Math.round(game_state.avatars[PlayerIP].lifespan) + ' seconds to spare! (player input)');
				delete game_state.avatars[PlayerIP].lifespan; // remove lifespan countdown from avatar
			}
			//game_state.avatars[PlayerIP].lifespan = 120; // will die after 120 seconds if not renewed by player input
			
			/*
			if (game_state.avatars[PlayerIP].isdead) // && game_state.avatars[PlayerIP].lastattacktimeout <= 15) 
			{
				socket.broadcast.emit('tellusersglobalstuff', 'red', 'You are dead for the next ' + game_state.avatars[PlayerIP].lastattacktimeout + ' seconds');
				console.log(game_state.avatars[PlayerIP].lastattacktimeout)
			}
			*/
		}
	});


});
server.listen(1337, "0.0.0.0");
console.log('started server with IP:');
getServerIP();


function getServerIP()
{
	var os = require('os');
	var ifaces = os.networkInterfaces();
	Object.keys(ifaces).forEach(function (ifname) {
	  var alias = 0;

	  ifaces[ifname].forEach(function (iface) {
		if ('IPv4' !== iface.family || iface.internal !== false) {
		  // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
		  return;
		}

		if (alias >= 1) {
		  // this single interface has multiple ipv4 addresses
		  console.log(ifname + ':' + alias, iface.address);
		} else {
		  // this interface has only one ipv4 adress
		  console.log(ifname, iface.address);
		}
		++alias;
	  });
	});
}


/*
//=========== UDP =============
var server = require('http').createServer(function(req, res) {
	 res.setHeader('Access-Control-Allow-Origin', 'http://sandbox-dane.com/games/voidpirates/'); // Website you wish to allow to connect    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // Request methods you wish to allow    
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type'); // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Credentials', true); // Set to true if you need the website to include cookies in the requests sent to the API (e.g. in case you use sessions)
});
var io = require('socket.io').listen(server);
var udpSocket = require('dgram').createSocket('udp4');


io.sockets.on('connection', function(socket)
{
	// when the user connects.. perform this
	addNewUser(socket); // Add a new user (paired with an avatar)

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		removeUser(socket); // remove the username from global usernames list
	});

	// User sends their commands to the server
	socket.on('sendtheservermydata', function (data) {
		//game_state.userCommands[socket.id] = data;

		//console.log(data);
		//console.log(game_state.avatars[socket.id]);

		if (game_state.avatars[socket.id]) // !!! PROTOTYPE
			game_state.avatars[socket.id].setControlData(data);
	});
});
udpSocket.bind(1338);
server.listen(1337);
console.log('started server');
*/


//======================= LOOP UPDATES WORLD (begin) =======================//
// See https://hacks.mozilla.org/2011/08/animating-with-javascript-from-setinterval-to-requestanimationframe/
var requestAnimFrame = (function(){
	return function(callback){
		setTimeout(callback, 1000 / 60);
		//setTimeout(callback, 3000 / 60); // 3000 improves performance, any higher messes up collision detection
	};
})();


// The main game loop
var lastTime;
var globalNoticeTimer = 0;

// Frame interval for better user-end performance
var frameInterval = 0.05; //0.10; // 0,05 improves performance while looking minimally choppy
var frameIntervalBuffer = 0;


function main() {
	var now = Date.now();
	var dt = (now - lastTime) / 1000.0;
	if (!isNaN(dt)) 
	{
		
		game_state_update.updateWorld(dt);
		
		//sendUserUpdates(dt);
		
		
		// Space sending world data packets out a bit to see if it improves player performance
		if (frameIntervalBuffer < frameInterval) {
			frameIntervalBuffer += dt;
		} else {
			sendUserUpdates(frameIntervalBuffer); // dt
			frameIntervalBuffer = 0;
		}
		
	}
	lastTime = now;
	requestAnimFrame(main);
}
function startMainLoop(){
	var lastTime = Date.now();
	main(); 
}
startMainLoop(); // Let's start this show!
//======================= LOOP UPDATES WORLD (end) =======================//


// Create starting world actors AFTER starting server
game_state.initializeWorld();

var loadActorSunThreshold = 2500;

function sendUserUpdates(dt)
{
	var loadActorThreshold = 900;

	// Make minimap (universal) (same data sent to all players)
	var minimap = {
		worldsize: game_state.worldSize,
		map: []
	};
	addActorsToMinimap(game_state.solarsystems, minimap.map);
	addActorsToMinimap(game_state.avatars, minimap.map);
	addActorsToMinimap(game_state.explosions, minimap.map);
	addActorsToMinimap(game_state.projectiles, minimap.map);


	// Send this customized selection of data to each user
	for(var socketID in game_state.users)
	{
		//var PlayerIP = socketID;
		//var PlayerIP = game_state.users[socketID].request.connection.remoteAddress; // Get IP Address
		//var PlayerIP = game_state.userIPs[socketID]; // Get IP Address
		var PlayerIP = game_state.getUserIP(socketID);
		if (PlayerIP)
		{
			
			
			var dataPacket = {
				player: {},
				actors: [],
				minimap: minimap,
				census: {
					ships: game_state.census_ships, 
					respawn_count: game_state.respawn_count[PlayerIP]
				}
				//highscore: game_state.highscore
			};

			if (game_state.avatars[PlayerIP])
			{
				
				// Solar Systems
				addActorsToUpdateArray(PlayerIP, game_state.solarsystems, loadActorThreshold, dataPacket.actors);

				// Projectiles
				addActorsToUpdateArray(PlayerIP, game_state.projectiles, loadActorThreshold, dataPacket.actors);

				// User's avatars
				addActorsToUpdateArray(PlayerIP, game_state.avatars, loadActorThreshold, dataPacket.actors);

				// Explosions
				addActorsToUpdateArray(PlayerIP, game_state.explosions, loadActorThreshold, dataPacket.actors);

				//console.log("(server.js) game_state.explosions.length: " + game_state.explosions.length);
				
				
				game_state.avatars[PlayerIP].addPoint(0); // Update highscore
				dataPacket.player = game_state.avatars[PlayerIP].pullPlayerHudData();
				//console.log("highscore: " + dataPacket.player.highscore);

				// Sun Compass
				for (var j in game_state.solarsystems)
				{
					if (game_state.solarsystems[j].actortype == "sun")
					{
						dataPacket.player.sunangle = game_math.getAngle(dataPacket.player.x, dataPacket.player.y, game_state.solarsystems[j].pos[0], game_state.solarsystems[j].pos[1]);
						dataPacket.player.sundistance = game_math.getDistance(dataPacket.player.x, dataPacket.player.y, game_state.solarsystems[j].pos[0], game_state.solarsystems[j].pos[1]);
						break;
					}
				}

				// Send this data to the user
				game_state.users[socketID].emit('sendyoutheserverdata', dataPacket);
			}
			//console.log(dataPacket);
			
			
		}
	}
	
	// echo globally the census data
	//io.sockets.broadcast.emit('tellusersglobalstuff', 'white', 'There are currently ' + getDataMemberCount(users) + ' spaceships in this region');
}
function addActorsToUpdateArray(playerID, actorList, loadActorThreshold, outputArray)
{
	for (var i in actorList)
	{
		//console.log(game_math.getActorDistance(player, actorList[i]));
		if (game_math.getActorDistance(game_state.avatars[playerID], actorList[i]) <= loadActorThreshold || (actorList[i].actortype == "sun" && game_math.getActorDistance(game_state.avatars[playerID], actorList[i]) <= loadActorSunThreshold))
		{
			/*
			//outputArray.push(createClientPacketFromActor(actorList[i]));
			if (actorList[i].id && actorList[i].id == playerID)
			{
				var actorPlayer = actorList[i].pullHudData();
				actorPlayer.health_percent = 1; // set to 100% so we won't see the health marker on out own actor
				outputArray.push(actorPlayer);
			}
			else outputArray.push(actorList[i].pullHudData());
			*/
			
			/*
			if (i == playerID) 
			{
				var actorPlayer = actorList[i].pullHudData();
				actorPlayer.health_percent = 1; // set to 100% so we won't see the health marker on out own actor
				outputArray.push(actorPlayer);
			}
			else outputArray.push(actorList[i].pullHudData());
			*/
			
			outputArray.push(actorList[i].pullHudData());
		}

	}

	//return outputArray;
}

function addActorsToMinimap(actorList, outputArray)
{
	for (var i in actorList)
	{
		//if (actorList[i].actortype == "explosion" && !actorList[i].direction) continue; // only collect Wormholes for the minimap
		if (actorList[i].actortype == "explosion")
		{
			if (!actorList[i].direction) continue; // only collect Wormholes for the minimap
			else
			{
				var actorCoordinates = {
					x: actorList[i].pos[0],
					y: actorList[i].pos[1],
					actortype: actorList[i].actortype,
					color: "#12ffff", //"blue", // "cyan", 
					xExit: (Math.sin(actorList[i].direction*game_math.TO_RADIANS) * actorList[i].distance),
					yExit: (Math.cos(actorList[i].direction*game_math.TO_RADIANS) * actorList[i].distance),

					direction: actorList[i].direction,
					distance: actorList[i].distance
				}
				outputArray.push(actorCoordinates);
			}
		}
		else if (actorList[i].actortype == "moon") 
		{
			// do nothing
		}
		else
		{
			var dotColor;
			switch(actorList[i].actortype) {
				case "player":
					if (actorList[i].isdead) dotColor = "white";
					else dotColor = "red";
					break;
				case "planet":
				case "moon":
					dotColor = "green";
					break;
				case "sun":
					dotColor = "yellow";
					break;
				case "projectile":
					dotColor = "#ff08fb"; // purple
					break;
				default:
					dotColor = "white";
			}
			
			var actorCoordinates = {
				x: actorList[i].pos[0],
				y: actorList[i].pos[1],
				actortype: actorList[i].actortype, 
				color: dotColor
			}
			outputArray.push(actorCoordinates);
		}
	}
}
