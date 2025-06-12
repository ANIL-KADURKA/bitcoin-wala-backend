const Announcement = sequelize.define('Announcement', {
  title: DataTypes.STRING,
  description: DataTypes.TEXT,
  image_data: DataTypes.BLOB('long'),

  status: {
    type: DataTypes.ENUM('draft', 'scheduled', 'published', 'inactive'),
    defaultValue: 'draft'
  },

  schedule_time: DataTypes.DATE,
  expiry_date: DataTypes.DATE,

  show_on_dashboard: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },

  send_email: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_email_sent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  email_targets: {
    type: DataTypes.JSON, // optional: user IDs, roles, etc.
    allowNull: true
  },

  created_by: DataTypes.STRING,
  click_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true
});
