import React, { useEffect, useState, useCallback } from "react";
import axios from "../utils/axiosInstance";
import AuctionCard from "../components/AuctionCard";
import { useAuth } from "../contexts/AuthContext";
import io from "socket.io-client";
import { 
  FiPieChart, 
  FiTrendingUp, 
  FiZap, 
  FiCreditCard, 
  FiMenu, 
  FiSearch, 
  FiPackage, 
  FiActivity, 
  FiCheckCircle,
  FiX,
  FiTrash2
} from "react-icons/fi";

const socket = io("http://ethio-bid-auction-system.onrender.com");

function BidderDashboard() {
  const { user } = useAuth();
  const [myBids, setMyBids] = useState([]);
  const [activeAuctions, setActiveAuctions] = useState([]);
  const [wonAuctions, setWonAuctions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({ totalBids: 0, wonAuctions: 0, avgBid: 0, watching: 0 });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [paymentStates, setPaymentStates] = useState({});
  const [selectedSlip, setSelectedSlip] = useState({}); // {paymentId: File}

  /* ======================= DATA FETCHING ======================= */
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [bidsRes, auctionsRes, paymentsRes, wonRes, statsRes] = await Promise.all([
        axios.get("/bidder/bids/my"),
        axios.get("/bidder/active-auctions"),
        axios.get("/payments/my"),
        axios.get("/bidder/won"),
        axios.get("/bidder/stats"),
      ]);

      const bidsData = bidsRes.data?.data || [];
      const auctionsData = auctionsRes.data?.data || [];
      const paymentsData = paymentsRes.data?.data || [];
      const wonData = wonRes.data?.data || [];
      const statsData = statsRes.data?.data || {};

      setMyBids(bidsData);
      setActiveAuctions(auctionsData);
      setPayments(paymentsData);
      setWonAuctions(wonData);
      setStats(statsData);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    // Listener for real-time win notifications
    socket.on("youAreNewWinner", (data) => {
      alert(`🏆 ${data.message}`);
      fetchData(); // Refresh to show new pending payment
    });

    socket.on("paymentRequired", (data) => {
      alert(data.message);
      fetchData(); // Refresh payments list
    });

    return () => {
      socket.off("youAreNewWinner");
      socket.off("paymentRequired");
    };
  }, [fetchData]);

  /* ======================= HANDLERS ======================= */
  const handleBid = async (auctionId, amount) => {
    try {
      await axios.post(`/auctions/${auctionId}/bid`, { amount: Number(amount) });
      fetchData();
    } catch { 
      alert("Bid failed. Check if your bid is high enough."); 
    }
  };

 /* handle delete auction*/
