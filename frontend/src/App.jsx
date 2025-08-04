import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Users from "./pages/users";
import Navbar from "./components/Navbar";
import CreateOrder from "./pages/CreateOrder";
import OrdersPage from "./pages/OrdersPage";
import Profile from "./pages/Profile";
const App = () => {
  // console.log(import.meta.env.VITE_NEWUSER); // Log the environment variable for debugging
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/users" element={<Users />} />
        <Route path="/users/:id" element={<Profile />} />
        <Route path="/createorder" element={<CreateOrder />} />
        <Route path="/orders" element={<OrdersPage />} />
      </Routes>
    </div>
  );
};

export default App;
