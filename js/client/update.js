
var globalMinimapScale = 0.04;

// // Create the canvas
// var canvas = document.getElementById('canvasScreenID'); //document.createElement("canvas");
// var ctx = canvas.getContext("2d");
// canvas.width = 1000;
// canvas.height = 1000; //520;
// canvas.style.display='block';
// canvas.style.margin='auto';
// //document.body.appendChild(canvas);


var connectToServerAttemptInterval;
function beginUserGame()
{
	if (connectToServerNode()) main();
	else
	{
		connectToServerAttemptInterval = setInterval(function(){
			if (connectToServerNode()){
				clearInterval(connectToServerAttemptInterval);
				main(); // Let's light this candle!
			}
		}, 6000);
	}
}



// ================== LOOP (begin) ================== //
// A cross-browser requestAnimationFrame
// See https://hacks.mozilla.org/2011/08/animating-with-javascript-from-setinterval-to-requestanimationframe/
var requestAnimFrame = (function(){
	return window.requestAnimationFrame    ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame    ||
		window.oRequestAnimationFrame      ||
		window.msRequestAnimationFrame     ||
		function(callback){
			window.setTimeout(callback, 1000 / 60);
		};
})();

// The main game loop
var lastTime; // dt is unused on the client side... for now.
function main() {
	var now = Date.now();
	var dt = (now - lastTime) / 1000.0; // dt is unused on the client side... for now.
	if (!isGamePaused)
	{
		
		checkServerTimeout();
		
		sendServerUpdatePacket(handleInput());
		
	}
	lastTime = now;
	requestAnimFrame(main);
}
// ================== LOOP (end) ================== //



// ================== KEY LISTENERS FOR DEBUGGING ================== //
// 'p' key pauses/freezes current game state on user-side (for debugging)
var isGamePaused = false;
document.addEventListener('keydown', function(e) {
	var keyCode = e.keyCode || e.which;
	//console.log(keyCode);
	
	if (keyCode == 80) {
		isGamePaused = !isGamePaused;
		if (isGamePaused == true) {
			console.log('pause');
			
			//drawTextLine(ctx, [canvas.height/2 - 100, canvas.width/2 - 50], "PAUSED", 80, "white");
			//drawTextLine(ctx, [canvas.height/2 - 100, 0], "PAUSED", 80, "white");
			drawTextLine(ctx, [-110, -70], "GAME PAUSED", 30, "white");
			
		} else {
			console.log('un-pause');
		}
	}
	
	// Disconnect/Reconnect
	//if (input.isDown("O")) {
	if (keyCode == 79) {
		//console.log(keyCode);
		reconnectToServerNode();
	}
	
	// Do / Do Not reconnect on server data timeout
	if (input.isDown("I")) {
		console.log(keyCode);
		reloadOnServerTimeout = !reloadOnServerTimeout;
		if (reloadOnServerTimeout == true) {
			console.log('client will reconnect if input is not received from the server for ' + lagReloadDelay + ' seconds');
		} else {
			console.log('client will wait patiently for the server to send it data');
		}
	}
	
});
// ================== KEY LISTENERS FOR DEBUGGING (end) ================== //



// ================== RECONNECT ================== //
function checkServerTimeout()
{
	// Checking server performance
	var receivedDataDelay = (Date.now() - lastPacketReceived) / 1000.0;
	if (receivedDataDelay > lagReloadDelay) 
	{
		console.log("things might be a little slow: " + receivedDataDelay);
		postWarningMessage("red", "things might be a little slow: " + receivedDataDelay);
		lastPacketReceived = Date.now() + (lagReloadRetry*1000); // add 10 sec before running this reconnect/reset again
		
		//reconnectToServerNode();
		
		//location.reload(false);
		//loadNewGameSessionData();
		//console.log("RELOADED PAGE");
		
		if (reloadOnServerTimeout) {
			window.location="http://sandbox-dane.rhcloud.com/VoidPirates/?autostart=1";
		}
	}
}
// ================== RECONNECT (end) ================== //



// ================== USER CONTROLS ================== //
function handleInput()
{
	// Empty input packet
	userInputPacket = [];
	
	// Mouse angle
	if (!globalOrientWorldAroundPlayer) {
		userInputPacket.push('ANGLE' + mouseAngle);
	}
	
	// Movement
	if (input.isDown(userInputControls.down)) {
		userInputPacket.push('DOWN');
	}
	if (input.isDown(userInputControls.up)) {
		userInputPacket.push('UP');
	}
	if(input.isDown(userInputControls.rleft)) {
		userInputPacket.push('RLEFT');
	}
	if(input.isDown(userInputControls.rright)) {
		userInputPacket.push('RRIGHT');
	}
	if(input.isDown(userInputControls.left)) {
		userInputPacket.push('LEFT');
	}
	if(input.isDown(userInputControls.right)) {
		userInputPacket.push('RIGHT');
	}

	// Brakes
	if(input.isDown(userInputControls.brake))
	{
		userInputPacket.push('BRAKE');
	}

	// Weapons
	if(input.isDown(userInputControls.fire)) {
		userInputPacket.push('FIRE');
	}
	
	if(input.isDown(userInputControls.swap_weapons)) {
		userInputPacket.push('SWAP_WEAPONS');
	}
	
	
	// Mouse buttons (weapons)
	if (mouseButtonsDown[1]) {
		userInputPacket.push('FIRE');
	}
	if (mouseButtonsDown[2]) {
		userInputPacket.push('SWAP_WEAPONS');
	}
	if (mouseButtonsDown[3]) {
		userInputPacket.push('FIRE2');
	}


	if(input.isDown(userInputControls.loot_weapon)) {
		userInputPacket.push('LOOT_WEAPON');
	}
	if(input.isDown(userInputControls.loot_weapon2)) {
		userInputPacket.push('LOOT_WEAPON2');
	}
	if(input.isDown(userInputControls.loot_armor)) {
		userInputPacket.push('LOOT_ARMOR');
	}
	if(input.isDown(userInputControls.loot_engine)) {
		userInputPacket.push('LOOT_ENGINE');
	}


	if(input.isDown('k')) // Suicide button
	{
		userInputPacket.push('k');
	}


	return userInputPacket;
}

/*
// ================== MOUSE TRACKING ================== //
function getMousePos(canvas, evt) 
{
	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}
canvas.addEventListener('mousemove', function(evt) 
{
	mousePosition = getMousePos(canvas, evt);
	//var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
	
	//var xOffset = canvas.width/2 + mousePos.x;
	//var yOffset = canvas.height/2 - mousePos.y;
	//var mousePos = getMousePos(canvas, evt);
	//var mouseAngle = getAngle(canvas.width/2, -canvas.height/2, mousePos.x, -mousePos.y);
	
	var mouseAngle = getAngle(canvas.width/2, -canvas.height/2, mousePos.x, -mousePos.y);
	
}, false);
*/



