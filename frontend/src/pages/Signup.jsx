import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Globe,
  Package,
  MapPin,
  Upload,
  Camera,
  X,
} from "lucide-react";
import axios from "axios";

// --- 3D Globe Component ---
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

// --- Signup Form Component ---
const SignupForm = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/heic"];
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        image: "يرجى اختيار صورة بصيغة JPG أو JPEG أو PNG أو HEIC فقط",
      }));
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        image: "حجم الصورة يجب أن يكون أقل من 4MB",
      }));
      return;
    }

    setProfileImage(file);
    setErrors((prev) => ({ ...prev, image: "" }));

    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setProfileImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setErrors((prev) => ({ ...prev, image: "" }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "الاسم مطلوب";
    }

    if (
      formData.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = "يرجى إدخال بريد إلكتروني صحيح";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "رقم الهاتف مطلوب";
    } else if (!/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = "يرجى إدخال رقم هاتف صحيح";
    }

    if (!formData.password) {
      newErrors.password = "كلمة المرور مطلوبة";
    } else if (formData.password.length < 6) {
      newErrors.password = "يجب أن تكون 6 أحرف على الأقل";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "تأكيد كلمة المرور مطلوب";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "كلمات المرور غير متطابقة";
    }

    if (!formData.address.trim()) {
      newErrors.address = "العنوان مطلوب";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("address", formData.address);

      // Add profile image if selected
      if (profileImage) {
        formDataToSend.append("profileImage", profileImage);
      }
      // console.log("the data ", formDataToSend);

      const response = await axios.post(
        import.meta.env.VITE_NEWUSER,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response?.data?.success) {
        alert("تم إنشاء الحساب بنجاح! برجاء تسجيل الدخول");
        navigate("/login");
      } else {
        setErrors({ general: response?.data?.message });
      }
    } catch (error) {
      console.error("Signup error:", error);

      if (error.response && error.response.data) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({ general: "حدث خطأ ما. حاول مجددًا." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
      dir="rtl"
    >
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Package className="w-8 h-8 text-[#8b6914] ml-2" />
          <h1 className="text-2xl font-bold text-[#8b6914]">شحن الآن</h1>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          انشاء حساب جديد
        </h2>
        <p className="text-gray-600">أدخل بياناتك لإنشاء حسابك</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
        encType="multipart/form-data"
      >
        {/* Image Upload */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="معاينة الصورة الشخصية"
                  className="w-24 h-24 rounded-full object-cover border-4 border-[#8b6914] border-opacity-30 shadow-lg"
                />
                <button
                  onClick={removeImage}
                  type="button"
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors shadow-lg"
                  title="إزالة الصورة"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-[#8b6914] transition-colors">
                <Camera className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.heic"
            onChange={handleImageChange}
            className="hidden"
            name="profileImage"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-3 flex items-center space-x-2 space-x-reverse text-[#8b6914] hover:text-[#6b5010] font-medium transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>{profileImage ? "تغيير الصورة" : "رفع صورة شخصية"}</span>
          </button>

          {errors.image && (
            <p className="text-red-500 text-sm mt-1 text-center">
              {errors.image}
            </p>
          )}

          <p className="text-gray-500 text-xs mt-1 text-center">
            الحد الأقصى: 4MB • JPG, JPEG, PNG, HEIC
          </p>
        </div>

        {/* Form Fields */}
        {[
          {
            name: "name",
            label: "الاسم الكامل",
            icon: <User />,
            required: true,
          },
          {
            name: "email",
            label: "البريد الإلكتروني (اختياري)",
            icon: <Mail />,
            type: "email",
            dir: "rtl",
          },
          {
            name: "phone",
            label: "رقم الهاتف",
            icon: <Phone />,
            type: "tel",
            dir: "rtl",
            required: true,
          },
        ].map(({ name, label, icon, type = "text", dir, required }) => (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {label}
              {required && <span className="text-red-500 mr-1">*</span>}
            </label>
            <div className="relative">
              {React.cloneElement(icon, {
                className:
                  "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5",
              })}
              <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleInputChange}
                dir={dir}
                className={`w-full pr-12 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#8b6914] focus:border-[#8b6914] transition-all ${
                  errors[name] ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={label}
              />
            </div>
            {errors[name] && (
              <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
            )}
          </div>
        ))}

        {/* Password Fields */}
        {["password", "confirmPassword"].map((name, i) => (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {name === "password" ? "كلمة المرور" : "تأكيد كلمة المرور"}
              <span className="text-red-500 mr-1">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={
                  name === "password"
                    ? showPassword
                      ? "text"
                      : "password"
                    : showConfirmPassword
                    ? "text"
                    : "password"
                }
                name={name}
                value={formData[name]}
                onChange={handleInputChange}
                className={`w-full pr-12 pl-12 py-3 border rounded-lg focus:ring-2 focus:ring-[#8b6914] focus:border-[#8b6914] transition-all ${
                  errors[name] ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() =>
                  name === "password"
                    ? setShowPassword(!showPassword)
                    : setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {name === "password" ? (
                  showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )
                ) : showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors[name] && (
              <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
            )}
          </div>
        ))}

        {/* Address Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            العنوان
            <span className="text-red-500 mr-1">*</span>
          </label>
          <div className="relative">
            <MapPin className="absolute right-3 top-3 text-gray-400 w-5 h-5" />
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows={3}
              className={`w-full pr-12 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#8b6914] focus:border-[#8b6914] resize-none transition-all ${
                errors.address ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="الشارع، المدينة، المحافظة، الرمز البريدي"
            />
          </div>
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">{errors.address}</p>
          )}
        </div>

        {/* General Error Message */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-center">
            {errors.general}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#8b6914] hover:bg-[#6b5010] disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
              جارٍ الإنشاء...
            </>
          ) : (
            "إنشاء الحساب"
          )}
        </button>

        <p className="text-center mt-4 text-gray-600">
          لديك حساب بالفعل؟{" "}
          <Link
            to="/login"
            className="text-[#8b6914] hover:text-[#6b5010] font-semibold transition-colors"
          >
            تسجيل الدخول
          </Link>
        </p>
      </form>
    </div>
  );
};

// --- Main Signup Page ---
const Signup = () => (
  <div
    className="min-h-screen bg-gradient-to-br from-[#edc494] via-[#d4a574] to-[#c19a5b] pt-20"
    dir="rtl"
  >
    <main className="px-6 py-8 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row-reverse items-center justify-between space-y-8 lg:space-y-0">
        <div className="flex-1 flex justify-center">
          <SignupForm />
        </div>
        <div className="flex-1 flex flex-col items-center space-y-6 text-white text-center">
          <Globe3D />
          <h2 className="text-3xl font-bold">انضم إلينا اليوم!</h2>
          <p className="text-lg opacity-90">
            أنشئ حسابك واستمتع بخدمات الشحن إلى جميع أنحاء العالم مع ضمان الأمان
            والسرعة
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
                <span className="text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  </div>
);

export default Signup;
