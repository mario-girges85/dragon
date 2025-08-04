import React, { useState } from "react";
import { Package, MapPin, Phone, User, Upload, DollarSign } from "lucide-react";
import axios from "axios";

const CreateOrder = () => {
  const [form, setForm] = useState({
    senderName: "",
    senderPhone: "",
    receiverName: "",
    receiverPhone: "",
    address: "",
    packageType: "",
    weight: "",
    notes: "",
    file: null,
    isCollection: false,
    collectionPrice: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (name === "file" && files[0]) {
      setForm((prev) => ({ ...prev, file: files[0] }));
      setPreview(URL.createObjectURL(files[0]));
    } else if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: checked,
        // Clear collection price if unchecking
        ...(name === "isCollection" && !checked ? { collectionPrice: "" } : {}),
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.senderName.trim()) newErrors.senderName = "اسم المرسل مطلوب";
    if (!form.senderPhone.trim())
      newErrors.senderPhone = "رقم هاتف المرسل مطلوب";
    if (!form.receiverName.trim()) newErrors.receiverName = "اسم المستلم مطلوب";
    if (!form.receiverPhone.trim())
      newErrors.receiverPhone = "رقم هاتف المستلم مطلوب";
    if (!form.address.trim()) newErrors.address = "العنوان مطلوب";
    if (!form.packageType.trim()) newErrors.packageType = "نوع الطرد مطلوب";
    if (!form.weight.trim()) newErrors.weight = "وزن الطرد مطلوب";
    if (form.isCollection && !form.collectionPrice.trim())
      newErrors.collectionPrice = "سعر التحصيل مطلوب";

    // Validate weight is a number
    if (form.weight && isNaN(parseFloat(form.weight))) {
      newErrors.weight = "وزن الطرد يجب أن يكون رقم";
    }

    // Validate collection price is a number if collection is enabled
    if (
      form.isCollection &&
      form.collectionPrice &&
      isNaN(parseFloat(form.collectionPrice))
    ) {
      newErrors.collectionPrice = "سعر التحصيل يجب أن يكون رقم";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      // Get token from localStorage
      const token = localStorage.getItem("token");

      if (!token) {
        setErrors({ general: "يجب تسجيل الدخول أولاً" });
        setLoading(false);
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("senderName", form.senderName);
      formData.append("senderPhone", form.senderPhone);
      formData.append("receiverName", form.receiverName);
      formData.append("receiverPhone", form.receiverPhone);
      formData.append("address", form.address);
      formData.append("packageType", form.packageType);
      formData.append("weight", form.weight);
      formData.append("notes", form.notes);
      formData.append("isCollection", form.isCollection);

      if (form.isCollection && form.collectionPrice) {
        formData.append("collectionPrice", form.collectionPrice);
      }

      if (form.file) {
        formData.append("packageImage", form.file);
      }

      const response = await axios.post(
        `${import.meta.env.VITE_NEWORDER}`, // Add this to your .env file
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        alert(
          `تم إنشاء الطلب بنجاح! رقم الطلب: ${response.data.order.orderNumber}`
        );

        // Reset form
        setForm({
          senderName: "",
          senderPhone: "",
          receiverName: "",
          receiverPhone: "",
          address: "",
          packageType: "",
          weight: "",
          notes: "",
          file: null,
          isCollection: false,
          collectionPrice: "",
        });
        setPreview(null);

        // Optionally redirect to orders page
        // navigate('/orders');
      } else {
        setErrors({
          general: response.data.message || "حدث خطأ أثناء إنشاء الطلب",
        });
      }
    } catch (error) {
      console.error("Error creating order:", error);

      if (error.response && error.response.data) {
        if (
          error.response.data.errors &&
          Array.isArray(error.response.data.errors)
        ) {
          // Handle validation errors from backend
          setErrors({ general: error.response.data.errors.join(", ") });
        } else {
          setErrors({
            general: error.response.data.message || "حدث خطأ أثناء إنشاء الطلب",
          });
        }
      } else {
        setErrors({ general: "حدث خطأ في الاتصال. حاول مرة أخرى." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#edc494] via-[#d4a574] to-[#c19a5b] pt-20 flex items-center justify-center"
      dir="rtl"
    >
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-[#8b6914] ml-2" />
            <h1 className="text-2xl font-bold text-[#8b6914]">
              طلب توصيل جديد
            </h1>
          </div>
          <p className="text-gray-600">
            أدخل بيانات الطلب لإتمام عملية التوصيل
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم المرسل<span className="text-red-500 mr-1">*</span>
              </label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="senderName"
                  value={form.senderName}
                  onChange={handleChange}
                  className={`w-full pr-12 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#8b6914] focus:border-[#8b6914] transition-all ${
                    errors.senderName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="اسم المرسل"
                />
              </div>
              {errors.senderName && (
                <p className="text-red-500 text-sm mt-1">{errors.senderName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم هاتف المرسل<span className="text-red-500 mr-1">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  name="senderPhone"
                  value={form.senderPhone}
                  onChange={handleChange}
                  className={`w-full pr-12 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#8b6914] focus:border-[#8b6914] transition-all ${
                    errors.senderPhone ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="رقم هاتف المرسل"
                />
              </div>
              {errors.senderPhone && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.senderPhone}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم المستلم<span className="text-red-500 mr-1">*</span>
              </label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="receiverName"
                  value={form.receiverName}
                  onChange={handleChange}
                  className={`w-full pr-12 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#8b6914] focus:border-[#8b6914] transition-all ${
                    errors.receiverName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="اسم المستلم"
                />
              </div>
              {errors.receiverName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.receiverName}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم هاتف المستلم<span className="text-red-500 mr-1">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  name="receiverPhone"
                  value={form.receiverPhone}
                  onChange={handleChange}
                  className={`w-full pr-12 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#8b6914] focus:border-[#8b6914] transition-all ${
                    errors.receiverPhone ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="رقم هاتف المستلم"
                />
              </div>
              {errors.receiverPhone && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.receiverPhone}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              عنوان التسليم<span className="text-red-500 mr-1">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute right-3 top-3 text-gray-400 w-5 h-5" />
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={2}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع الطرد<span className="text-red-500 mr-1">*</span>
              </label>
              <input
                type="text"
                name="packageType"
                value={form.packageType}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#8b6914] focus:border-[#8b6914] transition-all ${
                  errors.packageType ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="نوع الطرد (ملابس، إلكترونيات، ...الخ)"
              />
              {errors.packageType && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.packageType}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                وزن الطرد (كغ)<span className="text-red-500 mr-1">*</span>
              </label>
              <input
                type="number"
                name="weight"
                value={form.weight}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#8b6914] focus:border-[#8b6914] transition-all ${
                  errors.weight ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="وزن الطرد بالكيلوغرام"
              />
              {errors.weight && (
                <p className="text-red-500 text-sm mt-1">{errors.weight}</p>
              )}
            </div>
          </div>

          {/* Collection Checkbox */}
          <div className="flex items-center space-x-3 space-x-reverse">
            <input
              type="checkbox"
              name="isCollection"
              id="isCollection"
              checked={form.isCollection}
              onChange={handleChange}
              className="w-4 h-4 text-[#8b6914] bg-gray-100 border-gray-300 rounded focus:ring-[#8b6914] focus:ring-2"
            />
            <label
              htmlFor="isCollection"
              className="text-sm m-2 font-medium text-gray-700"
            >
              تحصيل (دفع عند الاستلام)
            </label>
          </div>

          {/* Collection Price Input */}
          {form.isCollection && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                سعر التحصيل<span className="text-red-500 mr-1">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  name="collectionPrice"
                  value={form.collectionPrice}
                  onChange={handleChange}
                  className={`w-full pr-12 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#8b6914] focus:border-[#8b6914] transition-all ${
                    errors.collectionPrice
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="المبلغ المطلوب تحصيله"
                  min="0"
                  step="0.01"
                />
              </div>
              {errors.collectionPrice && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.collectionPrice}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ملاحظات إضافية
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#8b6914] focus:border-[#8b6914] resize-none transition-all border-gray-300"
              placeholder="أي تفاصيل إضافية حول الطلب (اختياري)"
            />
          </div>

          <div className="flex flex-col items-center mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رفع صورة للطرد (اختياري)
            </label>
            <input
              type="file"
              name="file"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
              id="orderFileInput"
            />
            <button
              type="button"
              onClick={() => document.getElementById("orderFileInput").click()}
              className="mt-2 flex items-center space-x-2 space-x-reverse text-[#8b6914] hover:text-[#6b5010] font-medium transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>{form.file ? "تغيير الصورة" : "رفع صورة الطرد"}</span>
            </button>
            {preview && (
              <img
                src={preview}
                alt="معاينة الطرد"
                className="mt-3 w-24 h-24 rounded-lg object-cover border-2 border-[#f5d5a8] shadow"
              />
            )}
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-center">
              {errors.general}
            </div>
          )}

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
              "إنشاء الطلب"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateOrder;
