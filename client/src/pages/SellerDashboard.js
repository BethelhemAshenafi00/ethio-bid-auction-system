import React, { useEffect, useState, useCallback } from "react";
import axios from "../utils/axiosInstance";
import AuctionCard from "../components/AuctionCard";
import CreateAuction from "./CreateAuction";
import { useAuth } from "../contexts/AuthContext";
import { 
  FiPackage, 
  FiPlusCircle, 
  FiCreditCard, 
  FiMenu, 
  FiRefreshCw,
  FiCheckCircle,
  FiTrash2,
  FiX,
  FiAlertCircle
} from "react-icons/fi";

// Set your backend URL for images if they are stored locally
const API_BASE_URL = "http://ethio-bid-auction-system.onrender.com"; 


function SellerDashboard() {
const [myAuctions, setMyAuctions] = useState([]);
const [liveAuctions, setLiveAuctions] = useState([]);
const [endedAuctions, setEndedAuctions] = useState([]);

  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("my-auctions");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [editingAuction, setEditingAuction] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isDark, setIsDark] = useState(false);

  const { user } = useAuth();

  
  const fetchAuctions = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);

    const res = await axios.get("/seller/auctions");
    const auctions = res.data.data || [];
    console.log("🎯 Seller Dashboard - Loaded auctions:", auctions.length);
    if (auctions.length > 0) console.log("First auction:", auctions[0]);
    
    setMyAuctions(auctions);

    // ✅ SPLIT HERE
    const now = new Date();

    const live = auctions.filter(
      (a) => a.status === "approved" && new Date(a.endTime) > now
    );

    const ended = auctions.filter(
      (a) => a.status === "ended" || a.status === "sold" || new Date(a.endTime) <= now
    );

    setLiveAuctions(live);
    setEndedAuctions(ended);

  } catch (err) {
    setError(err.response?.data?.message || "Failed to load auctions");
  } finally {
    setLoading(false);
  }
}, []);

  const fetchPayments = useCallback(async () => {
    try {
      const res = await axios.get("/seller/payments");
      setPayments(res.data.data || []);
    } catch (err) {
      console.error("Payments error:", err);
    }
  }, []);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  useEffect(() => {
    if (activeTab === "payments") fetchPayments();
  }, [activeTab, fetchPayments]);

  const startEdit = (auction) => {
    setEditingAuction(auction);
    setActiveTab("create");
  };


  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this auction?")) return;
    try {
      await axios.delete(`/auctions/${id}`);
      setMyAuctions((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  // Approve Payment Handler
  const handleApprovePayment = async (paymentId) => {
    if (!window.confirm("Approve this payment? Bidder will receive the item.")) return;

    setActionLoading(paymentId);
    try {
      await axios.patch(`/seller/payments/${paymentId}/approve`);
      await fetchPayments();
      setSelectedPayment(null);
      alert("✅ Payment approved!");
    } catch (err) {
      alert(err.response?.data?.message || "Approve failed");
    } finally {
      setActionLoading(null);
    }
  };

  // Reject Payment Handler
  // Request Payment from winner
  const handleRequestPayment = async (auctionId) => {
    if (!window.confirm("Send payment request to winner?")) return;

    try {
      const res = await axios.post(`/seller/auction/${auctionId}/request-payment`);
      alert(res.data.message);
      fetchAuctions(); // refresh auctions to show payment status
    } catch (err) {
      alert(err.response?.data?.message || "Request failed");
    }
  };

  const handleRejectPayment = async (paymentId) => {
    if (!window.confirm("Reject this payment? Bidder can re-upload new slip.")) return;

    setActionLoading(paymentId);
    try {
      await axios.patch(`/seller/payments/${paymentId}/reject`);
      await fetchPayments();
      setSelectedPayment(null);
      alert("❌ Payment rejected. Bidder notified.");
    } catch (err) {
      alert(err.response?.data?.message || "Reject failed");
    } finally {
      setActionLoading(null);
    }
  };


  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <FiRefreshCw className="animate-spin text-4xl text-indigo-600 mb-4" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  const NavItem = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => { 
        setActiveTab(id); 
        setMobileOpen(false); 
        if(id !== 'create') setEditingAuction(null); 
      }}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        activeTab === id 
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none" 
          : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
      }`}
    >
      <Icon className="text-lg" />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="flex min-h-screen bg-[#f8fafc] dark:bg-gray-950 transition-colors duration-300">
        
        {/* MOBILE OVERLAY */}
        {mobileOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* SIDEBAR */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-r border-gray-100 dark:border-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="p-8">
            <div className="flex items-center space-x-3 mb-10">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <FiPackage className="text-white text-xl" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-950 dark:text-white">Seller Hub</span>
            </div>
            <nav className="space-y-2">
              <NavItem id="my-auctions" label="My Auctions" icon={FiPackage} />
              <NavItem id="create" label="Create Listing" icon={FiPlusCircle} />
              <NavItem id="payments" label="Sales History" icon={FiCreditCard} />
            </nav>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          {/* HEADER */}
          <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-200 dark:border-gray-800 p-4 lg:px-8 flex justify-between items-center">
            <div className="flex items-center">
              <button className="lg:hidden mr-4 text-2xl p-2 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white rounded-full" onClick={() => setMobileOpen(true)}>
                <FiMenu />
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                {activeTab.replace('-', ' ')}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Verified Seller</p>
              </div>
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full flex items-center justify-center font-bold">
                {user?.name?.charAt(0) || 'S'}
              </div>
            </div>
          </header>

          <main className="p-4 lg:p-8 w-full max-w-7xl mx-auto">
            {activeTab === "my-auctions" && (
              myAuctions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {myAuctions.map((auction) => (
                    <div key={auction._id} className="transition-transform duration-200 hover:-translate-y-1">
                      <AuctionCard
                        auction={auction}
                        onDelete={handleDelete}
                        onEdit={startEdit}
                        onRequestPayment={handleRequestPayment}
                        isSellerView
                      />

                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
                  <FiPackage className="text-6xl text-gray-300 dark:text-gray-700 mb-6" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">No auctions listed</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">Ready to sell something? Start here.</p>
                  <button 
                     onClick={() => setActiveTab('create')}
                     className="mt-6 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition"
                  >
                    Post New Auction
                  </button>
                </div>
              )
            )}

            {activeTab === "create" && (
              <div className="max-w-3xl mx-auto">
                <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 text-gray-900 dark:text-white">
                  <CreateAuction
                    onSuccess={() => { fetchAuctions(); setActiveTab('my-auctions'); }}
                    editAuction={editingAuction}
                    setEditingAuction={setEditingAuction}
                  />
                </div>
              </div>
            )}

            {activeTab === "payments" && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden text-gray-900 dark:text-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                        <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Buyer Details</th>
                        <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Item Title</th>
                        <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Final Price</th>
                        <th className="px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Status & Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                      {payments.length > 0 ? (
                        payments.map((p) => (
                          <tr key={p._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                            <td className="px-8 py-5">
                              <p className="font-bold text-gray-900 dark:text-white">{p.bidder?.name || "Anonymous"}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{p.bidder?.email || "No contact info"}</p>
                            </td>
                            <td className="px-8 py-5 text-sm font-medium dark:text-gray-300">
                              {p.auction?.title || "Auction Item"}
                            </td>
                            <td className="px-8 py-5">
                              <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                                ETB {p.amount?.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <div className="flex justify-end items-center space-x-3">
                                {/* Status Badge */}
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${
                                  p.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 
                                  p.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                  p.status === 'declined' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                  {p.status}
                                </span>

                                <button 
                                  onClick={() => setSelectedPayment(p)}
                                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                  View Slip
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="py-20 text-center text-gray-400">
                            <FiCreditCard className="mx-auto text-4xl mb-3 opacity-20" />
                            <p>No sales records found.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
      

      {/* PAYMENT DETAILS & ACTION MODAL */}
      {selectedPayment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold dark:text-white">Payment Verification</h3>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">Order ID: {selectedPayment._id.slice(-8)}</p>
              </div>
              <button onClick={() => setSelectedPayment(null)} className="text-gray-400 hover:text-red-500 transition">
                <FiX size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-4 mb-8 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Buyer</p>
                  <p className="font-bold dark:text-white">{selectedPayment.bidder?.name || "Anonymous"}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Amount Due</p>
                  <p className="text-xl font-black text-indigo-600">ETB {selectedPayment.amount?.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-gray-500 uppercase font-bold flex items-center">
                   <FiPlusCircle className="mr-2" /> Proof of Payment Slip
                </p>
                {selectedPayment.slip ? (
                  <div className="rounded-2xl overflow-hidden border-2 border-gray-100 dark:border-gray-800 bg-gray-50 group relative">
                    <img 
                      src={selectedPayment.slip.startsWith('http') ? selectedPayment.slip : `${API_BASE_URL}${selectedPayment.slip}`} 
                      alt="Payment Slip" 
                      className="w-full h-auto min-h-[300px] object-contain"
                      onError={(e) => { e.target.src = "https://via.placeholder.com/600x400?text=Receipt+Not+Found"; }}
                    />
                  </div>
                ) : (
                  <div className="py-20 bg-gray-100 dark:bg-gray-800 rounded-2xl text-center text-gray-400">
                    <FiCreditCard className="mx-auto text-4xl mb-2 opacity-20" />
                    <p>No receipt image was uploaded by the buyer.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <button 
                onClick={() => setSelectedPayment(null)}
                className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:text-gray-700 transition"
              >
                Cancel
              </button>
              
{(selectedPayment.status === 'proof_uploaded' || selectedPayment.status === 'pending') ? (
                <>
                  <button 
                    disabled={actionLoading === selectedPayment._id}
                    onClick={() => handleRejectPayment(selectedPayment._id)}
                    className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg transition flex items-center space-x-2"
                  >
                    <FiX />
                    <span>Reject</span>
                  </button>
                  <button 
                    disabled={actionLoading === selectedPayment._id}
                    onClick={() => handleApprovePayment(selectedPayment._id)}
                    className="px-8 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg transition flex items-center space-x-2"
                  >
                    <FiCheckCircle />
                    <span>Approve</span>
                  </button>
                </>
              ) : (
                <div className={`px-4 py-2 rounded-lg font-bold text-sm uppercase ${
                  selectedPayment.status === 'paid' ? 'text-emerald-600 bg-emerald-50' : 
                  selectedPayment.status === 'rejected' ? 'text-red-600 bg-red-100' :
                  'text-red-600 bg-red-50'
                }`}>
                  Finalized: {selectedPayment.status}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SellerDashboard;