import { Sequelize, Model, DataTypes, HasManyGetAssociationsMixin, InferAttributes, InferCreationAttributes } from 'sequelize';
import { ConnectionDB } from '../postgres/connectionDB';

const sequelize: Sequelize = ConnectionDB.getDB().getConnection();

// Modello per il magazzino
export class Store extends  Model<InferAttributes<Store>, InferCreationAttributes<Store>> {
  declare id: number;
  declare nomeFood: string;
  declare quantita: number;
}

Store.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nomeFood: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  quantita: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, { sequelize, tableName: 'store' });
