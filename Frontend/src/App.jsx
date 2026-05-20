import { Route, Routes, useLocation } from "react-router";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import { useEffect, useRef } from "react";
import apiRequest from "./utils/apiRequest";
import { setCheckingAuth, setCurrentUser } from "./features/usersSlice";
import { useDispatch } from "react-redux";
import ProtectedRoute from "./components/ProtectedRoute";
import CreateEvent from "./pages/CreateEvent";

const App = () => {
  const location = useLocation();
  const hideNavbar = ["/login", "/register"].includes(location.pathname);

  const dispatch = useDispatch();

  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    const checkAuth = async () => {
      try {
        const response = await apiRequest.get("/users");
        const user = response.data.data;
        dispatch(setCurrentUser(user));
      } catch (err) {
        dispatch(setCheckingAuth(false));
      }
    };
    checkAuth();
  }, [dispatch]);

  return (
    <div>
      <Toaster position="top-right" reverseOrder={false} />
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute allowedRoles={["ORGANIZER"]} />}>
          <Route path="/create-event" element={<CreateEvent />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