const handleDeleteBidHistory = async (auctionId) => {
  if (!window.confirm("Remove this bid from your history?")) return;

  try {
    await axios.delete(`/bidder/bids/${auctionId}`);

    alert("Bid history removed successfully");

    fetchData(); // refresh list
  } catch (err) {
    alert(err.response?.data?.message || "Failed to remove bid");
  }
};

  const handleSlipUpload = async (paymentId, auctionId) => {
    const file = selectedSlip[paymentId];
    if (!file) {
      alert("Please select a payment slip image first.");
      return;
    }

    const formData = new FormData();
    formData.append("slip", file);

    setPaymentStates(prev => ({...prev, [paymentId]: {...prev[paymentId], loading: true}}));
    try {
      const res = await axios.post(`/payments/${auctionId}/slip`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert(res.data.message || "Slip uploaded! Waiting seller approval.");
      setSelectedSlip(prev => ({...prev, [paymentId]: null}));
      fetchData();
    } catch (err) { 
      alert(err.response?.data?.message || "Upload failed");
    } finally { 
      setPaymentStates(prev => ({...prev, [paymentId]: {...prev[paymentId], loading: false}})); 
    }
  };

  const handleFileSelect = (paymentId, file) => {
    setSelectedSlip(prev => ({...prev, [paymentId]: file}));
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm("Are you sure you want to delete this payment record?")) return;  
    try {
      await axios.delete(`/payments/${paymentId}`);
      alert("Payment record removed");
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete payment");
    }
  };

  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.auction?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  /* ======================= UI COMPONENTS ======================= */
  const NavItem = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => { setActiveTab(id); setMobileOpen(false); }}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        activeTab === id 
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
          : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
    >
      <Icon className="text-lg" />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="flex min-h-screen bg-[#f8fafc] dark:bg-gray-950 transition-colors duration-300">
        
        {mobileOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        )}

        {/* SIDEBAR */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="p-8">
            <div className="flex items-center space-x-3 mb-10">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
                <FiPackage className="text-white text-xl" /> 
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">BidderHub</span>
            </div>
            <nav className="space-y-2">
              <NavItem id="dashboard" label="Dashboard" icon={FiPieChart} />
              <NavItem id="bids" label="My Bids" icon={FiTrendingUp} />
              <NavItem id="auctions" label="Explore" icon={FiZap} />
              <NavItem id="payments" label="Payments" icon={FiCreditCard} />
            </nav>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-200 dark:border-gray-800 p-4 lg:px-8 flex justify-between items-center">
            <div className="flex items-center">
              <button className="lg:hidden mr-4 text-2xl p-2 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white rounded-full" onClick={() => setMobileOpen(true)}>
                <FiMenu />
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{activeTab}</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Verified Bidder</p>
              </div>
            </div>
          </header>

          <main className="p-4 lg:p-8 max-w-7xl mx-auto w-full">
            {error && (
              <div className="mb-6 flex items-center justify-between bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl border border-red-100 dark:border-red-800">
                <p className="font-medium">{error}</p>
                <button onClick={() => setError(null)}><FiX /></button>
              </div>
            )}

            {/* DASHBOARD TAB */}
            {activeTab === "dashboard" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: "Total Bids", val: stats.totalBids, icon: FiActivity, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Won Auctions", val: stats.wonAuctions, icon: FiCheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Avg Bid", val: `ETB ${stats.avgBid}`, icon: FiTrendingUp, color: "text-indigo-600", bg: "bg-indigo-50" },
                    { label: "Watching", val: stats.watching, icon: FiZap, color: "text-amber-600", bg: "bg-amber-50" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                      <div className={`w-12 h-12 ${stat.bg} dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4`}>
                        <stat.icon className={`text-xl ${stat.color}`} />
                      </div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* EXPLORE / BIDS TAB */}
            {(activeTab === "auctions" || activeTab === "bids") && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mt-4">
                {(activeTab === "auctions" ? activeAuctions : myBids).length > 0 ? (
                  (activeTab === "auctions" ? activeAuctions : myBids).map((item) => (
                    <div key={item._id} className="transition-transform hover:-translate-y-1">
                      <AuctionCard 
                        auction={item} 
                        onBid={handleBid} 
                        isBidder={true}
                        myBid={myBids.find(b => b._id === item._id)?.latestBid?.amount}  
                        onDeleteBidHistory={activeTab === "bids" ? ((auctionId) => handleDeleteBidHistory(auctionId.toString())) : null}
                      />
                     
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800">
                    <FiPackage className="mx-auto text-5xl text-gray-300 mb-4" />
                    <p className="text-gray-500">No auctions found here.</p>
                  </div>
                )}
              </div>
            )}

            {/* PAYMENTS TAB */}
            {activeTab === "payments" && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-wrap gap-4 items-center">
                  <div className="relative flex-1 min-w-[200px]">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" placeholder="Search items..." 
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select 
                    className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="slip-uploaded">Slip Uploaded</option>
                  </select>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-[11px] uppercase tracking-widest text-gray-400 font-bold">
                        <th className="px-8 py-5">Auction Item</th>
                        <th className="px-8 py-5">Amount Due</th>
                        <th className="px-8 py-5">Status</th>
                        <th className="px-8 py-5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                      {filteredPayments.map((p) => (
                        <tr key={p._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                          <td className="px-8 py-5 font-bold text-gray-900 dark:text-white">{p.auction?.title}</td>
                          <td className="px-8 py-5 font-bold text-indigo-600 dark:text-indigo-400">ETB {p.amount?.toLocaleString()}</td>
                          <td className="px-8 py-5">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              p.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex justify-end items-center gap-3">
                              {p.status === 'pending' && (
                                <>
                                  <label className="text-xs border rounded-lg p-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white bg-gray-50 cursor-pointer px-2 py-1 hover:bg-gray-100">
                                    📄 Choose Slip
                                    <input 
                                      type="file" 
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => handleFileSelect(p._id, e.target.files[0])}
                                    />
                                  </label>
                                  <button 
                                    onClick={() => handleSlipUpload(p._id, p.auction?._id)}
                                    disabled={paymentStates[p._id]?.loading || !selectedSlip[p._id]}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition disabled:opacity-50 disabled:bg-gray-400"
                                  >
                                    {paymentStates[p._id]?.loading ? 'Uploading...' : 'Submit Slip'}
                                  </button>
                                  {selectedSlip[p._id] && (
                                    <span className="text-xs text-green-600">Selected ✓</span>
                                  )}
                                </>
                              )}
                              <button 
                                onClick={() => handleDeletePayment(p._id)}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredPayments.length === 0 && (
                    <div className="p-20 text-center text-gray-400">No payment history found.</div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default BidderDashboard;