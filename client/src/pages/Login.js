import React, { useState } from "react";
import axios from "../utils/axiosInstance";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("/auth/login", form);
      const user = res.data.user;

      if (login(res.data.token, user)) {
        let redirectPath = "/auctions";

        if (user.role === "seller") redirectPath = "/seller-dashboard";
        else if (user.role === "admin") redirectPath = "/admin-dashboard";
        else if (user.role === "bidder") redirectPath = "/bidder-dashboard";

        setStatus(`Welcome back! Redirecting...`);

        setTimeout(() => navigate(redirectPath), 1000);
      }
    } catch (err) {
      setStatus(err.response?.data?.msg || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">

      <div className="w-full max-w-md">

        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Sign In
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Access your dashboard
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6">

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* EMAIL */}
            <div>
              <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email"
                className="w-full p-3 border rounded-lg dark:bg-gray-900"
                required
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="w-full p-3 border rounded-lg dark:bg-gray-900"
                required
              />
            </div>

            {/* FORGOT */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-indigo-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Sign In
            </button>

            {/* STATUS */}
            {status && (
              <p className="text-center text-sm text-gray-700 dark:text-gray-300">
                {status}
              </p>
            )}

          </form>

          {/* REGISTER */}
          <div className="text-center mt-6 text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              Don’t have an account?{" "}
              <Link
                to="/register"
                className="text-indigo-600 font-semibold hover:underline"
              >
                Register
              </Link>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Login;