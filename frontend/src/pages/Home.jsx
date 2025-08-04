import React from "react";
import { Package, Truck } from "lucide-react";

// Stats Component
const Stats = () => (
  <div className="hidden lg:flex flex-col space-y-8 text-left" dir="rtl">
    <div>
      <div className="text-3xl font-bold text-[#8b6914] mb-1">+28</div>
      <div className="text-[#a67c00] text-sm">محافظة</div>
    </div>
    <div>
      <div className="text-3xl font-bold text-[#8b6914] mb-1">10 سنوات</div>
      <div className="text-[#a67c00] text-sm">خبرة</div>
    </div>
    <div>
      <div className="text-3xl font-bold text-[#8b6914] mb-1">+50</div>
      <div className="text-[#a67c00] text-sm">خبير</div>
    </div>
  </div>
);

// Package 3D Component
const Package3D = () => (
  <div className="relative flex-1 flex items-center justify-center">
    {/* Main package */}
    <div className="relative transform -rotate-12 hover:-rotate-6 transition-transform duration-500">
      {/* Package shadow */}
      <div className="absolute top-4 right-4 w-32 h-32 bg-yellow-800 opacity-30 rounded-lg transform rotate-6"></div>

      {/* Package body */}
      <div className="relative w-32 h-32 bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-lg shadow-2xl">
        {/* Package top */}
        <div className="absolute -top-2 -right-2 w-32 h-32 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg transform rotate-3 shadow-lg">
          {/* Tape */}
          <div className="absolute top-1/2 left-0 right-0 h-3 bg-white opacity-80 transform -translate-y-1/2"></div>
          <div className="absolute top-1/2 left-1/2 w-3 h-full bg-white opacity-80 transform -translate-x-1/2 -translate-y-1/2"></div>

          {/* Label */}
          <div className="absolute bottom-4 left-4 w-8 h-6 bg-white rounded-sm shadow-sm">
            <div className="w-full h-1 bg-gray-300 mt-1"></div>
            <div className="w-3/4 h-1 bg-gray-300 mt-1 mr-1"></div>
            <div className="w-1/2 h-1 bg-gray-300 mt-1 mr-1"></div>
          </div>
        </div>

        {/* Package icons */}
        <div className="absolute bottom-2 right-2 flex space-x-1 space-x-reverse">
          <div className="w-3 h-3 border border-yellow-900 flex items-center justify-center text-yellow-900 text-xs">
            <Truck className="w-2 h-2" />
          </div>
          <div className="w-3 h-3 border border-yellow-900 flex items-center justify-center text-yellow-900 text-xs">
            <Package className="w-2 h-2" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Hero Content Component
const HeroContent = () => (
  <div className="flex-1 max-w-xl text-right" dir="rtl">
    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
      اشحن طردك مع دراجون الآن
    </h1>
    <p className="text-white text-lg mb-8 leading-relaxed opacity-90">
      نحن نوفر أفضل خدمات الشحن السريع والآمن إلى جميع أنحاء العالم. مع خبرة
      تزيد عن 15 عاماً في مجال الشحن والتوصيل.
    </p>
    <button className="bg-[#8b6914] hover:bg-[#6b5010] text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
      ابدأ الآن
    </button>
  </div>
);

// Main Home Component
const Home = () => {
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#edc494] via-[#d4a574] to-[#c19a5b] relative overflow-hidden pt-20"
      dir="rtl"
    >
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#f5d5a8] rounded-full opacity-20 transform -translate-x-48 -translate-y-48"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-300 rounded-full opacity-20 transform translate-x-32 translate-y-32"></div>

      {/* Main content */}
      <main className="px-6 py-12 max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row-reverse items-center justify-between min-h-[70vh] space-y-12 lg:space-y-0 lg:space-x-12 lg:space-x-reverse">
          <HeroContent />

          <div className="flex-1 flex items-center justify-center relative">
            <Package3D />
            <Stats />
          </div>
        </div>

        {/* Mobile stats */}
        <div
          className="lg:hidden grid grid-cols-3 gap-6 mt-16 text-center"
          dir="rtl"
        >
          <div>
            <div className="text-2xl font-bold text-white mb-1">+28</div>
            <div className="text-[#f5d5a8] text-sm">محافظة</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white mb-1">10 سنوات</div>
            <div className="text-[#f5d5a8] text-sm">خبرة</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white mb-1">+50</div>
            <div className="text-[#f5d5a8] text-sm">خبير</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
