import jwt from "jsonwebtoken";

export const sendToken = (user, statusCode, res, message) => {
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d", // Token expires in 30 minutes
  });

  res.status(statusCode).json({
    success: true,
    message,
    user,
    token,
  });
};
