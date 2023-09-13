import { Sequelize, Model, DataTypes, Op, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { ConnectionDB } from '../postgres/connectionDB';

// Ottieni un'istanza di Sequelize dalla connessione al database.
const sequelize: Sequelize = ConnectionDB.getDB().getConnection();

// Definisco un enum per le tipologie di ruolo.
export enum UserRole {
  User = 'user',
  Admin = 'admin'
}

// Modello per l'entità utente.
export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
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
    type: DataTypes.ENUM(UserRole.User, UserRole.Admin), // Usa l'enum per definire i valori consentiti.
    allowNull: true
  }
}, { sequelize, tableName: 'users' });
