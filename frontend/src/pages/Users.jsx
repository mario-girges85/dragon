import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const roleOptions = ["user", "delivery", "admin"];

// Arabic translations for roles
const roleTranslations = {
  user: "مستخدم",
  delivery: "مندوب توصيل",
  admin: "مدير",
};

const UsersTable = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("يرجى تسجيل الدخول للوصول إلى هذه الصفحة");
          setLoading(false);
          return;
        }

        // Get current user from localStorage
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            setCurrentUser(JSON.parse(userStr));
          } catch (e) {
            console.error("Error parsing user data:", e);
          }
        }

        const response = await axios.get(import.meta.env.VITE_ALLUSER, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUsers(response.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        if (error.response?.status === 403) {
          setError("ليس لديك صلاحية للوصول إلى قائمة المستخدمين");
        } else if (error.response?.status === 401) {
          setError("يرجى تسجيل الدخول مرة أخرى");
        } else {
          setError("فشل تحميل المستخدمين");
        }
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole, currentRole, userName) => {
    // Show confirmation dialog
    const roleTranslations = {
      user: "مستخدم",
      delivery: "مندوب توصيل",
      admin: "مدير",
    };

    const currentRoleText = roleTranslations[currentRole] || currentRole;
    const newRoleText = roleTranslations[newRole] || newRole;

    const confirmMessage = `هل أنت متأكد من تغيير دور المستخدم "${userName}" من "${currentRoleText}" إلى "${newRoleText}"؟`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("يرجى تسجيل الدخول مرة أخرى");
        return;
      }

      await axios.put(
        `${import.meta.env.VITE_USERS_BASE}/${userId}/role`,
        {
          role: newRole,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the user's role in the local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );

      // Show success message
      alert("تم تحديث دور المستخدم بنجاح");
    } catch (error) {
      console.error("Error updating user role:", error);
      if (error.response?.status === 403) {
        alert("ليس لديك صلاحية لتغيير أدوار المستخدمين");
      } else {
        alert("فشل في تحديث دور المستخدم");
      }
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm("هل أنت متأكد من حذف هذا المستخدم؟")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("يرجى تسجيل الدخول مرة أخرى");
        return;
      }

      await axios.delete(`${import.meta.env.VITE_DELETEUSER}/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Remove the user from local state
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      alert("تم حذف المستخدم بنجاح");
    } catch (error) {
      console.error("Error deleting user:", error);
      if (error.response?.status === 403) {
        // Check if it's the self-deletion error
        if (error.response?.data?.message?.includes("حسابك الشخصي")) {
          alert("لا يمكنك حذف حسابك الشخصي");
        } else {
          alert("ليس لديك صلاحية لحذف المستخدمين");
        }
      } else if (error.response?.status === 401) {
        alert("يرجى تسجيل الدخول مرة أخرى");
      } else {
        alert("فشل في حذف المستخدم");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#edc494] via-[#d4a574] to-[#c19a5b]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#8b6914] mb-4"></div>
        <div className="text-[#8b6914] text-lg font-bold">
          جارٍ تحميل المستخدمين...
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  // Filter users by search
  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.phone?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#edc494] via-[#d4a574] to-[#c19a5b] pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-bold text-white mb-2">
            قائمة المستخدمين
          </h2>
          <p className="text-lg text-white">إدارة جميع المستخدمين في النظام</p>
        </div>

        <div className="mb-6 flex justify-end">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو رقم الهاتف..."
            className="w-full max-w-xs px-4 py-3 rounded-xl border-2 border-[#f5d5a8] focus:ring-2 focus:ring-[#8b6914] text-[#8b6914] font-semibold shadow-sm bg-white"
            dir="rtl"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f5d5a8] text-[#8b6914]">
              <tr>
                <th className="py-4 px-4 text-right font-semibold">الصورة</th>
                <th className="py-4 px-4 text-right font-semibold">الاسم</th>
                <th className="py-4 px-4 text-right font-semibold">
                  رقم الهاتف
                </th>
                <th className="py-4 px-4 text-right font-semibold">الدور</th>
                <th className="py-4 px-4 text-right font-semibold">حذف</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-[#f5d5a8] hover:bg-[#fff7ec] transition-colors"
                >
                  <td className="py-4 px-4 text-center">
                    <img
                      src={
                        user.profile_image_base64
                          ? user.profile_image_base64.startsWith("http")
                            ? user.profile_image_base64
                            : `data:image/jpeg;base64,${user.profile_image_base64}`
                          : "/avatar.png"
                      }
                      alt="avatar"
                      className="w-14 h-14 rounded-full object-cover border-2 border-[#f5d5a8] mx-auto shadow"
                      style={{ background: "#fff" }}
                    />
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => navigate(`/users/${user.id}`)}
                      className="font-bold text-[#8b6914] text-lg hover:text-[#6b5010] hover:underline transition-all duration-200 cursor-pointer"
                    >
                      {user.name}
                    </button>
                  </td>
                  <td className="py-4 px-4 text-[#a67c00] font-medium text-base">
                    {user.phone}
                  </td>
                  <td className="py-4 px-4">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(
                          user.id,
                          e.target.value,
                          user.role,
                          user.name
                        )
                      }
                      className="border-2 border-[#f5d5a8] rounded-lg px-4 py-2 text-[#8b6914] bg-white focus:ring-2 focus:ring-[#8b6914] font-semibold shadow-sm"
                      dir="rtl"
                    >
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>
                          {roleTranslations[role]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-4 px-4 text-center">
                    {currentUser && currentUser.id === user.id ? (
                      <span className="text-gray-400 text-sm font-medium">
                        لا يمكن حذف حسابك
                      </span>
                    ) : (
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl font-bold shadow-lg transition-colors"
                      >
                        حذف
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersTable;
