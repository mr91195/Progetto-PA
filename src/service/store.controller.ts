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


/**
 * Crea o aggiorna un elemento nel magazzino.
 * Se l'elemento esiste già, ne aggiorna la quantità, altrimenti lo crea.
 */
export async function createFood(req: any, res: any) {
    try {
      let food: string = req.body.food;
      food = food.toLowerCase();
      let quantity: number = parseInt(req.body.quantity);
  
      // Verifica se l'elemento esiste già nel magazzino.
      const check = await storeDAO.isExists(food);
  
      if (check) {
        // Se esiste, aggiorna la quantità dell'elemento.
        await storeDAO.update(food, quantity);
      } else {
        // Se non esiste, crea un nuovo elemento nel magazzino.
        const newStore = new Store({
          food: food,
          quantity: quantity,
        });
        await storeDAO.create(newStore);
      }
  
      res.status(StatusCodes.OK).send({ 'msg': 'Elemento aggiunto correttamente' });
    } catch (error) {
      // Gestisci gli errori in caso di problemi nella richiesta.
      console.error(error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ 'err': 'Si è verificato un errore' });
    }
}
