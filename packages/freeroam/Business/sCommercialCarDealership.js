const business = require('./sBusiness');
const misc = require('../misc');
const carDealership = require('./sCarDealership');

class CommercialCarDealership extends carDealership {
	
	setLocalSettings() {
		this.blip.model = 634;
		this.blip.name = `Concessionaire`;
		this.blip.color = 38;
	}

	openBuyerMenu(player) {
		if (player.vehicle) return;
		let execute = `app.id = ${this.id};`;
		execute += `app.margin = ${this.margin};`;

		player.call("cCommercialCarDealership-OpenBuyerMenu", [execute]);
		misc.log.debug(`${player.name} entrer dans un menu de concessionnaire de voitures commerciales`);
	}
}

async function loadShops() {
	const d = await misc.query("SELECT * FROM business INNER JOIN commercialcardealership ON business.id = commercialcardealership.id");
	for (let i = 0; i < d.length; i++) {
		new CommercialCarDealership(d[i]);
	}
}
loadShops();

mp.events.addCommand({
	'createcommercialcardealership' : async (player, enteredprice) => {
		if (player.adminLvl < 1) return;
		const id = business.getCountOfBusinesses() + 1;
		const coord = misc.getPlayerCoordJSON(player);
		const price = Number(enteredprice.replace(/\D+/g,""));
		const query1 = misc.query(`INSERT INTO business (title, coord, price) VALUES ('Autoverkäufer', '${coord}', '${price}');`);
		const query2 = misc.query(`INSERT INTO commercialcardealership (id) VALUES ('${id}');`);	
		await Promise.all([query1, query2]);
		player.outputChatBox("!{#4caf50} Concession de voitures bon marché crée avec succès!");
		player.outputChatBox("!{#4caf50} Maintenant, utilisez la commande /setbusbuyermenu [id] ou une autre commande!");
	},	

	'setcommercialcardealernewcarcoord' : async (player, id) => {
		if (player.adminLvl < 1) return;
		if (!player.vehicle) return player.nofity(`~r~Sie sitzen in keinem Fahrzeug!`);
		const coord = misc.getPlayerCoordJSON(player);
		await misc.query(`UPDATE commercialcardealership SET newCarCoord = '${coord}' WHERE id = ${id}`);
		player.notify(`~g~Réussi`);
	},	
});
