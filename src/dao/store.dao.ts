import { Store } from "models/store.model";


// Interfaccia per le operazioni CRUD su User
interface IStoreDAO {
    create(store: Store): Promise<void>;
  }
  
// Classe DAO per gestire le operazioni su User
export class StoreDAO implements IStoreDAO {

  async create(store: Store): Promise<void> {
    return store.save()
      .then(() => {
        console.log('User created successfully');
      })
      .catch((error) => {
        console.error('Error:', error);
        throw new Error("Failed to create user");
      });
  }
  
  
}
