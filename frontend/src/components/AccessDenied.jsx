import React from "react";
import { useNavigate } from "react-router-dom";
import { Shield, ArrowLeft } from "lucide-react";

const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#edc494] via-[#d4a574] to-[#c19a5b]">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            تم رفض الوصول
          </h2>
          <p className="text-gray-600 mb-6">
            عذراً، هذه الصفحة متاحة فقط للمديرين. لا تملك الصلاحيات المطلوبة للوصول إلى هذه المنطقة.
          </p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8b6914] to-[#6b5010] text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 transform"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة للرئيسية
          </button>
          
          <button
            onClick={() => navigate(-1)}
            className="w-full px-6 py-3 border-2 border-[#8b6914] text-[#8b6914] rounded-lg font-medium transition-all duration-200 hover:bg-[#8b6914] hover:text-white"
          >
            العودة للصفحة السابقة
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied; 