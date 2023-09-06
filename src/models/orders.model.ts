import { Sequelize, Model, DataTypes, Op, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { ConnectionDB } from '../postgres/connectionDB';

const sequelize: Sequelize = ConnectionDB.getDB().getConnection();

export enum StatusOrder {
  Creato = 'creato',
  Completato = 'completato',
  InEsecuzione = 'in esecuzione',
  Fallito = 'fallito'
}


export class Order extends Model<InferAttributes<Order>, InferCreationAttributes<Order>> {
  declare orderId: number;
  declare uuid: string;
  declare requestOrder: FoodItemOrder[];
  declare loadOrder: FoodItemLoad[];
  declare timestampCreat: Date;
  declare userCreat: string;
  declare status: StatusOrder;
}

// Definisco il modello per gli alimenti all'interno della creazione dell'ordine
interface FoodItemOrder {
  foodIndex: number;
  food: string;
  quantity: number;
}

// Definisco il modello per gli alimenti quando vengono caricati
interface FoodItemLoad {
  food: string;
  quantity: number;
  timestampLoad: Date;
}

Order.init({
  orderId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  uuid: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
  requestOrder: {
    type: DataTypes.JSON, // Utilizza JSON per memorizzare gli alimenti per l'ordine
    allowNull: false, // non puo essere true perchè quando creo la richiesta dell'ordine va impostato la sequenza dell'ordine
  },
  loadOrder: {
    type: DataTypes.JSON, // Utilizza JSON per memorizzare gli alimenti che vengono caricati
    allowNull: true, // quando viene creato l'ordine è vuoto, verrà caricato l'alimento uno per volta, con una seconda rotta
  },
  timestampCreat:{
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), // Imposta il timestamp di creazione automaticamente
  },
  userCreat: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM(StatusOrder.Creato, StatusOrder.Completato, StatusOrder.Fallito, StatusOrder.InEsecuzione),
    allowNull: false,
    defaultValue: StatusOrder.Creato
  }

}, { sequelize, tableName: 'orders' });