// ================== RENDER ================== //
// Render the scene
function render(data)
{
	if (isGamePaused) return;
	
	lastPacketReceived = Date.now();
	
	player = data.player;
	census = data.census;
	
	// Consolidate census data into player object
	//player.census_ships = data.census_ships;

	// Starry Backdrop
	ctx.fillStyle = terrainPattern;
	ctx.save();
	
	// Orient world around player
	if (globalOrientWorldAroundPlayer) {
		ctx.translate(canvas.width/2, canvas.height/2);
		ctx.rotate(-player.angle * TO_RADIANS);

		var offsetTerrainBack = Math.sqrt(2*canvas.width*canvas.width/canvasScreenScale);
		ctx.translate(-offsetTerrainBack/2, -offsetTerrainBack/2);
		ctx.translate(-player.x*terrainOffset, player.y*terrainOffset);
		ctx.fillRect(player.x*terrainOffset, -player.y*terrainOffset, offsetTerrainBack + canvas.width*(canvasScreenScale), offsetTerrainBack + canvas.height*(canvasScreenScale));
	}
	else
	{
		ctx.translate(-player.x*terrainOffset, player.y*terrainOffset);
		ctx.fillRect(player.x*terrainOffset - canvas.width*(1-canvasScreenScale), -player.y*terrainOffset - canvas.height*(1-canvasScreenScale), canvas.width/(1-canvasScreenScale) + 100, canvas.height/(1-canvasScreenScale) + 100);
	}
	ctx.restore();

	// Shadows (solar)
	//renderEntityShadows(data.actors); // ???

	// Particle effects
	updateExhaustFumePositions(exhaustFumeList);
	renderParticles(exhaustFumeList, ctx); //exhaustFumeList

	// Render most entities
	renderEntities(data.actors);
	
	// Mouse angle compasss
	drawMouseCompass(ctx);

	// ====== HUD stuff ======
	drawSunCompass(ctx, player.sunangle, player.sundistance);
	renderHUD(ctxHUD, 1.07); // 1.15
	renderMinimap(ctxMinimap, canvasMinimap, globalMinimapScale, data.minimap);
	if (player.health_percent <= 0 || player.isdead) renderDeathSceneHeader(ctx, player.respawn_timer);
};
function renderEntities(list)
{
	for(var i=0; i<list.length; i++) {
		renderEntity(list[i]);
	}
}
function renderEntity(entity)
{
	// // Shadows
	// sunCoordinates = {
	// 	x: 0,
	// 	y: 0
	// };
	// renderEntityShadow(entity, sunCoordinates);


	if (globalUseParticles) spawnExhaustFumes(entity, exhaustFumeList); // ???

	// Calculate entity position on screen
	// Offset rendered world to center on player coordinates
	var xOffset = entity.x-player.x+canvas.width/2;
	var yOffset = -(entity.y-player.y)+canvas.height/2; // y-axis is reversed for HTML5 Canvas

	ctx.save();

	// Orient world around player ???
	if (globalOrientWorldAroundPlayer) {
		ctx.translate(canvas.width/2, canvas.height/2);
		ctx.rotate(-player.angle * TO_RADIANS);
		ctx.translate(-canvas.width/2, -canvas.height/2);
	}

	ctx.translate(xOffset, yOffset); // offset rendered world to center on player coordinates



	if (entity.sprite >= 0)
	{
		// Use data from the server-side/type Sprite object to create a user-side/type Sprite object
		var localSprite = createLocalSprite(entity.sprite, entity.sprite_index);

		if (!localSprite) console.log('missing sprite at ' + entity.sprite);
		else
		{
			// Shadows from sunlight
			if (entity.sprite != 34) {
				drawShadowLayers(entity, localSprite);
			}
			
			ctx.rotate((entity.angle) * TO_RADIANS);
			ctx.scale(entity.scale, entity.scale);

			// Offset so sprites pivot on center
			ctx.translate(-localSprite.size[0]/2, -localSprite.size[1]/2);

			drawExhaustFumes(entity, localSprite.size[0]/2, localSprite.size[1]/2, ctx); // ???

			if (entity.sprite == 34 && renderSimplifiedSun) {
				localSprite.render(ctx, renderSimplifiedSun); // render simplified sun graphic
			}
			else
			{
				localSprite.render(ctx);
			}
			
			// Get in position to draw helpful text below actor
			ctx.translate(localSprite.size[0]/2, localSprite.size[1]/2);
			if (globalOrientWorldAroundPlayer) {
				ctx.rotate((player.angle-entity.angle) * TO_RADIANS); // Orient world around player ???
			} else {
				ctx.rotate((-entity.angle) * TO_RADIANS);
			}
			var entityDiameter = (localSprite.size[0]/2 * entity.scale) + 30;
			ctx.translate(0, entityDiameter);
			ctx.scale(1/entity.scale, 1/entity.scale);
			
			// Enemy Health / IP Address Display
			if (entity.id && entity.id != player_id)
			{
				// Enemy Health Display
				if (entity.health_percent < 1.0)
				{
					// Enemy is dead
					if (entity.health_percent <= 0.0)
					{
						if (getDistance(entity.x, entity.y, player.x, player.y) <= 150)
							drawTextLine(ctx, [0, 5], "LOOT", 15, "rgba(0, 255, 0, 0.5)", "center"); //drawTextLine(ctx, [-15, 5], "LOOT", 15, "rgba(0, 255, 0, 0.5)");
						else 
							drawTextLine(ctx, [0, 5], "DEAD", 15, "rgba(0, 255, 0, 0.5)", "center"); //drawTextLine(ctx, [-15, 5], "DEAD", 15, "rgba(255, 255, 0, 0.5)");
							
					}
					else
					{
						//drawTextLine(ctx, [-16, 4], Math.round(entity.health_percent*100) + "%", 15, "rgba(0, 0, 0, 1)");
						//drawTextLine(ctx, [-15, 5], Math.round(entity.health_percent*100) + "%", 15, "rgba(255, 0, 0, 1)");
						drawTextLine(ctx, [0, 5], Math.round(entity.health_percent*100) + "%", 15, "rgba(255, 0, 0, 1)", "center");
					}
				}
				
				// Show enemy player (non-AI) IP Address
				ctx.scale(entity.scale, entity.scale);
				if (isNaN(entity.id)) // && entity.id && entity.id != player_id) // AI use number IDs, players use IP string IDs
					//drawTextLine(ctx, [-50, 25], entity.id, 15, "rgba(255, 255, 0, 0.5)");
					drawTextLine(ctx, [0, 25], entity.id, 15, "rgba(255, 255, 0, 0.5)","center");
				
			}
			
			//if (entity.id)
			//	drawTextLine(ctx, [-50, 25], entity.id, 15, "rgba(255, 255, 0, 0.5)");
			
			// Show current highscore over its holder (includes player)
			ctx.translate(0, -(2*entityDiameter));
			if (entity.score && entity.score == player.highscore)
				drawTextLine(ctx, [0, 15], "HIGH SCORE "+player.highscore, 15, "rgba(0, 255, 0, 0.5)", "center"); //drawTextLine(ctx, [-75, 15], "HIGH SCORE "+player.highscore, 15, "rgba(0, 255, 0, 0.5)");
			
		}
	}
	else console.log(entity.actortype + " with sprite index " + entity.sprite + " not found");


	ctx.restore();
}

function createLocalSprite(spriteUrlIndex, spriteFrameIndex) {
	//console.log(spriteUrlIndex);
	if (!spriteClientArray[spriteUrlIndex]) return -1

	var clientSprite = spriteClientArray[spriteUrlIndex].getCopy(); // new ClientSprite(url, size, frames, index);
	clientSprite._index = spriteFrameIndex;
	return clientSprite;
}




// ================== RENDER SHADOW EFFECTS ========================== //
function drawShadowLayers(entity, localSprite) {
	// Shadows
	var shadowMaxWidth = (localSprite.size[0] / 80)*entity.scale; // localSprite.size[0] / 80;
	if (shadowMaxWidth <= 0) shadowMaxWidth = 1;
	//console.log(shadowMaxWidth);
	var entitySunDistance = getDistance(entity.x, entity.y, 0, 0);
	if (entitySunDistance < 1577) renderEntityShadow(entity, localSprite, shadowMaxWidth*1.1);
	if (entitySunDistance < 1477) renderEntityShadow(entity, localSprite, shadowMaxWidth*1.2);
	if (entitySunDistance < 1377) renderEntityShadow(entity, localSprite, shadowMaxWidth*1.3);
	if (entitySunDistance < 1277) renderEntityShadow(entity, localSprite, shadowMaxWidth*1.4);
	if (entitySunDistance < 1177) renderEntityShadow(entity, localSprite, shadowMaxWidth*1.6);
	if (entitySunDistance < 1077) renderEntityShadow(entity, localSprite, shadowMaxWidth*1.8);
}
function renderEntityShadow(entity, localSprite, rescaleShadowWidth) {
	if (entity.sprite == 0 || entity.sprite == 1 || entity.sprite == 3 || entity.sprite == 8 || entity.sprite == 9 || entity.sprite == 10 || entity.sprite == 11 || entity.sprite == 16) {}
	else if (entity.sprite < 35 || entity.sprite > 42) return 0; // only spaceships have shadows

	// Shadow effects
	var penumbraShadow = new ClientSprite('img/stage/penumbra.png', [80,800], [0], 0);
	//var penumbraShadow = new ClientSprite('img/sprite/bullet01.png', [2, 100], [0], 0);
	ctx.rotate((player.sunangle+180) * TO_RADIANS);
	ctx.scale(rescaleShadowWidth, 1.0);
	ctx.translate(-(penumbraShadow.size[0]/2), -(penumbraShadow.size[1]-localSprite.size[0]/3));
	penumbraShadow.render(ctx);
	ctx.translate((penumbraShadow.size[0]/2), (penumbraShadow.size[1]-localSprite.size[0]/3));
	ctx.scale(1/rescaleShadowWidth, 1.0);
	ctx.rotate(-(player.sunangle+180) * TO_RADIANS);
}





