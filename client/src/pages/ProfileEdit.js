import React, { useState, useEffect } from "react";
import axios from "../utils/axiosInstance";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function ProfileEdit() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", phoneNumber: "" });
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (currentUser) {
      setForm({
        name: currentUser.name || "",
        email: currentUser.email || "",
        phoneNumber: currentUser.phoneNumber || ""
      });

      if (currentUser.avatar) {
        setAvatarPreview(currentUser.avatar);
      }
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put("/users/profile", form);
      alert("Profile updated successfully!");
      navigate(`/${currentUser?.role || 'bidder'}-dashboard`); 
    } catch (err) {
      alert(err.response?.data?.msg || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 dark:from-gray-900 dark:to-gray-800 px-4 py-10">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">

        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg shadow hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          ⬅ Back Home
        </button>

        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Edit Profile
        </h1>

        <div /> {/* spacing */}
      </div>

      {/* CONTAINER */}
      <div className="max-w-2xl mx-auto">

        {/* AVATAR */}
        <div className="text-center mb-10">
          <div className="relative inline-block">

            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl ring-4 ring-white/50">

              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-full h-full object-cover rounded-3xl"
                />
              ) : (
                <span className="text-4xl font-black text-white">
                  {form.name?.charAt(0) || "?"}
                </span>
              )}

            </div>

            {/* Upload (UI only for now) */}
            <label className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-white p-2 rounded-xl shadow cursor-pointer hover:scale-105 transition">

              📷
              <input type="file" className="hidden" />

            </label>

          </div>

          <p className="text-gray-500 mt-4">
            Update your profile details
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* NAME */}
            <div>
              <label className="font-semibold text-gray-700 dark:text-gray-200">
                Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full mt-2 px-4 py-3 rounded-xl border dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your name"
                required
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="font-semibold text-gray-700 dark:text-gray-200">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full mt-2 px-4 py-3 rounded-xl border dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* PHONE */}
            <div>
              <label className="font-semibold text-gray-700 dark:text-gray-200">
                Phone Number
              </label>
              <input
                name="phoneNumber"
                type="tel"
                value={form.phoneNumber}
                onChange={handleChange}
                className="w-full mt-2 px-4 py-3 rounded-xl border dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your phone number"
                required
              />
            </div>

            {/* BUTTONS */}
            <div className="flex gap-4 pt-6">

              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {loading ? "Saving..." : "Update Profile"}
              </button>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 py-3 rounded-xl font-semibold"
              >
                Cancel
              </button>

            </div>

          </form>
        </div>

      </div>
    </div>
  );
}

export default ProfileEdit;