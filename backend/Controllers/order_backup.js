// Simple working version of getOrdersByUserId function
exports.getOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.id; // From verifyToken middleware

    // Check if user is requesting their own orders or is admin
    if (requestingUserId !== userId && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "لا يمكنك الوصول إلى طلبات مستخدم آخر",
      });
    }

    const orders = await Order.findAll({
      where: { userId: userId },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          attributes: ["name", "profile_image"],
        },
      ],
    });

    // Convert profile images to base64 for each order's user
    const ordersWithUserImages = orders.map((order) => {
      const orderObj = order.toJSON();
      if (
        orderObj.User &&
        orderObj.User.profile_image &&
        fs.existsSync(orderObj.User.profile_image)
      ) {
        try {
          const imageData = fs.readFileSync(orderObj.User.profile_image);
          orderObj.User.profile_image_base64 = `data:image/jpeg;base64,${imageData.toString(
            "base64"
          )}`;
        } catch (imgErr) {
          console.error("Error reading profile image:", imgErr);
          orderObj.User.profile_image_base64 = null;
        }
      } else {
        orderObj.User.profile_image_base64 = null;
      }
      return orderObj;
    });

    res.status(200).json({ success: true, orders: ordersWithUserImages });
  } catch (error) {
    console.error("Error fetching orders by user ID:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch user orders." });
  }
};

