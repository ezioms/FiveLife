const moneyAPI = require('./Money/sMoney');
const business = require('../Business/sBusiness');


class GPS {
	constructor () {
		mp.events.add('sGPS-CreateRoute', (player, str) => {
			const d = JSON.parse(str);
			let x, y;
			if (d.name === "Krankenhaus") {
				x = -498.184;
				y = -335.741;
			}
			if (d.name === "Gefängnis") {
				x = 1846.283;
				y = 2585.906;
			}
			if (d.name === "Clickin Bell Delivery Courier") {
				x = -136.757;
				y = 6198.713;
			}
			if (d.name === "ATM") {
				const pos = moneyAPI.getNearestATM(player.position);
				x = pos.x;
				y = pos.y;
			}
			if (d.name === "Tankstelle" || d.name === "Kleidergeschäft" || d.name === "Frisuer") {
				const pos = business.getNearestBusiness(d.name, player.position);
				x = pos.x;
				y = pos.y;
			}
			if (d.name === "Business") {
				const pos = business.getBusinessPositionById(d.id);
				if (!pos) return;
				x = pos.x;
				y = pos.y;
			}
			if (d.name === "Auto Finden") {
				const pos = mp.vehicles.at(d.id).position;
				if (!pos) return;
				x = pos.x;
				y = pos.y;
			}
			this.createRoute(player, x, y);
		});

	}

	createRoute(player, x, y) {
		player.call("cGPS-CreateRoute", [x, y]);
	}

}
new GPS();
