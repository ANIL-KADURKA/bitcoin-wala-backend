import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import dotenv from 'dotenv';
import { sequelize } from '../connection/connection';

dotenv.config();


interface BitcoinAttributes {
  id?: number;
  json: object;
  updatedAt?: Date;
}


type BitcoinCreationAttributes = Optional<BitcoinAttributes, 'id'>;


export class Bitcoin
  extends Model<BitcoinAttributes, BitcoinCreationAttributes>
  implements BitcoinAttributes
{
  public id!: number;
  public json!: object;
  public updatedAt!: Date;
}


Bitcoin.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    json: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Bitcoin',
    timestamps: true,
    createdAt: false,
  }
);

