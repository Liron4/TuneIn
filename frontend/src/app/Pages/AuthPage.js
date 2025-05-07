"use client";
import { useState } from "react";
import Login from "../Components/AuthPage/Login";
import Register from "../Components/AuthPage/Register";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <div className="mb-4 flex justify-center gap-2">
          <button
            className={`px-4 py-2 rounded ${isLogin ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`px-4 py-2 rounded ${!isLogin ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>
        {isLogin ? <Login /> : <Register />}
      </div>
    </div>
  );
}