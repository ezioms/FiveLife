const misc = require('../script');

mp.events.add({
	"cMenu-Open" : (inject) => {
		misc.prepareToCef(1);
		misc.openCef("package://freeroam/browser/Menu/Menu.html");
		misc.injectCef(inject);
	},
	
});