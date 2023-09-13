import { OrderDAO } from "dao/orders.dao";
import { StoreDAO } from "dao/store.dao";
import {Order, StatusOrder} from "../models/orders.model";
import {
	ReasonPhrases,
	StatusCodes,
	getReasonPhrase,
	getStatusCode,
} from 'http-status-codes';
const { format } = require('date-fns');


const orderDAO = new OrderDAO();
const storeDAO = new StoreDAO();

export async function createOrder(req: any, res: any) {
    try {
        let storeData = req.body;
        let itemData = storeData.requestOrder;
        let user = req.user.email;

        let flagSingleElement: boolean;
        const numberOfElements = Object.keys(itemData).length;
        if (numberOfElements == 1){
            flagSingleElement = true;
            let item = req.body.requestOrder;
            item = item[0];
            orderDAO.create(item, user, flagSingleElement)
            .then(() => {
                res.send({'msg' : 'Order created'});
                })
            .catch((error) => {
                console.error('Error:', error);
                res.status(500).send({'err' : "Failed to create order"});
            });
        }
        else{
            flagSingleElement = false;
            orderDAO.create(itemData, user, flagSingleElement)
            .then(() => {
                res.send({'msg' : 'Order created'});
            })
            .catch((error) => {
                console.error('Error:', error);
                res.status(500).send({'err' : "Failed to create order"});
            });
        }
    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ 'err': 'Si è verificato un errore' });
    }
}



export async function orderStart(req: any, res: any, next: any){

    let uuid : string = req.params.uuid;
    console.log('-------------------------------orderStart----------------------------------------')
    console.log(uuid);
    await orderDAO.changeStatus(StatusOrder.InEsecuzione, uuid)
    .then(() => {
        res.send({'msg' : 'l ordine è stato processato correttamente, stato ordine : IN ESECUZIONE'});
        next();
        //res.send(store);
    })
    .catch((error) => {
        res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ 'err': 'ordine non presente'});
    });
}

function padTo2Digits(num: number) {
    return num.toString().padStart(2, '0');
  }
  
function convertMsToTime(milliseconds: number) {
let seconds = Math.floor(milliseconds / 1000);
let minutes = Math.floor(seconds / 60);
const hours = Math.floor(minutes / 60);

seconds = seconds % 60;
minutes = minutes % 60;

// 👇️ If you want to roll hours over, e.g. 00 to 24
// 👇️ uncomment the line below
// uncommenting next line gets you `00:00:00` instead of `24:00:00`
// or `12:15:31` instead of `36:15:31`, etc.
// 👇️ (roll hours over)
// hours = hours % 24;

return `${padTo2Digits(hours)}:${padTo2Digits(minutes)}:${padTo2Digits(
    seconds,
)}`;
}
/*
    uuid UUID NOT NULL,
    foodIndex INTEGER NOT NULL,
    food VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    deviation INTEGER NOT NULL*/
