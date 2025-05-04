"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";
import { FaSpinner } from "react-icons/fa";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.push("/chat");
      } else {
        router.push("/login");
      }
    }
  }, [isAuthenticated, loading, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">Secret Echo</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">AI-powered messaging app</p>
        <FaSpinner className="animate-spin h-8 w-8 mx-auto text-indigo-600" />
      </div>
    </div>
  );
}
