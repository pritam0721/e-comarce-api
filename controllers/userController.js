const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");

const CustomError = require("../errors");

const getAllUsers = async (req, res) => {
 
  const users = await User.find({}, { _id: 0 }).select('-password');
  if (!users) {
    throw new CustomError.NotFoundError("there is no user in the database");
  }
  res.status(StatusCodes.OK).send({ users });
};

const getSingleUser = async (req, res) => {
     console.log(req.params.id);
  const user = await User.findOne({_id:req.params.id},{ _id:0,__v:0 }).select('-password');
  if (!user) {
    throw new CustomError.NotFoundError("there is no user in the database");
  }
  res.status(StatusCodes.OK).send({ user });
};
const showCurrentUser = async (req, res) => {
  res.send("showing a current user");
};
const updateUser = async (req, res) => {
  res.send(req.body);
};
const updateUserPassword = async (req, res) => {
  res.send(req.body);
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
