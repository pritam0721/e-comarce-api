const Order = require("../models/Order");
const Product = require("../models/Product");

const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { checkPermissons } = require("../utils");

const fakeStripeApi = async ({ amount, currency }) => {
  const clinet_secret = "someRandomValue";

  return { clinet_secret, amount };
};

const getAllOrders = async (req, res) => {
  const orders = await Order.find({});

  res.status(StatusCodes.OK).send({ orders, count: orders.length });
};

const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new CustomError.NotFoundError(
      `there is order with this id ${orderId}`
    );
  }
  checkPermissons(req.user, order.user);
  res.status(StatusCodes.OK).json({ order });
};

const getCurrentUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.userId });
  res.status(StatusCodes.OK).json({ orders, coutn: orders.length });
};

// ! Creating order
const createOrder = async (req, res) => {
  const { items: cartItems, tax, shippingFee } = req.body;

  if (!cartItems || cartItems.length < 1) {
    throw new CustomError.BadRequestError("There is item in your cart ");
  }
  if (!tax || !shippingFee) {
    throw new CustomError.BadRequestError(
      "Please provide tax and shipping fee "
    );
  }
  let orderItems = [];
  let subtotal = 0;

  for (const item of cartItems) {
    const dbproduct = await Product.findOne({ _id: item.product });
    if (!dbproduct) {
      throw new CustomError.NotFoundError(`The product with ${item.product}`);
    }

    const { name, price, image, _id } = dbproduct;

    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    };

    orderItems = [...orderItems, singleOrderItem];
    //
    subtotal += item.amount * price;
  }
  const total = subtotal + tax + shippingFee;

  //get client secret
  const paymentInten = await fakeStripeApi({
    amount: total,
    currency: "usd",
  });

  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    tax,
    shippingFee,
    clientSecret: paymentInten.clinet_secret,
    user: req.user.userId,
  });

  res.status(StatusCodes.OK).json({ order, clientSecret: order.clientSecret });
};

const updateOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const { paymentIntenId } = req.body;
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new CustomError.NotFoundError(
      `there is order with this id ${orderId}`
    );
  }
  checkPermissons(req.user, order.user);
  order.paymentIntenId = paymentIntenId;
  order.status = "paid";

  await order.save();

  res.status(StatusCodes.OK).json({ order });
};

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
};
