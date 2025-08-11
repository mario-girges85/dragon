import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Package, Calendar, TrendingUp } from "lucide-react";
import OrderCard from "../components/OrderCard";

const OrdersPage = () => {
  // State to hold the array of orders
  const [orders, setOrders] = useState([]);

  // State to manage the loading status while fetching data
  const [loading, setLoading] = useState(true);

  // State to hold any potential errors during the API call
  const [error, setError] = useState(null);

  // State for search functionality
  const [searchTerm, setSearchTerm] = useState("");

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(6); // Number of orders per page

  // State for status tabs
  const [activeTab, setActiveTab] = useState("all");

  // State for delivery users (admin only)
  const [deliveryUsers, setDeliveryUsers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      // Get the authentication token and user info from localStorage
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (!token) {
        setError("You must be logged in to view orders.");
        setLoading(false);
        return;
      }

      if (!userStr) {
        setError("User information not found. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const user = JSON.parse(userStr);
        setIsAdmin(user.role === "admin");

        let response;

        // Check user role and fetch orders accordingly
        if (user.role === "admin" || user.role === "delivery") {
          // Admin can see all orders, delivery users see orders assigned to them
          response = await axios.get(import.meta.env.VITE_ALLORDERS, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } else {
          // Regular users can only see orders they created
          response = await axios.get(
            `${import.meta.env.VITE_ORDERS_BY_USERID}${user.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }

        if (response.data.success) {
          setOrders(response.data.orders);
        } else {
          setError(response.data.message || "Failed to load orders.");
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(
          err.response?.data?.message ||
            "An error occurred while fetching your orders."
        );
      } finally {
        // Set loading to false once the request is complete (either success or failure)
        setLoading(false);
      }
    };

    fetchOrders();
  }, []); // The empty dependency array [] ensures this effect runs only once when the component mounts

  // Fetch delivery users for admin
  useEffect(() => {
    const fetchDeliveryUsers = async () => {
      if (!isAdmin) return;

      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        console.log(
          "Fetching delivery users from:",
          import.meta.env.VITE_DELIVERY_USERS
        );
        console.log("Token:", token);
        const response = await axios.get(import.meta.env.VITE_DELIVERY_USERS, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Delivery users response:", response.data);
        if (response.data.success) {
          setDeliveryUsers(response.data.deliveryUsers);
          console.log("Set delivery users:", response.data.deliveryUsers);
          console.log(
            "Number of delivery users:",
            response.data.deliveryUsers?.length
          );
        } else {
          console.log("Response was not successful:", response.data);
        }
      } catch (err) {
        console.error("Error fetching delivery users:", err);
        console.error("Error response:", err.response?.data);
        console.error("Error status:", err.response?.status);
      }
    };

    fetchDeliveryUsers();
  }, [isAdmin]);

  // Handle delivery assignment
  const handleAssignDelivery = async (orderId, deliveryUserId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("يرجى تسجيل الدخول مرة أخرى");
      return;
    }

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_ASSIGN_DELIVERY}${orderId}/assign-delivery`,
        { deliveryUserId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Update the order in the local state
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, ...response.data.order } : order
          )
        );
        alert("تم تعيين مندوب التوصيل بنجاح");
      } else {
        alert(response.data.message || "فشل في تعيين مندوب التوصيل");
      }
    } catch (err) {
      console.error("Error assigning delivery:", err);
      alert(err.response?.data?.message || "حدث خطأ أثناء تعيين مندوب التوصيل");
    }
  };

  // Handle delivery status update
  const handleDeliveryStatusUpdate = (updatedOrder) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === updatedOrder.id ? { ...order, ...updatedOrder } : order
      )
    );
  };

  // Status tabs configuration
  const statusTabs = [
    { id: "all", label: "جميع الطلبات", count: orders.length },
    {
      id: "pending",
      label: "في الانتظار",
      count: orders.filter((order) => order.status?.toLowerCase() === "pending")
        .length,
    },
    {
      id: "confirmed",
      label: "مؤكد",
      count: orders.filter(
        (order) => order.status?.toLowerCase() === "confirmed"
      ).length,
    },
    {
      id: "picked_up",
      label: "تم الاستلام",
      count: orders.filter(
        (order) => order.status?.toLowerCase() === "picked_up"
      ).length,
    },
    {
      id: "in_transit",
      label: "قيد النقل",
      count: orders.filter(
        (order) => order.status?.toLowerCase() === "in_transit"
      ).length,
    },

    {
      id: "delivered",
      label: "تم التوصيل",
      count: orders.filter(
        (order) => order.status?.toLowerCase() === "delivered"
      ).length,
    },
  ];

  // Filter orders based on search term and active tab
  const filteredOrders = orders.filter((order) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(searchLower) ||
      order.senderName?.toLowerCase().includes(searchLower) ||
      order.receiverName?.toLowerCase().includes(searchLower);

    const matchesTab =
      activeTab === "all" || order.status?.toLowerCase() === activeTab;

    return matchesSearch && matchesTab;
  });

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Reset to first page when search term or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show limited pages with ellipsis
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Calculate statistics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (order) => order.status?.toLowerCase() === "pending"
  ).length;
  const deliveredOrders = orders.filter(
    (order) => order.status?.toLowerCase() === "delivered"
  ).length;
  const inTransitOrders = orders.filter(
    (order) =>
      order.status?.toLowerCase() === "in_transit" ||
      order.status?.toLowerCase() === "picked_up"
  ).length;

  // --- Conditional Rendering ---

  // 1. Show a loading state while the API call is in progress
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#edc494] via-[#d4a574] to-[#c19a5b] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white font-semibold text-lg sm:text-xl">
            جاري تحميل الطلبات...
          </p>
          <p className="text-white/80 text-sm sm:text-base mt-2">
            يرجى الانتظار
          </p>
        </div>
      </div>
    );
  }

  // 2. Show an error message if the API call failed
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#edc494] via-[#d4a574] to-[#c19a5b] flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-red-800 mb-2">
            خطأ في التحميل
          </h2>
          <p className="text-red-600 text-sm sm:text-base">{error}</p>
        </div>
      </div>
    );
  }

  // 3. Render the list of orders if the fetch was successful
  return (
    <div
      className="min-h-screen pt-16 bg-gradient-to-br from-[#edc494] via-[#d4a574] to-[#c19a5b] p-4 sm:p-6 lg:p-20"
      dir="rtl"
    >
      <div className="container mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Package className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              الطلبات
            </h1>
          </div>
          <p className="text-white/90 text-base sm:text-lg max-w-2xl mx-auto">
            {(() => {
              const userStr = localStorage.getItem("user");
              if (userStr) {
                const user = JSON.parse(userStr);
                if (user.role === "admin") {
                  return "إدارة وتتبع جميع طلبات الشحن في النظام";
                } else if (user.role === "delivery") {
                  return "إدارة وتتبع الطلبات المخصصة لك للتوصيل";
                } else {
                  return "إدارة وتتبع طلبات الشحن الخاصة بك";
                }
              }
              return "إدارة وتتبع طلبات الشحن الخاصة بك";
            })()}
          </p>
          {/* Role Indicator */}
          {(() => {
            const userStr = localStorage.getItem("user");
            if (userStr) {
              const user = JSON.parse(userStr);
              const roleTranslations = {
                user: "مستخدم",
                delivery: "مندوب توصيل",
                admin: "مدير",
              };
              return (
                <div className="mt-2">
                  <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium">
                    {roleTranslations[user.role] || user.role}
                  </span>
                </div>
              );
            }
            return null;
          })()}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 sm:mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
              {totalOrders}
            </div>
            <div className="text-white/80 text-sm sm:text-base">
              إجمالي الطلبات
            </div>
          </div>
          <div className="bg-yellow-500/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
              {pendingOrders}
            </div>
            <div className="text-white/80 text-sm sm:text-base">
              في الانتظار
            </div>
          </div>
          <div className="bg-blue-500/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
              {inTransitOrders}
            </div>
            <div className="text-white/80 text-sm sm:text-base">قيد النقل</div>
          </div>
          <div className="bg-green-500/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
              {deliveredOrders}
            </div>
            <div className="text-white/80 text-sm sm:text-base">تم التوصيل</div>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2 sm:p-3">
            <div className="flex flex-wrap gap-2 justify-center">
              {statusTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 sm:px-6 sm:py-3 rounded-xl text-sm sm:text-base font-medium transition-all duration-200 flex items-center gap-2 ${
                    activeTab === tab.id
                      ? "bg-[#c19a5b] text-white shadow-lg"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      activeTab === tab.id
                        ? "bg-white/20 text-white"
                        : "bg-white/20 text-white/80"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 mb-8">
          <div className="max-w-md mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-white/70" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="البحث برقم الطلب أو اسم المرسل أو المستلم..."
                className="w-full pl-10 pr-12 py-3 sm:py-4 border-2 border-white/20 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-200"
                dir="rtl"
              />
            </div>

            {/* Search Results Info */}
            {(searchTerm || activeTab !== "all") && (
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <p className="text-white/80 text-sm sm:text-base">
                    تم العثور على {filteredOrders.length} طلب من أصل{" "}
                    {orders.length}
                    {activeTab !== "all" &&
                      ` في ${
                        statusTabs.find((tab) => tab.id === activeTab)?.label
                      }`}
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setActiveTab("all");
                    }}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    مسح الفلاتر
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Orders Content */}
        {orders.length > 0 ? (
          <>
            {filteredOrders.length > 0 ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                  {currentOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onAssignDelivery={handleAssignDelivery}
                      deliveryUsers={deliveryUsers}
                      isAdmin={isAdmin}
                      onDeliveryStatusUpdate={handleDeliveryStatusUpdate}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 sm:mt-12">
                    <div className="flex items-center justify-center gap-2">
                      {/* Previous Button */}
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        السابق
                      </button>

                      {/* Page Numbers */}
                      <div className="flex items-center gap-1">
                        {getPageNumbers().map((page, index) => (
                          <button
                            key={index}
                            onClick={() =>
                              typeof page === "number" && setCurrentPage(page)
                            }
                            disabled={page === "..."}
                            className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
                              page === currentPage
                                ? "bg-[#c19a5b] text-white"
                                : page === "..."
                                ? "text-white/50 cursor-default"
                                : "bg-white/10 hover:bg-white/20 text-white"
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>

                      {/* Next Button */}
                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        التالي
                      </button>
                    </div>

                    {/* Page Info */}
                    <div className="text-center mt-4">
                      <p className="text-white/80 text-sm">
                        صفحة {currentPage} من {totalPages} • عرض{" "}
                        {indexOfFirstOrder + 1}-
                        {Math.min(indexOfLastOrder, filteredOrders.length)} من{" "}
                        {filteredOrders.length} طلب
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              // Show a message if no orders match the search
              <div className="text-center bg-white/10 backdrop-blur-sm p-8 sm:p-12 rounded-2xl">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Search className="w-8 h-8 sm:w-10 sm:h-10 text-white/60" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">
                  لا توجد نتائج للبحث
                </h2>
                <p className="text-white/80 text-sm sm:text-base mb-6">
                  لم يتم العثور على طلبات تطابق "{searchTerm}"
                </p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-medium transition-colors duration-200"
                >
                  مسح البحث
                </button>
              </div>
            )}
          </>
        ) : (
          // Show a message if there are no orders to display
          <div className="text-center bg-white/10 backdrop-blur-sm p-8 sm:p-12 rounded-2xl">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Package className="w-8 h-8 sm:w-10 sm:h-10 text-white/60" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">
              {(() => {
                const userStr = localStorage.getItem("user");
                if (userStr) {
                  const user = JSON.parse(userStr);
                  if (user.role === "admin") {
                    return "لا توجد أي طلبات في النظام حتى الآن";
                  } else if (user.role === "delivery") {
                    return "لا توجد أي طلبات مخصصة لك حتى الآن";
                  }
                }
                return "لا يوجد لديك أي طلبات حتى الآن";
              })()}
            </h2>
            <p className="text-white/80 text-sm sm:text-base mb-6">
              {(() => {
                const userStr = localStorage.getItem("user");
                if (userStr) {
                  const user = JSON.parse(userStr);
                  if (user.role === "admin") {
                    return "عندما يقوم المستخدمون بإنشاء طلبات جديدة، ستظهر هنا";
                  } else if (user.role === "delivery") {
                    return "عندما يتم تخصيص طلبات لك، ستظهر هنا";
                  }
                }
                return "عندما تقوم بإنشاء طلب جديد، سيظهر هنا";
              })()}
            </p>
            {(() => {
              const userStr = localStorage.getItem("user");
              if (userStr) {
                const user = JSON.parse(userStr);
                if (user.role !== "admin" && user.role !== "delivery") {
                  return (
                    <button
                      onClick={() => (window.location.href = "/createorder")}
                      className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-medium transition-colors duration-200"
                    >
                      إنشاء طلب جديد
                    </button>
                  );
                }
              }
              return null;
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
