"use client";

import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Create auth context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from localStorage (client-side only)
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    
    if (storedToken) {
      try {
        // Verify and decode token
        const decoded = jwtDecode(storedToken);
        
        // Check if token is expired
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          // Token expired, logout
          handleLogout();
          toast.error("Session expired. Please login again.");
        } else {
          // Valid token, set auth state
          setToken(storedToken);
          fetchCurrentUser(storedToken);
        }
      } catch (error) {
        console.error("Invalid token:", error);
        handleLogout();
      }
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch current user data
  const fetchCurrentUser = async (authToken) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      
      setUser(response.data.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      setToken(token);
      setUser(user);
      
      toast.success("Registration successful!");
      router.push("/chat");
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.response?.data?.message || "Registration failed. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      setToken(token);
      setUser(user);
      
      toast.success("Login successful!");
      router.push("/chat");
      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "Login failed. Please check your credentials.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  // Check if user is authenticated
  const isAuthenticated = !!token && !!user;

  // Context value
  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    register,
    login,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}; 