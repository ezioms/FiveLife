mp.gui.chat.safeMode = false;

// CEF browser.
let menu;

// Configs.
let vehicles     = JSON.parse(require('./freeroam/configs/vehicles.js'));
let skins        = JSON.parse(require('./freeroam/configs/skins.js')).Skins;
let weapon       = JSON.parse(require('./freeroam/configs/weapon.js'));

// Initialization functions.
let vehiclesInit = require('./freeroam/menu_initialization/vehicles.js');
let skinsinit    = require('./freeroam/menu_initialization/skins.js');
let weaponInit   = require('./freeroam/menu_initialization/weapon.js');
let playersInit  = require('./freeroam/menu_initialization/players.js');

// Creating browser.
mp.events.add('guiReady', () => {
    if (!menu) {
        // Creating CEF browser.
        menu = mp.browsers.new('package://freeroam/browser/index.html');
        // Init menus and events, when browser ready.
        mp.events.add('browserDomReady', (browser) => {
            if (browser == menu) {
                // Init events.
                require('freeroam/events.js')(menu);
                // Init menus.
                vehiclesInit(menu, vehicles);
                skinsinit(menu, skins);
                weaponInit(menu, weapon);
                playersInit(menu);

                mp.gui.execute(`insertMessageToChat('<div style="background-color: rgba(0, 0, 0, 0.75); font-size: 1.0vw; padding: 6px; color: #ff0000; font-weight: 600;">Press F2 for open freeroam menu.</div>', 'true');`);
            }
        });
    }
});

const Use3d = true;
const UseAutoVolume = false;

const MaxRange = 50.0;

mp.keys.bind(0x73, true, function() {
    mp.voiceChat.muted = !mp.voiceChat.muted;
    mp.game.graphics.notify("Voice Chat: " + ((!mp.voiceChat.muted) ? "~g~enabled" : "~r~disabled"));
});

let g_voiceMgr =
{
	listeners: [],
	
	add: function(player)
	{
		this.listeners.push(player);
		
		player.isListening = true;		
		mp.events.callRemote("add_voice_listener", player);
		
		if(UseAutoVolume)
		{
			player.voiceAutoVolume = true;
		}
		else
		{
			player.voiceVolume = 1.0;
		}
		
		if(Use3d)
		{
			player.voice3d = true;
		}
	},
	
	remove: function(player, notify)
	{
		let idx = this.listeners.indexOf(player);
			
		if(idx !== -1)
			this.listeners.splice(idx, 1);
			
		player.isListening = false;		
		
		if(notify)
		{
			mp.events.callRemote("remove_voice_listener", player);
		}
	}
};

mp.events.add("playerQuit", (player) =>
{
	if(player.isListening)
	{
		g_voiceMgr.remove(player, false);
	}
});

setInterval(() =>
{
	let localPlayer = mp.players.local;
	let localPos = localPlayer.position;
	
	mp.players.forEachInStreamRange(player =>
	{
		if(player != localPlayer)
		{
			if(!player.isListening)
			{
				const playerPos = player.position;		
				let dist = mp.game.system.vdist(playerPos.x, playerPos.y, playerPos.z, localPos.x, localPos.y, localPos.z);
				
				if(dist <= MaxRange)
				{
					g_voiceMgr.add(player);
				}
			}
		}
	});
	
	g_voiceMgr.listeners.forEach((player) =>
	{
		if(player.handle !== 0)
		{
			const playerPos = player.position;		
			let dist = mp.game.system.vdist(playerPos.x, playerPos.y, playerPos.z, localPos.x, localPos.y, localPos.z);
			
			if(dist > MaxRange)
			{
				g_voiceMgr.remove(player, true);
			}
			else if(!UseAutoVolume)
			{
				player.voiceVolume = 1 - (dist / MaxRange);
			}
		}
		else
		{
			g_voiceMgr.remove(player, true);
		}
	});
}, 500);

mp.events.add('playerEnterVehicle', (vehicle, seat) => {
	setInterval(function(){radio_sync();},1000);
});

function radio_sync() {
	var player = mp.players.local;
	if(player.vehicle){
	if(player.vehicle.getVariable('radio') == null){
		var radio_index = 0;
	}else{
		var radio_index = player.vehicle.getVariable('radio');
	}

		if (player.vehicle && player.vehicle.getPedInSeat(-1) === player.handle) // Check if player is in vehicle and is driver
		{
			if(radio_index != mp.game.invoke("0xE8AF77C4C06ADC93")){
			radio_index = mp.game.invoke("0xE8AF77C4C06ADC93");
			mp.events.callRemote('radiochange', radio_index);
			}
		}else{
			if(radio_index == 255){
				mp.game.audio.setRadioToStationName("OFF");
			}else{
				mp.game.invoke("0xF7F26C6E9CC9EBB8", true);
				mp.game.invoke("0xA619B168B8A8570F ", radio_index);
			}
			
		}
	}
};

let speedo = mp.browsers.new("package://freeroam/browser/speedometer/speedometer.html");
let showed = false;
let player = mp.players.local;

mp.events.add('render', () =>
{
	if (player.vehicle && player.vehicle.getPedInSeat(-1) === player.handle)
	{
		if(showed === false)
		{
			speedo.execute("showSpeedo();");
			showed = true;
		}
		/*Get vehicle infos*/
		let vel = player.vehicle.getSpeed() * 3.6;
		let rpm = player.vehicle.rpm * 1000;
		let gas = player.vehicle.getPetrolTankHealth();
		gas = gas < 0 ? 0: gas / 10;
		
		speedo.execute(`update(${vel}, ${rpm}, ${gas});`); // Send data do CEF
	}
	else
	{
		if(showed)
		{
			speedo.execute("hideSpeedo();");
			showed = false;
		}
	}
});