require('dotenv').config();
require('express-async-errors');

const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');


const router = require("./routes/main");
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

// middleware
app.use(express.static('./public'));
app.use(express.json());
app.use(cookieParser());


app.use('/api/v1', router);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
