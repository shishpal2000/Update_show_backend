import { User } from "../Models/UserSchema.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { sendToken } from "../utils/sendToken.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { configDotenv } from "dotenv";
import { Address } from "../Models/AddressModel.js";
import { Cart } from "../Models/CartModel.js";
import { order } from "../Models/OrderModel.js";
import Razorpay from "razorpay";
import { payment } from "../Models/PaymentsModel.js";
import { coupon } from "../Models/CouponModel.js";

const razorpay = new Razorpay({
  key_id: "rzp_test_P6U4bVeKGpTrVw",
  key_secret: "Qx0MxnFoXZtH9Pusnp8ihXQN",
});

export const Signup = async (req, res, next) => {
  try {
    const { FirstName, LastName, email, password, phonenumber } = req.body;
    if (!FirstName || !LastName || !email || !password || !phonenumber)
      return next(new ErrorHandler("Please Enter All Details ", 500));
    const userexisted = await User.findOne({ email });

    const lowerCaseEmail = email.toLowerCase();

    if (userexisted) return next(new ErrorHandler("User Already Existed", 404));

    const hashedpassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      Firstname: FirstName,
      Lastname: LastName,
      email: lowerCaseEmail,
      password: hashedpassword,
      phonenumber,
    });
    sendToken(user, 201, res, "User Created Successfully");
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log("email", email, password);

    if (!email || !password)
      return next(new ErrorHandler("Please enter all details", 400));

    const lowerCaseEmail = email.toLowerCase();

    const user = await User.findOne({ email: lowerCaseEmail }).select(
      "+password"
    );

    if (!user)
      return next(new ErrorHandler("User Doesn't Exist, Please Signup"));

    const comparepassword = await bcrypt.compare(password, user.password);
    if (!comparepassword)
      return next(new ErrorHandler("Incorrect Email Or Password", 500));

    sendToken(user, 200, res, "User Logged in Successfully");
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export const googleLogin = (req, res) => {
  sendToken(req.user, 200, res, "Google Login Successful");
};

export const facebookLogin = (req, res) => {
  sendToken(req.user, 200, res, "Facebook Login Successful");
};

export const getallUser = async (req, res, next) => {
  try {
    const user = await User.find({});
    if (!user) return next(new ErrorHandler("Get All User", 200));
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server error", 500));
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new ErrorHandler("User Not found", 404));

    await user.deleteOne();
    res.status(200).json({
      success: true,
      messgae: "User Deleted Successfully",
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export const sendlink = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return next(new ErrorHandler("Please enter all details", 404));
    const user = await User.findOne({ email });
    if (!user) return next(new ErrorHandler("User Not Found", 404));
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "info@nexcraftdigital.com".trim(),
        pass: "vgxhfailwfvqznwb".trim(),
      },
    });

    // bvteramarmbeufnb
    const link = `https://localhost:3000/set-password?id=${user._id}`;
    let mailOptions;
    mailOptions = {
      from: "info@nexcraftdigital.com",
      to: [`${user.email}`],
      subject: "Your Reset Link For Reset the Password of Rajat Shoes",
      html: `
        <p>Welcome to the Rajat Shoes</b></p>
        <p>You Are trying to Reset Your Password Please Follow this Link ${link}</b></p>
        <p>Please treat this code as highly confidential. Do not share it with anyone, as unauthorized access could lead to security breaches.</p>
        <p>If you have not try to do this so please Ignore this email.</a>
        </p>
        <br/>
        <p>Best regards,</p>
        <p>Rajat Shoes</p>
      `,
    };
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "A Link is Send To Your email For Reseting the Password.",
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export const resetpassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("+password");
    if (!user) return next(new ErrorHandler("User Not Found", 404));
    const { NewPassword, ConfirmPassword } = req.body;
    if (!NewPassword || !ConfirmPassword)
      return next(new ErrorHandler("Please enter All Fields", 400));
    if (NewPassword !== ConfirmPassword)
      return next(
        new ErrorHandler("Password and ConfirmPassword Are Not Same", 400)
      );

    const hashedpassword = await bcrypt.hash(NewPassword, 10);
    user.password = hashedpassword;

    // Save the updated user
    await user.save();
    res.status(200).json({
      success: true,
      message: "Password Is Changes Successfully",
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export const getmyprofile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user);
    if (!user) return next(new ErrorHandler("User Not Found", 400));
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export const deleteany = async (req, res, next) => {};

export const updatemyprofile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user);
    if (!user) return next(new ErrorHandler("User Not Found", 400));

    const { Firstname, Lastname, phonenumber, email } = req.body;
    if (Firstname) user.Firstname = Firstname;
    if (Lastname) user.Lastname = Lastname;
    if (phonenumber) user.phonenumber = phonenumber;
    if (Lastname) user.Lastname = Lastname;
    if (email) user.email = email;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        Firstname: user.Firstname,
        Lastname: user.Lastname,
        phonenumber: user.phonenumber,
        email: user.email, // Email remains unchanged
      },
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal server Error ", 500));
  }
};

