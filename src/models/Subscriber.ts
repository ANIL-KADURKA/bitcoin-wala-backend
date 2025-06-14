import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../connection/connection';


interface SubscriberAttributes {
  id?: number;
  email: string;
  name: string;
  phone: string;
  organization?: string | null;
  is_active?: boolean;
  is_subscribed?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}


type SubscriberCreationAttributes = Optional<
  SubscriberAttributes,
  'id' | 'organization' | 'is_active' | 'is_subscribed'
>;


export class Subscriber
  extends Model<SubscriberAttributes, SubscriberCreationAttributes>
  implements SubscriberAttributes
{
  public id!: number;
  public email!: string;
  public name!: string;
  public phone!: string;
  public organization!: string | null;
  public is_active!: boolean;
  public is_subscribed!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}


Subscriber.init(
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    organization: {
      type: DataTypes.STRING,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    is_subscribed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  {
    sequelize,
    modelName: 'Subscriber'
  }
);

