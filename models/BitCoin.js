const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

const Bitcoin = sequelize.define('Bitcoin', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  json: {
    type: DataTypes.JSONB,
    allowNull: false
  }
}, {
  timestamps: true,
  createdAt: false, // only updatedAt is needed
});

sequelize.sync();

module.exports = { sequelize, Bitcoin };