// ================== EXHAUST FUME DRAWING FUNCTIONS ================== //
var localFumeSprite = createLocalSprite(4, 0);
var singleEngineSocketDepth = 4;
var twinEngineSocketDepth = 0;
function drawExhaustFumes(entity, xOffset, yOffset, ctx)
{
	if (entity.sprite == 5) return; // no particles for explosion sprites
	if (entity.sprite == 6) return; // no particles for explosion sprites
	if (entity.sprite == 7) return; // no particles for explosion sprites
	if (entity.sprite == 12) return; // no particles for explosion sprites
	if (entity.sprite == 13) return; // no particles for explosion sprites
	if (entity.sprite == 14) return; // no particles for explosion sprites
	if (entity.sprite == 15) return; // no particles for explosion sprites
	if (entity.sprite == 42) return; // no particles for explosion sprites
	if (entity.sprite == 43) return; // no particles for explosion sprites


	if (entity.engine_fire[0]) drawTwinFumeFlames(180, xOffset, yOffset, ctx);

	if (entity.engine_fire[1]) drawSingleFumeFlame(-90, xOffset, yOffset, ctx);

	if (entity.engine_fire[2]) drawTwinFumeFlames(0, xOffset, yOffset, ctx);

	if (entity.engine_fire[3]) drawSingleFumeFlame(90, xOffset, yOffset, ctx);

	//if (entity.engine_fire[4]) drawSingleFumeFlame(180, xOffset, 5, ctx);
	if (entity.engine_fire[4]) drawSingleFumeFlame(180, xOffset, yOffset, ctx);
}
function drawSingleFumeFlame(angle, xOffset, yOffset, ctx)
{
	ctx.translate(xOffset, yOffset); // 17
	ctx.rotate(angle * TO_RADIANS);
	ctx.translate(0, -(xOffset-singleEngineSocketDepth)); //8

	drawFumeFlame((Math.random() * 0.7), ctx);

	ctx.translate(0, (xOffset-singleEngineSocketDepth));
	ctx.rotate(-angle * TO_RADIANS);
	ctx.translate(-xOffset, -yOffset);
}
function drawTwinFumeFlames(angle, xOffset, yOffset, ctx)
{
	ctx.translate(xOffset, yOffset); //17
	ctx.rotate(angle * TO_RADIANS);
	ctx.translate(0, -(yOffset-twinEngineSocketDepth));

	ctx.translate(-8, 0);
	drawFumeFlame((Math.random()), ctx);
	ctx.translate(16, 0);
	drawFumeFlame((Math.random()), ctx);
	ctx.translate(-8, 0);

	ctx.translate(0, (yOffset-twinEngineSocketDepth));
	ctx.rotate(-angle * TO_RADIANS);
	ctx.translate(-xOffset, -yOffset);
}
function drawFumeFlame(flameScale, ctx)
{
	ctx.fillStyle = "rgba(255, 255, 255, 0.005)";
	ctx.beginPath();
	ctx.arc(0, -50, 60, 0, 2 * Math.PI);
	ctx.fill();

	ctx.fillStyle = "rgba(255, 179, 0, 0.03)";
	ctx.beginPath();
	ctx.arc(0, -20, 20, 0, 2 * Math.PI);
	ctx.fill();

	//var flameScale = Math.random() + 0.5;

	ctx.scale(flameScale, flameScale);
	ctx.translate(-localFumeSprite.size[0]/2, -localFumeSprite.size[1]);
	localFumeSprite._index = getRandomInt(0, 3);
	localFumeSprite.render(ctx);
	ctx.translate(localFumeSprite.size[0]/2, localFumeSprite.size[1]);
	ctx.scale(1/flameScale, 1/flameScale);


	/*
	var randomScale = Math.random() + 0.5;

	ctx.scale(1.0, randomScale);
	ctx.fillStyle = "rgba(255, 179, 0, 0.7)";
	ctx.beginPath();
	ctx.moveTo(0, 0);
	ctx.lineTo(-5, 0);
	ctx.lineTo(0, -24);
	ctx.lineTo(5, 0);
	ctx.lineTo(0, 0);
	ctx.fill();

	ctx.fillStyle = "rgba(275, 275, 275, 1.0)";
	ctx.beginPath();
	ctx.moveTo(0,-2);
	ctx.lineTo(-4, 0);
	ctx.lineTo(0, -17);
	ctx.lineTo(4, 0);
	ctx.lineTo(0,-2);
	ctx.fill();
	ctx.scale(1.0, 1/randomScale);
	*/
}




// ================== PLAYER HUD (STATS/MESSAGES/ETC) ================== //
function renderDeathSceneHeader(ctx, respawn_timer) {
	//drawTextLine(ctx, [canvas.width/2 - 108, canvas.height/2 - 50], "YOU DIED!", 35, "blue");
	//drawTextLine(ctx, [canvas.width/2 - 104, canvas.height/2 - 54], "YOU DIED!", 35, "green");
	
	//drawTextLine(ctx, [canvas.width/2 - 104, canvas.height/2 - 50], "YOU DIED!", 35, "red");
	//drawTextLine(ctx, [canvas.width/2 - 108, canvas.height/2 - 54], "YOU DIED!", 35, "white");
	
	drawTextLine(ctx, [canvas.width/2, canvas.height/2 - 50], "YOU DIED!", 35, "red", "center");
	drawTextLine(ctx, [canvas.width/2, canvas.height/2 - 54], "YOU DIED!", 35, "white", "center");

	// drawRespawnTimerBar(ctx, respawn_timer, 1.0, [canvas.width/2 + 4, canvas.height/2 + 54], "red")
	// drawRespawnTimerBar(ctx, respawn_timer, 1.0, [canvas.width/2, canvas.height/2 + 50], "white")

	drawRespawnTimerBar(ctx, respawn_timer-0.75, 0.25, [canvas.width/2 + 4, canvas.height/2 + 54], "red")
	drawRespawnTimerBar(ctx, respawn_timer-0.75, 0.25, [canvas.width/2, canvas.height/2 + 50], "white")
}