//Address

export const addAddress = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      country,
      company,
      streetAddress,
      aptSuiteUnit,
      city,
      state,
      phone,
      postalCode,
      deliveryInstruction,
    } = req.body;
    const user = await User.findById(req.user);
    if (!user) return next(new ErrorHandler("User Not Found", 400));

    const adress = await Address.create({
      userId: user._id,
      firstName,
      lastName,
      country,
      company,
      streetAddress,
      aptSuiteUnit,
      city,
      state,
      phone,
      postalCode,
      deliveryInstruction,
      type: "Shipping",
    });

    res.status(200).json({
      success: true,
      message: "Address Added Successfully",
      adress,
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal server Error", 500));
  }
};

export const getaddressbyuserid = async (req, res, next) => {
  try {
    const user = await User.findById(req.user);
    if (!user) return next(new ErrorHandler("Please Login Again", 400));
    const address = await Address.find({ userId: user._id });
    if (!address)
      return next(new ErrorHandler("No Address Please Add Address", 400));
    res.status(200).json({
      success: true,
      address,
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export const getaddressbyid = async (req, res, next) => {
  try {
    const address = await Address.findById(req.params.id);
    if (!address) return next(new ErrorHandler("Address Not Found ", 400));
    res.status(200).json({
      success: true,
      address,
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal server Error", 500));
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user);

    const address = await Address.find({
      userId: user._id,
    });
    if (!address) return next(new ErrorHandler("There is No Address", 400));
    const addressbyid = await Address.findById(req.params.id);
    if (!addressbyid) return next(new ErrorHandler("Address Not Dound", 400));
    await addressbyid.deleteOne();
    res.status(200).json({
      success: true,
      message: "Address Deleted Successfully",
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user);
    if (!user) return next(new ErrorHandler("User Not Found", 400));
    const {
      id,
      firstName,
      lastName,
      country,
      company,
      streetAddress,
      aptSuiteUnit,
      city,
      state,
      phone,
      postalCode,
      deliveryInstruction,
    } = req.body;

    const address = await Address.find({
      userId: user._id,
    });

    if (!address) return next(new ErrorHandler("Address Not Found", 400));

    const addressid = await Address.findById(id);
    if (!addressid) return next(new ErrorHandler("Address Not Found", 404));

    if (firstName) {
      addressid.firstName = firstName || addressid.firstName;
    }
    if (lastName) {
      addressid.lastName = lastName || addressid.lastName;
    }
    if (country) {
      addressid.country = country || addressid.country;
    }
    if (company) {
      addressid.company = company || addressid.company;
    }
    if (streetAddress) {
      addressid.streetAddress = streetAddress || addressid.streetAddress;
    }
    if (aptSuiteUnit) {
      addressid.aptSuiteUnit = aptSuiteUnit || addressid.aptSuiteUnit;
    }
    if (city) {
      addressid.city = city || addressid.city;
    }
    if (state) {
      addressid.state = state || addressid.state;
    }
    if (phone) {
      addressid.phone = phone || addressid.phone;
    }
    if (postalCode) {
      addressid.postalCode = postalCode || addressid.postalCode;
    }
    if (deliveryInstruction) {
      addressid.deliveryInstruction =
        deliveryInstruction || addressid.deliveryInstruction;
    }
    await addressid.save();
    res.status(200).json({
      success: true,
      message: "Address Added Successfully",
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

//Order

const generateOrderNumber = () => {
  const randomDigits = Math.floor(100000000 + Math.random() * 900000000);
  return `ORD_#${randomDigits}`;
};
// Function to generate a random coupon code
const generateCouponCode = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let couponCode = "";

  // Generate a 10-character alphanumeric coupon code
  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    couponCode += characters[randomIndex];
  }

  return couponCode;
};

export const createOrder = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const { shippingAddress } = req.body;
    if (!shippingAddress) {
      return next(new ErrorHandler("Please provide all required details", 400));
    }

    // Validate user
    const user = await User.findById(userId);
    if (!user) return next(new ErrorHandler("User not found", 404));

    // Fetch user's cart
    const cart = await Cart.findOne({ userId }).populate("Product.product");
    if (!cart || cart.Product.length === 0) {
      return next(new ErrorHandler("No products found in the cart", 404));
    }

    // Extract cart data
    const cartItems = cart.Product.map((cartItem) => ({
      product: cartItem.product._id,
      sizeId: cartItem.sizeId,
      variant: cartItem.variant,
      quantity: cartItem.count,
      amount: cartItem.Price,
    }));

    if (cartItems.length === 0) {
      return next(new ErrorHandler("Cart is empty", 400));
    }

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create the order
    const newOrder = await order.create({
      userId,
      shippingAddress,
      cartItems,
      totalAmount: cart.FinaltotalPrice,
      discount: cart.discount,
      finalTotal: cart.FinaltotalPrice,
      delieveryCharge: cart.ShippingCharge,
      orderNumber,
      status: "Pending",
      paymentMethod: cart.paymentMethod,
      paymentStatus: "Pending",
    });

    // Clear the cart after order creation
    await Cart.deleteOne({ userId });

    // Create a fixed ₹100 discount coupon
    const newCoupon = new coupon({
      code: generateCouponCode(), // Implement function to generate a random code
      discountValue: 100, // Fixed ₹100 discount
      discountType: "fixed",
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Valid for 30 days
      coupon_desc: "₹100 off on your next purchase. Thank you for shopping!",
    });

    await newCoupon.save();
    console.log("Generated Coupon:", newCoupon);

    // Send email to the user with the coupon code
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "info@nexcraftdigital.com".trim(),
        pass: "vgxhfailwfvqznwb".trim(),
      },
    });

    const mailOptions = {
      from: "info@nexcraftdigital.com",
      to: user.email,
      subject: "Your ₹100 Discount Coupon",
      text: `Thank you for your order! Use the coupon code ${newCoupon.code} to get ₹100 off on your next purchase.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: newOrder,
      coupon: newCoupon, // Send the new coupon code in the response
    });
  } catch (error) {
    console.error("Error creating order:", error);
    next(new ErrorHandler("Internal Server Error", 500));
  }
};

export const getallOrder = async (req, res, next) => {
  try {
    const { orderStatus, page = 1, limit = 10 } = req.query;

    // Ensure page and limit are numbers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Define filter condition
    const filter = {};
    if (orderStatus) {
      filter.orderStatus = orderStatus;
    }

    // Get total order count for pagination
    const totalOrders = await order.countDocuments(filter);

    const orders = await order
      .find(filter)
      .populate("userId")
      .populate("shippingAddress")
      .populate({
        path: "cartItems.product",
        populate: { path: "variants" },
      })
      .skip(skip) // Skip previous pages
      .limit(limitNumber); // Limit to per-page orders

    if (!orders || orders.length === 0) {
      return next(new ErrorHandler("No Orders Found", 404));
    }

    // Manually populate variant details
    const populatedOrders = orders.map((orderItem) => {
      const populatedCartItems = orderItem.cartItems.map((cartItem) => {
        const product = cartItem.product;
        if (!product || !product.variants) return null;

        const variant = product.variants.find(
          (v) => v._id.toString() === cartItem.variant.toString()
        );

        if (!variant) return null;

        return {
          ...cartItem.toObject(),
          product,
          variant,
        };
      });

      return {
        ...orderItem.toObject(),
        cartItems: populatedCartItems.filter((item) => item !== null),
      };
    });

    // Pagination metadata
    const hasNext = pageNumber * limitNumber < totalOrders;
    const hasPrev = pageNumber > 1;

    res.status(200).json({
      success: true,
      message: "All Orders",
      orders: populatedOrders,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        hasNext,
        hasPrev,
        totalOrders,
      },
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export const getmyorder = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Find the user
    const user = await User.findById(userId);
    if (!user) return next(new ErrorHandler("User Not Found", 404));

    // Fetch the orders and populate product & shipping details
    const orders = await order
      .find({ userId })
      .populate({
        path: "userId",
        select: "Firstname Lastname email",
      })
      .populate({
        path: "shippingAddress",
      })
      .populate({
        path: "cartItems.product",
        select:
          "name description poster category Subcategory stock Brand SoleMaterial Fastening Gender Type ToeShape variants",
        populate: [
          {
            path: "variants.color",
            select: "Color ColorCode",
          },
          {
            path: "variants.Size.size",
          },
        ],
      })
      .populate({
        path: "cartItems.sizeId",
      });

    if (!orders || orders.length === 0)
      return next(new ErrorHandler("You Don't Have Orders", 404));

    // Populate variant details manually
    const populatedOrders = await Promise.all(
      orders.map(async (orderItem) => {
        const populatedCartItems = await Promise.all(
          orderItem.cartItems.map(async (cartItem) => {
            const product = cartItem.product;
            if (!product) return null;

            // Find the specific variant from the product's variants array
            const variant = product.variants.find(
              (v) => v._id.toString() === cartItem.variant.toString()
            );

            if (!variant) return null; // If variant is not found, skip it

            return {
              ...cartItem.toObject(),
              product, // Include full product details
              variant, // Include full variant details
            };
          })
        );

        return {
          ...orderItem.toObject(),
          cartItems: populatedCartItems.filter((item) => item !== null), // Remove null items
        };
      })
    );

    // Construct response
    res.status(200).json({
      success: true,
      orders: populatedOrders,
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export const cancelmyorder = async (req, res, next) => {
  try {
    const user = await User.findById(req.user);
    if (!user) return next(new ErrorHandler("User not Found ", 400));
    const orders = await order.findById(req.params.id);
    if (!orders) return next(new ErrorHandler("Order not found", 400));

    orders.orderStatus = "Cancel";
    await orders.save();
    res.status(200).json({
      success: true,
      message: "Order Cancelled Successfully",
      orders,
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export const getorderbyid = async (req, res, next) => {
  try {
    const orders = await order
      .findById(req.params.id)
      .populate("userId")
      .populate("shippingAddress")
      .populate({
        path: "cartItems.product",
        populate: [
          { path: "variants", populate: { path: "color" } }, // Populating variants and their color
        ],
      })
      .populate("cartItems.sizeId");

    if (!orders) return next(new ErrorHandler("Order Not Found", 400));

    // Manually populate variant details similar to getallOrder
    const populatedCartItems = orders.cartItems.map((cartItem) => {
      const product = cartItem.product;
      if (!product || !product.variants) return null;

      // Find the correct variant based on cartItem.variant
      const variant = product.variants.find(
        (v) => v._id.toString() === cartItem.variant.toString()
      );

      if (!variant) return null;

      return {
        ...cartItem.toObject(),
        product,
        variant,
      };
    });

    res.status(200).json({
      success: true,
      orders: {
        ...orders.toObject(),
        cartItems: populatedCartItems.filter((item) => item !== null),
      },
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};



export const updateOrder = async (req, res, next) => {
  try {
    const { orderStatus, paymentStatus, DeliveryDate } = req.body;
    const { orderId } = req.params;

    // Check if order exists
    const existingOrder = await order.findById(orderId);
    if (!existingOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Update fields if provided
    if (orderStatus) existingOrder.orderStatus = orderStatus;
    if (paymentStatus) existingOrder.paymentStatus = paymentStatus;
    
    // Convert DeliveryDate to a proper Date object
    if (DeliveryDate) {
      const parsedDate = new Date(DeliveryDate);
      if (!isNaN(parsedDate.getTime())) {
        // Convert to UTC to avoid timezone shift
        existingOrder.DeliveryDate = new Date(Date.UTC(
          parsedDate.getFullYear(),
          parsedDate.getMonth(),
          parsedDate.getDate()
        ));
      } else {
        return res.status(400).json({ success: false, message: "Invalid date format" });
      }
    }

    // Save the updated order
    await existingOrder.save();

    return res.status(200).json({ success: true, message: "Order updated successfully", order: existingOrder });

  } catch (error) {
    console.error("Error updating order:", error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};




export const updateorderdeliverydate = async (req, res, next) => {
  try {
    const orders = await order.findById(req.params.id);
    if (!orders) return next(new ErrorHandler("Order not Found ", 400));
    const { deliverydate } = req.body;
    if (!deliverydate)
      return next(new ErrorHandler("PLease Enter Deliveryb Date", 400));
    orders.DeliveryDate = deliverydate;
    await orders.save();
    res.status(200).json({
      success: true,
      message: "Delivery Date Successfully",
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error , 500"));
  }
};
//Payments-----------------------------------------

export const createPayment = async (req, res, next) => {
  try {
    const { orderId, userId, amount, notes } = req.body;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }
    const orders = await order.findById(orderId);
    if (!orders)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `order_rcptid_${orderId}`,
      notes: {
        ...notes,
      },
    });
    orders.razorpayOrderId = razorpayOrder.id;
    orders.paymentStatus = "Pending";
    await orders.save();

    const payments = new payment({
      orderId: orders._id,
      userId: userId,
      razorpayOrderId: razorpayOrder.id,
      paymentStatus: "Pending",
      amount: amount,
      currency: "INR",
      notes: razorpayOrder.notes,
    });
    await payments.save();

    res.status(201).json({
      success: true,
      razorpayOrder,
    });
  } catch (error) {
    console.log(error);
    return next();
  }
};

export const verifypayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const generatedSignature = crypto
      .createHmac("sha256", "rzp_test_P6U4bVeKGpTrVw")
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");
    if (generatedSignature !== razorpaySignature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment signature" });
    }
    const payments = await payment.findOne({ razorpayOrderId });
    if (!payment)
      return res
        .status(404)
        .json({ success: false, message: "Payment record not found" });

    payments.razorpayPaymentId = razorpayPaymentId;
    payments.razorpaySignature = razorpaySignature;
    payments.paymentStatus = "Paid";
    await payments.save();

    const orders = await order.findById(payment.orderId);
    if (!orders)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    orders.razorpayPaymentId = razorpayPaymentId;
    orders.razorpaySignature = razorpaySignature;
    orders.paymentStatus = "Paid";
    orders.status = "Processing";
    await orders.save();

    res.status(200).json({
      success: true,
      message: "Payment verified, order updated, and shipping details saved",
    });
  } catch (error) {
    console.log(error);
    return next();
  }
};

export const paymentfailure = async (req, res, next) => {
  try {
    const { razorpayOrderId } = req.body;

    if (!razorpayOrderId) {
      return res
        .status(400)
        .json({ success: false, message: "Razorpay Order ID is required" });
    }

    const payments = await payment.findOne({ razorpayOrderId });
    if (!payments)
      return res
        .status(404)
        .json({ success: false, message: "Payment record not found" });

    payments.paymentStatus = "Failed";
    await payment.save();

    const orders = await order.findById(payment.orderId);
    if (orders) {
      orders.paymentStatus = "Failed";
      await order.save();
    }

    res
      .status(200)
      .json({ success: true, message: "Payment marked as failed" });
  } catch (error) {
    console.log(error);
    return next();
  }
};

export const paymentdetails = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const payments = await payment.findOne({ orderId });
    if (!payments)
      return res
        .status(404)
        .json({ success: false, message: "Payment details not found" });
    res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};
