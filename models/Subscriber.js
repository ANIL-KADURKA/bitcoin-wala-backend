const Subscriber = sequelize.define('Subscriber', {
  email: { type: DataTypes.STRING, unique: true },
  name: DataTypes.STRING,
  phone: DataTypes.STRING,
  organization: {
    type: DataTypes.STRING,
    allowNull: true
  },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  is_subscribed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});
