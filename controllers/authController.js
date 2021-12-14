const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../schemas/user");
const DBError = require("../utils/DBError");
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES;
const JWT_EXPIRATION_NUM = process.env.JWT_EXPIRATION_NUM;
const NODE_ENV = process.env.NODE_ENV;

// create valid jwt
const signJwt = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES,
  });
};

// set jwt options and send jwt as a cookie
const sendToken = (user, statusCode, req, res) => {
  const token = signJwt(user._id);
  const options = {
    expires: new Date(Date.now() + JWT_EXPIRATION_NUM),
    secure: NODE_ENV === "prodution" ? true : false,
    httpOnly: NODE_ENV === "production" ? true : false,
  };
  res.cookie("jwt", token, options);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    user,
  });
};

// Helper function to encrypt passwords
const encryptPw = async (password) => {
  return await bcrypt.hash(password, 12);
};

exports.signup = async (req, res) => {
  const { email, password, lastName, firstName } = req.body;
  console.log(req.body);
  const pw = await encryptPw(password);
  try {
    const newUser = await User.create({
      email,
      password: pw,
      lastName,
      firstName,
    });
    sendToken(newUser, 201, req, res);
  } catch (err) {
    let errorHandled = err;
    if (err.name === "MongoError") errorHandled = DBError(err);
    res.status(401).json({ message: errorHandled.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(400).json({ message: "Login Failed" });
    const compared = await bcrypt.compare(password, user.password);
    compared
      ? sendToken(user, 200, req, res)
      : res.status(400).json({ message: "Login Failed" });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
};
