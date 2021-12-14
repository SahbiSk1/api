const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "first name is required"],
  },
  lastName: {
    type: String,
    required: [true, "last name is required"],
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Email is invalid"],
    required: [true, "Email is required"],
  },
  password: {
    type: String,
    select: false,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
