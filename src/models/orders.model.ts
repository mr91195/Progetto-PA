import { Sequelize, Model, DataTypes, Op, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { ConnectionDB } from '../postgres/connectionDB';

const sequelize: Sequelize = ConnectionDB.getDB().getConnection();

export enum StatusOrder {
  Creato = 'creato',
  Completato = 'completato',
  InEsecuzione = 'in esecuzione',
  Fallito = 'fallito'
}


// Definisco il modello per gli alimenti all'interno della creazione dell'ordine
export class FoodItemOrder extends Model<InferAttributes<FoodItemOrder>, InferCreationAttributes<FoodItemOrder>> {
  declare foodIndex: number;
  declare food: string;
  declare quantity: number;
}

FoodItemOrder.init({
  foodIndex: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  food: {
    type: DataTypes.STRING,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, { sequelize, tableName: 'fooditemorder' });

// Definisco il modello per gli alimenti quando vengono caricati
export class FoodItemLoad {
  declare food: string;
  declare quantity: number;
  declare timestampLoad: Date;
}


export class Order extends Model<InferAttributes<Order>, InferCreationAttributes<Order>> {
  declare orderId?: number;
  declare uuid?: string;
  declare requestOrder: FoodItemOrder[];
  declare load?: FoodItemLoad[];
  declare timestamp?: Date;
  declare byUser: string;
  declare status?: StatusOrder;
}

Order.init({
  orderId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  uuid: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4
  },
  requestOrder: {
    type: DataTypes.JSON, // Utilizza JSON per memorizzare gli alimenti per l'ordine
    allowNull: false, // non puo essere true perchè quando creo la richiesta dell'ordine va impostato la sequenza dell'ordine
  },
  load: {
    type: DataTypes.JSON, // Utilizza JSON per memorizzare gli alimenti che vengono caricati
    allowNull: true, // quando viene creato l'ordine è vuoto, verrà caricato l'alimento uno per volta, con una seconda rotta
    defaultValue: [],
  },
  timestamp:{
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), // Imposta il timestamp di creazione automaticamente
  },
  byUser: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM(StatusOrder.Creato, StatusOrder.Completato, StatusOrder.Fallito, StatusOrder.InEsecuzione),
    allowNull: false,
    defaultValue: StatusOrder.Creato
  }

}, { sequelize, tableName: 'orders' });
