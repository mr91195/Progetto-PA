import { StoreDAO } from "dao/store.dao";
import { parseJsonText } from "typescript";
import {
	ReasonPhrases,
	StatusCodes,
	getReasonPhrase,
	getStatusCode,
} from 'http-status-codes';
import { OrderDAO } from "dao/orders.dao";
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
