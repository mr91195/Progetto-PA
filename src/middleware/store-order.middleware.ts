// Importa le classi DAO e i moduli necessari.
import { StoreDAO } from "dao/store.dao";
import { OrderDAO } from "dao/orders.dao";
import { StatusOrder } from "models/orders.model";
import {
	ReasonPhrases,
	StatusCodes,
	getReasonPhrase,
	getStatusCode,
} from 'http-status-codes';
require('dotenv').config;

// Crea istanze delle classi DAO.
const orderDAO = new OrderDAO();
const storeDAO = new StoreDAO();


/**
 * Funzione che modifica l'ordine in FALLITO.
 * @param {string} uuid - UUID dell'ordine fallito.
 */
async function orderFailed(uuid: string){

    //console.log('-------------------------------orderStart----------------------------------------')
    //console.log(uuid);
    await orderDAO.changeStatus(StatusOrder.Fallito, uuid)
    .then(() => {
    })
    .catch((error) => {
        console.log(error);
        throw new Error(error);
    });
}

/**
 * Middleware per la validazione dei prodotti, controllando se siano presenti nello store.
 */
export async function checkFood(req: any, res: any, next: any){

    let item = req.body.requestOrder;

    const numberOfElements = Object.keys(item).length;
    if(numberOfElements == 1){
            
        item = item[0];
        console.log(item.food);
        await storeDAO.isExists(item.food)
            .then((store) => {
                if(!store){
                    res
                    .status(StatusCodes.NOT_FOUND)
                    .send({'err':'elemeno non presente'});
                    

                }else{
                    next();
                }
            //res.send(store);
            })
            .catch((error) => {
                res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .send({ 'err': error});
            });

    }else{
        let flag: boolean = true;
        item.map(async (items: any) => {
            await storeDAO.isExists(items.food)
            .then((store) => {
                if(!store){
                    flag = false;
                    res
                    .status(StatusCodes.NOT_FOUND)
                    .send({'err':'elemeno non presente'});
                }
            //res.send(store);
            })
            .catch((error) => {
                res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .send({ 'err': error});
            });
        })
        if(flag){
            next();
        }
    }
}

/**
 * Middleware per la conferma dell'esistenza dell'ordine.
 */
export async function checkOrder(req:any, res: any, next: any){
    let uuid: string = req.params.uuid;
    await orderDAO.isExists(uuid)
    .then((order) => {
        if(order){
            next();
        }
    //res.send(store);
    })
    .catch(()=>{
        res
        .status(StatusCodes.NOT_FOUND)
        .send({'err':'ordine non presente'});
    })
}

/**
 * Middleware per la validazione della quantità degli alimenti nell'ordine.
 */
export async function checkQuantity(req: any, res: any, next: any){

    let item = req.body.requestOrder;

    const numberOfElements = Object.keys(item).length;
    if(numberOfElements == 1){
            
        item = item[0];
        //console.log(item.food);
        await storeDAO.isAction(item.food, item.quantity)
            .then((store) => {
                if(!store){
                    res
                    .status(StatusCodes.NOT_FOUND)
                    .send({'err':'quantità non presente nello store'});
                }else{
                    next();
                }
            //res.send(store);
            })
            .catch((error) => {
                res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .send({ 'err': error});
            });

    }else{
        const promises = item.map(async (items: any) => {
            try {
              const store = await storeDAO.isAction(items.food, items.quantity);
              if (!store) {
                res.status(StatusCodes.NOT_FOUND).send({ 'err': 'quantità non presente nello store' });
                return false; // Ritorna false se la chiamata non ha avuto successo
              }
              return true; // Ritorna true se la chiamata ha avuto successo
            } catch (error) {
              res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ 'err': error });
              return false; // Ritorna false se si è verificato un errore
            }
          });
          
          Promise.all(promises)
            .then((results) => {
              // Controlla se tutti gli elementi dell'array sono true
              if (results.every((result) => result === true)) {
                // Tutte le chiamate sono state riuscite, chiamiamo next()
                next();
              }
            })
            .catch((error) => {
              // Gestisci eventuali errori in Promise.all
              console.error('Errore in Promise.all:', error);
            });

    }    
}




