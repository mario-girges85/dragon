const User = require("../models/user");
const path = require("path");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
// Use memory storage to temporarily hold the file
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/heic"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"), false);
    }
  },
  limits: { fileSize: 4 * 1024 * 1024 }, // 4MB
});

exports.newUser = [
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const { name, email, phone, password, address } = req.body;

      // Validate required fields
      if (!name || !phone || !password || !address) {
        return res.status(400).json({
          success: false,
          message: "جميع الحقول مطلوبة ما عدا البريد الإلكتروني",
        });
      }

      // Validate email format if provided
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
          success: false,
          message: "صيغة البريد الإلكتروني غير صحيحة",
        });
      }

      // Check for existing user by email (only if email is provided)
      if (email) {
        const existingUserByEmail = await User.findOne({
          where: { email: email },
        });

        if (existingUserByEmail) {
          return res.status(409).json({
            success: false,
            message: "البريد الإلكتروني مستخدم بالفعل",
          });
        }
      }

      // Check for existing user by phone
      const existingUserByPhone = await User.findOne({
        where: { phone: phone },
      });

      if (existingUserByPhone) {
        return res.status(409).json({
          success: false,
          message: "رقم الهاتف مستخدم بالفعل",
        });
      }

      // Handle profile image upload
      let profileImagePath = null;
      if (req.file) {
        try {
          const username = name.replace(/[^a-zA-Z0-9]/g, "_") || "profile";
          const ext = path.extname(req.file.originalname);
          const timestamp = Date.now();
          const filename = `${username}_${timestamp}${ext}`;
          profileImagePath = path.join("uploads", "profiles", filename);

          // Ensure uploads/profiles directory exists
          const uploadsDir = path.join("uploads", "profiles");
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }

          // Write file to disk
          fs.writeFileSync(profileImagePath, req.file.buffer);
        } catch (fileError) {
          console.error("File upload error:", fileError);
          return res.status(500).json({
            success: false,
            message: "خطأ في رفع الصورة الشخصية",
          });
        }
      }

      // Hash password
      let hashedPassword;
      try {
        hashedPassword = await bcrypt.hash(password, 12);
      } catch (hashError) {
        console.error("Password hashing error:", hashError);
        // Clean up uploaded file if password hashing fails
        if (profileImagePath && fs.existsSync(profileImagePath)) {
          fs.unlinkSync(profileImagePath);
        }
        return res.status(500).json({
          success: false,
          message: "خطأ في معالجة كلمة المرور",
        });
      }

      // Determine user role
      let userRole = "user";
      if (phone.trim() === "01285948011") {
        userRole = "admin";
      }

      // Create user in database
      let user;
      try {
        user = await User.create({
          name: name.trim(),
          email: email ? email.trim() : null,
          phone: phone.trim(),
          password: hashedPassword,
          address: address.trim(),
          profile_image: profileImagePath,
          role: userRole, // Assign role based on phone
        });
      } catch (dbError) {
        console.error("Database creation error:", dbError);

        // Clean up uploaded file if database creation fails
        if (profileImagePath && fs.existsSync(profileImagePath)) {
          fs.unlinkSync(profileImagePath);
        }

        // Handle specific database errors
        if (dbError.name === "SequelizeUniqueConstraintError") {
          const field = dbError.fields
            ? Object.keys(dbError.fields)[0]
            : "unknown";
          if (field === "email") {
            return res.status(409).json({
              success: false,
              message: "البريد الإلكتروني مستخدم بالفعل",
            });
          } else if (field === "phone") {
            return res.status(409).json({
              success: false,
              message: "رقم الهاتف مستخدم بالفعل",
            });
          }
        }

        return res.status(500).json({
          success: false,
          message: "خطأ في إنشاء الحساب",
        });
      }

      // Prepare response user object (exclude password)
      const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        profile_image: user.profile_image,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      res.status(201).json({
        success: true,
        message: "تم إنشاء الحساب بنجاح",
        user: userResponse,
      });
    } catch (err) {
      console.error("Unexpected error in newUser:", err);
      res.status(500).json({
        success: false,
        message: "حدث خطأ غير متوقع",
      });
    }
  },
];

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] }, // Exclude password from response
    });

    // Convert profile images to base64
    const usersWithImages = users.map((user) => {
      const userObj = user.toJSON();
      if (userObj.profile_image && fs.existsSync(userObj.profile_image)) {
        try {
          const imageData = fs.readFileSync(userObj.profile_image);
          userObj.profile_image_base64 = imageData.toString("base64");
        } catch (imgErr) {
          userObj.profile_image_base64 = null;
        }
      } else {
        userObj.profile_image_base64 = null;
      }
      return userObj;
    });
    // console.log(usersWithImages);

    res.status(200).json(usersWithImages);
  } catch (err) {
    console.error("Error fetching users:", err);
    res
      .status(500)
      .json({ message: "Error fetching users", error: err.message });
  }
};

