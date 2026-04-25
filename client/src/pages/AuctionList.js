import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { auctionService } from "../services/auctionService";
import { useAuctions } from "../hooks/useAuctions";
import { io } from "socket.io-client";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import AuctionCard from "../components/AuctionCard";

const socket = io("http://ethio-bid-auction-system.onrender.com");

function AuctionList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAuctions, setFilteredAuctions] = useState([]);
  const { auctions, loading, error, refetch } = useAuctions();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Moved to useAuctions hook
  

    socket.on("bidUpdate", () => refetch());


    return () => socket.off("bidUpdate");
  }, []);

  useEffect(() => {
    if (Array.isArray(auctions)) {
      const filtered = auctions.filter((auction) =>
        auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        auction.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAuctions(filtered);
    } else {
      setFilteredAuctions([]);
    }
  }, [searchTerm, auctions]);

  const placeBid = async (auctionId, currentPrice) => {
    if (!currentUser) {
      toast("Please login to bid", { type: "info" });
      navigate("/login");
      return;
    }

    const amountStr = prompt(`Current: ETB ${currentPrice.toLocaleString()}\nEnter higher bid:`);
    const amount = parseFloat(amountStr);
    if (!amount || amount <= currentPrice) {
      toast.error("Bid must be higher");
      return;
    }

    try {
      await auctionService.bid(auctionId, amount);
      toast.success("Bid placed! 🎉");
    } catch (err) {
      toast.error(err.response?.data?.message || "Bid failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-6 py-12">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-14">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Live Auctions
          </h1>
          <p className="mt-4 text-gray-500 dark:text-gray-400 text-lg">
            Discover, bid, and win amazing items in real-time
          </p>
        </div>

        {/* SEARCH */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Search auctions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-indigo-400 transition"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
        </div>

        {/* STATS BAR */}
        <div className="flex justify-between items-center mb-10 text-sm text-gray-500 dark:text-gray-400">
          <span>{filteredAuctions.length} auctions</span>
         
        </div>

        {/* GRID */}
        {filteredAuctions.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAuctions.map((auction) => (
              <div
                key={auction._id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition transform duration-300"
              >

                <AuctionCard
                  auction={auction}
                />

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              No auctions found
            </h2>
            <p className="text-gray-500 mt-2">
              Try searching or create a new auction
            </p>

           
          </div>
        )}

      </div>
    </div>
  );
}

export default AuctionList;