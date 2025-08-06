import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Package,
  User,
  Calendar,
  DollarSign,
  Hash,
  ArrowLeft,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  Eye,
  Edit,
  MessageCircle,
  Download,
  TestTube,
} from "lucide-react";
import { generateOrderPDFWithFallback } from "../util/pdfGenerator";

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Fetching order details for ID:", orderId);
        console.log("API Base URL:", import.meta.env.VITE_API_BASE);
        console.log("Token:", token ? "Present" : "Missing");

        if (!token) {
          setError("يرجى تسجيل الدخول للوصول إلى هذه الصفحة");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE}/orders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Response:", response.data);
        if (response.data.success) {
          setOrder(response.data.order);
        } else {
          setError(
            `فشل في تحميل تفاصيل الطلب: ${
              response.data.message || "خطأ غير معروف"
            }`
          );
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
        console.error("Error response:", error.response?.data);
        console.error("Error status:", error.response?.status);

        if (error.response?.status === 401) {
          setError("يرجى تسجيل الدخول للوصول إلى هذه الصفحة");
        } else if (error.response?.status === 403) {
          setError("ليس لديك صلاحية للوصول إلى هذا الطلب");
        } else if (error.response?.status === 404) {
          setError("الطلب غير موجود");
        } else {
          setError("حدث خطأ أثناء تحميل تفاصيل الطلب");
        }
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in_transit":
      case "picked_up":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
      case "returned":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "في الانتظار";
      case "in_transit":
        return "قيد النقل";
      case "picked_up":
        return "تم الاستلام";
      case "delivered":
        return "تم التوصيل";
      case "cancelled":
        return "ملغي";
      case "returned":
        return "مرتجع";
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openWhatsApp = (phoneNumber) => {
    // Remove any non-digit characters and ensure it starts with country code
    const cleanNumber = phoneNumber.replace(/\D/g, "");
    const whatsappNumber = cleanNumber.startsWith("20")
      ? cleanNumber
      : `20${cleanNumber}`;
    const message = `مرحباً، أريد التواصل بخصوص الطلب ${order?.orderNumber}`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#c19a5b] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto"></div>
          <p className="mt-6 text-white text-lg font-medium">
            جاري تحميل تفاصيل الطلب...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#c19a5b] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">خطأ</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate("/orders")}
              className="bg-[#c19a5b] text-white px-6 py-3 rounded-lg hover:bg-[#a87c4a] transition-colors font-medium"
            >
              العودة إلى الطلبات
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#c19a5b] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              لم يتم العثور على الطلب
            </h3>
            <p className="text-gray-600 mb-6">
              الطلب المطلوب غير موجود أو تم حذفه
            </p>
            <button
              onClick={() => navigate("/orders")}
              className="bg-[#c19a5b] text-white px-6 py-3 rounded-lg hover:bg-[#a87c4a] transition-colors font-medium"
            >
              العودة إلى الطلبات
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#c19a5b] pt-20" dir="rtl">
      {/* Header */}
      <div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => navigate("/orders")}
              className="flex items-center text-[#c19a5b] hover:text-[#a87c4a] transition-colors font-medium"
            >
              <ArrowRight className="w-5 h-5 ml-2" />
              العودة إلى الطلبات
            </button>
            <div className="flex-1 flex justify-center">
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 w-full ml-auto">
                <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-white text-right w-full sm:w-auto">
                  تفاصيل الطلب
                </h1>
                <button
                  onClick={() => generateOrderPDFWithFallback(order)}
                  className="flex items-center justify-center bg-white text-[#c19a5b] px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium shadow-md w-full sm:w-auto max-w-full sm:max-w-xs"
                >
                  <Download className="w-5 h-5 ml-2" />
                  تحميل PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Order Header Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[#c19a5b] rounded-lg flex items-center justify-center mr-4">
                <Hash className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl pr-2.5 font-bold text-gray-800">
                  {order.orderNumber}
                </h2>
                <p className=" pr-2.5 text-gray-600">رقم الطلب</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <span
                className={`px-4 py-2 text-sm font-semibold rounded-full border ${getStatusStyles(
                  order.status
                )}`}
              >
                {getStatusText(order.status)}
              </span>
              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 ml-2" />
                <span className="text-sm">{formatDate(order.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sender and Receiver Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                <User className="w-5 h-5 text-[#c19a5b] ml-2" />
                تفاصيل المرسل والمستلم
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sender */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <h4 className="font-semibold pr-2 text-gray-800">المرسل</h4>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-700 font-medium">
                      {order.senderName}
                    </p>
                    {order.senderPhone && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-600">
                          <Phone className="w-4 h-4 ml-2" />
                          <span className="text-sm">{order.senderPhone}</span>
                        </div>
                        <button
                          onClick={() => openWhatsApp(order.senderPhone)}
                          className="flex items-center bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4 ml-1" />
                          واتساب
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Receiver */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <User className="w-4 h-4 text-green-600" />
                    </div>
                    <h4 className="font-semibold pr-2 text-gray-800">
                      المستلم
                    </h4>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-700 font-medium">
                      {order.receiverName}
                    </p>
                    {order.receiverPhone && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-600">
                          <Phone className="w-4 h-4 ml-2" />
                          <span className="text-sm">{order.receiverPhone}</span>
                        </div>
                        <button
                          onClick={() => openWhatsApp(order.receiverPhone)}
                          className="flex items-center bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4 ml-1" />
                          واتساب
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Package Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                <Package className="w-5 h-5 text-[#c19a5b] ml-2" />
                تفاصيل الشحنة
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">نوع الشحنة</span>
                    <span className="font-semibold text-gray-800">
                      {order.packageType}
                    </span>
                  </div>
                  {order.weight && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">الوزن</span>
                      <span className="font-semibold text-gray-800">
                        {order.weight} كجم
                      </span>
                    </div>
                  )}
                  {order.address && (
                    <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">العنوان</span>
                      <span className="font-semibold text-gray-800 text-right max-w-xs">
                        {order.address}
                      </span>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {order.notes && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 block mb-2">ملاحظات</span>
                      <span className="text-gray-800">{order.notes}</span>
                    </div>
                  )}
                  {order.packageDescription && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 block mb-2">
                        وصف الشحنة
                      </span>
                      <span className="text-gray-800">
                        {order.packageDescription}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Collection Details */}
            {order.isCollection && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                  <DollarSign className="w-5 h-5 text-green-600 ml-2" />
                  تفاصيل التحصيل
                </h3>
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-green-800 font-medium">
                      مبلغ التحصيل
                    </span>
                    <span className="text-2xl font-bold text-green-700">
                      {parseFloat(order.collectionPrice).toFixed(2)} $
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Creator Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <User className="w-5 h-5 text-[#c19a5b] ml-2" />
                منشئ الطلب
              </h3>
              <div className="flex items-center">
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
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    onError={(e) => {
                      e.target.src = "/avatar.png";
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                    <User className="w-8 h-8 text-gray-500" />
                  </div>
                )}
                <div className="mr-4 flex-1">
                  <p className="font-semibold text-gray-800 text-lg">
                    {order.User?.name || "مستخدم غير معروف"}
                  </p>
                  {order.User?.email && (
                    <div className="flex items-center mt-1 text-gray-600">
                      <Mail className="w-4 h-4 ml-1" />
                      <span className="text-sm">{order.User.email}</span>
                    </div>
                  )}
                  {order.User?.phone && (
                    <div className="flex items-center mt-1 text-gray-600">
                      <Phone className="w-4 h-4 ml-1" />
                      <span className="text-sm">{order.User.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Image */}
            {order.packageImage && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <Package className="w-5 h-5 text-[#c19a5b] ml-2" />
                  صورة الشحنة
                </h3>
                <div className="relative">
                  <img
                    src={
                      order.packageImage.startsWith("data:")
                        ? order.packageImage
                        : order.packageImage.startsWith("http")
                        ? order.packageImage
                        : `data:image/jpeg;base64,${order.packageImage}`
                    }
                    alt="صورة الشحنة"
                    className="w-full h-48 object-cover rounded-xl border border-gray-200"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  <div
                    className="hidden w-full h-48 bg-gray-200 rounded-xl items-center justify-center border border-gray-300"
                    style={{ display: "none" }}
                  >
                    <Package className="w-12 h-12 text-gray-400" />
                  </div>
                </div>
              </div>
            )}

            {/* Order Timeline */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Clock className="w-5 h-5 text-[#c19a5b] ml-2" />
                تاريخ الطلب
              </h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <div className="w-3 h-3 bg-[#c19a5b] rounded-full ml-3"></div>
                  <span className="text-sm">{formatDate(order.createdAt)}</span>
                </div>
                <div className="text-xs text-gray-500 mr-6">تم إنشاء الطلب</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