exports.deleteUserById = async (req, res) => {
  console.log(req.params.id);

  try {
    const userId = req.params.id;
    const requestingUserId = req.user.id; // From verifyToken middleware

    // Prevent users from deleting their own profile
    if (userId == requestingUserId) {
      return res.status(403).json({
        success: false,
        message: "لا يمكنك حذف حسابك الشخصي",
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete profile image if exists
    if (user.profile_image) {
      try {
        if (fs.existsSync(user.profile_image)) {
          fs.unlinkSync(user.profile_image);
        }
      } catch (imgErr) {
        console.error("Error deleting profile image:", imgErr);
      }
    }

    await user.destroy();
    res.status(200).json({
      success: true,
      message: "تم حذف المستخدم بنجاح",
    });
  } catch (err) {
    console.error("Error deleting user:", err);
    res
      .status(500)
      .json({ message: "Error deleting user", error: err.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const requestingUserId = req.user.id; // From verifyToken middleware

    // Check if user is requesting their own profile or is admin
    if (requestingUserId !== userId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "لا يمكنك الوصول إلى ملف شخصي آخر",
      });
    }

    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] }, // Exclude password from response
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Convert user to JSON and handle profile image
    const userObj = user.toJSON();

    // Convert profile image to base64 if exists
    if (userObj.profile_image && fs.existsSync(userObj.profile_image)) {
      try {
        const imageData = fs.readFileSync(userObj.profile_image);
        userObj.profile_image_base64 = imageData.toString("base64");
      } catch (imgErr) {
        console.error("Error reading profile image:", imgErr);
        userObj.profile_image_base64 = null;
      }
    } else {
      userObj.profile_image_base64 = null;
    }

    res.status(200).json({
      success: true,
      user: userObj,
    });
  } catch (err) {
    console.error("Error fetching user by ID:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: err.message,
    });
  }
};

// Secret for JWT — keep this in env vars in production
const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key";

exports.loginUser = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone || !password) {
      return res
        .status(400)
        .json({ message: "البريد/التليفون وكلمة المرور مطلوبين" });
    }

    // Find user by email or phone
    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: emailOrPhone }, { phone: emailOrPhone }],
      },
    });

    if (!user) {
      return res.status(401).json({ message: "بيانات الدخول غير صحيحة" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "بيانات الدخول غير صحيحة" });
    }

    // Prepare user object excluding password
    const userObj = user.toJSON();
    delete userObj.password;

    // Attach base64 image if exists
    if (userObj.profile_image && fs.existsSync(userObj.profile_image)) {
      try {
        const imageData = fs.readFileSync(userObj.profile_image);
        userObj.profile_image_base64 = imageData.toString("base64");
      } catch (imgErr) {
        userObj.profile_image_base64 = null;
      }
    } else {
      userObj.profile_image_base64 = null;
    }

    // Generate JWT (optional)
    const token = jwt.sign(
      { id: userObj.id, email: userObj.email },
      JWT_SECRET
    );

    // Return user data + token
    res.status(200).json({
      message: "logged in successfully",
      user: userObj,
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res
      .status(500)
      .json({ message: "خطأ في تسجيل الدخول", error: err.message });
  }
};

// Change user role endpoint
exports.changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ["user", "delivery", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "الدور غير صحيح. الأدوار المتاحة: user, delivery, admin",
      });
    }

    // Find user by ID
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "المستخدم غير موجود",
      });
    }

    // Update user role
    await user.update({ role });

    // Prepare response user object (exclude password)
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      profile_image: user.profile_image,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    // Convert profile image to base64 if exists
    if (
      userResponse.profile_image &&
      fs.existsSync(userResponse.profile_image)
    ) {
      try {
        const imageData = fs.readFileSync(userResponse.profile_image);
        userResponse.profile_image_base64 = imageData.toString("base64");
      } catch (imgErr) {
        userResponse.profile_image_base64 = null;
      }
    } else {
      userResponse.profile_image_base64 = null;
    }

    res.status(200).json({
      success: true,
      message: "تم تحديث دور المستخدم بنجاح",
      user: userResponse,
    });
  } catch (err) {
    console.error("Error changing user role:", err);
    res.status(500).json({
      success: false,
      message: "خطأ في تحديث دور المستخدم",
      error: err.message,
    });
  }
};

