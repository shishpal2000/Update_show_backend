import express from "express";
import cpUpload0 from "../middlewares/imageUpload.js";
import {
  addpaymethod,
  addRating,
  addReviews,
  addtoCart,
  addToWishlist,
  addvariant,
  adminlogin,
  adminsignup,
  applyCoupon,
  count,
  createCategory,
  createColor,
  createContact,
  createProduct,
  createSize,
  CreateSubCategory,
  createTestimonial,
  deleteAllProducts,
  deleteCategory,
  deletecorlor,
  deleteFromCart,
  deleteProduct,
  deletesize,
  deleteSubCategory,
  deletetestimonial,
  deleteVariant,
  getAllCategory,
  getallproduct,
  getallproductafterlogin,
  getallproductpagination,
  getAllSubCategory,
  getallTestimonial,
  getCart,
  getcolor,
  getcontact,
  getFilteredProducts,
  getproductbyid,
  getRating,
  getRelatedProducts,
  getreviews,
  getSize,
  getWishlist,
  removeCoupon,
  removeFromWishlist,
  singletestimonail,
  updateCart,
  updateCategory,
  updatePaymentMethod,
  updateProduct,
  updateSubCategory,
  updateTestimonial,
  updateVariant,
} from "../Controllers/adminController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();
//Testionial Route --------------------------------------------
router.route("/addtestimonial").post(cpUpload0, createTestimonial);
router.route("/gettestimonial").get(getallTestimonial);
router.route("/updatetestimonial/:id").put(cpUpload0, updateTestimonial);
router.route("/deletetestimonial/:id").delete(deletetestimonial);
router.route("/getsingletestionial/:id").get(singletestimonail);
//Contact route -----------------------------------------------
router.route("/createContact").post(createContact);
router.route("/getContact").get(getcontact);

//Category route ----------------------------------------------
router.route("/createCategory").post(cpUpload0, createCategory);
router.route("/getCategory").get(getAllCategory);
router.route("/updateCategory/:id").put(cpUpload0,updateCategory);
router.route("/deleteCategory/:id").delete(deleteCategory)

//Sub Category Route ------------------------------------------

router.route("/createSubCategory").post(CreateSubCategory);
router.route("/getsubCategory").get(getAllSubCategory);
router.route("/getSubcategory").get(getAllSubCategory);

router.route("/updateSubcategorie/:id").put(updateSubCategory);
router.route("/deleteSubcategorie/:id").delete(deleteSubCategory);

router.route("/createColor").post(createColor);
router.route("/getcolor").get(getcolor);
router.route("/Size").post(createSize);
router.route("/getsize").get(getSize);

//Product--------------------------------------------------------

router.route("/createproduct").post(cpUpload0, createProduct);
router.route("/getallproduct").get(getallproduct);
router.route("/getallproductpagination").get(getallproductpagination);
router.route("/getsingleproduct/:id").get(getproductbyid);
router.route("/updateproduct/:id").put(cpUpload0, updateProduct);
router.route("/deleteproduct/:id").delete(deleteProduct);
router.route("/deleteproductall").delete(deleteAllProducts);
router
  .route("/getallproductafterlogin")
  .get(isAuthenticated, getallproductafterlogin);

router.route("/createvariant").post(addvariant);
router.route("/updatevariant").put(updateVariant);
router.route("/deletevariant/:productId/:variantId").delete(deleteVariant);

// Revies and Ratingts
router.route("/addRating/:id").post(addRating);
router.route("/getrating/:id").get(getRating);
router.route("/addreview/:id").post(addReviews);
router.route("/getreview/:id").get(getreviews);
router.route("/relatedproduct/:id").get(getRelatedProducts);
router.route("/filterproduct").get(getFilteredProducts);

//Cart

router.route("/addtocart").post(isAuthenticated, addtoCart);
router.route("/getCart").get(isAuthenticated, getCart);
router.route("/updatecart").put(isAuthenticated, updateCart);
router.route("/deleteproductcart/:id").delete(isAuthenticated, deleteFromCart);

//Wishlist

router.route("/addtoWishlist").post(isAuthenticated, addToWishlist);
router.route("/getwishlist").get(isAuthenticated, getWishlist);
router.route("/removefromwishlist/:productId").delete(isAuthenticated, removeFromWishlist);

//Coupon And Payment Method

router.route("/applycoupon").post(isAuthenticated, applyCoupon);
router.route("/removecoupon").delete(isAuthenticated, removeCoupon);
router.route("/addpaymentmethod").post(isAuthenticated, addpaymethod);
router.route("/updatepaymentmethod").put(isAuthenticated, updatePaymentMethod)


//Create Admin

router.route("/adminsignup").post(adminsignup);
router.route("/adminlogin").post(adminlogin);

//Admin Count
router.route("/Count").get(count)

//Color
router.route("/deleteColor/:id").delete(deletecorlor);
router.route("/deleteSize/:id").delete(deletesize);

export default router;