export async function consumeStore(req: any, res: any){
    let storeData = req.body.loadOrder;
    let uuid = req.params.uuid;
    const numberOfElements = Object.keys(storeData).length;
    if (numberOfElements == 1){
        let isSingleElement: boolean = true;
        let item = storeData[0];
        let order = await orderDAO.retrieveById(uuid);
        if(order){
            let request = order.request_order[0];
            let tmp: number = new Date().getTime() - new Date(order.created_at).getTime();
            let timestamp: string = convertMsToTime(tmp);
            let food : string = item.food;
            let quantity: number = parseInt(item.quantity.toString());
            let rqsQnt: number = parseInt(request.quantity.toString());
            let deviation: number = rqsQnt - quantity;
            await storeDAO.update(food, -quantity);
            await orderDAO.loadOrder(uuid, timestamp, food, quantity, deviation)
                .then(()=>{
                    res.send({'msg' : 'Caricamento andato a buon fine!'})
                })
                .catch(()=>{
                    res
                    .status(StatusCodes.NOT_ACCEPTABLE)
                    .send({'err' : 'errore nel caricamento dell ordine'});
                })

        }else{
            res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .send({'err' : 'Problema nel caricamento degli alimenti'});
        }
    }
    else{
        let order = await orderDAO.retrieveById(uuid);
        if(order){
            let index : number = 0;
            storeData.map(async (items: any) => {
                let request = order.request_order[index];
                let tmp: number = new Date().getTime() - new Date(order.created_at).getTime();
                let timestamp: string = convertMsToTime(tmp);
                let food : string = items.food;
                let quantity: number = parseInt(items.quantity.toString());
                let rqsQnt: number = parseInt(request.quantity.toString());
                let deviation: number = rqsQnt - quantity;
                index++;
                await storeDAO.update(food, -quantity);
                await orderDAO.loadOrder(uuid, timestamp, food, quantity, deviation)
                .then(()=>{
                    res.send({'msg' : 'Caricamento andato a buon fine!'})
                })
                .catch(()=>{
                    res
                    .status(StatusCodes.NOT_ACCEPTABLE)
                    .send({'err' : 'errore nel caricamento dell ordine'});
                })
            })
        }else{
            res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .send({'err' : 'Problema nel caricamento degli alimenti'});
        }
}};


export async function searchRange(req:any, res: any) {
    let startDate: string = req.body.start;
    let endDate: string = req.body.end;


    await orderDAO.retrieveByRange(startDate, endDate)
    .then( (orders)=>{
        if(orders.length === 0){
            res
            .status(StatusCodes.NOT_FOUND)
            .send({'err' : 'Nessun ordine'});
        }else{
            res.send(orders);
        }
    })
    .catch( () => {
        res
        .status(StatusCodes.NOT_FOUND).send({'err' : 'Nessun ordine'});
    })
}

export async function getOrder(req:any, res: any) {
    try {
        let uuid: string = req.params.uuid;

        let order = await orderDAO.retrieveById(uuid);
        let load = await orderDAO.retrieveLoadOrderByUuid(uuid);
        interface Ideviation {
            food: string;
            deviation: number;
          }
          
        let timestamp: string = "";
        let sequence: any = []
        load.map((items) =>{
            let item: Ideviation = {
                food: items.food,
                deviation: items.deviation
            }
            timestamp = items.timestamp;
            sequence.push(item);
        } )


        const dateObject = new Date(order.created_at);

        // Formatta la data 
        const formattedDate = format(dateObject, "yyyy-MM-dd HH:mm:ss");

        //console.log(formattedDate);

        
        // Formatto la risposta come desiderato.
        const responseJson = {
          orderId: req.params.uuid,
          status: order.status,
          order_create_at : formattedDate,
          order_create_by : order.created_by,
          sequence: sequence,
          processingTime: timestamp,
          message: "Stato dell'ordine recuperato con successo.",
        };
    
        // Invia la risposta al client.
        res.status(200).send(responseJson);
      } catch (error) {
        // Gestisci gli errori in caso di problemi nella richiesta.
        console.error("Errore durante la richiesta dello stato dell'ordine:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: "Si è verificato un errore durante la richiesta dello stato dell'ordine." });
      }
}
/*
export async function consumeStore(req: any, res: any){
    let item = req.body.requestOrder;
    let uuid: string = req.params.uuid;

    const numberOfElements = Object.keys(item).length;
    if(numberOfElements == 1){
            
        item = item[0];
        let qnt = parseInt(item.quantity);
        console.log('------------------------------------------------------consume-------------------------------------------------')
        console.log(-qnt)
        console.log(typeof(qnt))
        await orderDAO.loadOrder(uuid, item, true);
        await storeDAO.update(item.food, -qnt)
            .then(() => {
                res.send('order create')
                
            })
            .catch((error) => {
                res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .send({ 'err': error});
            });

    }else{
        item.map(async (items: any) => {
            let qnt = parseInt(items.quantity);

            await storeDAO.update(items.food, -qnt)
            .then(() => {
                res.send('order create')
            //res.send(store);
            })
            .catch((error) => {
                res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .send({ 'err': error});
            });
        })
    }    
}*/