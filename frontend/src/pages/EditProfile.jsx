import React, { useState, useEffect } from "react";
import axios from "axios";
import { User, Mail, Phone, MapPin, Camera, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const navigate = useNavigate();

  // State to hold the user data
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // Profile image state
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

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

  useEffect(() => {
    const fetchUserProfile = async () => {
      const currentUser = getCurrentUser();
      const token = localStorage.getItem("token");

      if (!currentUser || !currentUser.id || !token) {
        setError("يرجى تسجيل الدخول للوصول إلى هذه الصفحة.");
        setLoading(false);
        return;
      }

      try {
        // Fetch user data from the API endpoint
        const response = await axios.get(
          `${import.meta.env.VITE_PROFILE}/${currentUser.id}`
        );

        if (response.data.success) {
          const userData = response.data.user;
          setUser(userData);
          setFormData({
            name: userData.name || "",
            email: userData.email || "",
            phone: userData.phone || "",
            address: userData.address || "",
          });
          setPreviewImage(
            userData.profile_image_base64
              ? userData.profile_image_base64.startsWith("data:")
                ? userData.profile_image_base64
                : userData.profile_image_base64.startsWith("http")
                ? userData.profile_image_base64
                : `data:image/jpeg;base64,${userData.profile_image_base64}`
              : null
          );
        } else {
          setError(response.data.message || "Failed to load user profile.");
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError(
          err.response?.data?.message ||
            "An error occurred while fetching the user profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const currentUser = getCurrentUser();
      const token = localStorage.getItem("token");

      if (!currentUser || !token) {
        setError("Authentication required. Please log in again.");
        setUpdating(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("address", formData.address);

      if (profileImage) {
        formDataToSend.append("profileImage", profileImage);
      }

      const response = await axios.put(
        `${import.meta.env.VITE_PROFILE}/${currentUser.id}/editprofile`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        // Update localStorage with new user data
        localStorage.setItem("user", JSON.stringify(response.data.user));
        alert("تم تحديث الملف الشخصي بنجاح");
        navigate("/");
      } else {
        setError(response.data.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      if (err.response?.status === 403) {
        setError(
          "لا يمكنك تعديل ملف شخصي آخر. يرجى تسجيل الدخول بحسابك الصحيح."
        );
      } else if (err.response?.status === 401) {
        setError("يرجى تسجيل الدخول مرة أخرى للوصول إلى هذه الصفحة.");
      } else {
        setError(
          err.response?.data?.message ||
            "An error occurred while updating the profile."
        );
      }
    } finally {
      setUpdating(false);
    }
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
            <div className="mt-4 space-x-4">
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                تسجيل الدخول
              </button>
              <button
                onClick={() => navigate("/myprofile")}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                العودة للملف الشخصي
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#edc494] via-[#d4a574] to-[#c19a5b] pt-20 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/myprofile")}
            className="flex items-center text-white hover:text-[#f5d5a8] mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 ml-2" />
            العودة للملف الشخصي
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">
            تعديل الملف الشخصي
          </h1>
          <p className="text-lg text-white">تحديث معلومات الحساب</p>
        </div>

        {/* Edit Profile Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Image Section */}
            <div className="text-center">
              <div className="relative inline-block">
                <img
                  src={previewImage || "/avatar.png"}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-[#f5d5a8] shadow-lg"
                  onError={(e) => {
                    e.target.src = "/avatar.png";
                  }}
                />
                <label className="absolute bottom-0 right-0 bg-[#8b6914] text-white p-2 rounded-full cursor-pointer hover:bg-[#6b5010] transition-colors">
                  <Camera className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-gray-600 text-sm mt-2">
                انقر على الكاميرا لتغيير الصورة
              </p>
            </div>

            {/* Name Field */}
            <div>
              <label className="block text-[#8b6914] font-semibold mb-2 text-right">
                الاسم
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#a67c00] w-5 h-5" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full pr-12 pl-10 py-3 border-2 border-[#f5d5a8] rounded-xl focus:ring-2 focus:ring-[#8b6914] focus:border-[#8b6914] text-[#8b6914] font-semibold"
                  placeholder="أدخل اسمك"
                  dir="rtl"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-[#8b6914] font-semibold mb-2 text-right">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#a67c00] w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pr-12 pl-10 py-3 border-2 border-[#f5d5a8] rounded-xl focus:ring-2 focus:ring-[#8b6914] focus:border-[#8b6914] text-[#8b6914] font-semibold"
                  placeholder="أدخل بريدك الإلكتروني"
                  dir="rtl"
                />
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-[#8b6914] font-semibold mb-2 text-right">
                رقم الهاتف
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#a67c00] w-5 h-5" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full pr-12 pl-10 py-3 border-2 border-[#f5d5a8] rounded-xl focus:ring-2 focus:ring-[#8b6914] focus:border-[#8b6914] text-[#8b6914] font-semibold"
                  placeholder="أدخل رقم هاتفك"
                  dir="rtl"
                />
              </div>
            </div>

            {/* Address Field */}
            <div>
              <label className="block text-[#8b6914] font-semibold mb-2 text-right">
                العنوان
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#a67c00] w-5 h-5" />
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  className="w-full pr-12 pl-10 py-3 border-2 border-[#f5d5a8] rounded-xl focus:ring-2 focus:ring-[#8b6914] focus:border-[#8b6914] text-[#8b6914] font-semibold resize-none"
                  placeholder="أدخل عنوانك"
                  dir="rtl"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={updating}
                className="w-full bg-[#8b6914] hover:bg-[#6b5010] text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? "جاري التحديث..." : "تحديث الملف الشخصي"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