function renderHUD(ctx, rescaleHUD) {
	ctx.clearRect ( 0 , 0 , canvas.width , canvas.height );
	ctx.save();

	ctx.beginPath();
	ctx.fillStyle = '#000000';
	ctx.rect(0, 0, canvas.width, canvas.height);
	ctx.fill();


	if (!rescaleHUD) rescaleHUD = 1.0;
	ctx.scale(rescaleHUD, rescaleHUD);

	// ====== HUD stuff ======
	//drawSunCompass(ctx, player.sunangle, player.sundistance);

	// Health
	if (player_last_health > player.health_percent)
	{
		var healthBarOffset = 5;// + getRandomArbitrary(0.0, 30.0);
		drawStatBar(ctx, player.health_percent, 1.0, [healthBarOffset, 5], "#ff0000");
	}
	else if (player_last_health < player.health_percent)
	{
		drawStatBar(ctx, player.health_percent, 1.0, [5, 5], "#30d50f");

		var zx1, zx2, zy1, zy2;
		zx1 = 7;
		zy1 = 7;
		zx2 = 196;
		zy2 = 10;

		var zoneStart, zoneEnd, particleCount, particleColor, particleSpeed, particleLifespan;
		//zoneStart = [zx1*rescaleHUD + (zx2*player.health_percent*rescaleHUD), zy1*rescaleHUD];
		//zoneEnd = [zx1*rescaleHUD + zx2*rescaleHUD, zy1*rescaleHUD + zy2*rescaleHUD];
		//zoneStart = [0, 0];
		//zoneEnd = [300, 300];
		zoneStart = [zx1*rescaleHUD + (zx2*player.health_percent*rescaleHUD), zy1*rescaleHUD];
		zoneEnd = [zx1*rescaleHUD + zx2*rescaleHUD, zy1*rescaleHUD + zy2*rescaleHUD];

		particleCount = 160 * (1 - player.health_percent) + 1;
		particleColor = 'g';
		particleSpeed = 0;
		particleLifespan = 9.0;

		spawnParticleZone(statParticleArray, zoneStart, zoneEnd, particleCount, particleColor, particleSpeed, particleLifespan);

		//updateExhaustFumePositions(statParticleArray);
		//renderParticleZone(statParticleArray, ctx);
	}
	else
	{
		drawStatBar(ctx, player.health_percent, 1.0, [5, 5], "#30d50f");
	}
	player_last_health = player.health_percent;
	//drawTextLine(ctx, [210, 16], player.health_max, 15, "#30d50f");
	
	if (Math.round(player.health_percent * player.health_max) > player.health_max/3) {
		//drawTextLine(ctx, [210, 16], (Math.round(player.health_percent * player.health_max) + "/" + player.health_max), 15, "#30d50f");
		drawTextLine(ctx, [210, 16], (Math.round(player.health_percent * player.health_max)), 15, "#30d50f");
		//drawTextLine(ctx, [0, 16], (Math.round(player.health_percent * player.health_max)), 15, "#30d50f", "center");
	} else {
		//drawTextLine(ctx, [210, 16], (Math.round(player.health_percent * player.health_max) + "/" + Math.round(player.health_max)), 15, "#ff0000");
		
		drawTextLine(ctx, [210, 16], (Math.round(player.health_percent * player.health_max)), 15, "#ff0000");
		//drawTextLine(ctx, [0, 16], (Math.round(player.health_percent * player.health_max)), 15, "#ff0000", "center");
	}
	drawTextLine(ctx, [237, 16], ("/" + Math.round(player.health_max)), 15, "#30d50f");
	//drawTextLine(ctx, [0, 16], ("/" + Math.round(player.health_max)), 15, "#30d50f", "center");
	


	// Weapon 1
	drawStatBar(ctx, player.weapon_percent, 1.0, [5, 20], "#fff700");
	drawStatBar(ctx, player.weapon_drain, 1.0, [5, 20], "rgba(255, 179, 0, 0.68)");
	if (player.weapon_percent >= player.weapon_timeout*player.weapon_drain) drawStatBar(ctx, player.weapon_timeout*player.weapon_drain, 1.0, [5, 20], "orange");
	else drawStatBar(ctx, (player.weapon_timeout*player.weapon_drain - (player.weapon_drain - player.weapon_percent)), 1.0, [5, 20], "orange");
	drawTextLine(ctx, [210, 32], Math.ceil(player.damage), 15, "#ff0000");

	ctx.translate(0, 15); // !!! may want to fix this extra offset properly later!

	// Weapon 2
	drawStatBar(ctx, player.weapon2_percent, 1.0, [5, 20], "#fff700");
	drawStatBar(ctx, player.weapon2_drain, 1.0, [5, 20], "rgba(255, 179, 0, 0.68)");
	if (player.weapon2_percent >= player.weapon2_timeout*player.weapon2_drain) drawStatBar(ctx, player.weapon2_timeout*player.weapon2_drain, 1.0, [5, 20], "orange");
	else drawStatBar(ctx, (player.weapon2_timeout*player.weapon2_drain - (player.weapon2_drain - player.weapon2_percent)), 1.0, [5, 20], "orange");
	drawTextLine(ctx, [210, 32], Math.ceil(player.damage2), 10, "#7D0000");


	// Engine
	var fuelBarOffsetX = 4;
	var fuelBarOffsetY = 35;
	if (player.engine_percent > 0.25)
	{
		// do nothing
	}
	else if (player.engine_percent > 0)
	{
		fuelBarOffsetX += getRandomArbitrary(-5.0, 10.0);
		fuelBarOffsetY += getRandomArbitrary(-3.0, 3.0);
		//drawTextLine(ctx, [fuelBarOffsetX+210, fuelBarOffsetY+15], "engine temperature rising!", 16, "#ff0000");
	}
	else
	{
		fuelBarOffsetX += getRandomArbitrary(-10.0, 20.0);
		fuelBarOffsetY += getRandomArbitrary(-5.0, 5.0);
		//drawTextLine(ctx, [fuelBarOffsetX+210, fuelBarOffsetY+15], "ENGINE OVERHEATING!", 22, "#ff0000");
	}
	drawThermometer(ctx, 1-player.engine_percent, 1.0, [fuelBarOffsetX, fuelBarOffsetY]);
	if (player.engine_percent <= 0) {
		ctx.beginPath();
		ctx.fillStyle = 'white';
		ctx.rect(fuelBarOffsetX, fuelBarOffsetY, 200, 20)
		ctx.fill();
		drawTextLine(ctx, [fuelBarOffsetX, fuelBarOffsetY+15], "ENGINE OVERHEATING!", 15, "#000000");
		drawTextLine(ctx, [fuelBarOffsetX+1, fuelBarOffsetY+16], "ENGINE OVERHEATING!", 15, "#ff0000");
	}


	if (player.sundistance < 1577 && player.weapon_percent < 1.0)
	{
		var zx1, zx2, zy1, zy2;
		zx1 = 7;
		zy1 = 22;
		zx2 = 196;
		zy2 = 10;

		var zoneStart, zoneEnd, particleCount, particleColor, particleSpeed, particleLifespan;
		zoneStart = [zx1*rescaleHUD + (zx2*player.weapon_percent*rescaleHUD), zy1*rescaleHUD];
		//zoneStart = [zx1*rescaleHUD, zy1*rescaleHUD];
		zoneEnd = [zx1*rescaleHUD + zx2*rescaleHUD, zy1*rescaleHUD + zy2*rescaleHUD];
		particleCount = 160 * (1 - player.weapon_percent) + 1;
		particleColor = 'y';
		particleSpeed = 0;
		particleLifespan = 9.0;

		spawnParticleZone(statParticleArray, zoneStart, zoneEnd, particleCount, particleColor, particleSpeed, particleLifespan);
	}
	if (player.sundistance < 1577 && player.weapon2_percent < 1.0)
	{
		var zx1, zx2, zy1, zy2;
		zx1 = 7;
		zy1 = 37;
		zx2 = 196;
		zy2 = 10;

		var zoneStart, zoneEnd, particleCount, particleColor, particleSpeed, particleLifespan;
		zoneStart = [zx1*rescaleHUD + (zx2*player.weapon2_percent*rescaleHUD), zy1*rescaleHUD];
		//zoneStart = [zx1*rescaleHUD, zy1*rescaleHUD];
		zoneEnd = [zx1*rescaleHUD + zx2*rescaleHUD, zy1*rescaleHUD + zy2*rescaleHUD];
		particleCount = 160 * (1 - player.weapon2_percent) + 1;
		particleColor = 'y';
		particleSpeed = 0;
		particleLifespan = 9.0;

		spawnParticleZone(statParticleArray, zoneStart, zoneEnd, particleCount, particleColor, particleSpeed, particleLifespan);
	}


	/*
	drawTextLine(ctx, [140, 68], "   My Score: " + player.score, 10);
	drawTextLine(ctx, [140, 88], "High Score: " + player.highscore, 10);
	
	drawTextLine(ctx, [5, 68], "Mass: " + player.mass, 15);
	drawTextLine(ctx, [5, 88], "Accell: " + player.engine_accelleration, 15);
	//drawTextLine(ctx, [140, 108], "MaxSpeed: " + player.engine_speed_max, 15);
	//drawTextLine(ctx, [5, 108], "Rotation: " + Math.round(player.engine_angle_accell), 15);

	ctx.translate(113, 74);
	
	// Weapon icon
	var weaponIcon = createLocalSprite(player.weapon_sprite, 0);
	renderEquipmentSprite(weaponIcon, ctx);

	// Drone icon
	if (player.drone_sprite != player.weapon_sprite)
	{
		var droneWeaponIcon = createLocalSprite(player.drone_sprite, 0);
		renderEquipmentSprite(droneWeaponIcon, ctx);
	}
	*/
	
	// 5, 105, 205
	drawTextLine(ctx, [5, 68], "Ships: " + census.ships, 10);
	drawTextLine(ctx, [65, 68], "High Score: " + player.highscore, 10);
	drawTextLine(ctx, [165, 68], "My Score:   " + player.score, 10);
	
	
	// TODO: Lifespan
	if (player.hasOwnProperty('lifespan')) 
		drawTextLine(ctx, [120, 83], "LS: " + player.lifespan, 10); //drawTextLine(ctx, [165, 83], "Lifespan: " + player.lifespan, 10);
	
	if (census.hasOwnProperty('respawn_count') && census.respawn_count > 0) 
		drawTextLine(ctx, [165, 83], "Respawns: " + census.respawn_count, 10);
	
	
	ctx.translate(250, 20);
	
	// Weapon icon
	var weaponIcon = createLocalSprite(player.weapon_sprite, 0);
	renderEquipmentSprite(weaponIcon, ctx);

	// Drone icon
	if (player.drone_sprite != player.weapon_sprite)
	{
		var droneWeaponIcon = createLocalSprite(player.drone_sprite, 0);
		renderEquipmentSprite(droneWeaponIcon, ctx);
	}

	ctx.restore();
	
	
	
	var playerWeaponDescriptionIndex = player.weapon_sprite;
	if (player.drone_sprite != player.weapon_sprite){ playerWeaponDescriptionIndex = 0 } // drone description
	var weaponDescription = "";
	switch (playerWeaponDescriptionIndex) {
		case 0:
			// drone
			weaponDescription = "Spawns AI-driven defensive drones that will attack any enemies that fly too close to your ship.";
			break;
		case 1:
			// missile
			weaponDescription = "Fires homing missiles that track targets. A high-damage long-range weapon.";
			break;
		case 44:
			// shotgun
			weaponDescription = "Fires a random number of low-damage projectiles, great for sweeping away mines and asteroids, or getting around enemy shields and defensive fire!";
			break;
		case 3:
			// bullet
			weaponDescription = "Standard bullet weapon. No gimmicks, but makes a good staple weapon, as it deals moderate damage. Simple and reliable.";
			break;
		case 6:
			// flamethrower
			//weaponDescription = "Emits a high-damage stream at short-range. ";
			//weaponDescription = "A high-damage short-range flamethrower... in space! Also destroys enemy projectiles from that direction while firing.";
			weaponDescription = "A high-damage short-range flamethrower... in space! Also blocks enemy fire from that direction while firing.";
			break;
		case 7:
			// displacement drive
			weaponDescription = "This Displacement Drive allows your ship to teleport a short distance in a random direction. Perfect for escaping enemies, traps, and the sun's gravity!";
			break;
		case 8:
			// mine
			weaponDescription = "Drops proximity-triggered explosive mines that can be left in orbit around planets. Try seeding a planet with mines before attacking it!";
			break;
		case 9:
			// wormhole mine
			weaponDescription = "A high-skill weapon. Drops impact-triggered mines that open long-lasting wormholes on impact. Try using them to drop enemies into the sun!";
			break;
		case 10:
			// gravity mine
			//weaponDescription = "Drops proximity-triggered mines that trap opponents in a gravity well. Try layering them for maximum damage, then pepper the trapped enemy with your other weapons. Shoot the mine to escape it.";
			weaponDescription = "Drops proximity-triggered mines that trap opponents in a gravity well. Be sure to pepper the trapped enemy with your other weapon!";
			break;
		case 11:
			// wormhole missile
			weaponDescription = "Fires a missile that opens up a wormhole on impact. Watch your distance to the target, or you may teleport yourself as well! Long-range chaos-sowing weapon.";
			break;
		case 12:
			// repeller
			weaponDescription = "Fires a continuous stream of force that repels enemies, blocks enemy fire, and destroys mines.";
			break;
		case 13:
			// puller (tractor beam)
			weaponDescription = "Fires a continuous tractor-beam that will lock onto an opponent and drag them with you. Also blocks enemy fire and destroys mines.";
			break;
		case 15:
			// shield
			weaponDescription = "Generates a shield that blocks enemy fire. Fire it up, then swap to your other weapon to take down opponents while they are unable to harm you!";
			break;
		case 45:
			// shockwave
			weaponDescription = "Fires a shockwave that hurls opponents away. Knock opponents into one-another, or into the sun!";
			break;
		default:
			weaponDescription = "";
	}
	//drawTextLine(ctx, [5, 108], "Weapon Description: \r" + weaponDescription, 10); 
	drawTextLine(ctx, [5, 108], "Weapon Description:", 10); 
	wrapText(ctx, weaponDescription, 5, 122, 290, 10);
	


	updateExhaustFumePositions(statParticleArray);
	renderParticleZone(statParticleArray, ctx);


	drawLootIcons();
}

