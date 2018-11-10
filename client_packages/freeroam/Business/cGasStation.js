"use strict";

const misc = require('../script');

mp.events.add({
	"cGasStation-OpenBuyerMenu" : (inject, camData) => {
		const d = JSON.parse(camData);
		misc.createCam(d.x, d.y, d.z, 0, 0, d.rz, d.viewangle);
		misc.prepareToCef();
		misc.openCef("package://freeroam/browser/Business/GasStation/gs.html");
		misc.injectCef(inject);
	}
});
