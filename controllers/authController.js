const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CutsomError = require("../errors");

const { attachCookiesToResponse,} = require("../utils");

//! Register as a user 

const register = async (req, res) => {
  const { email, name, password } = req.body;

  const eamilAlreadyExist = await User.findOne({ email });

  if (eamilAlreadyExist) {
    throw new CutsomError.BadRequestError("Email Already Existed");
  }

  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "user";

  const user = await User.create({ name, email, password, role });

  const tokenUser = { name: user.name, userId: user._id, role: user.role };

  attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

// ! Login as a user 

const login = async (req, res) => {

const {email , password } = req.body

if(!email || !password){
  throw new CutsomError.BadRequestError('please enter your password and email ')
}

const user = await User.findOne({ email })
if(!user){
  throw new CutsomError.BadRequestError('the user dose not exist ')
}
  const isPasswordCorrect = await user.comparePassword(password);

  if(!isPasswordCorrect){
    throw new CutsomError.UnauthenticatedError('the password dose not match')
  }
    const tokenUser = { name: user.name, userId: user._id, role: user.role };

attachCookiesToResponse({ res, user:tokenUser });

res.status(StatusCodes.OK).json({ user:tokenUser });
};

// ! Log out as  a user 

const logout = async (req, res) => {
 res.cookie('token','logout',{
  httpOnly:true,
  expires:new Date(Date.now())
 })
 res.status(StatusCodes.OK).send('logout user ')
};

module.exports = {
  register,
  login,
  logout,
};
