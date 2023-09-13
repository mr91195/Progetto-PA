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

/**
 * Crea un nuovo ordine.
 */
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

/**
 * Avvia l'esecuzione di un ordine.
 */
export async function orderStart(req: any, res: any, next: any){

    let uuid : string = req.params.uuid;
    //console.log('-------------------------------orderStart----------------------------------------')
    //console.log(uuid);
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






/**
 * Aggiunge zeri iniziali a un numero per renderlo una stringa di almeno due caratteri.
 * @param num - Il numero da formattare.
 * @returns Il numero formattato come stringa con almeno due caratteri.
 */
function padTo2Digits(num: number) {
    return num.toString().padStart(2, '0');
}

/**
 * Converte i millisecondi in un formato orario HH:MM:SS.
 * @param milliseconds - I millisecondi da convertire.
 * @returns Il tempo in formato HH:MM:SS.
 */
function convertMsToTime(milliseconds: number) {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);

    seconds = seconds % 60;
    minutes = minutes % 60;

    // Se vuoi che le ore siano in formato 00-24, puoi decommentare la riga successiva
    hours = hours % 24;

    return `${padTo2Digits(hours)}:${padTo2Digits(minutes)}:${padTo2Digits(seconds)}`;
}


/**
 * Gestisce il caricamento di alimenti da un ordine.
 */
export async function consumeStore(req: any, res: any){
    let storeData = req.body.loadOrder;
    let uuid = req.params.uuid;
    const numberOfElements = Object.keys(storeData).length;
    if (numberOfElements == 1){
        //let isSingleElement: boolean = true;
        let item = storeData[0];
        let order = await orderDAO.retrieveById(uuid);
        if(order){
            let request = order.request_order[0];
            let tmp: number = new Date().getTime() - new Date(order.created_at).getTime();
            let timestamp: string = convertMsToTime(tmp);
            let food : string = item.food;
            food = food.toLowerCase();
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
                food = food.toLowerCase();
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
    }
}










/**
 * Ricerca ordini in un intervallo di date.
 */
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


/**
 * Recupera i dettagli di un ordine e i dettagli relativi al caricamento degli alimenti.
 * Formatta il tutto per una visualizzazione generica dello stato dell'ordine.
 */
export async function getOrder(req: any, res: any) {
    try {
        let uuid: string = req.params.uuid;

        // Recupera i dettagli dell'ordine dal database.
        let order = await orderDAO.retrieveById(uuid);

        // Recupera i dettagli relativi al caricamento degli alimenti.
        let load = await orderDAO.retrieveLoadOrderByUuid(uuid);

        // Definizione dell'interfaccia per rappresentare un elemento di deviazione.
        interface Ideviation {
            food: string;
            deviation: number;
        }
          
        let timestamp: string = "";
        let sequence: any = []

        // Mappa gli elementi di caricamento per creare una sequenza di deviazioni.
        load.map((items) =>{
            let food: string = items.food;
            food = food.toLowerCase();
            let item: Ideviation = {
                food: food,
                deviation: items.deviation
            }
            timestamp = items.timestamp;
            sequence.push(item);
        } )

        // Converti la data dell'ordine in un formato desiderato.
        const dateObject = new Date(order.created_at);
        const formattedDate = format(dateObject, "yyyy-MM-dd HH:mm:ss");
        
        // Crea una risposta JSON formattata con i dettagli dell'ordine.
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
