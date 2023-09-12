import { error } from "console";
import { Store } from "models/store.model";


// Interfaccia per le operazioni CRUD su Store
interface IStoreDAO {
    create(store: Store): Promise<void>;
    isExists(name: string): Promise<boolean>;
    isAction(food: string, quantity: number): Promise<boolean>;
    retrieveAll(): Promise<Store[]>;
    retrieveByName(food: string): Promise<Store>;
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
