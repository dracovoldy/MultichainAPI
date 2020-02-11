const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

require('dotenv').config({path: __dirname + '/.env'})

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny'));

//use - routes
app.use('/', require('./routes/home'));
app.use('/streams', require('./routes/streams'));

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('mcapi listening on port ' + port);
});