// Update user profile endpoint
exports.updateUserProfile = [
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, phone, address } = req.body;

      // Verify that the user is editing their own profile
      if (req.user.id !== id) {
        return res.status(403).json({
          success: false,
          message: "لا يمكنك تعديل ملف شخصي آخر",
        });
      }

      // Validate required fields
      if (!name || !phone || !address) {
        return res.status(400).json({
          success: false,
          message: "الاسم ورقم الهاتف والعنوان مطلوبة",
        });
      }

      // Validate email format if provided
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
          success: false,
          message: "صيغة البريد الإلكتروني غير صحيحة",
        });
      }

      // Find user by ID
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "المستخدم غير موجود",
        });
      }

      // Check for existing user by email (only if email is provided and different from current)
      if (email && email !== user.email) {
        const existingUserByEmail = await User.findOne({
          where: { email: email },
        });

        if (existingUserByEmail) {
          return res.status(409).json({
            success: false,
            message: "البريد الإلكتروني مستخدم بالفعل",
          });
        }
      }

      // Check for existing user by phone (only if phone is different from current)
      if (phone !== user.phone) {
        const existingUserByPhone = await User.findOne({
          where: { phone: phone },
        });

        if (existingUserByPhone) {
          return res.status(409).json({
            success: false,
            message: "رقم الهاتف مستخدم بالفعل",
          });
        }
      }

      // Handle profile image upload
      let profileImagePath = user.profile_image; // Keep existing image by default
      if (req.file) {
        try {
          // Delete old profile image if exists
          if (user.profile_image && fs.existsSync(user.profile_image)) {
            fs.unlinkSync(user.profile_image);
          }

          const username = name.replace(/[^a-zA-Z0-9]/g, "_") || "profile";
          const ext = path.extname(req.file.originalname);
          const timestamp = Date.now();
          const filename = `${username}_${timestamp}${ext}`;
          profileImagePath = path.join("uploads", "profiles", filename);

          // Ensure uploads/profiles directory exists
          const uploadsDir = path.join("uploads", "profiles");
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }

          // Write file to disk
          fs.writeFileSync(profileImagePath, req.file.buffer);
        } catch (fileError) {
          console.error("File upload error:", fileError);
          return res.status(500).json({
            success: false,
            message: "خطأ في رفع الصورة الشخصية",
          });
        }
      }

      // Update user in database
      await user.update({
        name: name.trim(),
        email: email ? email.trim() : null,
        phone: phone.trim(),
        address: address.trim(),
        profile_image: profileImagePath,
      });

      // Prepare response user object (exclude password)
      const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        profile_image: user.profile_image,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      // Convert profile image to base64 if exists
      if (
        userResponse.profile_image &&
        fs.existsSync(userResponse.profile_image)
      ) {
        try {
          const imageData = fs.readFileSync(userResponse.profile_image);
          userResponse.profile_image_base64 = imageData.toString("base64");
        } catch (imgErr) {
          userResponse.profile_image_base64 = null;
        }
      } else {
        userResponse.profile_image_base64 = null;
      }

      res.status(200).json({
        success: true,
        message: "تم تحديث الملف الشخصي بنجاح",
        user: userResponse,
      });
    } catch (err) {
      console.error("Error updating user profile:", err);
      res.status(500).json({
        success: false,
        message: "خطأ في تحديث الملف الشخصي",
        error: err.message,
      });
    }
  },
];

// Logout (stateless, just a placeholder for frontend)
exports.logoutUser = (req, res) => {
  // For JWT, logout is handled on the client by deleting the token
  res.status(200).json({ success: true, message: "تم تسجيل الخروج بنجاح" });
};

// Get current user's profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "المستخدم غير موجود" });
    }
    const userObj = user.toJSON();
    if (userObj.profile_image && fs.existsSync(userObj.profile_image)) {
      try {
        const imageData = fs.readFileSync(userObj.profile_image);
        userObj.profile_image_base64 = imageData.toString("base64");
      } catch (imgErr) {
        userObj.profile_image_base64 = null;
      }
    } else {
      userObj.profile_image_base64 = null;
    }
    res.status(200).json({ success: true, user: userObj });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "خطأ في جلب البيانات",
      error: err.message,
    });
  }
};

// Update current user's profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, address, phone } = req.body;
    const user = await User.findByPk(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "المستخدم غير موجود" });
    }
    if (name) user.name = name;
    if (email) user.email = email;
    if (address) user.address = address;
    if (phone) user.phone = phone;
    await user.save();
    res
      .status(200)
      .json({ success: true, message: "تم تحديث البيانات بنجاح", user });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "خطأ في تحديث البيانات",
      error: err.message,
    });
  }
};
