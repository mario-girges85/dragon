import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Package,
  User,
  Calendar,
  DollarSign,
  Hash,
  ArrowLeft,
  Eye,
  Truck,
  UserPlus,
  CheckCircle,
  XCircle,
} from "lucide-react";

const OrderCard = ({
  order,
  onAssignDelivery,
  deliveryUsers,
  isAdmin,
  onDeliveryStatusUpdate,
}) => {
  const navigate = useNavigate();
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedDeliveryUser, setSelectedDeliveryUser] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [shippingFee, setShippingFee] = useState("");

  const handleCardClick = () => {
    navigate(`/orders/${order.id}`);
  };

  const handleAssignClick = (e) => {
    e.stopPropagation(); // Prevent card click
    console.log("Assignment modal opened");
    console.log("Delivery users prop:", deliveryUsers);
    console.log("Is admin:", isAdmin);
    setShowAssignmentModal(true);
  };

  const handleAssignDelivery = async () => {
    if (!selectedDeliveryUser) {
      alert("يرجى اختيار مندوب التوصيل");
      return;
    }

    if (
      !shippingFee ||
      isNaN(parseFloat(shippingFee)) ||
      parseFloat(shippingFee) < 0
    ) {
      alert("يرجى إدخال رسوم الشحن الصحيحة");
      return;
    }

    setIsAssigning(true);
    try {
      await onAssignDelivery(
        order.id,
        selectedDeliveryUser,
        parseFloat(shippingFee)
      );
      setShowAssignmentModal(false);
      setSelectedDeliveryUser("");
      setShippingFee("");
    } catch (error) {
      console.error("Error assigning delivery:", error);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleDeliverySuccess = async () => {
    setIsUpdatingStatus(true);
    try {
      await updateDeliveryStatus(order.id, "delivered", "");
    } catch (error) {
      console.error("Error marking order as delivered:", error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeliveryFailed = () => {
    setShowDeliveryModal(true);
  };

  const handleSubmitFailedDelivery = async () => {
    if (!deliveryNotes.trim()) {
      alert("يرجى إدخال سبب عدم التوصيل");
      return;
    }

    setIsUpdatingStatus(true);
    try {
      await updateDeliveryStatus(order.id, "returned", deliveryNotes);
      setShowDeliveryModal(false);
      setDeliveryNotes("");
    } catch (error) {
      console.error("Error marking order as not delivered:", error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const updateDeliveryStatus = async (orderId, status, notes) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("يرجى تسجيل الدخول مرة أخرى");
      return;
    }

    try {
      const response = await axios.put(
        `${
          import.meta.env.VITE_UPDATE_DELIVERY_STATUS
        }${orderId}/delivery-status`,
        { status, deliveryNotes: notes },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Call the parent component's update function
        if (onDeliveryStatusUpdate) {
          onDeliveryStatusUpdate(response.data.order);
        }
        alert(
          status === "delivered"
            ? "تم تحديث الطلب كمُسلم بنجاح"
            : "تم تحديث الطلب كغير مُسلم"
        );
      } else {
        alert(response.data.message || "فشل في تحديث حالة التوصيل");
      }
    } catch (err) {
      console.error("Error updating delivery status:", err);
      alert(err.response?.data?.message || "حدث خطأ أثناء تحديث حالة التوصيل");
    }
  };

  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
      case "returned":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      submitted: "تم التقديم",
      confirmed: "مؤكد",
      delivered: "تم التوصيل",
      cancelled: "ملغي",
      returned: "مرتجع",
    };
    return statusMap[status?.toLowerCase()] || status;
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <div
        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 w-full max-w-md mx-auto cursor-pointer hover:shadow-xl transition-shadow duration-300 hover:border-[#c19a5b]"
        dir="rtl"
        onClick={handleCardClick}
      >
        {/* Card Header: Order Number and Status */}
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200">
          <div className="flex items-center">
            <Hash className="w-6 h-6 text-[#c19a5b]" />
            <span className="text-xl font-bold text-gray-800 mr-2">
              {order.orderNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusStyles(
                order.status
              )}`}
            >
              {getStatusText(order.status)}
            </span>
            <Eye className="w-4 h-4 text-[#c19a5b]" />
          </div>
        </div>

        {/* Card Body: Order Details */}
        <div className="space-y-4">
          <div className="flex items-center text-gray-700 font-medium">
            <User className="w-5 h-5 text-gray-500 ml-3" />
            <span>{order.senderName}</span>
            <span className="mx-2 text-gray-400">({order.senderPhone})</span>
            <ArrowLeft className="w-5 h-5 text-[#c19a5b] mx-2" />
            <span>{order.receiverName}</span>
            <span className="mx-2 text-gray-400">({order.receiverPhone})</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Package className="w-5 h-5 text-gray-500 ml-3" />
            <span>{order.packageType}</span>
            {order.weight && (
              <>
                <span className="mx-2">•</span>
                <span>الوزن: {order.weight} كجم</span>
              </>
            )}
          </div>
          <div className="flex items-center text-gray-600">
            <span className="font-semibold">العنوان:</span>
            <span className="ml-2">{order.address}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Calendar className="w-5 h-5 text-gray-500 ml-3" />
            <span>{formattedDate}</span>
          </div>
          {order.notes && (
            <div className="flex items-center text-gray-600">
              <span className="font-semibold">ملاحظات:</span>
              <span className="ml-2">{order.notes}</span>
            </div>
          )}
          {order.packageImageUrl && (
            <div className="flex items-center text-gray-600">
              <img
                src={
                  order.packageImageUrl.startsWith("data:")
                    ? order.packageImageUrl
                    : `${import.meta.env.VITE_UPLOAD_URL}${
                        order.packageImageName
                      }`
                }
                alt="صورة الطرد"
                className="w-16 h-16 rounded-lg object-cover border ml-3"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <span>صورة الطرد</span>
            </div>
          )}
          {order.isCollection && (
            <div className="flex items-center text-green-700 font-semibold">
              <DollarSign className="w-5 h-5 text-green-500 ml-3" />
              <span>
                تحصيل عند الاستلام:{" "}
                {parseFloat(order.collectionPrice).toFixed(2)} $
              </span>
            </div>
          )}
          {order.shippingFee && (
            <div className="flex items-center text-blue-700 font-semibold">
              <DollarSign className="w-5 h-5 text-blue-500 ml-3" />
              <span>
                رسوم الشحن: {parseFloat(order.shippingFee).toFixed(2)} $
              </span>
            </div>
          )}
          {/* Delivery Assignment Info */}
          {order.DeliveryUser && (
            <div className="flex items-center text-blue-700 font-semibold">
              <Truck className="w-5 h-5 text-blue-500 ml-3" />
              <span>مندوب التوصيل: {order.DeliveryUser.name}</span>
            </div>
          )}
        </div>

        {/* Card Footer with Creator's Info and Action Buttons */}
        <div className="pt-5 mt-5 border-t border-gray-200">
          <div className="flex items-center justify-between">
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

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Assignment Button for Admin */}
              {isAdmin &&
                !order.DeliveryUser &&
                order.status !== "delivered" &&
                order.status !== "cancelled" &&
                order.status !== "returned" && (
                  <button
                    onClick={handleAssignClick}
                    className="flex items-center gap-2 px-3 py-2 bg-[#c19a5b] hover:bg-[#a88a4a] text-white rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    <UserPlus className="w-4 h-4" />
                    تعيين مندوب
                  </button>
                )}

              {/* Delivery Action Buttons for Delivery Users */}
              {(() => {
                const userStr = localStorage.getItem("user");
                if (userStr) {
                  const user = JSON.parse(userStr);
                  const isDeliveryUser = user.role === "delivery";
                  const isAssignedToUser = order.deliveryUserId === user.id;

                  // Delivery users can update status based on current status
                  if (isDeliveryUser && isAssignedToUser) {
                    if (order.status === "submitted") {
                      // Can confirm pickup
                      return (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateDeliveryStatus(order.id, "submitted", "");
                          }}
                          disabled={isUpdatingStatus}
                          className="flex items-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                        >
                          <CheckCircle className="w-4 h-4" />
                          تأكيد الاستلام
                        </button>
                      );
                    } else if (order.status === "confirmed") {
                      // Can mark as delivered or returned
                      return (
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeliverySuccess();
                            }}
                            disabled={isUpdatingStatus}
                            className="flex items-center gap-1 px-3 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                          >
                            <CheckCircle className="w-4 h-4" />
                            تم التوصيل
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeliveryFailed();
                            }}
                            disabled={isUpdatingStatus}
                            className="flex items-center gap-1 px-3 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                          >
                            <XCircle className="w-4 h-4" />
                            لم يتم التوصيل
                          </button>
                        </div>
                      );
                    }
                  }
                }
                return null;
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full" dir="rtl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              تعيين مندوب التوصيل
            </h3>
            <p className="text-gray-600 mb-4">
              اختر مندوب التوصيل المطلوب تعيينه للطلب {order.orderNumber}
            </p>

            <select
              value={selectedDeliveryUser}
              onChange={(e) => setSelectedDeliveryUser(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-[#c19a5b]"
            >
              <option value="">اختر مندوب التوصيل</option>
              {console.log("Delivery users in modal:", deliveryUsers)}
              {deliveryUsers?.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} - {user.phone}
                </option>
              ))}
            </select>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رسوم الشحن<span className="text-red-500 mr-1">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  value={shippingFee}
                  onChange={(e) => setShippingFee(e.target.value)}
                  className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c19a5b] focus:border-[#c19a5b] transition-all"
                  placeholder="أدخل رسوم الشحن"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAssignDelivery}
                disabled={
                  isAssigning ||
                  !selectedDeliveryUser ||
                  !shippingFee ||
                  isNaN(parseFloat(shippingFee)) ||
                  parseFloat(shippingFee) < 0
                }
                className="flex-1 bg-[#c19a5b] hover:bg-[#a88a4a] disabled:bg-gray-300 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
              >
                {isAssigning ? "جاري التعيين..." : "تعيين"}
              </button>
              <button
                onClick={() => setShowAssignmentModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors duration-200"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Notes Modal */}
      {showDeliveryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full" dir="rtl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              سبب عدم التوصيل
            </h3>
            <p className="text-gray-600 mb-4">
              يرجى إدخال سبب عدم تمكنك من توصيل الطلب {order.orderNumber}
            </p>

            <textarea
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="مثال: العنوان غير صحيح، المستلم غير متواجد، رفض استلام الطلب..."
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-[#c19a5b] resize-none"
              rows="4"
              dir="rtl"
            />

            <div className="flex gap-3">
              <button
                onClick={handleSubmitFailedDelivery}
                disabled={isUpdatingStatus || !deliveryNotes.trim()}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
              >
                {isUpdatingStatus ? "جاري التحديث..." : "تأكيد عدم التوصيل"}
              </button>
              <button
                onClick={() => {
                  setShowDeliveryModal(false);
                  setDeliveryNotes("");
                }}
                disabled={isUpdatingStatus}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors duration-200"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderCard;
