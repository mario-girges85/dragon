import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Package,
  Edit,
} from "lucide-react";
import OrderCard from "../components/OrderCard";
import { useNavigate } from "react-router-dom";

const MyProfile = () => {
  const navigate = useNavigate();

  // State to hold the user data
  const [user, setUser] = useState(null);

  // State to manage the loading status while fetching data
  const [loading, setLoading] = useState(true);

  // State to hold any potential errors during the API call
  const [error, setError] = useState(null);

  // State for user's orders
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(null);

  // Get current user from localStorage
  const getCurrentUser = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  // Fetch user's orders
  const fetchUserOrders = async (userId) => {
    if (!userId) {
      setOrdersError("User ID is required");
      setOrdersLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_ORDERS_BY_USERID}${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setOrders(response.data.orders);
      } else {
        setOrdersError(response.data.message || "Failed to load user orders.");
      }
    } catch (err) {
      console.error("Error fetching user orders:", err);
      setOrdersError(
        err.response?.data?.message ||
          "An error occurred while fetching user orders."
      );
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      const currentUser = getCurrentUser();

      if (!currentUser || !currentUser.id) {
        setError("User not found. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("يرجى تسجيل الدخول للوصول إلى هذه الصفحة");
          setLoading(false);
          return;
        }

        // Fetch user data from the API endpoint
        const response = await axios.get(import.meta.env.VITE_PROFILE, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setUser(response.data.user);
          // Fetch orders after user data is loaded
          fetchUserOrders(currentUser.id);
        } else {
          setError(response.data.message || "Failed to load user profile.");
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        if (err.response?.status === 403) {
          setError("لا يمكنك الوصول إلى ملف شخصي آخر");
        } else if (err.response?.status === 401) {
          setError("يرجى تسجيل الدخول مرة أخرى");
        } else {
          setError(
            err.response?.data?.message ||
              "An error occurred while fetching the user profile."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []); // Only run once on mount

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#edc494] via-[#d4a574] to-[#c19a5b]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#8b6914] mb-4"></div>
        <div className="text-[#8b6914] text-lg font-bold">
          جارٍ تحميل الملف الشخصي...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#edc494] via-[#d4a574] to-[#c19a5b] pt-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 text-lg font-semibold mb-2">خطأ</div>
            <div className="text-red-500">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#edc494] via-[#d4a574] to-[#c19a5b] pt-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <div className="text-yellow-600 text-lg font-semibold mb-2">
              لا يوجد بيانات
            </div>
            <div className="text-yellow-500">
              لم يتم العثور على بيانات المستخدم
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#edc494] via-[#d4a574] to-[#c19a5b] pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">الملف الشخصي</h1>
          <p className="text-lg text-white">معلومات الحساب والطلبات</p>
        </div>

        {/* User Profile Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => navigate("/editprofile")}
              className="flex items-center gap-2 bg-[#8b6914] hover:bg-[#6b5010] text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
              تعديل الملف الشخصي
            </button>
          </div>
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <img
                src={
                  user.profileImageBase64 || user.profile_image_base64
                    ? (
                        user.profileImageBase64 || user.profile_image_base64
                      ).startsWith("data:")
                      ? user.profileImageBase64 || user.profile_image_base64
                      : (
                          user.profileImageBase64 || user.profile_image_base64
                        ).startsWith("http")
                      ? user.profileImageBase64 || user.profile_image_base64
                      : `data:image/jpeg;base64,${
                          user.profileImageBase64 || user.profile_image_base64
                        }`
                    : "/avatar.png"
                }
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-[#f5d5a8] shadow-lg"
                onError={(e) => {
                  e.target.src = "/avatar.png";
                }}
              />
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-right">
              <h2 className="text-3xl font-bold text-[#8b6914] mb-4">
                {user.name}
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-center md:justify-start space-x-3 space-x-reverse">
                  <Mail className="w-5 h-5 text-[#a67c00]" />
                  <span className="text-[#a67c00] ml-2 font-medium">
                    {user.email}
                  </span>
                </div>

                <div className="flex items-center justify-center md:justify-start space-x-3 space-x-reverse">
                  <Phone className="w-5 h-5 text-[#a67c00]" />
                  <span className="text-[#a67c00] ml-2 font-medium">
                    {user.phone}
                  </span>
                </div>

                <div className="flex items-center justify-center md:justify-start space-x-3 space-x-reverse">
                  <MapPin className="w-5 h-5 text-[#a67c00]" />
                  <span className="text-[#a67c00] ml-2 font-medium">
                    {user.address}
                  </span>
                </div>

                <div className="flex items-center justify-center md:justify-start space-x-3 space-x-reverse">
                  <User className="w-5 h-5 text-[#a67c00]" />
                  <span className="text-[#a67c00] ml-2 font-medium">
                    {user.role === "admin"
                      ? "مدير"
                      : user.role === "delivery"
                      ? "مندوب توصيل"
                      : "مستخدم"}
                  </span>
                </div>

                <div className="flex items-center justify-center md:justify-start space-x-3 space-x-reverse">
                  <Calendar className="w-5 h-5 text-[#a67c00]" />
                  <span className="text-[#a67c00] ml-2 font-medium">
                    انضم في {formatDate(user.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center mb-6">
            <Package className="w-6 h-6 text-[#8b6914] ml-2" />
            <h3 className="text-2xl font-bold text-[#8b6914]">طلباتي</h3>
          </div>

          {ordersLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8b6914] mb-4"></div>
              <div className="text-[#8b6914] font-medium">
                جارٍ تحميل الطلبات...
              </div>
            </div>
          ) : ordersError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <div className="text-red-600 font-semibold mb-2">
                خطأ في تحميل الطلبات
              </div>
              <div className="text-red-500">{ordersError}</div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-500 text-lg font-medium mb-2">
                لا توجد أي طلبات
              </div>
              <div className="text-gray-400">
                لم تقم بإنشاء أي طلبات حتى الآن
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  isAdmin={false}
                  deliveryUsers={[]}
                  onAssignDelivery={() => {}}
                  onDeliveryStatusUpdate={() => {}}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
