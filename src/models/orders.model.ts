import { Sequelize, Model, DataTypes, Op, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { ConnectionDB } from '../postgres/connectionDB';

const sequelize: Sequelize = ConnectionDB.getDB().getConnection();

export enum StatusOrder {
  Creato = 'creato',
  Completato = 'completato',
  InEsecuzione = 'in esecuzione',
  Fallito = 'fallito'
}


export interface JsonRequest {
  foodIndex: number;
  food: string;
  quantity: number;
}


export class Order extends Model<InferAttributes<Order>, InferCreationAttributes<Order>> {
  declare uuid: string;
  declare request_order: JsonRequest[];
  declare created_at: number;
  declare created_by: string;
  declare status: StatusOrder;
}

Order.init({
  uuid: {
    type: DataTypes.UUID,
    primaryKey: true,
  },
  request_order: {
    type: DataTypes.ARRAY(DataTypes.JSON),
    allowNull: false,
  },
  created_at:{
    type: DataTypes.DATE,
    allowNull: false,
  },
  created_by: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM(StatusOrder.Creato, StatusOrder.Completato, StatusOrder.Fallito, StatusOrder.InEsecuzione),
    allowNull: false,
  }

}, { sequelize, tableName: 'orders' });

export class loadOrder extends Model{
  declare uuid: string;
  declare food: string;
  declare quantity: number;
  declare timestamp: number;
}

loadOrder.init({
  uuid: {
    type: DataTypes.UUID,
    primaryKey: true,
  },
  food: {
    type: DataTypes.STRING,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {sequelize, tableName: 'load_order'});

