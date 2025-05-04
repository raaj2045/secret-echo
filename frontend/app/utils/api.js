"use client";

import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API methods for messages
export const messageApi = {
  // Get all messages
  getMessages: async () => {
    try {
      const response = await api.get("/messages");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
  },
  
  // Send a new message
  sendMessage: async (content) => {
    try {
      const response = await api.post("/messages", { content });
      return response.data.data;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }
};

export default api; 