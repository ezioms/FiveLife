const business = require('./sBusiness');
const misc = require('../misc');
const clothes = require('../Character/sClothes');

class ClothingShop extends business {
    constructor(d) {
		super(d);
		this.camData = JSON.parse(d.camData);
		this.buyerStandCoord = d.buyerStandCoord;
    }
	
	setLocalSettings() {
		this.buyerColshape.clothingShopId = this.id;
		this.blip.model = 73;
		this.blip.name = `Kleidergeschäft`;
	}

	async buyCloth(player, d) {
		const price = clothes.getPrice(player, d.title, d.number);
		const shopTax = misc.roundNum(price * this.margin / 100);
		const endPrice = price + shopTax;
		const canBuy = await player.changeMoney(-endPrice);
		if (!canBuy) return;

		await this.addMoneyToBalance(shopTax);
		await clothes.saveClothes(player, d);
		player.notify(`~g~Erfolgreich!`);
		misc.log.debug(`${player.name} hat Kleidung im Wert von $${endPrice} erworben`);
	}

	async updateCamData(player) {
		const pos = player.position;
		const obj = {
			x: misc.roundNum(pos.x, 2),
			y: misc.roundNum(pos.y, 2),
			z: misc.roundNum(pos.z, 2),
			rz: misc.roundNum(player.heading, 2),
			viewangle: 35,
		}
		const data = JSON.stringify(obj);
		await misc.query(`UPDATE clothingshop SET camData = '${data}' WHERE id = ${this.id}`);
		this.camData = obj;

		player.notify(`~g~Erfolgreich!`);
	}

	openBuyerMenu(player) {
		if (player.vehicle) return;
		player.tp(JSON.parse(this.buyerStandCoord));
		let execute;
		if (player.model === 1885233650) execute = `loadMans();`;
		else execute = `loadWomans();`;

		execute += `app.id = ${this.id};`;
		execute += `app.margin = ${this.margin};`;
		execute += `app.camRotation = ${this.camData.rz - 180};`;
	
		player.call("cClothingShop-ShowBuyerMenu", [execute, this.camData]);
		misc.log.debug(`${player.name} enter a clothing shop menu`);
	}	
}


async function loadClothingShops() {
	const d = await misc.query("SELECT * FROM business INNER JOIN clothingshop ON business.id = clothingshop.id");
	for (let i = 0; i < d.length; i++) {
		new ClothingShop(d[i]);
	}
}
loadClothingShops();



mp.events.add({
	"sClothingShop-BuyCloth" : (player, data) => {
		const d = JSON.parse(data);
		const shop = business.getBusiness(d.id);
		shop.buyCloth(player, d);
	},

	"sClothingShop-ReloadClothes" : (player) => {
		clothes.loadPlayerClothes(player);
	},
});

mp.events.addCommand({
	'createclothingshop' : async (player, enteredprice) => {
		if (player.adminLvl < 1) return;
		const id = business.getCountOfBusinesses() + 1;
		const coord = misc.getPlayerCoordJSON(player);
		const price = Number(enteredprice.replace(/\D+/g,""));
		const query1 = misc.query(`INSERT INTO business (id, title, coord, price) VALUES ('${id}', 'Kleidergeschäft', '${coord}', '${price}');`);
		const query2 = misc.query(`INSERT INTO clothingshop (id) VALUES ('${id}');`);	
		await Promise.all([query1, query2]);
		player.outputChatBox("!{#4caf50} Clothing shop successfully created!");
	},	

	'setchbuyerstandcoord' : async (player, id) => {
		if (player.adminLvl < 1) return;
		const coord = misc.getPlayerCoordJSON(player);
		await misc.query(`UPDATE clothingshop SET buyerStandCoord = '${coord}' WHERE id = ${id}`);
		player.notify(`~g~Erfolgreich!`);
	},

	'setchcamdata' : async (player, id) => {
		if (player.adminLvl < 1) return;
		const shop = business.getBusiness(+id);
		shop.updateCamData(player);
	},	
});