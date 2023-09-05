import { Sequelize, Model, DataTypes, Op, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { SingConnectionDB } from '../postgres/ConnectionDB';

const sequelize: Sequelize = SingConnectionDB.getDB().getConnection();


// Definisco un enum per le tipologie di ruolo
export enum UserRole {
  User = 'user',
  Admin = 'admin'
}

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>>{
  declare username: string;
  declare email: string;
  declare token: number;
  declare role: UserRole;
}

User.init({
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
    validate: {
      isEmail: true
    }
  },
  token: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM(UserRole.User, UserRole.Admin), // Usa l'enum per definire i valori consentiti
    allowNull: true
  }
}, {sequelize, tableName: 'users'});


// Interfaccia per le operazioni CRUD su User
interface IUserDAO {
    create(user: User): Promise<void>;
    retrieveAll(): Promise<User[]>;
    retrieveByEmail(email: string): Promise<User>;
    updateToken(email: string, token_: number): Promise<void>;
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



export async function getUser(email: string){

  console.log('------------------- email_getUser ------------------------');

  console.log('email : ' + email);
  console.log('------------------- email ------------------------');


  let usr = await User.findOne({
    attributes:['email'],
    where:{email:email}
  });
  console.log('------------------- usr ------------------------');

  console.log('usr : ' + JSON.stringify(usr));
  console.log('------------------- usr ------------------------');

  return usr;
}
