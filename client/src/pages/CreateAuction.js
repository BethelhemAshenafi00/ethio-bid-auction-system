import React, { useState, useEffect } from "react";
import axios from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function CreateAuction({ editAuction, setEditingAuction, onSuccess }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    startingPrice: "",
    endTime: ""
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);

  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isEditMode = !!editAuction;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImage(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Prefill form for edit mode
  useEffect(() => {
    if (editAuction) {
      setForm({
        title: editAuction.title || "",
        description: editAuction.description || "",
        category: editAuction.category || "",
        startingPrice: editAuction.startingPrice || "",
        endTime: editAuction.endTime ? new Date(editAuction.endTime).toISOString().slice(0, 16) : ""
      });
      setCurrentImage(editAuction.image);
      setPreview(`https://ethio-bid-auction-system.onrender.com${editAuction.image}`);
    }
  }, [editAuction]);

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check seller role upfront
      if (!currentUser || currentUser.role !== "seller") {
        alert("Only sellers can create auctions. Please login as seller or contact admin.");
        navigate("/login");
        setLoading(false);
        return;
      }

      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });

      if (image) {
        formData.append("image", image);
      }

      let response;
      if (isEditMode) {
        response = await axios.put(`/auctions/${editAuction._id}`, formData);
        alert("Auction updated successfully!");
      } else {
        response = await axios.post("/auctions/create", formData);
        alert("Auction created successfully!");
        navigate("/seller-dashboard");
        return;
      }

      // Edit success - refresh list
      if (onSuccess) onSuccess();
      if (setEditingAuction) setEditingAuction(null);

      // Reset form
      setForm({
        title: "",
        description: "",
        category: "",
        startingPrice: "",
        endTime: ""
      });
      setImage(null);
      setPreview(null);

    } catch (err) {
      console.error("Auction Error:", err);
      const errorMsg = err.response?.data?.message || err.response?.data?.msg || "Error saving auction";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (setEditingAuction) setEditingAuction(null);
    // Reset form for create mode
    setForm({
      title: "",
      description: "",
      category: "",
      startingPrice: "",
      endTime: ""
    });
    setImage(null);
    setPreview(null);
    setCurrentImage(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with cancel for edit */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          {isEditMode ? "Edit Auction" : "Create Auction"}
        </h1>
        {isEditMode && (
          <button
            onClick={handleCancel}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium"
          >
            Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current image preview in edit mode */}
        {currentImage && !image && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow">
            <p className="text-sm text-gray-600 mb-2">Current image:</p>
            <img
              src={`https://ethio-bid-auction-system.onrender.com${currentImage}`}
              alt="current"
              className="w-full max-w-md h-64 object-cover rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-2">Upload new image to replace</p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow space-y-4">
          <input
            name="title"
            placeholder="Auction title"
            value={form.title}
            onChange={handleChange}
            className="w-full p-3 rounded-lg border dark:bg-gray-900"
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="w-full p-3 rounded-lg border dark:bg-gray-900"
            rows="4"
            required
          />

          <input
            name="category"
            placeholder="Category"
            value={form.category}
            onChange={handleChange}
            className="w-full p-3 rounded-lg border dark:bg-gray-900"
          />

          <input
            name="startingPrice"
            type="number"
            placeholder="Starting Price"
            value={form.startingPrice}
            onChange={handleChange}
            className="w-full p-3 rounded-lg border dark:bg-gray-900"
            required
          />

          <input
            name="endTime"
            type="datetime-local"
            value={form.endTime}
            onChange={handleChange}
            className="w-full p-3 rounded-lg border dark:bg-gray-900"
            required
          />
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow">
          <label className="block mb-2 font-medium">
            {isEditMode ? "Update Image (optional)" : "Upload Image"}
          </label>

          <input type="file" onChange={handleFileChange} accept="image/*" />

          {preview && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">New image preview:</p>
              <img
                src={preview}
                alt="preview"
                className="w-full max-w-md h-64 object-cover rounded-lg"
              />
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition"
          >
            {loading ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update Auction" : "Create Auction")}
          </button>
          
          {isEditMode && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition"
            >
              Cancel
            </button>
          )}
        </div>

      </form>
    </div>
  );
}

export default CreateAuction;