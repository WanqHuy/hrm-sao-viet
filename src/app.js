const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const routes = require('./routes');
const { errorHandler } = require('./middlewares/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Phục vụ giao diện web tĩnh từ thư mục public
app.use(express.static(path.join(__dirname, '../public')));

// Prefix API RESTful
app.use('/api/v1', routes);

// Error handling middleware
app.use(errorHandler);

module.exports = app;