interface arraySequence {
    quantity: number;
    food: string;
  }
/**
 * Funzione per verificare se due array di oggetti (la sequenza di carico e la sequenza dell'ordine richiesto) sono uguali entro una percentuale massima.
 * @param {arraySequence[]} arr1 - Primo array da confrontare.
 * @param {arraySequence[]} arr2 - Secondo array da confrontare.
 * @param {number} percentualeMassima - Percentuale massima di scostamento ammessa.
 * @returns {boolean} - True se gli array sono uguali, altrimenti False.
 */
function isEquals(
    arr1: arraySequence[],
    arr2: arraySequence[],
    percentualeMassima: number
    ): boolean {
        if (arr1.length !== arr2.length) {
            return false; // Le lunghezze sono diverse, quindi non sono uguali
        }

        return arr1.map((item1, index) => {
            const item2 = arr2[index];
            const differenza = Math.abs(item1.quantity - item2.quantity);
            const scostamentoPercentuale = (differenza / item1.quantity) * 100;
            return scostamentoPercentuale <= percentualeMassima && item1.food === item2.food;
        }).every((sonoUguali) => sonoUguali);
}

/**
 * Middleware per la validazione della sequenza di caricamento dell'ordine.
 */
export async function checkSequence(req: any, res: any, next: any){
    let storeData = req.body.loadOrder;
    let uuid = req.params.uuid;
    const numberOfElements = Object.keys(storeData).length;
    if (numberOfElements == 1){
        let item = storeData[0];
        let jsonLoad = {
            'food' : item.food,
            'quantity' : item.quantity,
        }
        let order = await orderDAO.retrieveById(uuid);
        if(order){
            let request = order.request_order[0];
            let jsonOrder = ({
                food: request.food,
                quantity: request.quantity,
              });
            let orderFood: string = jsonOrder.food;
            let loadFood: string = jsonLoad.food;
            let flagFood = orderFood==loadFood ? true : false;

            let orderQnt: number = jsonOrder.quantity;
            let loadQnt: number = jsonLoad.quantity;
            let flagQnt = orderQnt==loadQnt ? true : false;

            if(!flagFood || !flagQnt){
                if(req.params.uuid !== undefined){
                    orderFailed(req.params.uuid);
                }
                        
                res
                .status(StatusCodes.EXPECTATION_FAILED)
                .send({'err' : 'Spiacenti gli alimenti caricati non rispettano la richiesta'});
            }else{
                // Valore di riferimento (la richiesta)
                let richiesta = orderQnt;

                // Valore da verificare (il carico)
                let carico = loadQnt;

                // Calcola la differenza
                let differenza = Math.abs(richiesta - carico);

                // Calcola lo scostamento percentuale
                let scostamentoPercentuale = (differenza / richiesta) * 100;

                // Verifica se lo scostamento percentuale è inferiore o uguale al 10%
                let percentage: number = Number(process.env.PERCENTAGE);
                if (scostamentoPercentuale <= percentage) {
                    next();
                } else {
                    if(req.params.uuid !== undefined){
                        orderFailed(req.params.uuid);
                    }
                    res
                    .status(StatusCodes.EXPECTATION_FAILED)
                    .send({'err' : 'Spiacenti il carico non rispetta la quantità richiesta'});
                }
            }
            /*
            console.log('----------------------------------------jsonorder----------------------------------')
            console.log(jsonOrder);
            console.log('----------------------------------------jsonload----------------------------------')
            console.log(jsonLoad)
            */
        }
    }else{
        let order = await orderDAO.retrieveById(uuid);
        
        let arrayOrder: arraySequence[] = [];
        let arrayLoad: arraySequence[] = [];

        order.request_order.map((items: any) => {
            let item: arraySequence = {
                food : items.food,
                quantity: items.quantity
            }
            arrayOrder.push(item);
        })
        storeData.map((items: any) => {
            let item: arraySequence = {
                food : items.food,
                quantity: items.quantity
            }
            arrayLoad.push(item);
        })
        
        let percentage: number = Number(process.env.PERCENTAGE);
        
        const sonoUguali: boolean = isEquals(arrayOrder, arrayLoad, percentage);
        if(sonoUguali){
            next();
        }else{
            if(req.params.uuid !== undefined){
                orderFailed(req.params.uuid);
            }
            res
            .status(StatusCodes.EXPECTATION_FAILED)
            .send({'err' : 'Spiacenti il carico non rispetta la richiesta'});
        }
        console.log(sonoUguali); 
    }
}



