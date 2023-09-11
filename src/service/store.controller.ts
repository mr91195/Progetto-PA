import { Store } from "models/store.model";
import { StoreDAO} from "dao/store.dao";
import {
	ReasonPhrases,
	StatusCodes,
	getReasonPhrase,
	getStatusCode,
} from 'http-status-codes';
import { isQualifiedName } from "typescript";

const storeDAO = new StoreDAO

export async function createFood(req: any, res: any) {
    try {
      let food: string = req.body.food;
      food = food.toLowerCase();
      let quantity: number = parseInt(req.body.quantity);
  
      const check = await storeDAO.isExists(food);
  
      if (check) {
        await storeDAO.update(food, quantity);
      } else {
        const newStore = new Store({
          food: food,
          quantity: quantity,
        });
        await storeDAO.create(newStore);
      }
  
      res.status(StatusCodes.OK).send({ 'msg': 'Elemento aggiunto correttamente' });
    } catch (error) {
      console.error(error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ 'err': 'Si è verificato un errore' });
    }
  }
  