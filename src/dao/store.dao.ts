import { error } from "console";
import { Store } from "models/store.model";


// Interfaccia per le operazioni CRUD su Store
interface IStoreDAO {
  /**
   * Crea un nuovo elemento nello store.
   *
   * @param {Store} store - L'oggetto Store da creare.
   */
  create(store: Store): Promise<void>;

  /**
   * Verifica se un elemento con il nome specificato esiste nello store.
   *
   * @param {string} name - Il nome dell'elemento da verificare.
   */
  isExists(name: string): Promise<boolean>;

  /**
   * Verifica se è possibile eseguire l'operazione verificando la quantità a disposizione.
   *
   * @param {string} name - Il nome dell'elemento su cui eseguire l'azione.
   * @param {number} requestQuantity - La quantità richiesta per l'azione.
   * @returns {Promise<boolean>} - True se l'azione è possibile, altrimenti false.
   */
  isAction(name: string, requestQuantity: number): Promise<boolean>;

  /**
   * Recupera tutti gli elementi presenti nello store.
   *
   * @returns {Promise<Store[]>} - Un array di oggetti Store.
   */
  retrieveAll(): Promise<Store[]>;

  /**
   * Recupera un elemento dallo store basato sul nome specificato.
   *
   * @param {string} food - Il nome dell'elemento da recuperare.
   * @returns {Promise<Store>} - L'oggetto Store corrispondente al nome specificato.
   */
  retrieveByName(food: string): Promise<Store>;

  /**
   * Aggiorna la quantità di un elemento specifico nello store.
   *
   * @param {string} food - Il nome dell'elemento da aggiornare.
   * @param {number} quantity - La quantità da aggiungere o sottrarre.
   * @returns {Promise<void>}
   */
  update(food: string, quantity: number): Promise<void>;
}

  
// Classe DAO per gestire le operazioni sullo store
export class StoreDAO implements IStoreDAO {

  async isAction(name: string, requestQuantity: number): Promise<boolean> {   
    let food = await Store.findOne({
      where: { food: name }
    });
    if (food){
      let flag = food.quantity >= requestQuantity ? true  : false;
      if (flag){
        return true;
      }else{
        return false;
      }
    }else{
      throw new Error('quantità non specificata');
    }
  
  }

  async isExists(name: string): Promise<boolean>{
        
        let food = await Store.findOne({
          where: { food: name }
        });
        if (!food){
          return false;
        }
        else{
        
        return true;
      }
  }


  async create(store: Store): Promise<void> {
    return store.save()
      .then(() => {
        console.log('Food add successfully');
      })
      .catch((error) => {
        console.error('Error:', error);
        throw new Error("Failed to add food.");
      });
  }
  
  async retrieveAll(): Promise<Store[]> {
    return Store.findAll()
        .then((store) => {
          if (!store) {
            throw new Error(`Store empty`);
          }
            return store;
        })
        .catch((error) => {
            console.error('Error:', error);
            throw new Error("Failed to retrieve store");
        });
  }

  async retrieveByName(food: string): Promise<Store> {
    return Store.findOne({
        where: { food: food },
    })
    .then((food) => {
        if (!food) {
            throw new Error(`Food ${food} not found`);
        }
        return food;
    })
    .catch((error) => {
        console.error('Error:', error);
        throw new Error("Failed to retrieve food");
    });
  }



async update(food: string, quantity: number): Promise<void> {
  let element = await this.retrieveByName(food)
  if (element){
    element.quantity += quantity;
    element.save();
  }
  else{
    console.error('Error:', error);
    throw new Error("Failed to retrieve food");
  }

}
  
}
