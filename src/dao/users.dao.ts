import { User } from "models/users.model";


// Interfaccia per le operazioni CRUD su User
interface IUserDAO {
    create(user: User): Promise<void>;
    retrieveAll(): Promise<User[]>;
    retrieveByEmail(email: string): Promise<User>;
    updateToken(email: string, tokenAdd: number): Promise<void>;
    decrementToken(email: string): Promise<void>;
    delete(email: string): Promise<void>;
  }
  
// Classe DAO per gestire le operazioni su User
export class UserDAO implements IUserDAO {

  async create(user: User): Promise<void> {
    return user.save()
      .then(() => {
        console.log('User created successfully');
      })
      .catch((error) => {
        console.error('Error:', error);
        throw new Error("Failed to create user");
      });
  }
  

  async retrieveAll(): Promise<User[]> {
    return User.findAll()
        .then((users) => {
            return users;
        })
        .catch((error) => {
            console.error('Error:', error);
            throw new Error("Failed to retrieve users");
        });
  }

  

  async retrieveByEmail(email: string): Promise<User> {
    return User.findByPk(email)
        .then((user) => {
            if (!user) {
                throw new Error(`User with email ${email} not found`);
            }
            return user;
        })
        .catch((error) => {
            console.error('Error:', error);
            throw new Error("Failed to retrieve user");
        });
    }

  async updateToken(email: string, tokenAdd: number): Promise<void> {
    return User.findByPk(email)
      .then((user) => {
        if (!user) {
          throw new Error(`User with email ${email} not found`);
        }
        // Aggiorna il token
        user.token += tokenAdd;
        // Salva le modifiche nel database
        return user.save();
      })
      .then(() => {
        console.log('Token updated successfully');
      })
      .catch((error) => {
        console.error('Error:', error);
        throw new Error("Failed to update user token");
      });
  }
  
  async decrementToken(email: string): Promise<void> {
    return User.findByPk(email)
      .then((user) => {
        if (!user) {
          throw new Error(`User with email ${email} not found`);
        }
        // Decrementa il token
        user.token -= 1;
        // Salva le modifiche nel database
        return user.save();
      })
      .then(() => {
        console.log('Token decremented successfully');
      })
      .catch((error) => {
        console.error('Error:', error);
        throw new Error("Failed to decrement user token");
      });
  }


  async delete(email: string): Promise<void> {
    return User.findByPk(email)
      .then((user) => {
        if (!user) {
          throw new Error(`User with email ${email} not found`);
        }
        // Elimina l'utente dal database
        return user.destroy();
      })
      .then(() => {
        console.log('User deleted successfully');
      })
      .catch((error) => {
        console.error('Error:', error);
        throw new Error("Failed to delete user");
      });
  }
  
}
