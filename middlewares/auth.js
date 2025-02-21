import jwt from "jsonwebtoken";
import { User } from "../Models/UserSchema.js";
import ErrorHandler from "../utils/ErrorHandler.js";



export const isAuthenticated = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return next(new ErrorHandler("User not logged in", 400));

    const token = authHeader.split(" ")[1];

    if (!token) return next(new ErrorHandler("User not logged in", 400));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded._id);

      if (!req.user) return next(new ErrorHandler("User not found", 404));
      next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return next(new ErrorHandler("Token expired, please login again", 401));
        }
      return next(new ErrorHandler("Invalid token", 400));  
    }
};
  


export const authorizeAdmin = (req, res, next) => {
  // Ensure the user is authenticated and has a role
  if (!req.user || !req.user.role) {
    return next(new ErrorHandler("User role not found", 400));
  }

  // Allow access if the user is either 'admin' or 'super admin'
  const allowedRoles = ['admin', 'superadmin'];
  if (!allowedRoles.includes(req.user.role)) {
    return next(new ErrorHandler("You are not allowed to access this resource", 403));
  }

  // If user has one of the allowed roles, proceed
  next();
};