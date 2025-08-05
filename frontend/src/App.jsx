import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Users from "./pages/users";
import Navbar from "./components/Navbar";
import CreateOrder from "./pages/CreateOrder";
import OrdersPage from "./pages/OrdersPage";
import Profile from "./pages/Profile";
import MyProfile from "./pages/MyProfile";
import EditProfile from "./pages/EditProfile";
import ProtectedRoute from "./components/ProtectedRoute";
const App = () => {
  // console.log(import.meta.env.VITE_NEWUSER); // Log the environment variable for debugging
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/users"
          element={
            <ProtectedRoute requireAdmin={true}>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MyProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editprofile"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/:id"
          element={
            <ProtectedRoute requireAdmin={true}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/createorder"
          element={
            <ProtectedRoute>
              <CreateOrder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
