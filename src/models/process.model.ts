import { Sequelize, Model, DataTypes, HasManyGetAssociationsMixin } from 'sequelize';
import { SingConnectionDB } from '../postgres/ConnectionDB';

const sequelize: Sequelize = SingConnectionDB.getDB().getConnection();

// Modello per il magazzino
export class Magazzino extends Model {
  declare id: number;
  declare nomeFood: string;
  declare quantita: number;
}

Magazzino.init({
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
}, { sequelize, tableName: 'magazzino' });

// Modello per gli ordini
export class Ordine extends Model {
  declare id: number;
  declare stato: string;
  declare timestampCreazione: Date;
  declare creatoDa: string;

  // Associazione tra Ordine e Food
  declare getFoods: HasManyGetAssociationsMixin<Food>;

  // Associazione tra Ordine e Magazzino
  declare getMagazzino: HasManyGetAssociationsMixin<Magazzino>;
}

Ordine.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  stato: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  timestampCreazione: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
  },
  creatoDa: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, { sequelize, tableName: 'ordine' });

// Modello per gli alimenti
export class Food extends Model {
  declare id: number;
  declare idOrdine: number;
  declare nomeFood: string;
  declare quantita: number;
  declare timestampCarico: Date;
  declare caricatoDa: string;
}

Food.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  idOrdine: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  nomeFood: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  quantita: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  timestampCarico: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
  },
  caricatoDa: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, { sequelize, tableName: 'foods' });

// Associazione tra Ordine e Food
Ordine.hasMany(Food, {
  sourceKey: 'id',
  foreignKey: 'idOrdine',
  as: 'foods',
});

// Associazione tra Ordine e Magazzino
Ordine.hasMany(Magazzino, {
  sourceKey: 'id',
  foreignKey: 'idOrdine',
  as: 'magazzino',
});