function renderEquipmentSprite(lootIcon, ctx)
{
	if (lootIcon.url == 'img/sprite/explosion.png' || lootIcon.url == 'img/sprite/explosion-blue.png' || lootIcon.url == 'img/sprite/wormhole.png') lootIcon._index = 2;

	var maxSize = 25; // 30
	
	//var iconScale = [1.0, 1.0];
	//if (lootIcon.size[0] > maxSize) iconScale[0] = maxSize / lootIcon.size[0];
	//if (lootIcon.size[1] > maxSize) iconScale[1] = maxSize / lootIcon.size[1];
	
	var iconRescale = 1.0;
	if (lootIcon.size[0] > maxSize) {
		iconRescale = maxSize / lootIcon.size[0];
	}
	if ((lootIcon.size[1] * iconRescale) > maxSize) {
		iconRescale = maxSize / (lootIcon.size[1] * iconRescale);
	}
	var iconScale = [iconRescale, iconRescale];
	
	ctx.translate(-lootIcon.size[0]*iconScale[0]/2, -lootIcon.size[1]*iconScale[1]/2);
	ctx.scale(iconScale[0], iconScale[1]);
	lootIcon.render(ctx);
	ctx.scale(1/iconScale[0], 1/iconScale[1]);
	ctx.translate(lootIcon.size[0]*iconScale[0]/2, lootIcon.size[1]*iconScale[1]/2); // Translate back to starting position
}


