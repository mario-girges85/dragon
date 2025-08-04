import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AccessDenied from "./AccessDenied";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (user && token) {
        try {
          // Verify the user data is valid JSON
          const userData = JSON.parse(user);
          setIsAuthenticated(true);

          // Check if user is admin if required
          if (requireAdmin) {
            setIsAdmin(userData.role === "admin");
          } else {
            setIsAdmin(true); // If admin not required, consider it true
          }
        } catch (error) {
          // Invalid user data, clear it
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener("authChanged", handleAuthChange);
    return () => window.removeEventListener("authChanged", handleAuthChange);
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#edc494] via-[#d4a574] to-[#c19a5b]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#8b6914] mb-4"></div>
        <div className="text-[#8b6914] text-lg font-bold">
          {requireAdmin ? "جارٍ التحقق من صلاحيات المدير..." : "جارٍ التحقق من تسجيل الدخول..."}
        </div>
      </div>
    );
  }

  // Show access denied for admin routes if user is not admin
  if (!loading && isAuthenticated && requireAdmin && !isAdmin) {
    return <AccessDenied />;
  }

  return isAuthenticated && (!requireAdmin || isAdmin) ? children : null;
};

export default ProtectedRoute;
