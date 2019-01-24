const business = require('./sBusiness');
const misc = require('../misc');

class GasStation extends business {
    constructor(d) {
        super(d);
        this.fuelprice = 1 + 0.02 * this.margin;
        this.fillingCoord = JSON.parse(d.fillingCoord);
        this.camData = d.camData;
        this.tempGain = 0;
    }
    
    setLocalSettings() {
        this.buyerColshape.gasStationId = this.id;
        this.blip.model = 361;
        this.blip.name = `Station`;
    }

    createFillingColshape() {
        if (!this.fillingCoord) return;
        const colshape = mp.colshapes.newSphere(this.fillingCoord.x, this.fillingCoord.y, this.fillingCoord.z, this.fillingCoord.r);
        colshape.gasStationFillingId = this.id;
        this.fillingShape = colshape;
    }

    updateFuelPrice() {
        this.fuelprice = 1 + 0.02 * this.margin;
    }

    async setMargin(ownerId, newMargin) {
        await super.setMargin(ownerId, newMargin);
        this.updateFuelPrice();
    }

    getCarsCanFillUp() {
        const vehiclesList = [];
        mp.vehicles.forEachInRange(this.fillingCoord, this.fillingCoord.r, (vehicle) => {
            const obj = {
                id: vehicle.id,
                title: vehicle.title,
                fuel: vehicle.fuel,
                fuelTank: vehicle.fuelTank,
                numberPlate: vehicle.numberPlate,
            }
            vehiclesList.push(obj);
        });
        return vehiclesList;
    }

    async fillUpCar(player, str) {
        const carData = JSON.parse(str);

        let vehicle;
        mp.vehicles.forEachInRange(this.fillingCoord, this.fillingCoord.r, (veh) => {
            if (veh.id === carData.id) {
                vehicle = veh;
            }
        });
        if (!vehicle) return;

        if (vehicle.engine) {
            player.notify(`~r~S'il vous plaît éteindre le moteur!`);
            return;
        }
        if (vehicle.getOccupants().length > 0) {
            player.notify(`~r~Demandez à vos passagers de quitter le véhicule!`);
            return;
        }

        const price = Math.ceil(carData.litres * this.fuelprice);
        const canBuy = await player.changeMoney(-price);
        if (!canBuy) return;

        const tax = misc.roundNum(price - carData.litres, 2);
        this.updateTempGain(tax);
        vehicle.fillUp(carData.litres);

        player.notify(`~g~Succès!`);
        misc.log.debug(`${player.name} remplir la voiture pour $${price}`);
    }

    async updateFillingData(player, radius) {
        const pos = player.position;
        const obj = {
            x: misc.roundNum(pos.x, 2),
            y: misc.roundNum(pos.y, 2),
            z: misc.roundNum(pos.z, 2),
            r: misc.roundNum(+radius, 2),
        }
        const coord = JSON.stringify(obj);
        await misc.query(`UPDATE gasstation SET fillingCoord = '${coord}' WHERE id = ${this.id}`);
        player.notify(`~g~Succès!`);
    }

    async updateCamData(player, viewangle) {
        const pos = player.position;
        const obj = {
            x: misc.roundNum(pos.x, 2),
            y: misc.roundNum(pos.y, 2),
            z: misc.roundNum(pos.z + 2, 2),
            rz: misc.roundNum(player.heading, 2),
            viewangle: +viewangle,
        }
        const data = JSON.stringify(obj);
        await misc.query(`UPDATE gasstation SET camData = '${data}' WHERE id = ${this.id}`);
        this.camData = data;

        player.notify(`~g~Succès!`);
    }

    updateTempGain(newGain) {
        this.tempGain += newGain;
        if (this.tempGain < 1) return;
        const tax = Math.ceil(this.tempGain);
        this.tempGain -= tax;
        this.addMoneyToBalance(tax);
    }

    openBuyerMenu(player) {
        if (player.vehicle) return;
        const cars = JSON.stringify(this.getCarsCanFillUp());
    
        let execute = `app.id = ${this.id};`;
        execute += `app.margin = ${this.margin};`;
        execute += `app.updatePriceForLitre();`;
        execute += `app.updateCars('${cars}');`
        
        player.call("cGasStation-OpenBuyerMenu", [execute, this.camData]);
        misc.log.debug(`${player.name} entrer dans un menu de station d'essence`);
    }	
}

mp.events.add({
    "playerEnterColshape" : (player, colshape) => {
        if (!player.loggedIn) return;
        if (player.vehicle && colshape.gasStationFillingId) {
            const shop = business.getBusiness(colshape.gasStationFillingId);
            player.notify(`Prix au litre: ~g~$${shop.fuelprice}`);
        }
    },
    
    "playerExitColshape" : (player, colshape) => {
        if (!player.loggedIn) return;
        if (player.vehicle && colshape.gasStationFillingId) player.notify(`~g~Bonne route, à la prochaine!`);
    },

    "sGasStation-FillUp" : (player, str) => {
        const id = player.canOpen.businessBuyerMenu;
        if (!id) return;
        const shop = business.getBusiness(id);
        shop.fillUpCar(player, str);
    },
});

async function loadShops() {
    const d = await misc.query("SELECT * FROM business INNER JOIN gasstation ON business.id = gasstation.id");
    for (let i = 0; i < d.length; i++) {
        const shop = new GasStation(d[i]);
        shop.createFillingColshape();
    }
}
loadShops();

mp.events.addCommand({
    'creategasstation' : async (player, enteredprice) => {
        if (player.adminLvl < 1) return;
        const id = business.getCountOfBusinesses() + 1;
        const coord = misc.getPlayerCoordJSON(player);
        const price = Number(enteredprice.replace(/\D+/g,""));
        const query1 = misc.query(`INSERT INTO business (title, coord, price) VALUES ('Service', '${coord}', '${price}');`);
        const query2 = misc.query(`INSERT INTO gasstation (id) VALUES ('${id}');`);	
        await Promise.all([query1, query2]);
        player.outputChatBox("!{#4caf50} Station d essence créée avec succès!");
    },	

    'setgasstationfillingpos' : async (player, fullText, id, radius) => {
        if (player.adminLvl < 1) return;
        const shop = business.getBusiness(+id);
        shop.updateFillingData(player, radius);
    },	

    'setgasstationcamdata' : async (player, fullText, id, viewangle) => {
        if (player.adminLvl < 1) return;
        const shop = business.getBusiness(+id);
        shop.updateCamData(player, viewangle);
    },	

});