function renderSecondaryHUD(ctx) {
	ctx.save();

	// Weapon icon
	var weaponIcon = createLocalSprite(player.weaponsprite, 0);
	if (weaponIcon.url == 'img/sprite/explosion.png' || weaponIcon.url == 'img/sprite/explosion-blue.png') weaponIcon._index = 2;
	ctx.translate(20 - weaponIcon.size[0]/2, 24 - weaponIcon.size[1]/2);
	ctx.scale(1.0, 1.0);
	weaponIcon.render(ctx);

	if (player.droneweaponsprite)
	{
		var droneWeaponIcon = createLocalSprite(player.droneweaponsprite, 0);
		if (droneWeaponIcon.url == 'img/sprite/explosion.png' || droneWeaponIcon.url == 'img/sprite/explosion-blue.png' || droneWeaponIcon.url == 'img/sprite/wormhole.png') droneWeaponIcon._index = 2;
		//ctx.translate(240, 24); // - weaponIcon.size[1]
		//ctx.scale(0.6, 0.6);
		ctx.translate(weaponIcon.size[0]/2 - droneWeaponIcon.size[0]/2, 24 - droneWeaponIcon.size[1]/2); // - weaponIcon.size[1]/2
		ctx.scale(1.0, 1.0);
		droneWeaponIcon.render(ctx);
	}

	ctx.restore();


	ctx.save();

	// Armor icon
	var armorIcon = createLocalSprite(player.sprite, 0);
	ctx.translate(70 - armorIcon.size[0]/2, 24 - armorIcon.size[1]/2);
	ctx.scale(1.0, 1.0);
	armorIcon.render(ctx);

	ctx.restore();

	ctx.save();

	drawTextLine(ctx, [140, 68], "Score: " + player.score, 15);
	drawTextLine(ctx, [5, 68], "Mass: " + player.mass, 15);
	drawTextLine(ctx, [5, 88], "Accell: " + player.accelleration, 15);
	drawTextLine(ctx, [5, 108], "MaxSpeed: " + player.maxspeed, 15);

	ctx.restore();
}


function drawStatBar(ctx, currenthealth, maxhealth, pos, innercolor)
{
	ctx.beginPath();
	ctx.rect(pos[0], pos[1], 200, 15);
	//ctx.fillStyle = 'green';
	//ctx.fill();
	ctx.lineWidth = 2;
	ctx.strokeStyle = 'white';
	ctx.stroke();

	var percentprogress = (currenthealth/maxhealth)*196;
	if (currenthealth < 0) percentprogress = 0;
	ctx.beginPath();
	ctx.rect(pos[0]+2, pos[1]+2, percentprogress, 11);
	ctx.fillStyle = innercolor;
	ctx.fill();
}

function drawTextLine(ctx, pos, line, fontsize, txColor, txAlign)
{
	if (!fontsize) fontsize = 10;
	ctx.font = "bold " + fontsize + "px Georgia";
	if (txColor) ctx.fillStyle = txColor;
	else ctx.fillStyle = 'white';
	if (txAlign) ctx.textAlign = txAlign; 
	ctx.fillText(line, pos[0], pos[1]);
}


// SOURCE:  http://www.html5canvastutorials.com/tutorials/html5-canvas-wrap-text-tutorial/
function wrapText(context, text, x, y, maxWidth, lineHeight) {
	var words = text.split(' ');
	var line = '';

	for(var n = 0; n < words.length; n++) {
	  var testLine = line + words[n] + ' ';
	  var metrics = context.measureText(testLine);
	  var testWidth = metrics.width;
	  if (testWidth > maxWidth && n > 0) {
		context.fillText(line, x, y);
		line = words[n] + ' ';
		y += lineHeight;
	  }
	  else {
		line = testLine;
	  }
	}
	context.fillText(line, x, y);
}
  

function drawMouseCompass(ctx)
{
	if (globalOrientWorldAroundPlayer) return; // Skip if using keyboard-controlled orientation
	
	// Mouse angle guide
	var xOffset = mousePosition.x; // + Math.sin(mouseAngle * TO_RADIANS) * canvasScreenScale;
	var yOffset = mousePosition.y; // - Math.cos(mouseAngle * TO_RADIANS) * canvasScreenScale;
	ctx.save();
	//ctx.fillRect(canvas.width/2 - 2, canvas.height/2 - 2, 4, 4);
	ctx.beginPath();
	ctx.lineWidth = 0.3;
	ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
	ctx.fillStyle = 'white';
	// Draw aesthetic hoop around player
	ctx.arc(canvas.width/2, canvas.height/2, 40, 0, 2 * Math.PI, false);
	/*
	// Color line when Laser Beam is active
	if (mouseButtonsDown[1] == true) {
		ctx.lineWidth = 3;
		ctx.strokeStyle = 'rgba(255, 0, 0, 1.0)';
	}
	if (mouseButtonsDown[3] == true) {
		ctx.lineWidth = 3;
		ctx.strokeStyle = 'rgba(0, 255, 0, 1.0)';
	}
	*/
	// Offset line start from player so there is no overlap
	if (globalOrientWorldAroundPlayer) {
		ctx.moveTo(canvas.width/2, canvas.height/2 - 40);
	} else {
		//ctx.moveTo(canvas.width/2 + Math.sin(player.angle * TO_RADIANS) * 40, canvas.height/2 - Math.cos(player.angle * TO_RADIANS) * 40);
		ctx.moveTo(canvas.width/2 + Math.sin(mouseAngle * TO_RADIANS) * 40, canvas.height/2 - Math.cos(mouseAngle * TO_RADIANS) * 40);
	}
	// Draw line
	ctx.lineTo(xOffset, yOffset);
	ctx.stroke();
	ctx.restore();
	
	/*
	// Draw a ball-cap at the end of the directional line
	ctx.save();
	ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
	ctx.beginPath();
	ctx.arc(xOffset, yOffset, 2, 0, 2 * Math.PI, false);
	ctx.fill();
	ctx.restore();
	*/
	
	/*
	// Targeting recticle
	var crosshairRadius = 35 * canvasScreenScale;
	var crossHairEdgeLength = crosshairRadius - crosshairRadius*0.5; // 65
	ctx.save();
	// Draw cross-hairs outer circle
	ctx.lineWidth = 0.8; //0.3;
	ctx.strokeStyle = 'rgba(0, 0, 255, 1.0)';
	ctx.beginPath();
	ctx.arc(xOffset, yOffset, crosshairRadius, 0, 2 * Math.PI, false);
	// Draw cross-hairs lines
	ctx.moveTo(xOffset, yOffset - crossHairEdgeLength);
	ctx.lineTo(xOffset, yOffset + crossHairEdgeLength);
	ctx.moveTo(xOffset - crossHairEdgeLength, yOffset);
	ctx.lineTo(xOffset + crossHairEdgeLength, yOffset);
	ctx.stroke();
	*/
	
}


function drawSunCompass(ctx, sunangle, sundistance)
{
	ctx.save();

	// Orient world around player ???
	if (globalOrientWorldAroundPlayer) {
		ctx.translate(canvas.width/2, canvas.height/2);
		ctx.rotate(-player.angle * TO_RADIANS);
		ctx.translate(-canvas.width/2, -canvas.height/2);
	}

	ctx.translate(canvas.width/2, canvas.height/2);
	ctx.rotate((sunangle + 180) * TO_RADIANS); // Accidentally flipped the draw functions below, so this is a quick-fix

	ctx.translate(0, canvas.height*0.49);
		ctx.fillStyle="rgba(31,31,0, 0.95)";
		ctx.beginPath();
		ctx.moveTo(-5,0);
		ctx.lineTo(0,350);
		ctx.lineTo(5,0);
		ctx.fill();

		var r = 20;
		var p = 10;
		var m = 0.5;
		if (sundistance < 4000)
			r = 40 * 2000/sundistance;

		ctx.translate(0, -r-10);

		ctx.fillStyle="rgba(31,31,0, 0.95)";
		ctx.beginPath();
		for (var i = 0; i < p; i++)
		{
			ctx.rotate(Math.PI / p);
			ctx.lineTo(0, 0 - (r*m));
			ctx.rotate(Math.PI / p);
			ctx.lineTo(0, 0 - r);
		}
		ctx.fill();
	ctx.restore();
	
	
	if (sundistance < 920)
	{
		// Draw layered ray lines to simulate glare from the sun
		var rayWidth = 90;
		drawRandomFractureLines(ctx, (-sunangle - 90) - rayWidth, (-sunangle - 90) + rayWidth, 400);
		//drawRandomFractureLines(ctx, 0, 360, 400);
	}
}

