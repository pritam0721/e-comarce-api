require("dotenv").config();
require("express-async-errors");

// EXPRESS SETUP

const express = require("express");
const app = express();

// REST OF THE PACKAGAES

const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileupload = require("express-fileupload");
const rateLimiter = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");

// DATABASE CONNECTION

const connectDB = require("./db/connect");

// ROUTES
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRouter = require("./routes/productRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const orderRouter = require("./routes/orderRoutes");

//ERROR HANDALAER MIDDLEWARE

const notFoundMiddleWare = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

//BASIC MIDDLEWARE

app.set("trust proxy ", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);

app.use(helmet());
app.use(cors());
app.use(xss());
app.use(mongoSanitize());

app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));

app.use(express.static("./public"));
app.use(fileupload());




app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/orders", orderRouter);

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
