import { StoreDAO } from "dao/store.dao";
import { parseJsonText } from "typescript";
import {
	ReasonPhrases,
	StatusCodes,
	getReasonPhrase,
	getStatusCode,
} from 'http-status-codes';
import { OrderDAO } from "dao/orders.dao";
import { StatusOrder, loadOrder } from "models/orders.model";
require('dotenv').config

const orderDAO = new OrderDAO();
const storeDAO = new StoreDAO();

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
            await storeDAO.isExists(items.food)
            .then((store) => {
                if(!store){
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

        next();
    }
}

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
interface arraySequence {
    quantity: number;
    food: string;
  }

function sonoArrayUgualiConScostamento(
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
    }
    else{
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
        
        const sonoUguali: boolean = sonoArrayUgualiConScostamento(arrayOrder, arrayLoad, percentage);
        if(sonoUguali){
            next();
        }else{
            res
            .status(StatusCodes.EXPECTATION_FAILED)
            .send({'err' : 'Spiacenti il carico non rispetta la richiesta'});
        }
        console.log(sonoUguali); // Restituirà false a causa dello scostamento percentuale
        
    }
}



export async function checkLoad(req: any, res: any, next: any){

    let item = req.body.loadOrder;

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
            await storeDAO.isExists(items.food)
            .then((store) => {
                if(!store){
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

        next();
    }
}


export async function checkQuantityLoad(req: any, res: any, next: any){

    let item = req.body.loadOrder;

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