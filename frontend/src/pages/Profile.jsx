import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { User, Mail, Phone, MapPin, Calendar, Package } from "lucide-react";
import OrderCard from "../components/OrderCard";

const Profile = () => {
  const { id } = useParams(); // Extract user ID from URL params
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

  // Fetch user's orders
  const fetchUserOrders = async () => {
    if (!id) {
      setOrdersError("User ID is required");
      setOrdersLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_ORDERS_BY_USERID}${id}`,
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
      if (!id) {
        setError("User ID is required");
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
        const response = await axios.get(
          `${import.meta.env.VITE_PROFILE}/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          setUser(response.data.user);
          // Fetch orders after user data is loaded
          fetchUserOrders();
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
  }, [id]); // Re-run when id changes

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // --- Conditional Rendering ---

  // 1. Show a loading state while the API call is in progress
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#edc494] via-[#d4a574] to-[#c19a5b] flex items-center justify-center text-white font-bold text-2xl">
        جاري تحميل الملف الشخصي...
      </div>
    );
  }

  // 2. Show an error message if the API call failed
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#edc494] via-[#d4a574] to-[#c19a5b] flex items-center justify-center">
        <div className="bg-red-800 p-8 rounded-2xl text-white font-bold text-2xl text-center">
          خطأ: {error}
        </div>
      </div>
    );
  }

  // 3. Render the user profile if the fetch was successful
  return (
    <div
      className="  min-h-screen bg-gradient-to-br from-[#edc494] via-[#d4a574] to-[#c19a5b] p-4 sm:p-6 lg:p-20"
      dir="rtl"
    >
      <div className="container mx-auto max-w-2xl lg:max-w-4xl xl:max-w-6xl">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
          {/* Profile Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
              الملف الشخصي
            </h1>

            {/* Profile Image */}
            <div className="mb-4 sm:mb-6">
              {user?.profile_image_base64 ? (
                <img
                  src={
                    user.profile_image_base64.startsWith("data:")
                      ? user.profile_image_base64
                      : user.profile_image_base64.startsWith("http")
                      ? user.profile_image_base64
                      : `data:image/jpeg;base64,${user.profile_image_base64}`
                  }
                  alt={user.name}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover mx-auto border-4 border-[#c19a5b] shadow-lg"
                  onError={(e) => {
                    e.target.src = "/avatar.png";
                  }}
                />
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-200 flex items-center justify-center mx-auto border-4 border-[#c19a5b] shadow-lg">
                  <User className="w-12 h-12 sm:w-16 sm:h-16 text-gray-500" />
                </div>
              )}
            </div>
          </div>

          {/* User Information */}
          <div className="space-y-4 sm:space-y-6">
            {/* Name */}
            <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-xl">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-[#c19a5b] ml-3 sm:ml-4" />
              <div>
                <p className="text-xs sm:text-sm text-gray-500">الاسم</p>
                <p className="font-semibold text-sm sm:text-base text-gray-800">
                  {user?.name}
                </p>
              </div>
            </div>

            {/* Email */}
            {user?.email && (
              <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-xl">
                <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-[#c19a5b] ml-3 sm:ml-4" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">
                    البريد الإلكتروني
                  </p>
                  <p className="font-semibold text-sm sm:text-base text-gray-800">
                    {user.email}
                  </p>
                </div>
              </div>
            )}

            {/* Phone */}
            <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-xl">
              <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-[#c19a5b] ml-3 sm:ml-4" />
              <div>
                <p className="text-xs sm:text-sm text-gray-500">رقم الهاتف</p>
                <p className="font-semibold text-sm sm:text-base text-gray-800">
                  {user?.phone}
                </p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-xl">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-[#c19a5b] ml-3 sm:ml-4" />
              <div>
                <p className="text-xs sm:text-sm text-gray-500">العنوان</p>
                <p className="font-semibold text-sm sm:text-base text-gray-800">
                  {user?.address}
                </p>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-xl">
              <div className="w-5 h-5 sm:w-6 sm:h-6 ml-3 sm:ml-4 flex items-center justify-center">
                <span className="text-[#c19a5b] font-bold text-sm sm:text-base">
                  👤
                </span>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-500">نوع الحساب</p>
                <p className="font-semibold text-sm sm:text-base text-gray-800">
                  {user?.role === "admin" && "مدير"}
                  {user?.role === "delivery" && "مندوب توصيل"}
                  {user?.role === "user" && "مستخدم"}
                </p>
              </div>
            </div>

            {/* Join Date */}
            <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-xl">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-[#c19a5b] ml-3 sm:ml-4" />
              <div>
                <p className="text-xs sm:text-sm text-gray-500">
                  تاريخ الانضمام
                </p>
                <p className="font-semibold text-sm sm:text-base text-gray-800">
                  {user?.createdAt ? formatDate(user.createdAt) : "غير متوفر"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="mt-4 sm:mt-6 lg:mt-8">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Package className="w-6 h-6 sm:w-8 sm:h-8 text-[#c19a5b]" />
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">
                الطلبات التي تم إنشاؤها
              </h2>
            </div>

            {/* Orders Loading State */}
            {ordersLoading && (
              <div className="text-center py-6 sm:py-8">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-4 border-[#c19a5b] mx-auto mb-3 sm:mb-4"></div>
                <p className="text-sm sm:text-base text-gray-600">
                  جاري تحميل الطلبات...
                </p>
              </div>
            )}

            {/* Orders Error State */}
            {ordersError && !ordersLoading && (
              <div className="text-center py-6 sm:py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded-lg mx-2 sm:mx-0">
                  <p className="font-semibold text-sm sm:text-base">
                    خطأ في تحميل الطلبات
                  </p>
                  <p className="text-xs sm:text-sm mt-1">{ordersError}</p>
                </div>
              </div>
            )}

            {/* Orders List */}
            {!ordersLoading && !ordersError && (
              <>
                {orders.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                    {orders.map((order) => (
                      <OrderCard key={order.id} order={order} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-1 sm:mb-2">
                      لا توجد طلبات
                    </h3>
                    <p className="text-sm sm:text-base text-gray-500 px-2">
                      لم يتم إنشاء أي طلبات حتى الآن.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
