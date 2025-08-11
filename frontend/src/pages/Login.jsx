import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, Package, Globe, Phone } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import * as jwtDecode from "jwt-decode";

// --- 3D Globe Component (same as signup) ---
const Globe3D = () => (
  <div className="relative flex items-center justify-center">
    <div className="relative transform -rotate-12 hover:-rotate-6 transition-transform duration-500">
      <div className="absolute top-4 right-4 w-32 h-32 bg-green-800 opacity-30 rounded-full transform rotate-6"></div>
      <div className="relative w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-2xl overflow-hidden">
        <div className="absolute top-4 left-4 w-8 h-6 bg-green-700 rounded-lg opacity-80"></div>
        <div className="absolute top-8 right-6 w-6 h-8 bg-green-700 rounded-lg opacity-80"></div>
        <div className="absolute bottom-6 left-8 w-10 h-4 bg-green-700 rounded-lg opacity-80"></div>
        <div className="absolute bottom-4 right-4 w-6 h-6 bg-green-700 rounded-lg opacity-80"></div>
        <div className="absolute inset-0 border-2 border-green-300 rounded-full opacity-30"></div>
        <div className="absolute top-0 left-1/2 w-0.5 h-full bg-green-300 opacity-30 transform -translate-x-1/2"></div>
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-green-300 opacity-30 transform -translate-y-1/2"></div>
        <div className="absolute top-6 left-2 w-16 h-0.5 bg-yellow-400 opacity-60 rounded-full"></div>
        <div className="absolute bottom-8 right-2 w-12 h-0.5 bg-yellow-400 opacity-60 rounded-full transform rotate-45"></div>
        <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full shadow-sm flex items-center justify-center">
          <Globe className="w-3 h-3 text-green-600" />
        </div>
      </div>
    </div>
  </div>
);

// --- Login Form Component ---
const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null); // logged-in user
  const navigate = useNavigate();

  // On mount, hydrate from localStorage if present
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(
        import.meta.env.VITE_LOGIN,
        {
          emailOrPhone: formData.emailOrPhone,
          password: formData.password,
        },
        {
          withCredentials: true, // if your backend uses cookies; JWT could be in body
        }
      );

      // Expecting: { user: {...}, token: "...", message: "...", ... }
      if (response.status === 200) {
        const { user: returnedUser, token } = response.data;

        // Minimal client-side object
        const clientUser = {
          id: returnedUser.id,
          name: returnedUser.name,
          email: returnedUser.email,
          role: returnedUser.role, // Add role to stored user data
          profile_image_base64: returnedUser.profile_image_base64,
          token,
        };

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(clientUser));
        window.dispatchEvent(new Event("authChanged"));

        setUser(clientUser);
        alert("تم تسجيل الدخول بنجاح!");
        navigate("/"); // or wherever
      } else {
        setError(response.data.message || "بيانات الدخول غير صحيحة");
      }
    } catch (err) {
      setError(err.response?.data?.message || "حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  // Build avatar src
  const avatarSrc = user?.profile_image_base64
    ? `data:image/jpeg;base64,${user.profile_image_base64}`
    : null;

  return (
    <div
      className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
      dir="rtl"
    >
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Package className="w-8 h-8 text-[#8b6914] ml-2" />
          <h1 className="text-2xl font-bold text-[#8b6914]">دراجون</h1>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          {user ? "مرحباً، " + (user.name || "المستخدم") : "تسجيل الدخول"}
        </h2>
        <p className="text-gray-600">
          {user
            ? "أنت مسجل الدخول. يمكنك الخروج أو الانتقال إلى لوحة التحكم."
            : "أدخل بياناتك للوصول إلى حسابك"}
        </p>
      </div>

      {user ? (
        // Avatar + actions when logged in
        <div className="flex flex-col items-center space-y-4">
          <div>
            <img
              src={
                avatarSrc ||
                "/default-avatar.png" /* fallback image in public folder */
              }
              alt="avatar"
              className="w-24 h-24 rounded-full border-4 border-[#8b6914] object-cover"
            />
          </div>
          <div className="text-center">
            <div className="font-semibold">{user.name}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/profile")}
              className="px-4 py-2 bg-[#8b6914] text-white rounded-lg hover:bg-[#6b5010] transition"
            >
              حسابي
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-[#8b6914] text-[#8b6914] rounded-lg hover:bg-[#f5e9d0] transition"
            >
              تسجيل خروج
            </button>
          </div>
        </div>
      ) : (
        // Login form when not authenticated
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email/Phone Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              البريد الإلكتروني أو التليفون
              <span className="text-red-500 mr-1">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="emailOrPhone"
                value={formData.emailOrPhone}
                onChange={handleInputChange}
                className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8b6914] focus:border-[#8b6914] transition-all"
                placeholder="البريد أو التليفون"
                dir="rtl"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              كلمة المرور
              <span className="text-red-500 mr-1">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pr-12 pl-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8b6914] focus:border-[#8b6914] transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Remember + Forgot */}
          <div className="flex justify-between items-center">
            <a
              href="#"
              className="text-sm text-[#8b6914] hover:text-[#6b5010] transition-colors"
            >
              نسيت كلمة المرور؟
            </a>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-center">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-[#8b6914] hover:bg-[#6b5010] disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
                جاري تسجيل الدخول...
              </>
            ) : (
              "تسجيل الدخول"
            )}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">أو</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center pt-4">
            <p className="text-gray-600">
              ليس لديك حساب؟{" "}
              <a
                href="/signup"
                className="text-[#8b6914] hover:text-[#6b5010] font-semibold transition-colors"
              >
                انشاء حساب جديد
              </a>
            </p>
          </div>
        </form>
      )}
    </div>
  );
};

// --- Main Login Page (matching signup layout) ---
const Login = () => (
  <div
    className="min-h-screen bg-gradient-to-br from-[#edc494] via-[#d4a574] to-[#c19a5b] pt-20"
    dir="rtl"
  >
    <main className="px-6 py-8 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row-reverse items-center justify-between space-y-8 lg:space-y-0">
        <div className="flex-1 flex justify-center">
          <LoginForm />
        </div>
        <div className="flex-1 flex flex-col items-center space-y-6 text-white text-center">
          <Globe3D />
          <h2 className="text-3xl font-bold">مرحباً بعودتك!</h2>
          <p className="text-lg opacity-90">
            سجل دخولك للوصول إلى خدمات الشحن السريع والآمن إلى جميع أنحاء العالم
          </p>
          <div className="space-y-3">
            {[
              { icon: <Globe />, text: "شحن لأكثر من 300 دولة" },
              { icon: <Package />, text: "تتبع مباشر للطرود" },
              { icon: <Phone />, text: "دعم عملاء 24/7" },
            ].map(({ icon, text }, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-3 space-x-reverse"
              >
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  {icon}
                </div>
                <span className="text-sm m-2.5">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  </div>
);

export default Login;