function drawThermometer(ctx, currenthealth, maxhealth, pos)
{

	ctx.beginPath();
	ctx.rect(pos[0], pos[1], 200, 15);
	ctx.fillStyle = '#9d9d9d';
	ctx.fill();
	//ctx.lineWidth = 2;
	//ctx.strokeStyle = 'black';
	//ctx.stroke();



	/*
	var percentprogress = (currenthealth/maxhealth)*196;
	if (currenthealth < 0) percentprogress = 0;
	ctx.beginPath();
	ctx.rect(pos[0]+2, pos[1]+2, percentprogress, 11);
	ctx.fillStyle = 'white';
	ctx.fill();
	*/

	// ctx.beginPath();
	// ctx.fillRect(pos[0], pos[1], 200, 15);
	// ctx.fillStyle = thermometerPattern;
	// ctx.fill();


	ctx.beginPath();
	var percentprogress = (currenthealth/maxhealth)*193;
	if (currenthealth < 0) percentprogress = 0;
	ctx.rect(pos[0]+8, pos[1]+9, percentprogress, 3);
	ctx.fillStyle = 'red';
	ctx.fill();

	var imageObj = resources.get('img/hud/thermometer.png')
	ctx.drawImage(imageObj, pos[0], pos[1]);

	ctx.beginPath();
	ctx.rect(pos[0]+3, pos[1]+3, 195, 15);
	ctx.lineWidth = 2;
	ctx.strokeStyle = 'black';
	ctx.stroke();

	//resources.get('img/sprites.png')
}



function drawRespawnTimerBar(ctx, currenthealth, maxhealth, pos, innercolor)
{
	var percentprogress = (currenthealth/maxhealth)*(canvas.width-200);
	if (currenthealth < 0) percentprogress = 0;
	ctx.beginPath();
	ctx.rect(pos[0]-(percentprogress/2), pos[1], percentprogress, 20);
	ctx.fillStyle = innercolor;
	ctx.fill();
	
	// Draw random "fracture" lines to simulate chaos when dead
	drawRandomFractureLines(ctx, 0, 360, 200); // 200
	
}


function drawRandomFractureLines(ctx, minAngle, maxAngle, addRays) 
{
	ctx.save();
	
	ctx.lineWidth = 0.3;
	ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
	ctx.fillStyle = 'white';
	
	// Draw aesthetic hoop around player
	ctx.beginPath();
	ctx.arc(canvas.width/2, canvas.height/2, 40, 0, 2 * Math.PI, false);
	ctx.stroke();
	
	// 20 // 3000
	ctx.lineWidth = 50.3;
	ctx.strokeStyle = 'rgba(255, 255, 255, 0.005)';
	
	if (globalOrientWorldAroundPlayer) {
		ctx.translate(canvas.width/2, canvas.height/2);
		ctx.rotate(-player.angle * TO_RADIANS);
		ctx.translate(-canvas.width/2, -canvas.height/2);
	}
	
	var rayCount = 2*(Math.abs(maxAngle-minAngle)) + addRays; // 820 for 360deg (with addRays default = 100)
	for (var i = 0; i < rayCount; i++) {
		// Choose random angle
		var randPos = findPointFromAngleDistance(0, 0, getRandomInt(minAngle,maxAngle), getRandomInt(100,2000));
		var randAngle = getAngle(0, 0, randPos.x, randPos.y);
		ctx.beginPath();
		ctx.moveTo(canvas.width/2 + Math.sin(randAngle * TO_RADIANS) * 40, canvas.height/2 - Math.cos(randAngle * TO_RADIANS) * 40);
		// Draw line
		ctx.lineTo(canvas.width/2 + randPos.x, canvas.height/2 - randPos.y);
		ctx.stroke();
	}
	
	ctx.restore();
}
/*
function drawRandomFractureLines(ctx) 
{
	ctx.save();
	
	ctx.lineWidth = 0.3;
	ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
	ctx.fillStyle = 'white';
	
	// Draw aesthetic hoop around player
	ctx.beginPath();
	ctx.arc(canvas.width/2, canvas.height/2, 40, 0, 2 * Math.PI, false);
	ctx.stroke();
	
	// 20 // 3000
	ctx.lineWidth = 50.3;
	ctx.strokeStyle = 'rgba(255, 255, 255, 0.005)';
	for (var i = 0; i < 820; i++) {
		// Choose random angle
		var xOffset = getRandomInt(-1000,1000);
		var yOffset = getRandomInt(-1000,1000);
		var randAngle = getAngle(0, 0, xOffset, yOffset);
		ctx.beginPath();
		ctx.moveTo(canvas.width/2 + Math.sin(randAngle * TO_RADIANS) * 40, canvas.height/2 - Math.cos(randAngle * TO_RADIANS) * 40);
		// Draw line
		ctx.lineTo(canvas.width/2 + xOffset, canvas.height/2 - yOffset);
		ctx.stroke();
		
	}
	
	ctx.restore();
}
*/


function drawLootIcons()
{
	if (!player.loot_target[0]) return 0;


	var xOffset = player.loot_target[0]-player.x+canvas.width/2;
	var yOffset = -(player.loot_target[1]-player.y)+canvas.height/2;


	ctx.save();

	// Orient world around player
	if (globalOrientWorldAroundPlayer) {
		ctx.translate(canvas.width/2, canvas.height/2);
		ctx.rotate(-player.angle * TO_RADIANS);
		ctx.translate(-canvas.width/2, -canvas.height/2);
	}

	ctx.translate(xOffset, yOffset); // offset rendered world to center on player coordinates
	//ctx.rotate((entity.angle) * TO_RADIANS);
	//ctx.scale(entity.scale, entity.scale);

	if (globalOrientWorldAroundPlayer) ctx.rotate(player.angle * TO_RADIANS);
	ctx.translate(-65, -85);
	//drawTextLine(ctx, [-110, -55], "PRESS KEYS " + getLootKeyBound(1) + ", " + getLootKeyBound(2) + ", " + getLootKeyBound(3) + " TO LOOT GEAR", 20, "white"); //rgba(0, 255, 0, 0.5)
	//drawTextLine(ctx, [-90, -65], "PRESS KEYS TO LOOT GEAR", 20, "white");
	drawTextLine(ctx, [65, -65], "PRESS KEYS TO LOOT GEAR", 20, "white", "center");
	var keybindIndex = 1;
	for (var i = 2; i < player.loot_target.length; i++)
	{
		if (i == 4 || i == 7 || i == 9)
		{
			// Show keybinding to press to loot this item			
			drawTextLine(ctx, [-5, -30], getLootKeyBound(keybindIndex++), 20, "white");


			// Show the stat number in green or red to let player know if this item is better than the one they currently have equipped
			var lootColor = "red";
			if (i == 4 && parseInt(player.loot_target[i]) > player.damage) lootColor = "green";
			if (i == 7 && parseInt(player.loot_target[i]) > player.damage) lootColor = "green";
			if (i == 9 && parseInt(player.loot_target[i]) > player.health_max) lootColor = "green";

			// Defensive items will do 0 damage, so give them a different color
			if (i == 4 && parseInt(player.loot_target[i]) == 0) lootColor = "blue";
			if (i == 7 && parseInt(player.loot_target[i]) == 0) lootColor = "blue";

			// Draw the stat overtop the loot icon(s) that have been rendered in this position (see 'else' below)
			drawTextLine(ctx, [-12, 35], parseInt(player.loot_target[i]), 20, lootColor);

			// Move position before showing the next loot item on list
			ctx.translate(65, 0);
		}
		else
		{
			// Render loot slot icons
			// Use data from the server-side/type Sprite object to create a user-side/type Sprite object
			var localSprite = createLocalSprite(player.loot_target[i], 0);
			if (localSprite) renderEquipmentSprite(localSprite, ctx);
			else console.log('missing sprite at ' + entity.sprite);
		}
	}


	ctx.restore();
}
function getLootKeyBound(i)
{
	switch (i)
	{
		case 1:
			return userInputControls.loot_weapon;
			break;
		case 2:
			return userInputControls.loot_weapon2;
			break;
		case 3:
			return userInputControls.loot_armor;
			break;
		case 4:
			return userInputControls.loot_engine;
			break;
		default:
			return 'none';
	}
}



