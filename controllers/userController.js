const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");

const CustomError = require("../errors");

const {
  createTokenUser,
  attachCookiesToResponse,
  checkPermissons,
} = require("../utils");

// !GETING ALL THE  USER
const getAllUsers = async (req, res) => {
  const users = await User.find({}, { _id: 0 }).select("-password");
  if (!users) {
    throw new CustomError.NotFoundError("there is no user in the database");
  }
  res.status(StatusCodes.OK).send({ users });
};

// ! GETTING A SINGLE USER

const getSingleUser = async (req, res) => {
  console.log(req.params.id);
  const user = await User.findOne({ _id: req.params.id }, { __v: 0 }).select(
    "-password"
  );

  if (!user) {
    throw new CustomError.NotFoundError("there is no user in the database");
  }

  checkPermissons(req.user, user._id) ; 

  res.status(StatusCodes.OK).send({ user });
};

// * SHOWING CURRENT USER

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

// ! UPDATEING USER DETAILS

const updateUser = async (req, res) => {
  const { email, name } = req.body;

  if (!email || !name) {
    throw new CustomError.BadRequestError("please provide boht values");
  }
  const user = await User.findOne({ _id: req.user.userId });

  user.email = email;
  user.name = name;

  await user.save();

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.OK).json({ user: tokenUser });
};

// !UPDATEING USER PASSORD

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassowrd } = req.body;

  if (!oldPassword || !newPassowrd) {
    throw new CustomError.BadRequestError("please provide bodth values ");
  }

  const user = await User.findOne({ _id: req.user.userId });

  const isPasswordCorrect = await user.comparePassword(oldPassword);

  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }
  user.password = newPassowrd;

  user.save();

  res
    .status(StatusCodes.ACCEPTED)
    .json({ msg: "the password updated successfullly " });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