/**
 * Middleware per verificare se gli alimenti richiesti siano presenti.
 */
export async function checkLoad(req: any, res: any, next: any){

    let item = req.body.loadOrder;

    const numberOfElements = Object.keys(item).length;
    if(numberOfElements == 1){
            
        item = item[0];
        console.log(item.food);
        await storeDAO.isExists(item.food)
            .then((store) => {
                if(!store){
                    if(req.params.uuid !== undefined){
                        orderFailed(req.params.uuid);
                    }

                    res
                    .status(StatusCodes.NOT_FOUND)
                    .send({'err':'elemeno non presente'});
                }
            //res.send(store);
            })
            .catch((error) => {
                res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .send({ 'err': error});
            });

            next();
    }else{
        const promises = item.map(async (items: any) => {
            try {
              const store = await storeDAO.isExists(items.food);
              if (!store) {
                if(req.params.uuid !== undefined){
                    orderFailed(req.params.uuid);
                }

                res.status(StatusCodes.NOT_FOUND).send({ 'err': 'quantità non presente nello store' });
                return false; // Ritorna false se la chiamata non ha avuto successo
              }
              return true; // Ritorna true se la chiamata ha avuto successo
            } catch (error) {
              res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ 'err': error });
              return false; // Ritorna false se si è verificato un errore
            }
          });
          
          Promise.all(promises)
            .then((results) => {
              // Controlla se tutti gli elementi dell'array sono true
              if (results.every((result) => result === true)) {
                // Tutte le chiamate sono state riuscite, chiamiamo next()
                next();
              }
            })
            .catch((error) => {
              // Gestisci eventuali errori in Promise.all
              console.error('Errore in Promise.all:', error);
            });
    }
}

/**
 * Middleware per la validazione della quantità di alimenti caricati nell'ordine.
 */
export async function checkQuantityLoad(req: any, res: any, next: any){

    let item = req.body.loadOrder;

    const numberOfElements = Object.keys(item).length;
    if(numberOfElements == 1){
            
        item = item[0];
        //console.log(item.food);
        await storeDAO.isAction(item.food, item.quantity)
            .then((store) => {
                if(!store){
                    if(req.params.uuid !== undefined){
                        orderFailed(req.params.uuid);
                    }
                    res
                    .status(StatusCodes.NOT_FOUND)
                    .send({'err':'quantità non presente nello store'});
                }
            //res.send(store);
            })
            .catch((error) => {
                res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .send({ 'err': error});
            });

            next();
    }else{
        item.map(async (items: any) => {
            await storeDAO.isAction(items.food, items.quantity)
            .then((store) => {
                if(!store){
                    if(req.params.uuid !== undefined){
                        orderFailed(req.params.uuid);
                    }
                    res
                    .status(StatusCodes.NOT_FOUND)
                    .send({'err':'quantità non presente nello store'});
                }
            //res.send(store);
            })
            .catch((error) => {
                res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .send({ 'err': error});
            });
        })

        next();
    }    
}

/**
 * Middleware per la validazione dello stato dell'ordine, solo se lo stato è IN ESECUZIONE procede.
 */
export async function checkState(req:any, res: any, next: any) {
    let uuid = req.params.uuid;
    let order = await orderDAO.retrieveById(uuid);
    if(order){
        if(order.status == StatusOrder.InEsecuzione){
            next();
        }
        else{
            res
            .status(StatusCodes.EXPECTATION_FAILED)
            .send({'err' : 'Spiacenti l ordine non è stato approvato e non risulta in esecuzione'});

        }
    }
    else{
        res
        .status(StatusCodes.NOT_FOUND)
        .send({'err':'elemeno non presente'});
    }
    
}