"use strict";

const misc = require('../script');

mp.events.add({
	"cBusinnes-ShowMenu" : (inject) => {
		misc.prepareToCef(500);
		misc.openCef("package://freeroam/browser/Business/business.html");
		misc.injectCef(inject);
	}
});
