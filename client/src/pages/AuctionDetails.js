import React, { useEffect, useState, useRef } from "react";
import axios from "../utils/axiosInstance";
import { io } from "socket.io-client";
import { useAuth } from "../contexts/AuthContext";
import { useParams, Link } from "react-router-dom";

function AuctionDetails() {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const methodSelectRef = useRef(null);
  const { currentUser } = useAuth();
  
  // Use a ref for the socket to prevent multiple connections on re-render
  const socketRef = useRef(null);

  const fetchAuction = async () => {
    try {
      const res = await axios.get(`/auctions/${id}`);
      setAuction(res.data.data);
    } catch (err) {
      console.error("Error fetching auction details:", err);
    }
  };

  useEffect(() => {
    fetchAuction();
    socketRef.current = io("http://ethio-bid-auction-system.onrender.com");

    //bid updates
    socketRef.current.on("bidUpdate", (updatedAuction) => {
      if (updatedAuction._id === id) {
        setAuction(updatedAuction);
      }
    });

    // winner message
    socketRef.current.on("youAreNewWinner", (data) => {
      if (data.auctionId === id) {
        alert(`🎉 ${data.message}`);
        fetchAuction(); 
      }
    });

    //auction ending event
    socketRef.current.on("auctionWon", (data) => {
      if (data.auctionId === id) {
        alert(`🏆 ${data.message}`);
        fetchAuction();
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off("bidUpdate");
        socketRef.current.off("youAreNewWinner");
        socketRef.current.off("auctionWon");
        socketRef.current.disconnect();
      }
    };
  }, [id]);

  const placeBid = async () => {
    const amount = parseFloat(bidAmount);
    if (!bidAmount || amount <= (auction.currentPrice || 0)) {
      return alert(`Bid must be higher than the current price of ETB ${auction.currentPrice}`);
    }

    try {
      await axios.post(`/auctions/${id}/bid`, {
        amount: amount,
      });

      alert("Bid placed successfully!");
      setBidAmount("");
      fetchAuction();
    } catch (err) {
      alert(err.response?.data?.msg || "Error placing bid");
    }
  };

  const handlePayment = async () => {
    const selectedMethod = methodSelectRef.current?.value || 'telebirr';
    setIsPaying(true);
    try {
      const res = await axios.post(`/payments/${id}/charge`, {
        amount: auction.currentPrice,
        method: selectedMethod
      });

      if (res.data.redirectUrl) {
        const proceed = window.confirm(`Proceed to ${selectedMethod} payment?`);
        if (proceed) {
          window.location.href = res.data.redirectUrl;
        }
      } else {
        alert(`${res.data.message}\nReference: ${res.data.ref}\n\n${res.data.instructions || 'Please follow the instructions to complete payment.'}`);
      }
    } catch (err) {
      alert('Payment initiation failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsPaying(false);
    }
  };

  if (!auction) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="ml-4 text-gray-500 text-lg">Loading auction...</p>
      </div>
    );
  }

  const isActive = new Date(auction.endTime) > new Date();

  const baseStatus =
    auction.status === "pending"
      ? "Pending Approval"
      : auction.status === "rejected"
      ? "Rejected"
      : isActive
      ? "Live"
      : "Ended";

  const statusColor =
    auction.status === "pending"
      ? "bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full"
      : auction.status === "rejected"
      ? "bg-red-100 text-red-700 px-3 py-1 rounded-full"
      : isActive
      ? "bg-green-100 text-green-700 px-3 py-1 rounded-full"
      : "bg-gray-100 text-gray-700 px-3 py-1 rounded-full";

  const recentBids = auction.bids?.slice().reverse().slice(0, 8) || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-6 sm:py-10 px-3 sm:px-6">
      <div className="max-w-6xl mx-auto">

        {/* BACK BUTTON */}
        <Link
          to={currentUser ? `/${currentUser.role}-dashboard` : "/"}
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6 sm:mb-8 font-medium text-sm sm:text-base transition"
        >
          <span className="mr-2">&#8592;</span>Back to {currentUser ? "Dashboard" : "Homepage"}
        </Link>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">

          {/* IMAGE */}
          <div className="rounded-3xl overflow-hidden shadow-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            {auction.image ? (
              <img
                src={`http://ethio-bid-auction-system.onrender.com${auction.image}`}
                alt={auction.title}
                className="w-full h-64 sm:h-80 lg:h-[550px] object-cover"
              />
            ) : (
              <div className="w-full h-64 sm:h-80 lg:h-[550px] bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-500 text-xl">
                📦 No Image Available
              </div>
            )}
          </div>

          {/* DETAILS */}
          <div className="space-y-6">
            <div>
              <span className={`${statusColor} text-xs font-bold uppercase tracking-wider mb-3 inline-block`}>
                {baseStatus}
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
                {auction.title || "Untitled Auction"}
              </h1>
            </div>

            <div className="flex items-baseline gap-4">
              <span className="text-4xl sm:text-5xl font-black text-indigo-600 dark:text-indigo-400">
                ETB {auction.currentPrice?.toLocaleString() || 0}
              </span>
              <span className="text-gray-400 text-sm font-medium">Current Bid</span>
            </div>

            <div className="grid grid-cols-2 gap-6 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <div>
                <p className="text-gray-500 text-xs uppercase font-bold tracking-widest mb-1">Ends At</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {auction.endTime ? new Date(auction.endTime).toLocaleString() : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase font-bold tracking-widest mb-1">Activity</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {auction.bids?.length || 0} Bids • {auction.views || 0} Views
                </p>
              </div>
            </div>

            {/* BIDDING SECTION (IF LIVE) */}
            {isActive && currentUser?.role === "bidder" && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder={`Min Bid: ETB ${(auction.currentPrice + 1).toLocaleString()}`}
                    className="flex-1 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={placeBid}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold transition shadow-lg shadow-indigo-200 dark:shadow-none"
                  >
                    Place Bid
                  </button>
                </div>
              </div>
            )}

            {/* PAY TO WIN (IF ENDED & HIGHEST BIDDER) */}
            {!isActive && currentUser && auction.highestBidder?._id === currentUser._id && (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-3xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 mb-4 flex items-center">
                  <span className="mr-2">🏆</span> You Won! Complete Payment
                </h3>
                <div className="space-y-4">
                  <select 
                    ref={methodSelectRef}
                    className="w-full p-4 border border-emerald-200 dark:border-emerald-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-800 dark:text-white outline-none"
                    defaultValue="telebirr"
                  >
                    <option value="telebirr">🇪🇹 Telebirr</option>
                    <option value="chapa">💳 Chapa (Card/Bank)</option>
                    <option value="cbe">🏦 CBE Transfer</option>
                  </select>
                  <button
                    onClick={handlePayment}
                    disabled={isPaying}
                    className="w-full bg-emerald-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:bg-emerald-700 disabled:opacity-50 transition shadow-lg shadow-emerald-100 dark:shadow-none"
                  >
                    {isPaying ? '⏳ Initializing...' : `Secure Payment: ETB ${auction.currentPrice?.toLocaleString()}`}
                  </button>
                </div>
              </div>
            )}

            {/* AUCTION ENDED STATUS */}
            {!isActive && (
              <div className="bg-gray-100 dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Winner Announcement</h3>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {auction.highestBidder ? (
                    <span>Congratulations to <span className="text-indigo-600">{auction.highestBidder.name}</span></span>
                  ) : "No bids were placed."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* SELLER & DESCRIPTION SECTION */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
               <span className="mr-2">👤</span> Seller Info
            </h2>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-inner">
                {auction.seller?.name?.[0] || "S"}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{auction.seller?.name || "Anonymous Seller"}</h3>
                <p className="text-sm text-gray-500">{auction.seller?.email || "No contact info"}</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
               <span className="mr-2">📝</span> Description
            </h2>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm min-h-[100px]">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {auction.description || "No description provided for this item."}
              </p>
            </div>
          </div>
        </div>

        {/* RECENT BIDS HISTORY */}
        {recentBids.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
               <span className="mr-2">💰</span> Recent Activity
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentBids.map((bid, index) => (
                <div
                  key={bid._id}
                  className={`p-4 rounded-2xl border transition-all ${
                    index === 0 
                    ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800 scale-105" 
                    : "bg-white border-gray-100 dark:bg-gray-900 dark:border-gray-800"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-gray-400 uppercase">{index === 0 ? "Highest" : "Previous"}</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-black">ETB {bid.amount.toLocaleString()}</span>
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{bid.bidder?.name || "Anonymous"}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AuctionDetails;