import express from "express";
import { login, Signup, googleLogin, facebookLogin, getallUser, deleteUser, sendlink, resetpassword, addAddress, getaddressbyuserid, deleteAddress, updateAddress, createOrder, getallOrder, getmyorder, createPayment, verifypayment, paymentfailure, paymentdetails, getmyprofile, updatemyprofile, getaddressbyid, getorderbyid, updateorderdeliverydate, cancelmyorder, updateOrder } from "../Controllers/UserController.js";
import passport from "passport";
import { authorizeAdmin, isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.route("/Signup").post(Signup);
router.route("/login").post(login);
router.route("/Users").get(getallUser);
router.route("/deleteuser/:id").delete(deleteUser);
router.route("/Sendlink").post(sendlink);
router.route("/resetpassword/:id").put(resetpassword);
router.route("/getmyprofile").get(isAuthenticated,getmyprofile);
router.route("/updateprofile").put(isAuthenticated,updatemyprofile);

// Google OAuth Routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport.authenticate("google", { session: false }), googleLogin);

// Facebook OAuth Routes
router.get("/facebook", passport.authenticate("facebook", { scope: ["email"] }));
router.get("/facebook/callback", passport.authenticate("facebook", { session: false }), facebookLogin);

// add Address

router.route("/add_address").post(isAuthenticated, addAddress);
router.route("/getAddressByUser").get(isAuthenticated, getaddressbyuserid);
router.route("/getAddressById/:id").get(isAuthenticated, getaddressbyid);
router.route("/updateaddress").put(isAuthenticated, updateAddress);
router.route("/deleteaddress/:id").delete(isAuthenticated, deleteAddress);

//create Oders -------------------------------

router.route("/createorder").post(isAuthenticated, createOrder);
router.route("/getAllOrders").get(isAuthenticated, getallOrder);
router.route("/getmyorder").get(isAuthenticated, getmyorder);
router.route("/getorderbyid/:id").get(isAuthenticated, getorderbyid);
router.route("/updateorder/:orderId").put(isAuthenticated, updateOrder);
router.route("/updatedeliverydate/:id").put(isAuthenticated, updateorderdeliverydate);
router.route("/cancelmyorder/:id").put(isAuthenticated,cancelmyorder)
//Payments -----------------------------

router.route("/createPayment").post( createPayment);
router.route("/verifypayment").post(verifypayment);
router.route("/paymentfailure").post(paymentfailure);
router.route("/getpaymentdetails/:id").get(paymentdetails)


export default router;
