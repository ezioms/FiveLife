"use strict"

const player = mp.players.local;
const misc = require('../script');

class loginClass {
    constructor() {
        mp.events.add({
			"cLogin-ShowLoginWindow" : () => {
				misc.prepareToCef(1);
				misc.createCam(3223, 5349, 14, 0, 0, 218, 20);
				misc.openCef("package://freeroam/browser/Login/login.html");
			},
			"cLogin-ShowRegWindow" : () => {
				misc.prepareToCef(1);
				misc.createCam(3223, 5349, 14, 0, 0, 218, 20);
				misc.openCef("package://freeroam/browser/Login/register.html");
			},
		});
    }
}

const login = new loginClass();
