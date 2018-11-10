const misc = require('../script');

mp.events.add({
	"cCheapCarDealership-OpenBuyerMenu" : (inject) => {
		misc.prepareToCef(500);
		misc.openCef("package://freeroam/browser/Business/CheapCarDealership/ccd.html");
		misc.injectCef(inject);
	},

	"cCommercialCarDealership-OpenBuyerMenu" : (inject) => {
		misc.prepareToCef(500);
		misc.openCef("package://freeroam/browser/Business/CommercialCarDealership/ccd.html");
		misc.injectCef(inject);
	}
});