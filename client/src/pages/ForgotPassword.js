import React, { useState } from "react";
import axios from "../utils/axiosInstance";
import { useNavigate, Link } from "react-router-dom";

function ForgotPassword() {
  const [form, setForm] = useState({ email: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await axios.post("/users/forgot-password", form);

      setMessage("Reset link sent to your email!");

      setTimeout(() => {
        navigate("/login");
      }, 2500);

    } catch (err) {
      setMessage(err.response?.data?.msg || "Error sending reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">

      <div className="w-full max-w-md">

        {/* HEADER */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Forgot Password
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Enter your email to reset your password
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6">

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* EMAIL */}
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
              className="w-full p-3 border rounded-lg dark:bg-gray-900"
              required
            />

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

          </form>

          {/* MESSAGE */}
          {message && (
            <p className="text-center text-sm text-gray-700 dark:text-gray-300 mt-4">
              {message}
            </p>
          )}

          {/* LINKS */}
          <div className="text-center mt-5 text-sm space-y-2">

            <Link to="/login" className="text-indigo-600 font-semibold block">
              Back to Login
            </Link>

            <Link to="/register" className="text-gray-600 dark:text-gray-400">
              Create an account
            </Link>

          </div>

        </div>

      </div>
    </div>
  );
}

export default ForgotPassword;