function renderMinimap(ctx, canvas, offsetScale, minimap)
{
	ctx.clearRect ( 0 , 0 , canvas.width , canvas.height );
	ctx.save();

	ctx.beginPath();
	ctx.fillStyle = '#000000';
	ctx.rect(0, 0, canvas.width, canvas.height);
	ctx.fill();

	if (globalOrientWorldAroundPlayer) {
		ctx.translate(canvas.width/2, canvas.height/2);
		ctx.rotate(-player.angle * TO_RADIANS);
		ctx.translate(-canvas.width/2, -canvas.height/2);
	}

	// Draw world loop boundary
	ctx.beginPath();
	ctx.lineWidth = 0.1;
	ctx.strokeStyle = '#12ffff';
	var xOffset = (-player.x)*offsetScale + canvas.width/2;
	var yOffset = -(-player.y)*offsetScale + canvas.height/2;
	ctx.arc(xOffset, yOffset, (minimap.worldsize*offsetScale), 0, 2 * Math.PI);
	ctx.stroke();

	ctx.beginPath();
	ctx.fillStyle = 'yellow';
	for(var i=0; i<minimap.map.length; i++) {
		if (minimap.map[i].actortype == "sun")
			rendeMinimapEntity(ctx, canvas, offsetScale, minimap.map[i]);
	}
	ctx.fill();
	
	/*
	ctx.beginPath();
	ctx.fillStyle = '#12ffff';
	ctx.strokeStyle = '#12ffff';
	ctx.lineWidth = 0.1;
	for(var i=0; i<minimap.map.length; i++) {
		if (minimap.map[i].actortype == "explosion")
			rendeMinimapEntity(ctx, canvas, offsetScale, minimap.map[i]);
	}
	ctx.stroke();
	ctx.fill();
	
	ctx.beginPath();
	ctx.fillStyle = 'green';
	for(var i=0; i<minimap.map.length; i++) {
		if (minimap.map[i].actortype == "planet" || minimap.map[i].actortype == "moon")
			rendeMinimapEntity(ctx, canvas, offsetScale, minimap.map[i]);
	}
	ctx.fill();

	ctx.beginPath();
	ctx.fillStyle = 'red';
	for(var i=0; i<minimap.map.length; i++) {
		if (minimap.map[i].actortype == "player") {
			//if (minimap.map[i].isdead) ctx.fillStyle = '#e6e600';
			//else ctx.fillStyle = 'red';
			rendeMinimapEntity(ctx, canvas, offsetScale, minimap.map[i]);
		}
	}
	ctx.fill();

	ctx.beginPath();
	ctx.fillStyle = '#ff08fb';
	for(var i=0; i<minimap.map.length; i++) {
		if (minimap.map[i].actortype == "projectile")
			rendeMinimapEntity(ctx, canvas, offsetScale, minimap.map[i]);
	}
	ctx.fill();
	*/
	
	
	// TODO: are rapid ctx.beginPath() & ctx.fill() pairs less efficient, or does it make any difference at all?
	// Render each entity based on color
	for(var i=0; i<minimap.map.length; i++) {
		ctx.beginPath();
		ctx.fillStyle = minimap.map[i].color;
		rendeMinimapEntity(ctx, canvas, offsetScale, minimap.map[i]);
		ctx.stroke();
		ctx.fill();
	}
	
	
	// Highlight a circle around dead (loot-able) spaceships
	ctx.fillStyle = 'white';
	ctx.strokeStyle = 'white';
	ctx.lineWidth = 0.2;
	for(var i=0; i<minimap.map.length; i++) {
		if (minimap.map[i].actortype == "player" && minimap.map[i].color == "white") 
		{
			var xOffset = (minimap.map[i].x-player.x)*offsetScale + canvas.width/2;
			var yOffset = -(minimap.map[i].y-player.y)*offsetScale + canvas.height/2;
			
			ctx.beginPath();
			rendeMinimapEntity(ctx, canvas, offsetScale, minimap.map[i]);
			ctx.fill();
			
			ctx.beginPath();
			ctx.arc(xOffset, yOffset, (100*offsetScale), 0, 2 * Math.PI);
			ctx.stroke();
			
			ctx.beginPath();
			ctx.arc(xOffset, yOffset, (200*offsetScale), 0, 2 * Math.PI);
			ctx.stroke();
		}
	}
	
	
	// Draw player in center of minimap
	ctx.beginPath();
	ctx.fillStyle = '#ffae00';
	rendeMinimapEntity(ctx, canvas, offsetScale, player)
	ctx.fill();
	
	
	ctx.beginPath();
	ctx.fillStyle = '#ffae00';
	ctx.translate(canvas.width/2, canvas.height/2);
	ctx.rotate(player.angle * TO_RADIANS);
	ctx.moveTo(0,-10);
    ctx.lineTo(2,1);
    ctx.lineTo(-2,1);
    ctx.fill();
	

	ctx.restore();
}
function rendeMinimapEntity(ctx, canvas, offsetScale, entity)
{
	//var offsetScale = 0.03;
	var xOffset = (entity.x-player.x)*offsetScale + canvas.width/2;
	var yOffset = -(entity.y-player.y)*offsetScale + canvas.height/2;

	// Do not render if off the edge of the map
	//if (entity.actortype != "sun") {
	//	if (xOffset < 0-canvas.width/3 || xOffset > canvas.width*(4/3)) return 0;
	//	if (yOffset < 0-canvas.height/3 || yOffset > canvas.height*(4/3)) return 0;
	//}

	if (entity.actortype && entity.actortype == "sun") ctx.arc(xOffset, yOffset, (1548*offsetScale*0.5), 0, 2 * Math.PI); 	//if (entity.actortype == "sun") ctx.rect(xOffset-(1548*offsetScale*0.5), yOffset-(1548*offsetScale*0.5), (1548*offsetScale), (1548*offsetScale));
	else ctx.rect(xOffset-1, yOffset-1, 3, 3);

	if (entity.actortype == "explosion")
	{
		ctx.lineTo(
		 	Math.cos((entity.direction-90)*TO_RADIANS)*entity.distance*offsetScale + xOffset,
		 	Math.sin((entity.direction-90)*TO_RADIANS)*entity.distance*offsetScale + yOffset
		);
	}
}




// ================== MESSAGES FROM THE SERVER ================== //
// var warningTimoutTimer;
// var warningList = [];
function postWarningMessage(textColor, newMessage)
{
	newMessage = '<div style="color:'+textColor+';"><strong>' + newMessage + '</strong></div>';
	warningList.push(newMessage);
	if (warningList.length > 5) warningList.shift(); // No more than 5 warnings will spam you at any given time

	printWarningMessages();

	clearTimeout(warningTimoutTimer); // Do nothing until user FINISHES resizing the browser window, otherwise you end up with an insane number of function calls getting added up every second that you are still dragging the window.
	warningTimoutTimer = setInterval(function()
	{
		warningList.shift(); // No more than 5 warnings will spam you at any given time
		printWarningMessages();
	}, 3000);
}
function printWarningMessages()
{
	//console.log(warningList);

	$('#myWarningMessages').html('');
	for(var thisWarning in warningList) {
		$('#myWarningMessages').html( warningList[thisWarning] + $('#myWarningMessages').html());
	}
}
