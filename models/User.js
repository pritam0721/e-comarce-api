
const mongoose = require("mongoose");
const validator = require("validator")
const bcryptjs = require('bcryptjs')

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "please provide your name"],
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    unique:true,
    required: [true, "please provide your email"],
    validate:{
    validator:validator.isEmail,
      message:'please provide valid eamil'
    }
  },
  password: {
    type: String,
    required: [true, "please provide your password"],
    minlength: 3,
  },
  role:{
    type:String,
    enum:["admin","user"],
    default:"user",
  },
});

UserSchema.pre('save', async function(){
  const salt = await bcryptjs.genSalt(10)
  this.password = await bcryptjs.hash(this.password,salt)
})

UserSchema.methods.comparePassword = async function(canditatePassword){
const isMatch = await bcryptjs.compare(canditatePassword,this.password)

return isMatch;
}

module.exports = mongoose.model('User',UserSchema);
