import { Store } from "models/store.model";


// Interfaccia per le operazioni CRUD su Store
interface IStoreDAO {
    create(store: Store): Promise<void>;
    retrieveAll(): Promise<Store[]>;
    retrieveByName(food: string): Promise<Store>;
    update(food: string, quantity: number): Promise<void>;
  }
  
// Classe DAO per gestire le operazioni sullo store
export class StoreDAO implements IStoreDAO {
//DEVO AGGIUNGERE IL CONTROLLO CHE SE ESISTE GIA, AGGIUNGO LA QUANTITA.
//DEVO IMPLEMENTARE CHE TUTTI GLI INPUT DEVON ESSERE TUTTI LOWERCASE

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
    return this.retrieveByName(food)
      .then((food) => {
        if (!food) {
          throw new Error(`Food ${food} not found`);
        }
        // Aggiorna la quantita
        food.quantity += quantity;
        // Salva le modifiche nel database
        return food.save();
      })
      .then(() => {
        console.log('Food modified');
      })
      .catch((error) => {
        console.error('Error:', error);
        throw new Error("Failed to modify.");
      });

  }
  
}
