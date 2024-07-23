require("dotenv").config();
require('express-async-errors')

// EXPRESS SETUP

const express = require("express");
const app = express();

// REST OF THE PACKAGAES

const morgan = require('morgan')
const cookieParser = require('cookie-parser')

// DATABASE CONNECTION 

const connectDB = require('./db/connect')


// ROUTES
const authRoutes = require('./routes/authRoutes')


//ERROR HANDALAER MIDDLEWARE

const notFoundMiddleWare = require('./middleware/not-found')
const errorHandlerMiddleware  = require('./middleware/error-handler')


//BASIC MIDDLEWARE

app.use(morgan('tiny'))
app.use(express.json())
app.use(cookieParser(process.env.JWT_SECRET));



app.get("/", (req, res) => {
  res.send("e commarace api ");
});

app.get("/api/v1", (req, res) => {
     console.log(req.signedCookies);
  res.send("e commarace api ");
});

app.use("/api/v1/auth",authRoutes);

app.use(notFoundMiddleWare);
app.use(errorHandlerMiddleware);

port = process.env.PORT || 5000;

const start = async () => {


  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log(`the server is running  ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};
start();
