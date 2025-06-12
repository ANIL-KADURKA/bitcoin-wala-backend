require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const adminRoutes = require('./routes/admin-registration');
const { sequelize } = require('./models/User');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use('/', adminRoutes);

sequelize.authenticate()
  .then(() => {
    console.log('Database connected.');
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch((err) => console.error('Database connection error:', err));
