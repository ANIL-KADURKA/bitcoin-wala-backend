import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../connection/connection";
import { User } from "./User";

interface AnnouncementAttributes {
  id?: number;
  title: string;
  description: string;
  image_data: Buffer;
  status: "draft" | "scheduled" | "published" | "inactive";
  schedule_time: Date;
  expiry_date: Date;
  show_on_dashboard: boolean;
  send_email: boolean;
  is_email_sent: boolean;
  email_targets?: any; 
  created_by: string;
  click_count: number;
  createdAt?: Date;
  updatedAt?: Date;
}

type AnnouncementCreationAttributes = Optional<
  AnnouncementAttributes,
  | "id"
  | "status"
  | "email_targets"
  | "click_count"
  | "show_on_dashboard"
  | "send_email"
  | "is_email_sent"
  | "createdAt"
  | "updatedAt"
>;

export class Announcement
  extends Model<AnnouncementAttributes, AnnouncementCreationAttributes>
  implements AnnouncementAttributes
{
  public id!: number;
  public title!: string;
  public description!: string;
  public image_data!: Buffer;
  public status!: "draft" | "scheduled" | "published" | "inactive";
  public schedule_time!: Date;
  public expiry_date!: Date;
  public show_on_dashboard!: boolean;
  public send_email!: boolean;
  public is_email_sent!: boolean;
  public email_targets?: any;
  public created_by!: string;
  public click_count!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}


Announcement.init(
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image_data: {
     type: DataTypes.BLOB('long'),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("draft", "scheduled", "published", "inactive"),
      defaultValue: "draft",
    },
    schedule_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    expiry_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    show_on_dashboard: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    send_email: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_email_sent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    email_targets: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users", 
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    click_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: "Announcement",
    timestamps: true,
  }
);


User.hasMany(Announcement, {
  foreignKey: 'created_by',
  as: 'announcements'
});

Announcement.belongsTo(User, {
  foreignKey: "created_by",
  as: "creator", 
});


