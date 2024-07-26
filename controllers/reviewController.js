const Review = require("../models/Review");
const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { checkPermissons } = require("../utils");

const createReview = async (req, res) => {
  const { product: productId } = req.body;

  const isValidProduct = await Product.findOne({ _id: productId });
  if (!isValidProduct) {
    throw new CustomError.NotFoundError(`No Product with ${productId}`);
  }

  const alreadyRiviewed = await Review.findOne({
    product: productId,
    user: req.user.userId,
  });

  if (alreadyRiviewed) {
    throw new CustomError.BadRequestError("You already reviewd the product.");
  }

  req.body.user = req.user.userId;

  const review = await Review.create(req.body);
  res.status(StatusCodes.OK).json({ review });
};

const getAllReviews = async (req, res) => {
  const reviews = await Review.find({}).populate({
    path: "product",
    select: "name company price",
  }).populate({
    path: "user",
    select: "name -_id",
  });
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};
const getSingleReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new CustomError.NotFoundError(`No Review with this id ${reviewId}`);
  }
  res.status(StatusCodes.OK).json({ review });
};

const updateReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const { rating, title, comment } = req.body;
  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new CustomError.NotFoundError(`No Review with this id ${reviewId}`);
  }
  checkPermissons(req.user, review.user);

  review.rating = rating;
  review.title = title;
  review.comment = comment;

  await review.save();
  res.status(StatusCodes.OK).json({ review });
};

const deleteReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new CustomError.NotFoundError(`No Review with this id ${reviewId}`);
  }
  checkPermissons(req.user, review.user);
  await Review.deleteOne({ _id: reviewId });
  res.status(StatusCodes.OK).json({ msg: "Success! review removed" });
};

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
};
