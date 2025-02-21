import { Category } from "../Models/CategorySchema.js";
import { Contact } from "../Models/ContactSchema.js";
import { Product } from "../Models/ProductSchema.js";
import { Subcategory } from "../Models/SubCategorySchema.js";
import { Testimonial } from "../Models/TestimonialSchema.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { v2 as cloudinary } from "cloudinary";
import { Colour } from "../Models/ColorSchema.js";
import { Size } from "../Models/Size.js";
import { User } from "../Models/UserSchema.js";
import { Cart } from "../Models/CartModel.js";
import { Wishlist } from "../Models/WishlistModel.js";
import { coupon } from "../Models/CouponModel.js";
import bcrypt from "bcrypt";
import { sendToken } from "../utils/sendToken.js";
import { order } from "../Models/OrderModel.js";
import mongoose from "mongoose";

// Admin Signup Login

export const adminsignup = async (req, res, next) => {
  try {
    const { Firstname, Lastname, email, password } = req.body;
    if (!Firstname || !Lastname || !email || !password)
      return next(new ErrorHandler("Please Enter All Details", 400));
    const user = await User.findOne({ email });
    if (user) return next(new ErrorHandler("User Already Exist", 400));

    const hashedpassword = await bcrypt.hash(password, 10);
    const createuser = await User.create({
      Firstname,
      Lastname,
      email,
      password: hashedpassword,
    });

    createuser.role = "admin";
    await createuser.save();
    res.status(201).json({
      success: true,
      message: "Admin Created Successfully",
      createuser,
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export const adminlogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return next(new ErrorHandler("Please Enter all Details ", 400));
    const user = await User.findOne({ email }).select("+password");
    if (!user)
      return next(new ErrorHandler("User Not Existed Please Signup", 400));
    const comparepassword = await bcrypt.compare(password, user.password);
    if (!comparepassword)
      return next(
        new ErrorHandler("Please Enter Correct Email And Password", 400)
      );
    if (user.role === "admin") {
      sendToken(user, 200, res, "Login Successfully");
    } else {
      return next(new ErrorHandler("You are Not Allowed to login here ", 401));
    }
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

//Testimonail Control Starts Here

export const createTestimonial = async (req, res, next) => {
  try {
    const { Title, Description, UserName, Rating } = req.body;

    if (!Title || !Description || !UserName || !Rating)
      return next(new ErrorHandler("Please Enter All Details"));

    let images = [];
    let userImg = [];

    const singleImage = req.files["image"] ? req.files["image"][0] : null;
    const multipleImages = req.files["images"] || [];
    const userImageFile = req.files["userImg"] ? req.files["userImg"][0] : null; // User image handling

    // Handle multiple images
    if (singleImage) {
      let obj = {
        public_id: singleImage.filename,
        url: singleImage.path,
      };
      images.push(obj);
    }

    for (let i = 0; i < multipleImages.length; i++) {
      const file = multipleImages[i];
      let obj = {
        public_id: file.filename,
        url: file.path,
      };
      images.push(obj);
    }

    // Handle User Image
    if (userImageFile) {
      let useriobj = {
        public_id: userImageFile.filename,
        url: userImageFile.path,
      };
      userImg.push(useriobj);
    }

    const testimonial = await Testimonial.create({
      Title,
      Description,
      UserName,
      Rating,
      Images: images,
      UserImg: userImg, // Add the user image here
    });

    res.status(201).json({
      success: true,
      message: "Testimonial Created Successfully",
      testimonial,
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export const getallTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.find({});
    if (!testimonial)
      return next(new ErrorHandler("No Testimonial Found", 404));
    res.status(200).json({
      success: true,
      message: "All Testimonial",
      testimonial,
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export const updateTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial)
      return next(new ErrorHandler("Testimonial not found", 404));

    const { title, description, username, Rating } = req.body;

    if (title) testimonial.Title = title;
    if (description) testimonial.Description = description;
    if (username) testimonial.UserName = username;
    if (Rating) testimonial.Rating = Rating;

    // Handle new images
    let images = testimonial.Images || [];
    let userImg = testimonial.UserImg || [];

    const singleImage = req.files["image"] ? req.files["image"][0] : null;
    const multipleImages = req.files["images"] || [];
    const userImageFile = req.files["userImg"] ? req.files["userImg"][0] : null;

    // Replace testimonial images if new ones are provided
    if (singleImage || multipleImages.length > 0) {
      // Delete old images from Cloudinary
      for (let img of testimonial.Images) {
        await cloudinary.uploader.destroy(img.public_id);
      }
      images = []; // Clear old images

      if (singleImage) {
        images.push({
          public_id: singleImage.filename,
          url: singleImage.path,
        });
      }

      multipleImages.forEach((file) => {
        images.push({
          public_id: file.filename,
          url: file.path,
        });
      });

      testimonial.Images = images;
    }

    // Replace user image if a new one is uploaded
    if (userImageFile) {
      // Delete old user image from Cloudinary
      if (testimonial.UserImg.length > 0) {
        await cloudinary.uploader.destroy(testimonial.UserImg[0].public_id);
      }

      userImg = [{
        public_id: userImageFile.filename,
        url: userImageFile.path,
      }];

      testimonial.UserImg = userImg;
    }

    await testimonial.save();

    res.status(200).json({
      success: true,
      message: "Testimonial updated successfully",
      testimonial,
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};


export const deletetestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial)
      return next(new ErrorHandler("Testimonial Not Found ", 404));

    if (testimonial.Images.length > 0) {
      for (let i = 0; i < testimonial.Images.length; i++) {
        const image = testimonial.Images[i];
        await cloudinary.uploader.destroy(image.public_id);
      }
    }
    await testimonial.deleteOne();
    res.status(200).json({
      success: true,
      message: "Testimonia Deleted Successfully",
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export const singletestimonail = async (req, res, next) => {
  try {
    const testimonail = await Testimonial.findById(req.params.id);
    if (!testimonail)
      return next(new ErrorHandler("Testimonial Not Found", 404));
    res.status(200).json({
      success: true,
      testimonail,
    });
  } catch (error) {
    console.log(error);
  }
};

//Contact Us Starts here

export const createContact = async (req, res, next) => {
  try {
    const { address, PhoneNumber, fb, linkedin, insta, twitter, link1, link2 } =
      req.body;

    // Find an existing contact and update it, or create a new one if none exists
    const contact = await Contact.findOneAndUpdate(
      {}, // Match any document (only one allowed in this case)
      { address, PhoneNumber, fb, linkedin, insta, twitter, link1, link2 },
      { new: true, upsert: true, setDefaultsOnInsert: true } // Create if not found
    );

    res.status(200).json({
      success: true,
      message: "Contact saved successfully",
      contact,
    });
  } catch (error) {
    console.error("Error creating/updating contact:", error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export const getcontact = async (req, res, next) => {
  try {
    const contact = await Contact.findOne();
    if (!contact) return next(new ErrorHandler("Contact Not Found", 404));
    res.status(201).json({
      success: true,
      contact,
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

// CAtegories Controller start here
export const createCategory = async (req, res, next) => {
  try {
    const { name, badge } = req.body;

    // Validate name
    if (!name) return next(new ErrorHandler("Please enter all fields", 400));

    // Validate req.files

    let images = [];
    const singleImage = req.files["image"] ? req.files["image"][0] : null;
    const multipleImages = req.files["images"] || [];

    // Process single image
    if (singleImage) {
      images.push({
        public_id: singleImage.filename,
        url: singleImage.path,
      });
    }

    // Process multiple images
    multipleImages.forEach((file) => {
      images.push({
        public_id: file.filename,
        url: file.path,
      });
    });

    // Create category in database
    const category = await Category.create({
      name,
      badge,
      poster: images,
    });

    // Send response
    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error(error);
    next(new ErrorHandler("Internal Server Error", 500));
  }
};

export const getAllCategory = async (req, res, next) => {
  try {
    const category = await Category.find({});
    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};
export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return next(new ErrorHandler("Invalid Category Id", 404));

    const { name, badge } = req.body;

    if (!name) {
      return next(new ErrorHandler("Please enter all fields", 400));
    }

    // Update name and badge
    category.name = name || category.name;
    category.badge = badge || category.badge;

    // Handle image updates
    let images = category.poster || []; // Retain existing images if no new ones are provided
    const singleImage = req.files["image"] ? req.files["image"][0] : null;
    const multipleImages = req.files["images"] || [];

    // If new images are uploaded, replace existing images
    if (singleImage || multipleImages.length > 0) {
      images = []; // Clear old images

      if (singleImage) {
        images.push({
          public_id: singleImage.filename,
          url: singleImage.path,
        });
      }

      multipleImages.forEach((file) => {
        images.push({
          public_id: file.filename,
          url: file.path,
        });
      });

      category.poster = images;
    }

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return next(new ErrorHandler("Invalid Category Id"));
    await category.deleteOne();
    res.status(200).json({
      success: true,
      message: "Category deleted successfully please update Subcategory also",
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

//SubCategory-----------------------------------------------------------------------------

export const CreateSubCategory = async (req, res, next) => {
  try {
    const { categoryId, name } = req.body;
    if (!categoryId || !name)
      return next(new ErrorHandler("please enter all Fields"));
    const findCategory = await Category.findById(categoryId);
    if (!findCategory) return next(new ErrorHandler("Invalid Category", 400));
    const subCategory = await Subcategory.create({
      name,
      category: categoryId,
    });
    res.status(201).json({
      success: "true",
      message: "SubCategory created successfully",
      subCategory,
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export const getAllSubCategoryAdmin = async (req, res, next) => {
  try {
    const subcategory = await Subcategory.find({}).populate("category");
    res.status(200).json({
      success: true,
      subcategory,
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export const getAllSubCategory = async (req, res, next) => {
  try {
    const subcategory = await Subcategory.find({}).populate("category");
    res.status(200).json({
      success: true,
      subcategory,
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export const updateSubCategory = async (req, res, next) => {
  try {
   
    const subcategory = await Subcategory.findById(req.params.id);
    const { categoryId, name } = req.body;
    console.log(subcategory);
    if (!subcategory || subcategory == "")
      return next(new ErrorHandler("Subcategory Not Found", 404));
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return next(new ErrorHandler("Category Not found", 404));
      }
      subcategory.category = categoryId || subcategory.category;
    }
    if (name) {
      subcategory.name = name || subcategory.name;
    }
    await subcategory.save()
    res.status(200).json({
      success: true,
      message: "subcategory updated Successfully",
      subcategory,
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export const deleteSubCategory = async (req, res, next) => {
  try {
    const subcategory = await Subcategory.findByIdAndDelete(req.params.id);
    if (!subcategory) return next(new ErrorHandler("Not Found", 404));
    res.status(200).json({
      success: true,
      message: "Subcategory deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

// Color-----------------------------------------------------
export const createColor = async (req, res, next) => {
  try {
    const { Color, ColorCode } = req.body;
    console.log("color", Color, ColorCode);

    if (!Color || !ColorCode)
      return next(new ErrorHandler("Please Enter All Details", 500));
    const color = await Colour.create({
      Color,
      ColorCode,
    });
    res.status(201).json({
      success: true,
      message: "Color Created Successfully",
      color,
    });
  } catch (error) {
    console.log(error);
    next(new ErrorHandler("Internal Server Error", 500));
  }
};

export const getcolor = async (req, res, next) => {
  try {
    const color = await Colour.find({});
    if (!color) return next(new ErrorHandler("There Are No Colors"));
    res.status(200).json({
      success: true,
      color,
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error"));
  }
};

export const deletecorlor = async (req, res, next) => {
  try {
    const color = await Colour.findById(req.params.id);
    if (!color) return next(new ErrorHandler("Color Not found", 404));
    await color.deleteOne();
    res.status(200).json({
      success: true,
      message: "Delete Color Successfully",
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};
// Size ---------------------------

export const createSize = async (req, res, next) => {
  try {
    const { size } = req.body;
    if (!size) return next(new ErrorHandler("Please Enter the Size"));
    const s = await Size.create({
      Size: size,
    });

    res.status(201).json({
      success: true,
      size,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getSize = async (req, res, next) => {
  try {
    const size = await Size.find({});
    if (!size) return next(new ErrorHandler("There Are No Size"));
    res.status(200).json({
      success: true,
      size,
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error"));
  }
};
export const deletesize = async (req, res, next) => {
  try {
    const size = await Size.findById(req.params.id);
    if (!size) return next(new ErrorHandler("Size Not Found", 404));
    await size.deleteOne();
    res.status(200).json({
      success: true,
      message: "Size Delete Successfully",
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

//Producttttttttttttt -----------------------------------------------------------------------

export const createProduct = async (req, res, next) => {
  try {
    // Debug uploaded files
    const {
      name,
      description,
      price,
      stock,
      categoryId,
      subcategoryId,
      Brand,
      SoleMaterial,
      Fastening,
      Gender,
      Type,
      ToeShape,
      isPopular,
    } = req.body;

    let images = [];
    let videos = [];

    // Handle single image
    const singleImage = req.files["image"] ? req.files["image"][0] : null;
    if (singleImage) {
      images.push({
        public_id: singleImage.filename,
        url: singleImage.path,
      });
    }

    // Handle multiple images
    const multipleImages = req.files["images"] || [];
    for (let file of multipleImages) {
      images.push({
        public_id: file.filename,
        url: file.path,
      });
    }

    // Handle multiple videos
    const multipleVideos = req.files["videos"] || [];
    for (let file of multipleVideos) {
      videos.push({
        public_id: file.filename,
        url: file.path,
      });
    }

    // If no valid files uploaded, return an error
    if (!images.length && !videos.length) {
      return res.status(400).json({
        success: false,
        message: "No valid files uploaded",
      });
    }

    // Create the product
    const product = await Product.create({
      name,
      description,
      price,
      category: categoryId,
      Subcategory: subcategoryId,
      stock,
      poster: images,
      videos,
      Brand,
      SoleMaterial,
      Fastening,
      Gender,
      Type,
      ToeShape,
      isPopular,
    });
    const lastFourDigits = product._id.toString().slice(-4); // Get the last 4 digits of the ID
    product.sku = `${name}-${lastFourDigits}`;

    // Save the product with the updated SKU
    await product.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Error creating product: ", error.message || error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const getallproduct = async (req, res, next) => {
  try {
    const products = await Product.find({})
      .populate({
        path: "category",
      })
      .populate({
        path: "Subcategory",
        populate: {
          path: "category", // Populate the category inside Subcategory
        },
      })
      .populate({
        path: "variants",
        populate: [
          { path: "Size.size", model: "Size", select: "Size" }, // Populate size with the Size field
          { path: "color", select: "Color ColorCode" }, // Populate color with Color and ColorCode fields
        ],
      });

    if (!products || products.length === 0) {
      return next(new ErrorHandler("There are no products", 404));
    }

    const updatedProducts = products.map((product) => {
      product.isWishlist = false;
      return product;
    });

    res.status(200).json({
      success: true,
      message: "All Products",
      updatedProducts,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export const getallproductpagination = async (req, res, next) => {
  try {
    // Extract page and limit from query parameters, with default values
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch products with pagination
    const products = await Product.find({})
      .populate({
        path: "category",
      })
      .populate({
        path: "Subcategory",
        populate: {
          path: "category", // Populate the category inside Subcategory
        },
      })
      .populate("Size.size")
      .populate("color")
      .skip(skip)
      .limit(limit);

    // Get total count of products
    const totalProducts = await Product.countDocuments();

    if (!products || products.length === 0) {
      return next(new ErrorHandler("There are no products", 404));
    }

    const updatedProducts = products.map((product) => {
      product.isWishlist = false;
      return product;
    });

    res.status(200).json({
      success: true,
      message: "All Products",
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts,
      updatedProducts,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export const getproductbyid = async (req, res, next) => {
  try {
    const productId = req.params.id;
    if (!productId)
      return next(new ErrorHandler("Please provide productId", 404));
    const product = await Product.findById(productId).populate({
      path: "variants",
      populate: [
        { path: "Size.size", model: "Size", select: "Size" }, // Populate size with the Size field
        { path: "color", select: "Color ColorCode" }, // Populate color with Color and ColorCode fields
      ],
    });
    if (!product) return next(new ErrorHandler("product Not Found", 404));

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal server error", 500));
  }
};

export const getallproductafterlogin = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    console.log("userID", userId);

    const user = await User.findById(userId);
    let products = await Product.find({});

    if (user) {
      const wishlistprod = await Wishlist.findOne({ userId }).populate(
        "products.productId",
        "name price description poster"
      );

      if (wishlistprod) {
        // Extract product IDs from wishlist
        const pidArray = wishlistprod.products.map(
          (item) => item.productId._id
        );
        console.log("wishlist", pidArray);

        // Find products in wishlist and update their isWishlist property
        const wishlistProducts = await Product.find({ _id: { $in: pidArray } });
        wishlistProducts.forEach((product) => {
          product.isWishlist = true;
          product.save(); // Save the updated product
        });

        // Return the complete product list
        products = await Product.find({});
      }

      res.status(200).json({
        success: true,
        products,
      });
    } else {
      // User not found or not logged in
      products.forEach((product) => (product.isWishlist = false));
      res.status(200).json({
        success: true,
        products,
      });
    }
  } catch (error) {
    console.error(error);
    return next(new ErrorHandler("Internal server Error", 500));
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      categoryId,
      subcategoryId,
      sizeId,
      colorId,
      variantId,
      Brand,
      SoleMaterial,
      Fastening,
      Gender,
      Type,
      ToeShape,
    } = req.body;

    const { id } = req.params;

    // Find the product to update
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Delete existing images from Cloudinary
    if (req.files && (req.files["image"] || req.files["images"])) {
      for (const img of product.poster) {
        await cloudinary.uploader.destroy(img.public_id); // Replace with your Cloudinary delete function
      }
      product.poster = []; // Clear the current poster array
    }

    let images = [];

    const singleImage = req.files?.["image"] ? req.files["image"][0] : null;
    const multipleImages = req.files?.["images"] || [];

    if (singleImage) {
      let obj = {
        public_id: singleImage.filename,
        url: singleImage.path,
      };
      images.push(obj);
    }

    for (let i = 0; i < multipleImages.length; i++) {
      const file = multipleImages[i];
      let obj = {
        public_id: file.filename,
        url: file.path,
      };

      images.push(obj);
    }

    // Check and update the variants
    if (variantId) {
      const variantIndex = product.variants.findIndex(
        (item) => item._id.toString() === variantId
      );

      if (variantIndex !== -1) {
        // If variantId matches, update the size and/or color
        const variant = product.variants[variantIndex];

        // Update size if sizeId is provided
        if (sizeId) {
          variant.size = sizeId;
        }

        // Update color if colorId is provided
        if (colorId) {
          variant.color = colorId;
        }

        // Reassign the updated variant back to the product
        product.variants[variantIndex] = variant;
      }
    }

    // Update product fields
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.stock = stock || product.stock;
    product.category = categoryId || product.category;
    product.Subcategory = subcategoryId || product.Subcategory;
    product.poster = images.length > 0 ? images : product.poster;
    product.Brand = Brand || product.Brand;
    product.SoleMaterial = SoleMaterial || product.SoleMaterial;
    product.Fastening = Fastening || product.Fastening;
    product.Gender = Gender || product.Gender;
    product.Type = Type || product.Type;
    product.ToeShape = ToeShape || product.ToeShape;

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal server Error", 500));
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the product by id
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Delete images from Cloudinary
    const images = product.poster || [];
    for (const image of images) {
      if (image.public_id) {
        await cloudinary.uploader.destroy(image.public_id);
      }
    }

    // Delete the product from the database
    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal server Error", 500));
  }
};

export const addRating = async (req, res, next) => {
  try {
    const { rating } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return next(new ErrorHandler("Product Not Found", 404));

    if (!rating) return next(new ErrorHandler("Please Provide Rating"));
    let obj = {
      rate: rating,
    };

    product.ratings.push(obj);
    await product.save();
    res.status(201).json({
      success: true,
      message: "Rating Add Successfully",
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export const addReviews = async (req, res, next) => {
  try {
    const { user, name, rating, comment } = req.body;
    const userss = await User.findById(user);
    if (!userss) return next(new ErrorHandler("Please Login First ", 404));
    const product = await Product.findById(req.params.id);
    if (!product) return next(new ErrorHandler("Product Not Found", 404));

    let obj = {
      user: user,
      name: name,
      rating: rating,
      comment: comment,
    };
    product.reviews.push(obj);
    product.NumOfreviews = product.reviews.length;
    await product.save();
    res.status(201).json({
      success: true,
      message: "Reviews added Successfully",
    });
  } catch (error) {
    console.log(error);
  }
};

export const getRating = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(new ErrorHandler("Product  Not Found", 404));
    } else {
      const rating = product.ratings;
      res.status(200).json({
        success: true,
        rating,
      });
    }
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export const getreviews = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(new ErrorHandler("Product Not Found", 404));
    } else {
      const reviews = product.reviews;
      res.status(200).json({
        success: true,
        reviews,
      });
    }
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export const getRelatedProducts = async (req, res, next) => {
  try {
    const { id } = req.params; // Product ID passed in the URL
    const currentProduct = await Product.findById(id);

    if (!currentProduct) {
      return next(new ErrorHandler("Product not found", 404));
    }

    // Find related products based on category or subcategory
    let relatedProducts = await Product.find({
      _id: { $ne: id }, // Exclude the current product
      $or: [
        { category: currentProduct.category },
        { Subcategory: currentProduct.Subcategory },
      ],
    })
      .populate("category")
      .populate("Subcategory");

    // Fallback: Fetch at least one product if no related products are found
    if (relatedProducts.length === 0) {
      const fallbackProduct = await Product.findOne({ _id: { $ne: id } })
        .populate("category")
        .populate("Subcategory");

      if (fallbackProduct) {
        relatedProducts = [fallbackProduct]; // Use fallback product
      }
    }

    res.status(200).json({
      success: true,
      message: relatedProducts.length
        ? "Related Products"
        : "No related products found, showing a fallback product",
      relatedProducts,
    });
  } catch (error) {
    console.error("Error fetching related products:", error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export const getFilteredProducts = async (req, res, next) => {
  try {
    const {
      isPopular,
      newArrival,
      category,
      subcategory,
      size,
      color,
      gender,
      minPrice,
      maxPrice,
      name,
      page = 1,
      limit = 10,
    } = req.query;

    const filterConditions = {};

    // Apply filters
    if (newArrival === "true") {
      filterConditions.createdAt = {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      };
    }
    if (isPopular === "true") {
      filterConditions.isPopular = "true";
    }

    if (category) {
      filterConditions.category = category;
    }

    if (subcategory) {
      filterConditions.Subcategory = subcategory;
    }

    if (gender) {
      filterConditions.Gender = gender;
    }

    if (minPrice || maxPrice) {
      filterConditions.price = {};
      if (minPrice) filterConditions.price.$gte = minPrice;
      if (maxPrice) filterConditions.price.$lte = maxPrice;
    }

    if (name) {
      filterConditions.name = { $regex: name, $options: "i" };
    }

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const skip = (pageNumber - 1) * pageSize;

    const products = await Product.find(filterConditions)
      .populate("category")
      .populate("Subcategory")
      .populate({
        path: "variants",
        populate: [
          { path: "size", select: "Size" },
          { path: "color", select: "Color ColorCode" },
        ],
      })
      .skip(skip)
      .limit(pageSize);

    const filteredProducts = products.filter((product) => {
      if (size || color) {
        return product.variants.some((variant) => {
          const matchesSize =
            size && variant.size ? variant.size._id.toString() === size : true;
          const matchesColor =
            color && variant.color
              ? variant.color._id.toString() === color
              : true;
          return matchesSize && matchesColor;
        });
      }
      return true;
    });

    const totalProducts = await Product.countDocuments(filterConditions); // Total count of matching products
    const totalPages = Math.ceil(totalProducts / pageSize);

    if (!filteredProducts.length) {
      return res.status(404).json({
        success: false,
        message: "No products found matching the criteria",
      });
    }

    res.status(200).json({
      success: true,
      message: "Filtered Products",
      currentPage: pageNumber,
      totalPages,
      totalProducts,
      hasPrev: pageNumber > 1,
      hasNext: pageNumber < totalPages,
      products: filteredProducts,
    });
  } catch (error) {
    console.error("Error fetching filtered products:", error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

//Add Variants ------------------------------
export const addvariant = async (req, res, next) => {
  try {
    const { size, color, price, quantity, productId } = req.body;
    if (!size || !color || !price || !quantity || !productId)
      return next(new ErrorHandler("Please Enter all Details", 400));

    const product = await Product.findById(productId);
    if (!product) return next(new ErrorHandler("Product Not Found", 404));

    // Ensure that the size array is correctly structured
    const sizesArray = size.map((s) => ({
      size: s, // Here, s can be a size ID if it's a reference to the Size model
    }));

    const obj = {
      color: color,
      Size: sizesArray, // Add the array of size objects
      price: price,
      quantity: quantity,
    };

    product.variants.push(obj);
    await product.save();

    res.status(201).json({
      success: true,
      message: "Product Variant added Successfully",
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal server error"));
  }
};

export const updateVariant = async (req, res, next) => {
  try {
    const { variantId, productId, sizes, color, price, quantity } = req.body;

    if (!variantId || !productId) {
      return next(
        new ErrorHandler("Product ID and Variant ID are required", 400)
      );
    }

    const product = await Product.findById(productId);
    if (!product) return next(new ErrorHandler("Product Not Found", 404));

    // Find the specific variant in the product
    const variant = product.variants.id(variantId);
    if (!variant) return next(new ErrorHandler("Variant Not Found", 404));

    // Update the sizes array only if provided
    if (sizes && Array.isArray(sizes)) {
      variant.Size = sizes.map((s) => ({ size: s }));
    }

    if (color) {
      variant.color = color;
    }
    if (price) {
      variant.price = price;
    }
    if (quantity) {
      variant.quantity = quantity;
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: "Variant updated successfully",
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal server error"));
  }
};
export const deleteVariant = async (req, res, next) => {
  try {
    const { variantId, productId } = req.params;

    if (!variantId || !productId) {
      return next(
        new ErrorHandler("Product ID and Variant ID are required", 400)
      );
    }

    const product = await Product.findById(productId);
    if (!product) {
      return next(new ErrorHandler("Product Not Found", 404));
    }

    // Find the index of the variant in the product's variants array
    const variantIndex = product.variants.findIndex(
      (variant) => variant._id.toString() === variantId
    );

    if (variantIndex === -1) {
      return next(new ErrorHandler("Variant Not Found", 404));
    }

    // Remove the variant from the array
    product.variants.splice(variantIndex, 1);

    await product.save();

    res.status(200).json({
      success: true,
      message: "Variant deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

// Cart ANd wishlist -----------------------
export const addtoCart = async (req, res, next) => {
  try {
    const { productId, variantId, sizeId, count } = req.body;
    const userId = req.user._id;

    if (
      !productId ||
      !variantId ||
      !sizeId ||
      !count ||
      isNaN(count) ||
      count <= 0
    ) {
      return next(new ErrorHandler("Invalid input data", 400));
    }

    const user = await User.findById(userId);
    if (!user) return next(new ErrorHandler("Please Login First", 404));

    const product = await Product.findById(productId);
    if (!product) return next(new ErrorHandler("Product Not Found", 404));

    const variant = product.variants.find(
      (v) => v._id.toString() === variantId
    );
    if (!variant) return next(new ErrorHandler("Variant Not Found", 404));

    const size = variant.Size.find((s) => s.size.toString() === sizeId);
    
    if (!size) return next(new ErrorHandler("Invalid Size ID", 400));

    const productPrice = variant.price * count;

    if (
      isNaN(variant.price) ||
      isNaN(count) ||
      count <= 0 ||
      isNaN(productPrice) ||
      productPrice <= 0
    ) {
      return next(new ErrorHandler("Invalid product price or count", 400));
    }

    let cart = await Cart.findOne({ userId });

    if (cart) {
      const existingProduct = cart.Product.find(
        (p) =>
          p.product.toString() === productId.toString() &&
          p.variant.toString() === variantId.toString() &&
          p.sizeId.toString() === sizeId
      );

      if (existingProduct) {
        existingProduct.count += count;
        existingProduct.Price = variant.price * existingProduct.count;
      } else {
        cart.Product.push({
          product: productId,
          variant: variantId,
          sizeId,
          count,
          Price: productPrice,
        });
      }

      cart.TotalItems = cart.Product.reduce(
        (total, item) => total + item.count,
        0
      );
      cart.TotalPrice = cart.Product.reduce(
        (total, item) => total + item.Price,
        0
      );
    } else {
      cart = new Cart({
        userId,
        Product: [
          {
            product: productId,
            variant: variantId,
            sizeId,
            count,
            Price: productPrice,
          },
        ],
        TotalItems: count,
        TotalPrice: productPrice,
      });
    }

    // Ensure TotalPrice is non-negative
    cart.TotalPrice = Math.max(cart.TotalPrice, 0);

    // Calculate Final total price
    cart.FinaltotalPrice = Math.max(
      cart.TotalPrice - cart.discount + cart.ShippingCharge,
      0
    );

    await cart.save();

    res.status(201).json({
      success: true,
      message: "Product with variant added to cart successfully",
      cart,
    });
  } catch (error) {
    console.error("Error in addtoCart:", error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export const getCart = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId })
      .populate({
        path: "userId",
        select: "Firstname Lastname email",
      })
      .populate({
        path: "Product.product",
        select:
          "name description poster category Subcategory stock Brand SoleMaterial Fastening Gender Type ToeShape variants",
        populate: [
          {
            path: "variants.Size.size", // Correctly populating size inside Size array
            select: "Size",
          },
          {
            path: "variants.color",
            select: "Color ColorCode",
          },
        ],
      })
      .populate({
        path: "couponCode",
      });

    // Check if cart or products exist
    if (!cart || cart.Product.length === 0) {
      return res.status(404).json({
        success: true,
        message: "There are no products in the cart. Please add products.",
        cart: {
          _id: cart ? cart._id : null,
          user: cart ? cart.userId : null,
          products: [],
        },
      });
    }

    // Populate sizeId separately since it's not in the Product schema
    await Promise.all(
      cart.Product.map(async (productItem) => {
        const product = productItem.product;
        if (product && productItem.sizeId) {
          // If sizeId is present, populate it
          productItem.sizeId = await mongoose
            .model("Size")
            .findById(productItem.sizeId);
        }
      })
    );

    // Populate variant details
    const populatedProducts = await Promise.all(
      cart.Product.map(async (productItem) => {
        const product = productItem.product;
        if (!product) return null;

        const variant = product.variants.find(
          (v) => v._id.toString() === productItem.variant.toString()
        );

        if (!variant) return null;

        return {
          ...productItem.toObject(),
          product,
          variant,
        };
      })
    );

    const filteredProducts = populatedProducts.filter((item) => item !== null);

    // If cart is empty, set default values
    const totalPrice = filteredProducts.length > 0 ? cart.TotalPrice : 0;
    const finalTotalPrice = Math.max(
      totalPrice - cart.discount + cart.ShippingCharge,
      0
    );

    res.status(200).json({
      success: true,
      cart: {
        _id: cart._id,
        user: cart.userId,
        products: filteredProducts,
        TotalItems: cart.TotalItems,
        TotalPrice: totalPrice,
        discount: cart.discount,
        coupon: cart.couponCode ? cart.couponCode : null,
        ShippingCharge: cart.ShippingCharge,
        paymentMethod: cart.paymentMethod,
        FinaltotalPrice: finalTotalPrice,
      },
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return next(new ErrorHandler("Internal server error", 500));
  }
};

export const updateCart = async (req, res, next) => {
  try {
    const { id, count } = req.body; // `id` refers to the `_id` inside the Product array
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId });
    if (!cart) return next(new ErrorHandler("Cart Not Found", 404));

    // Find the product in the cart using `_id` inside the Product array
    const productIndex = cart.Product.findIndex(
      (item) => item._id.toString() === id
    );

    if (productIndex === -1) {
      return next(new ErrorHandler("Product not found in cart", 404));
    }

    const productItem = cart.Product[productIndex];

    // Get the product details from the database
    const product = await Product.findById(productItem.product);
    if (!product) return next(new ErrorHandler("Product Not Found", 404));

    // Find the variant inside the product
    const variant = product.variants.find(
      (v) => v._id.toString() === productItem.variant.toString()
    );
    if (!variant) return next(new ErrorHandler("Variant Not Found", 404));

    if (count > 0) {
      // Update quantity and price
      cart.Product[productIndex].count = count;
      cart.Product[productIndex].Price = count * variant.price;
    } else {
      // Remove product if count is 0
      cart.Product.splice(productIndex, 1);
    }

    // Recalculate TotalItems and TotalPrice
    cart.TotalItems = cart.Product.reduce((sum, item) => sum + item.count, 0);
    cart.TotalPrice = cart.Product.reduce((sum, item) => sum + item.Price, 0);

    // Calculate final price with discount (if any)
    const discountAmount = cart.discount || 0;
    cart.FinaltotalPrice =
      cart.TotalPrice + cart.ShippingCharge - discountAmount;

    await cart.save();

    // Populate coupon details in the response
    const updatedCart = await Cart.findById(cart._id).populate("couponCode");

    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      updatedCart,
    });
  } catch (error) {
    console.error("Error in updateCart:", error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export const deleteFromCart = async (req, res, next) => {
  try {
    const { id } = req.params; // The `_id` of the product entry in the cart
    const userId = req.user._id; // Authenticated user's ID

    // Find the user's cart
    const cart = await Cart.findOne({ userId });
    if (!cart) return next(new ErrorHandler("Cart not found", 404));

    // Find the index of the product in the `Product` array
    const productIndex = cart.Product.findIndex(
      (item) => item._id.toString() === id
    );

    if (productIndex === -1)
      return next(new ErrorHandler("Product not found in cart", 404));

    // Get the product details before removing
    const removedProduct = cart.Product[productIndex];

    // Validate price and count before updating totals
    const productPrice = removedProduct.Price || 0;
    const productCount = removedProduct.count || 0;

    // Prevent total price from going negative
    cart.TotalItems = Math.max(0, cart.TotalItems - productCount);
    cart.TotalPrice = Math.max(
      0,
      cart.TotalPrice - productPrice * productCount
    );
    cart.FinaltotalPrice = cart.TotalPrice;
    // Remove the product from the cart
    cart.Product.splice(productIndex, 1);

    // Save the updated cart
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Product removed from cart successfully",
      cart,
    });
  } catch (error) {
    console.error("Error in deleteFromCart:", error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

//Wishlist

export const addToWishlist = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    // Check if the user is authenticated
    const user = await User.findById(userId);
    if (!user) return next(new ErrorHandler("Please Login First", 400));

    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) return next(new ErrorHandler("Product Not Found", 404));

    // Find or create the wishlist for the user
    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      wishlist = new Wishlist({ userId, products: [] });
    }

    // Check if the product is already in the wishlist
    const isAlreadyWishlisted = wishlist.products.some(
      (item) => item.productId.toString() === productId
    );
    if (isAlreadyWishlisted) {
      return next(new ErrorHandler("Product is already in the wishlist", 400));
    }

    // Add product to the wishlist
    wishlist.products.push({ productId });
    await wishlist.save();

    // Update the product to mark it as wishlisted

    res.status(201).json({
      success: true,
      message: "Product added to wishlist",
    });
  } catch (error) {
    console.error("Error in addToWishlist:", error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export const getWishlist = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Check if the user is authenticated
    const user = await User.findById(userId);
    if (!user) return next(new ErrorHandler("Please Login First", 400));

    // Fetch the user's wishlist and populate product details
    const wishlist = await Wishlist.findOne({ userId }).populate({
      path: "products.productId",
      populate: [
        { path: "category", select: "name" }, // Populate category
        { path: "Subcategory", select: "name" }, // Populate subcategory
        {
          path: "variants.color",
          select: "Color ColorCode", // Adjust fields as per your schema
        },
        {
          path: "variants.Size.size",
          select: "Size", // Adjust fields as per your schema
        },
      ],
    });

    if (!wishlist) return next(new ErrorHandler("No Wishlist Found", 404));

    res.status(200).json({
      success: true,
      wishlist,
    });
  } catch (error) {
    console.error("Error in getWishlist:", error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export const removeFromWishlist = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    // Check if the user is authenticated
    const user = await User.findById(userId);
    if (!user) return next(new ErrorHandler("Please Login First", 400));

    // Find the wishlist
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) return next(new ErrorHandler("No Wishlist Found", 404));

    // Remove the product from the wishlist
    wishlist.products = wishlist.products.filter(
      (item) => item.productId.toString() !== productId
    );
    await wishlist.save();

    // Update the product to mark it as not wishlisted
    const product = await Product.findById(productId);
    if (product) {
      product.isWishlist = false;
      await product.save();
    }

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    console.error("Error in removeFromWishlist:", error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export const deleteAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find(); // Fetch all products
    if (!products || products.length === 0) {
      return next(new ErrorHandler("No Products Found", 404));
    }

    await Product.deleteMany(); // Delete all products
    res.status(200).json({
      success: true,
      message: "All products deleted successfully",
    });
  } catch (error) {
    console.error(error);
    next(error); // Pass the error to the error-handling middleware
  }
};

// apply Coupon
export const applyCoupon = async (req, res, next) => {
  try {
    const user = await User.findById(req.user);
    const { couponCode } = req.body;

    if (!user) return next(new ErrorHandler("User Not Found", 400));

    const cart = await Cart.findOne({ userId: user._id });
    if (!cart) return next(new ErrorHandler("Cart Not Found", 400));

    if (!couponCode)
      return next(new ErrorHandler("Coupon code is required", 400));

    // Find the coupon in the database
    const validCoupon = await coupon.findOne({
      code: couponCode,
      expirationDate: { $gte: new Date() }, // Check if the coupon is still valid
      isApplied: false, // Ensure the coupon has not been used
      isValid: true, // Ensure the coupon is valid
    });

    if (!validCoupon) {
      return next(
        new ErrorHandler("Invalid, expired, or already used coupon", 400)
      );
    }

    let discount = 0;

    // Apply discount based on coupon type
    if (validCoupon.discountType === "percentage") {
      discount = (validCoupon.discountValue / 100) * cart.TotalPrice;
    } else if (validCoupon.discountType === "fixed") {
      discount = validCoupon.discountValue;
    }

    // Ensure discount does not exceed the total price
    discount = Math.min(discount, cart.TotalPrice);

    // Update the cart with the discount and new total price
    cart.discount = discount;
    cart.TotalPrice -= discount;
    cart.couponCode = validCoupon._id;
    cart.FinaltotalPrice = cart.TotalPrice;

    await cart.save();

    // Mark the coupon as used
    validCoupon.isApplied = true;
    validCoupon.usedCount += 1;
    await validCoupon.save();

    // Populate the coupon details before sending the response
    const updatedCart = await Cart.findById(cart._id).populate("couponCode");

    res.status(200).json({
      success: true,
      message: `Coupon applied successfully! You saved ₹${discount}.`,
      cart: updatedCart,
    });
  } catch (error) {
    console.error("Error in applyCoupon:", error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export const removeCoupon = async (req, res, next) => {
  try {
    const user = await User.findById(req.user);
    if (!user) return next(new ErrorHandler("User Not Found", 400));

    const cart = await Cart.findOne({ userId: user._id });
    if (!cart) return next(new ErrorHandler("Cart Not Found", 400));

    if (!cart.couponCode) {
      return next(new ErrorHandler("No coupon applied to remove", 400));
    }

    // Restore the total price before the discount was applied
    cart.TotalPrice += cart.discount;
    cart.FinaltotalPrice = cart.TotalPrice;
    cart.discount = 0;
    cart.couponCode = null;

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Coupon removed successfully!",
      cart,
    });
  } catch (error) {
    console.error("Error in removeCoupon:", error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

// Add Payment Method

export const addpaymethod = async (req, res, next) => {
  try {
    const { paymentMethod } = req.body;
    const user = await User.findById(req.user);

    if (!user) return next(new ErrorHandler("User Not Found", 400));
    if (!paymentMethod)
      return next(new ErrorHandler("Please Enter Payment Method", 400));
    if (!["Online", "COD"].includes(paymentMethod))
      return next(new ErrorHandler("Invalid Payment Method", 400));

    const cart = await Cart.findOne({ userId: user._id });
    if (!cart) return next(new ErrorHandler("Cart Not Found", 400));

    // Set payment method
    cart.paymentMethod = paymentMethod;

    // Apply shipping charge rules
    if (paymentMethod === "Online") {
      cart.ShippingCharge = 0;
      cart.FinaltotalPrice = cart.TotalPrice;
    } else if (paymentMethod === "COD") {
      cart.ShippingCharge = cart.TotalPrice < 2000 ? 100 : 0;
      cart.FinaltotalPrice = cart.TotalPrice + cart.ShippingCharge;
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Payment method added successfully!",
      cart,
    });
  } catch (error) {
    console.error("Error in addpaymethod:", error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};
export const updatePaymentMethod = async (req, res, next) => {
  try {
    const { paymentMethod } = req.body;
    const user = await User.findById(req.user);

    if (!user) return next(new ErrorHandler("User Not Found", 400));
    if (!paymentMethod)
      return next(new ErrorHandler("Please Enter Payment Method", 400));
    if (!["Online", "COD"].includes(paymentMethod))
      return next(new ErrorHandler("Invalid Payment Method", 400));

    const cart = await Cart.findOne({ userId: user._id });
    if (!cart) return next(new ErrorHandler("Cart Not Found", 400));

    // Update payment method
    cart.paymentMethod = paymentMethod;

    // Apply shipping charge rules
    if (paymentMethod === "Online") {
      cart.ShippingCharge = 0;
      cart.FinaltotalPrice = cart.TotalPrice;
    } else if (paymentMethod === "COD") {
      cart.ShippingCharge = cart.TotalPrice < 2000 ? 100 : 0;
      cart.FinaltotalPrice = cart.TotalPrice + cart.ShippingCharge;
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Payment method updated successfully!",
      cart,
    });
  } catch (error) {
    console.error("Error in updatePaymentMethod:", error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

//dashboard Count Api

export const count = async (req, res, next) => {
  try {
    const product = await Product.find({});
    const orders = await order.find({});
    const category = await Category.find({});
    const subCategory = await Subcategory.find({});
    const user = await User.find({});
    res.status(200).json({
      success: true,
      productCount: product.length,
      orderscount: order.length,
      categoryCount: category.length,
      subCategoryCount: Subcategory.length,
      usercount: user.length,
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};



