import { OrderDAO } from "dao/orders.dao";
import { StoreDAO } from "dao/store.dao";
import {
	ReasonPhrases,
	StatusCodes,
	getReasonPhrase,
	getStatusCode,
} from 'http-status-codes';

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
                res.send('Order created');
                })
            .catch((error) => {
                console.error('Error:', error);
                res.status(500).send("Failed to create order");
            });
        }
        else{
            flagSingleElement = false;
            orderDAO.create(itemData, user, flagSingleElement)
            .then(() => {
                res.send('Order created');
            })
            .catch((error) => {
                console.error('Error:', error);
                res.status(500).send("Failed to create order");
            });
        }
    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ 'err': 'Si è verificato un errore' });
    }
}

export async function consumeStore(req: any, res: any){
    let item = req.body.requestOrder;

    const numberOfElements = Object.keys(item).length;
    if(numberOfElements == 1){
            
        item = item[0];
        let qnt = parseInt(item.quantity);
        console.log('------------------------------------------------------consume-------------------------------------------------')
        console.log(-qnt)
        console.log(typeof(qnt))
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
}
  