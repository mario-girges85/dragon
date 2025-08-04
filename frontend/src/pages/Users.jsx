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

  useEffect(() => {
    axios
      .get(import.meta.env.VITE_ALLUSER)
      .then((res) => {
        setUsers(res.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError("فشل تحميل المستخدمين");
        setLoading(false);
      });
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`${import.meta.env.VITE_ALLUSER}/${userId}/role`, {
        role: newRole,
      });

      // Update the user's role in the local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("فشل في تحديث دور المستخدم");
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm("هل أنت متأكد من حذف هذا المستخدم؟")) {
      return;
    }

    try {
      await axios.delete(`${import.meta.env.VITE_DELETEUSER}/${userId}`);

      // Remove the user from local state
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("فشل في حذف المستخدم");
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
                        handleRoleChange(user.id, e.target.value)
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
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl font-bold shadow-lg transition-colors"
                    >
                      حذف
                    </button>
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
