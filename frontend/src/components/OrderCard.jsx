import React from "react";
import {
  Package,
  User,
  Calendar,
  DollarSign,
  Hash,
  ArrowLeft,
} from "lucide-react";

const OrderCard = ({ order }) => {
  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_transit":
      case "picked_up":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
      case "returned":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 w-full max-w-md mx-auto"
      dir="rtl"
    >
      {/* Card Header: Order Number and Status */}
      <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200">
        <div className="flex items-center">
          <Hash className="w-6 h-6 text-[#c19a5b]" />
          <span className="text-xl font-bold text-gray-800 mr-2">
            {order.orderNumber}
          </span>
        </div>
        <span
          className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusStyles(
            order.status
          )}`}
        >
          {order.status}
        </span>
      </div>

      {/* Card Body: Order Details */}
      <div className="space-y-4">
        <div className="flex items-center text-gray-700 font-medium">
          <User className="w-5 h-5 text-gray-500 ml-3" />
          <span>{order.senderName}</span>
          <ArrowLeft className="w-5 h-5 text-[#c19a5b] mx-2" />
          <span>{order.receiverName}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Package className="w-5 h-5 text-gray-500 ml-3" />
          <span>{order.packageType}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Calendar className="w-5 h-5 text-gray-500 ml-3" />
          <span>{formattedDate}</span>
        </div>
        {order.isCollection && (
          <div className="flex items-center text-green-700 font-semibold">
            <DollarSign className="w-5 h-5 text-green-500 ml-3" />
            <span>
              تحصيل عند الاستلام: {parseFloat(order.collectionPrice).toFixed(2)}{" "}
              $
            </span>
          </div>
        )}
      </div>

      {/* NEW: Card Footer with Creator's Info */}
      <div className="pt-5 mt-5 border-t border-gray-200">
        <div className="flex items-center">
          {/* Display user profile image if it exists */}
          {order.User?.profile_image_base64 ? (
            <img
              src={
                order.User.profile_image_base64.startsWith("data:")
                  ? order.User.profile_image_base64
                  : order.User.profile_image_base64.startsWith("http")
                  ? order.User.profile_image_base64
                  : `data:image/jpeg;base64,${order.User.profile_image_base64}`
              }
              alt={order.User.name}
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                e.target.src = "/avatar.png";
              }}
            />
          ) : (
            // Fallback icon if no image
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-5 h-5 text-gray-500" />
            </div>
          )}
          <div className="mr-3">
            <p className="text-sm text-gray-500">تم إنشاؤه بواسطة</p>
            {/* Display user name */}
            <p className="font-semibold text-gray-800">
              {order.User?.name || "مستخدم غير معروف"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
