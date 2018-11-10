"use strict";

const misc = require('../script');
const player = mp.players.local;

mp.events.add(
{
	"cBarberShop-ShowBuyerMenu" : (inject, camD) => {
		misc.prepareToCef();
		misc.openCef("package://freeroam/browser/Business/BarberShop/bs.html");
		misc.injectCef(inject);
		misc.createCam(camD.x, camD.y, camD.z, camD.rx, camD.ry, camD.rz, camD.viewangle);
	},

	"cBarberShop-SetHairColor" : (col1, col2) => player.setHairColor(col1, col2)
});
