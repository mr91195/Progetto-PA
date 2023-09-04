import { Sequelize, Model, DataTypes, Op, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { SingConnectionDB } from '../postgres/ConnectionDB';

const sequelize: Sequelize = SingConnectionDB.getDB().getConnection();


// Definisco un enum per le tipologie di ruolo
enum UserRole {
  User = 'user',
  Admin = 'admin'
}

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>>{
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
    update_token(email: string, token_: number): Promise<void>;
    delete(email: string): Promise<void>;
  }
  
// Classe DAO per gestire le operazioni su User
export class UserDAO implements IUserDAO {

  async create(user: User): Promise<void> {
    try {
      await user.save(); // Salva l'utente nel database
    } catch (error) {
      throw new Error("Failed to create user");
    }
  }

  async retrieveAll(): Promise<User[]> {
    try {
      const users = await User.findAll(); // Recupera tutti gli utenti dal database
      console.log('------------------- usr ------------------------');
      console.log('usr : ' + JSON.stringify(users));
      console.log('------------------- usr ------------------------');
      return users; // Restituisce direttamente l'array di utenti
    } catch (error) {
      throw new Error("Failed to retrieve users");
    }
  }
  

  async retrieveByEmail(email: string): Promise<User> {
    try {


      console.log('------------------- email_getUser ------------------------');

      console.log('email : ' + email);
      console.log('------------------- email ------------------------');


      const user = await User.findByPk(email); // Recupera l'utente

      console.log('------------------- usr ------------------------');

      console.log('usr : ' + JSON.stringify(user));
      console.log('------------------- usr ------------------------');
      if (!user) {
        throw new Error(`User with username ${email} not found`);
      }
      return user;

    } catch (error) {
      throw new Error("Failed to retrieve user by email");
    }
  }

  async update_token(email: string, token_: number): Promise<void> {
    try {
      // Recupera l'utente dal database
      const user = await User.findByPk(email);
  
      if (!user) {
        throw new Error(`User with username ${email} not found`);
      }
  
      // Aggiorna il token
      user.token += token_;
  
      // Salva le modifiche nel database
      await user.save();
    } catch (error) {
      throw new Error("Failed to update user token");
    }
  }

  async delete(email: string): Promise<void> {
    try {
      const user = await User.findByPk(email);
      if (!user) {
        throw new Error(`User with username ${email} not found`);
      }
      // Elimina l'utente dal database
      await user.destroy();
    } catch (error) {
      throw new Error("Failed to delete user");
    }
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
