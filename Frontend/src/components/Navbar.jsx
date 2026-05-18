import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { Ticket, LogOut, User, Menu, X, ChevronDown } from "lucide-react";
import apiRequest from "../utils/apiRequest";
import { logout } from "../features/usersSlice";

const Navbar = () => {
  const { currentUser } = useSelector((state) => state.users);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await apiRequest.post("/users/logout");
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-indigo-600 p-2 rounded-xl group-hover:bg-indigo-700 transition-colors">
              <Ticket className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">
              Smart<span className="text-indigo-600">Event</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              to="/events"
              className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
            >
              Events
            </Link>

            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200">
              {currentUser ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() =>
                      setIsProfileDropdownOpen(!isProfileDropdownOpen)
                    }
                    className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <img
                      src={
                        currentUser.avatar ||
                        "https://png.pngtree.com/png-vector/20220210/ourmid/pngtree-avatar-bussinesman-man-profile-icon-vector-illustration-png-image_4384273.png"
                      }
                      alt={currentUser.username}
                      className="w-9 h-9 rounded-full object-cover border border-gray-200"
                    />
                    <div className="text-left hidden lg:block">
                      <p className="text-sm font-semibold text-gray-900">
                        {currentUser.username}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {currentUser.role?.toLowerCase() || "Customer"}
                      </p>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isProfileDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-2 animate-in fade-in slide-in-from-top-2">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        My Profile
                      </Link>
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-medium transition-colors shadow-sm shadow-indigo-200"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 pt-2 pb-4 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 rounded-xl text-base font-medium text-gray-900 hover:bg-gray-50 transition-colors"
              onClick={toggleMobileMenu}
            >
              Home
            </Link>
            <Link
              to="/events"
              className="block px-3 py-2 rounded-xl text-base font-medium text-gray-900 hover:bg-gray-50 transition-colors"
              onClick={toggleMobileMenu}
            >
              Events
            </Link>

            <div className="border-t border-gray-200 mt-4 pt-4">
              {currentUser ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <img
                      src={
                        currentUser.avatar ||
                        "https://png.pngtree.com/png-vector/20220210/ourmid/pngtree-avatar-bussinesman-man-profile-icon-vector-illustration-png-image_4384273.png"
                      }
                      alt={currentUser.username}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    />
                    <div>
                      <p className="text-base font-medium text-gray-900">
                        {currentUser.username}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        {currentUser.role?.toLowerCase() || "Customer"}
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-base font-medium text-gray-900 hover:bg-gray-50 transition-colors"
                    onClick={toggleMobileMenu}
                  >
                    <User className="w-5 h-5 text-gray-500" />
                    My Profile
                  </Link>
                  <button
                    onClick={() => {
                      toggleMobileMenu();
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-2 px-3">
                  <Link
                    to="/login"
                    className="block w-full text-center py-2.5 rounded-xl font-medium text-gray-900 bg-gray-50 hover:bg-gray-100 transition-colors"
                    onClick={toggleMobileMenu}
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="block w-full text-center py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                    onClick={toggleMobileMenu}
                  >
                    Sign Up
                  </Link>
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
