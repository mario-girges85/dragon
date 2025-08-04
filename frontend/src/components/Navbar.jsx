import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  Settings,
  Bell,
  Zap,
} from "lucide-react";
import axios from "axios";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load user from localStorage
  useEffect(() => {
    const loadUserFromStorage = () => {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          localStorage.removeItem("user");
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    loadUserFromStorage();

    const handler = () => {
      loadUserFromStorage();
    };
    window.addEventListener("authChanged", handler);

    return () => {
      window.removeEventListener("authChanged", handler);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      if (import.meta.env.VITE_LOGOUT) {
        await axios.post(
          import.meta.env.VITE_LOGOUT,
          {},
          { withCredentials: true }
        );
      }
    } catch (err) {
      console.warn("Logout backend error (continuing):", err);
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("authChanged"));
      setUser(null);
      navigate("/login");
    }
  };

  const avatarSrc = user?.profile_image_base64
    ? `data:image/jpeg;base64,${user?.profile_image_base64}`
    : null;

  const navLinks = [
    { href: "/", label: "الرئيسية", active: true },
    { href: "/orders", label: "الطلبات" },
    { href: "/users", label: "المستخدمين" },
    { href: "/createorder", label: "إنشاء طلب" },
    { href: "#", label: "اتصل بنا" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-100"
          : "bg-transparent"
      }`}
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div
              className={`p-2 rounded-xl transition-all duration-300 ${
                scrolled
                  ? "bg-gradient-to-r from-[#8b6914] to-[#6b5010] shadow-lg"
                  : "bg-white/10 backdrop-blur-sm"
              } group-hover:scale-110`}
            >
              <Zap
                className={`w-6 h-6 ${scrolled ? "text-white" : "text-white"}`}
              />
            </div>
            <span
              className={`text-xl font-bold transition-colors ${
                scrolled ? "text-gray-800" : "text-white"
              }`}
            >
              دراجون
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 relative overflow-hidden group ${
                  scrolled
                    ? "text-gray-700 hover:text-[#8b6914] hover:bg-[#8b6914]/5"
                    : "text-white/90 hover:text-white hover:bg-white/10"
                } ${
                  link.active
                    ? scrolled
                      ? "text-[#8b6914] bg-[#8b6914]/5"
                      : "text-white bg-white/10"
                    : ""
                }`}
              >
                <span className="relative z-10">{link.label}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#8b6914] to-[#6b5010] opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
              </a>
            ))}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                {/* Notifications */}
                <button
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    scrolled
                      ? "text-gray-600 hover:text-[#8b6914] hover:bg-gray-50"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Bell className="w-5 h-5" />
                </button>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                      scrolled ? "hover:bg-gray-50" : "hover:bg-white/10"
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={avatarSrc || "/default-avatar.png"}
                        alt="avatar"
                        className="w-8 h-8 rounded-full border-2 border-white/20 object-cover cursor-pointer hover:scale-110 transition-transform"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDropdownOpen(false);
                          navigate(`/users/${user.id}`);
                        }}
                      />
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-medium text-sm ${
                          scrolled ? "text-gray-800" : "text-white"
                        }`}
                      >
                        {user.name || "المستخدم"}
                      </div>
                      <div
                        className={`text-xs ${
                          scrolled ? "text-gray-500" : "text-white/70"
                        }`}
                      >
                        متصل
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        dropdownOpen ? "rotate-180" : ""
                      } ${scrolled ? "text-gray-600" : "text-white/80"}`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                      <div className="p-4 border-b border-gray-50 bg-gradient-to-r from-[#8b6914]/5 to-[#6b5010]/5">
                        <div className="flex items-center gap-3">
                          <img
                            src={avatarSrc || "/default-avatar.png"}
                            alt="avatar"
                            className="w-10 h-10 rounded-full object-cover cursor-pointer hover:scale-110 transition-transform"
                            onClick={() => {
                              setDropdownOpen(false);
                              navigate(`/users/${user.id}`);
                            }}
                          />
                          <div>
                            <div className="font-semibold text-gray-800">
                              {user.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="py-2">
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            navigate(`/users/${user.id}`);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-right hover:bg-gray-50 transition-colors"
                        >
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">الملف الشخصي</span>
                        </button>

                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            navigate("/settings");
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-right hover:bg-gray-50 transition-colors"
                        >
                          <Settings className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">الإعدادات</span>
                        </button>
                      </div>

                      <div className="border-t border-gray-100">
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-right hover:bg-red-50 transition-colors text-red-600"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>تسجيل الخروج</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/login")}
                  className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                    scrolled
                      ? "text-gray-700 hover:text-[#8b6914] hover:bg-gray-50"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  تسجيل الدخول
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="px-6 py-2 bg-gradient-to-r from-[#8b6914] to-[#6b5010] text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 transform"
                >
                  إنشاء حساب
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              scrolled
                ? "text-gray-600 hover:text-[#8b6914] hover:bg-gray-50"
                : "text-white hover:bg-white/10"
            }`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-lg border-t border-gray-100 shadow-lg">
          <div className="px-4 py-6 space-y-1">
            {navLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                  link.active
                    ? "text-[#8b6914] bg-[#8b6914]/5"
                    : "text-gray-700 hover:text-[#8b6914] hover:bg-gray-50"
                }`}
              >
                {link.label}
              </a>
            ))}

            <div className="pt-4 border-t border-gray-100 space-y-3">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#8b6914]/5 to-[#6b5010]/5 rounded-lg">
                    <img
                      src={avatarSrc || "/default-avatar.png"}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover cursor-pointer hover:scale-110 transition-transform"
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate(`/users/${user.id}`);
                      }}
                    />
                    <div>
                      <div className="font-semibold text-gray-800">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">متصل</div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate(`/users/${user.id}`);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-right rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">الملف الشخصي</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-right rounded-lg hover:bg-red-50 transition-colors text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>تسجيل الخروج</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate("/login");
                    }}
                    className="w-full px-4 py-3 border-2 border-[#8b6914] text-[#8b6914] rounded-lg font-medium transition-all duration-200 hover:bg-[#8b6914] hover:text-white"
                  >
                    تسجيل الدخول
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate("/signup");
                    }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-[#8b6914] to-[#6b5010] text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02]"
                  >
                    إنشاء حساب
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
