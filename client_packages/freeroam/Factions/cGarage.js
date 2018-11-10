const misc = require('../script');

mp.events.add({

	"cGarage-ShowVisitorsGarageMenu" : (execute, cam) => {
		misc.prepareToCef(1);
		misc.openCef("package://freeroam/browser/Factions/VisitorsGarage/Garage/garage.html");
		misc.injectCef(execute);
		const c = JSON.parse(cam);
		misc.createCam(c.x, c.y, c.z, c.rx, c.ry, c.rz, c.viewangle);
	},

	"cGarage-ShowVisitorsLiftMenu" : (execute) => {
		misc.prepareToCef(1);
		misc.openCef("package://freeroam/browser/Factions/VisitorsGarage/Lift/lift.html");
		misc.injectCef(execute);
	},
});

