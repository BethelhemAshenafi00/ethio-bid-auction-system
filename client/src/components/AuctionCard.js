import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

function AuctionCard({
  auction,
  onBid,
  onDelete,
  onEdit,
  onDeleteBidHistory,
  onRequestPayment, // FIX: added missing prop
  isSellerView = false,
}) {
  const [timeLeft, setTimeLeft] = useState("Loading...");
  const [bidAmount, setBidAmount] = useState("");

  const { currentUser } = useAuth();

  const safeAuction = auction || {};
  const safeEndTime = safeAuction.endTime ? new Date(safeAuction.endTime) : null;
  const isActive = safeEndTime && safeEndTime > new Date();

  const userId = currentUser?._id || currentUser?.id;

  useEffect(() => {
    if (!safeEndTime) {
      setTimeLeft("No end time");
      return;
    }

    const timer = setInterval(() => {
      const now = new Date();
      const diff = safeEndTime - now;

      if (diff <= 0) {
        setTimeLeft("Ended");
        clearInterval(timer);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [safeEndTime]);

  const handleBidClick = () => {
    const amount = Number(bidAmount);

    if (!amount || amount <= 0) {
      toast.error("Enter a valid bid amount");
      return;
    }

    if (amount <= safeAuction.currentPrice) {
      toast.error("Bid must be higher than current price");
      return;
    }

    onBid?.(safeAuction._id, amount);
    setBidAmount("");
    toast.success("Bid placed!");
  };

  const handleDelete = () => {
    onDelete?.(safeAuction._id);
    toast.success("Auction deleted");
  };

  const handleEdit = () => {
    onEdit?.(safeAuction);
  };

  if (!safeAuction._id) {
    return (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-64 rounded-xl mb-6" />
    );
  }

  const currentPrice =
    safeAuction.currentPrice || safeAuction.startingPrice || 0;

  const canBid =
    onBid &&
    !isSellerView &&
    currentUser?.role === "bidder" &&
    isActive &&
    safeAuction.seller?._id !== userId;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition p-6">

      {/* IMAGE */}
      <div className="h-56 rounded-xl overflow-hidden mb-4">
        <img
          src={
            safeAuction.image
              ? `https://ethio-bid-auction-system.onrender.com${safeAuction.image}`
              : "/placeholder.jpg"
          }
          alt={safeAuction.title}
          className="w-full h-full object-cover hover:scale-105 transition duration-300"
        />
      </div>

      {/* TITLE */}
      <h3 className="font-bold text-xl mb-2">
        {safeAuction.title || "Untitled Auction"}
      </h3>

      {/* PRICE + TIMER */}
      <div className="flex justify-between items-center mb-3">
        <p className="text-xl font-bold text-green-600">
          Birr {currentPrice.toLocaleString()}
        </p>

        <span className="text-sm text-gray-500 dark:text-gray-300">
          ⏰ {timeLeft}
        </span>
      </div>

      {/* BID INPUT */}
      {canBid && (
        <div className="flex gap-2 mb-4">
          <input
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2 flex-1 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            placeholder={`Min bid: ${currentPrice + 1}`}
          />

          <button
            onClick={handleBidClick}
            disabled={Number(bidAmount) <= currentPrice}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 transition"
          >
            Bid
          </button>
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex gap-2 flex-wrap">

        <Link
          to={`/auction/${safeAuction._id}`}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm flex-1 text-center transition"
        >
          View
        </Link>

        {isSellerView && onEdit && (
          <button
            onClick={handleEdit}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg text-sm transition"
          >
            Edit
          </button>
        )}

        {isSellerView &&
          onRequestPayment &&
          safeAuction.status === "ended" &&
          safeAuction.highestBidder && (
            <button
              onClick={() => onRequestPayment(safeAuction._id)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition"
            >
              💳 Request Payment
            </button>
          )}

        {isSellerView && (
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition"
          >
            Delete
          </button>
        )}

        {onDeleteBidHistory && (
          <button
            onClick={() => onDeleteBidHistory(safeAuction._id)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm transition"
          >
            Delete Bid
          </button>
        )}
      </div>
    </div>
  );
}

export default AuctionCard;