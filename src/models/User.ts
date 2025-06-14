import { Sequelize, DataTypes, Model, Optional } from "sequelize";
import dotenv from "dotenv";
import { sequelize } from "../connection/connection";
import { Announcement } from "./Announcement";

dotenv.config();

interface UserAttributes {
  id?: number;
  username: string;
  password: string;
  email: string;
  role: "admin" | "super_admin";
  status?: "pending" | "approved" | "rejected";
  remarks: object;
  createdAt?: Date;
  updatedAt?: Date;
}

type UserCreationAttributes = Optional<UserAttributes, "id" | "status">;

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public username!: string;
  public password!: string;
  public email!: string;
  public role!: "admin" | "super_admin";
  public status!: "pending" | "approved" | "rejected";
  public remarks!: object;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    role: {
      type: DataTypes.ENUM("admin", "super_admin"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    remarks: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "User",
  }
);
