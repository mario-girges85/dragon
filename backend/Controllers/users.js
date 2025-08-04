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

      // Check if user exists by email or phone
      const existingUser = await User.findOne({
        where: {
          email: email,
        },
      });
      const existingUserByPhone = await User.findOne({
        where: {
          phone: phone,
        },
      });

      if (existingUser || existingUserByPhone) {
        return res.status(409).json({ message: "الحساب موجود بالفعل" });
      }

      // User doesn't exist, now save the file if it exists
      let profileImagePath = null;
      if (req.file) {
        const username = name || "profile";
        const ext = path.extname(req.file.originalname);
        const filename = `${username}${ext}`;
        profileImagePath = path.join("uploads", "profiles", filename);

        // Ensure uploads directory exists
        if (!fs.existsSync("uploads")) {
          fs.mkdirSync("uploads", { recursive: true });
        }

        // Write file to disk
        fs.writeFileSync(profileImagePath, req.file.buffer);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      try {
        const user = await User.create({
          name,
          email,
          phone,
          password: hashedPassword,
          address,
          profile_image: profileImagePath,
        });
        res
          .status(201)
          .json({ message: "تم إنشاء المستخدم", user, success: true });
      } catch (dbErr) {
        // If database error occurs, delete the uploaded file
        if (profileImagePath && fs.existsSync(profileImagePath)) {
          fs.unlinkSync(profileImagePath);
        }
        console.error("Database error:", dbErr);
        res
          .status(500)
          .json({ message: "Database error", error: dbErr.message });
      }
    } catch (err) {
      console.error("Error creating user:", err);
      res
        .status(500)
        .json({ message: "Error creating user", error: err.message });
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
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
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
    res.status(200).json({ message: "User deleted" });
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
        userObj.profileImageBase64 = `data:image/jpeg;base64,${imageData.toString(
          "base64"
        )}`;
      } catch (imgErr) {
        console.error("Error reading profile image:", imgErr);
        userObj.profileImageBase64 = null;
      }
    } else {
      userObj.profileImageBase64 = null;
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
