import React, { useEffect, useState, useCallback } from "react";
import axios from "../utils/axiosInstance";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const [auctions, setAuctions] = useState([]);
  const [activeAuctions, setActiveAuctions] = useState([]);
  const [endedAuctions, setEndedAuctions] = useState([]);
  const [pendingAuctions, setPendingAuctions] = useState([]);
  const [users, setUsers] = useState([]);
  const [bids, setBids] = useState([]);
  const [activity, setActivity] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [activitySearch, setActivitySearch] = useState("");
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalAuctions: 0,
    activeUsers: 0,
    totalRevenue: 0,
    newToday: 0,
  });

  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = useNavigate();
  useAuth();

  
  
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [
        auctionRes,
        usersRes,
        bidsRes,
        activityRes,
        pendingRes,
        paymentsRes,
      ] = await Promise.all([
        axios.get("/admin/auctions/all"),
        axios.get("/admin/users"),
        axios.get("/admin/bids"),
        axios.get("/admin/activity"),
        axios.get("/admin/auctions/pending"),
        axios.get("/admin/payments"),
      ]);

      const allAuctions = auctionRes?.data?.data || [];
      const adminUsers = usersRes?.data?.data || [];
      const regularUsers = adminUsers.filter(user => user.role !== 'admin'); // Hide admins from list
      const pendingAuctionsList = pendingRes?.data?.data || [];
      const allPayments = paymentsRes?.data?.data || [];
      const bidsData = bidsRes?.data?.data || [];
      const activityData = activityRes?.data?.recentActivity || [];

      const now = new Date();
      const active = allAuctions.filter((a) => new Date(a.endTime) > now);
      const ended = allAuctions.filter((a) => new Date(a.endTime) <= now);

      setAuctions(allAuctions);
      setActiveAuctions(active);
      setPendingAuctions(pendingAuctionsList);
      setEndedAuctions(ended);
      setUsers(regularUsers);
      setBids(bidsData);
      setActivity(activityData);
      setPayments(allPayments);

      const totalRevenue = ended.reduce(
        (sum, a) => sum + (a.currentPrice || 0),
        0
      );
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const newTodayCount = allAuctions.filter(
        (a) => new Date(a.createdAt) >= today
      ).length;

      setStats({
        totalAuctions: allAuctions.length,
        activeUsers: regularUsers.length,
        totalRevenue,
        newToday: newTodayCount,
      });
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id) => {
    if (!id) return;
    if (!window.confirm("Delete this auction?")) return;
    try {
      await axios.delete(`/admin/auctions/${id}`);
      setAuctions((prev) => prev.filter((a) => a._id !== id));
      setActiveAuctions((prev) => prev.filter((a) => a._id !== id));
      setEndedAuctions((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete auction");
    }
  };

  const handleApproveUser = async (id) => {
    try {
      await axios.patch(`/users/${id}/approve`);
      setUsers((prev) =>
        prev.map((u) =>
          u._id === id ? { ...u, isApproved: !u.isApproved } : u
        )
      );
    } catch (err) {
      alert("Failed to update user status");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await axios.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user");
    }
  };

  const handleDeletePayment = async (id) => {
    if (!window.confirm("Delete payment record?")) return;
    try {
      await axios.delete(`/admin/payments/${id}`);
      fetchData();
      alert("Payment deleted");
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting payment");
    }
  };

  const confirmAction = (message) => {
  return window.confirm(message);
};

  const handleClearActivity = async () => {
    if (window.confirm("Clear all system logs?")) {
      try {
        await axios.delete(`/admin/activity/clear`);
        fetchData();
      } catch (err) {
        console.error("Failed to clear activity:", err);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium animate-pulse">Initializing System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100">
      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 lg:translate-x-0 lg:static 
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6">
            <div className="flex items-center gap-3 text-indigo-600 mb-8">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
              <h2 className="text-xl font-bold tracking-tight dark:text-white">Admin Core</h2>
            </div>

            <nav className="space-y-1">
              {[
                { key: "dashboard", label: "Dashboard", icon: "📊" },
                { key: "pending", label: "Pending Auctions", icon: "⏳", count: pendingAuctions.length },
                { key: "auctions", label: "Auctions", icon: "📦", count: auctions.length },
                { key: "users", label: "Users List", icon: "👤", count: users.length },
                { key: "bids", label: "Live Bids", icon: "💰", count: bids.length },
                { key: "activity", label: "System Logs", icon: "📈" },
                { key: "payments", label: "Payments", icon: "💳" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all
                  ${activeTab === tab.key 
                    ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                    : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setMobileOpen(false);
                  }}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-lg">{tab.icon}</span>
                    {tab.label}
                  </span>
                  {tab.count !== undefined && (
                    <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-md text-[10px]">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
          <div className="mt-auto p-6 border-t border-gray-100 dark:border-gray-800">
             <button onClick={() => navigate('/')} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-red-500 transition-colors">
               <span>🚪</span> Return to Site
             </button>
          </div>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOP BAR */}
        <header className="h-16 flex items-center justify-between px-8 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg" onClick={() => setMobileOpen(true)}>☰</button>
            <h1 className="text-sm font-bold uppercase tracking-widest text-gray-400">
              Overview / <span className="text-indigo-600">{activeTab}</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex flex-col items-end">
                <span className="text-xs font-bold">Admin Session</span>
                <span className="text-[10px] text-green-500 font-mono">● System Online</span>
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Total Auctions", value: stats.totalAuctions, color: "text-blue-600" },
                  { label: "Active Users", value: stats.activeUsers, color: "text-purple-600" },
                  { label: "Revenue", value: `ETB ${stats.totalRevenue.toLocaleString()}`, color: "text-green-600" },
                  { label: "New Today", value: stats.newToday, color: "text-orange-600" },
                ].map((item, i) => (
                  <div key={i} className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:scale-[1.02] transition-transform">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">{item.label}</p>
                    <p className={`text-2xl font-black ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-indigo-600 rounded-3xl p-8 text-white flex items-center justify-between shadow-xl shadow-indigo-200 dark:shadow-none">
                 <div className="max-w-md">
                    <h2 className="text-2xl font-bold mb-2">Welcome to your Control Center</h2>
                    <p className="text-indigo-100 text-sm">Monitor all platform activities, approve transactions, and manage user permissions from a single interface.</p>
                 </div>
                 <div className="hidden lg:block text-5xl">⚡</div>
              </div>
            </div>
          )}

{activeTab === "pending" && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold">Pending Approval ({pendingAuctions.length})</h3>
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-gray-800/50 text-[10px] uppercase text-gray-400">
                    <tr>
                      <th className="px-6 py-4">Seller & Item</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Created</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                 <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
  {pendingAuctions.map((a) => (
    <tr
      key={a._id}
      className="hover:bg-yellow-50/50 dark:hover:bg-yellow-900/20 transition-colors"
    >
      <td className="px-6 py-4">
        <p className="font-bold">{a.title}</p>
        <p className="text-xs text-gray-500">
          by {a.seller?.name || "Seller"}
        </p>
      </td>

      <td className="px-6 py-4 font-mono text-sm">
        ETB {a.currentPrice?.toLocaleString()}
      </td>

      <td className="px-6 py-4 text-xs text-gray-500">
        {new Date(a.createdAt).toLocaleDateString()}
      </td>

      <td className="px-6 py-4 text-right">
        <div className="flex gap-2">

          {/* APPROVE */}
          <button
            onClick={async () => {
              if (!confirmAction("Approve this auction?")) return;

              try {
                await axios.patch(`/admin/auctions/${a._id}/approve`);
                fetchData();
                alert("✅ Approved & notified seller!");
              } catch (err) {
                alert("Approve failed");
              }
            }}
            className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition"
          >
            ✅ Approve
          </button>

          {/* REJECT */}
          <button
            onClick={async () => {
              if (!confirmAction("Reject this auction?")) return;

              try {
                await axios.patch(`/admin/auctions/${a._id}/reject`);
                fetchData();
                alert("❌ Rejected & seller notified");
              } catch (err) {
                alert("Reject failed");
              }
            }}
            className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition"
          >
            ❌ Reject
          </button>

        </div>
      </td>
    </tr>
  ))}
</tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "auctions" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-xl font-bold">Live Auctions ({activeAuctions.length + endedAuctions.length})</h3>
                <div className="relative w-full sm:w-72">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                  <input
                    type="text"
                    placeholder="Search titles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-gray-800/50 text-[10px] uppercase text-gray-400">
                    <tr>
                      <th className="px-6 py-4">Item Details</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Closing</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {[
                      ...activeAuctions.map(a => ({ ...a, status: "active" })),
                      ...endedAuctions.map(a => ({ ...a, status: "ended" })),
                    ].filter(a => a.title?.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((a) => (
                      <tr key={a._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-sm">{a.title}</p>
                          <p className="text-[10px] text-gray-400 font-mono mt-1">{a._id}</p>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-indigo-600">
                          ETB {a.currentPrice?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">
                          {new Date(a.endTime).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase
                            ${a.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => navigate(`/auction/${a._id}`)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs hover:bg-indigo-600 hover:text-white">View</button>
                            <button onClick={() => handleDelete(a._id)} className="p-2 bg-gray-50 text-gray-600 rounded-lg text-xs hover:bg-red-600 hover:text-white">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}


          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                 <h3 className="text-xl font-bold">User Directory</h3>
                 <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-72 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-sm"
                  />
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-gray-800 text-[10px] uppercase text-gray-400">
                    <tr>
                      <th className="px-6 py-4">Full Name</th>
                      <th className="px-6 py-4">Contact</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Verification</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {users.filter(u => u.name?.toLowerCase().includes(userSearch.toLowerCase())).map((user) => (
                      <tr key={user._id} className="text-sm">
                        <td className="px-6 py-4 font-bold">{user.name}</td>
                        <td className="px-6 py-4 text-gray-500">{user.email}</td>
                        <td className="px-6 py-4 capitalize">{user.role}</td>
                        <td className="px-6 py-4">
                           <div className="flex flex-col gap-1">
                             {user.isApproved ? <span className="text-green-500 text-[10px] font-bold">✓ Approved</span> : <span className="text-yellow-600 text-[10px] font-bold">⚠ Pending</span>}
                             {user.isBlocked && <span className="text-red-500 text-[10px] font-bold">☒ Blocked</span>}
                           </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleApproveUser(user._id)} className={`px-3 py-1 rounded-md text-[10px] font-bold mr-2 ${user.isApproved ? 'bg-gray-100 text-gray-600' : 'bg-green-600 text-white'}`}>
                            {user.isApproved ? "Revoke" : "Approve"}
                          </button>
                          <button onClick={() => handleDeleteUser(user._id)} className="px-3 py-1 bg-red-50 text-red-600 rounded-md text-[10px] font-bold">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "bids" && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
               <div className="p-6 border-b border-gray-100 dark:border-gray-800"><h3 className="font-bold">Live Bid Stream</h3></div>
               <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-gray-800 text-[10px] uppercase text-gray-400">
                    <tr>
                      <th className="px-6 py-4">Target Auction</th>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Timestamp</th>
                      <th className="px-6 py-4">Manage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                    {bids.map((bid, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4 font-bold">{bid.auctionTitle}</td>
                        <td className="px-6 py-4">{bid.bidder?.name || "Anonymous"}</td>
                        <td className="px-6 py-4 text-green-600 font-bold">ETB {bid.amount?.toLocaleString()}</td>
                        <td className="px-6 py-4 text-xs text-gray-400">{new Date(bid.timestamp).toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <button onClick={async () => {
                              if (!window.confirm("Delete this bid?")) return;
                              try { await axios.delete(`/admin/bids/${bid.auctionId}/${bid.bidder?._id}`); fetchData(); } 
                              catch (err) { alert("Failed to delete bid"); }
                          }} className="text-red-500 text-xs hover:underline font-bold">🗑️ Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                 <h3 className="text-xl font-bold">System Events</h3>
                 <button onClick={handleClearActivity} className="text-xs bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold">Clear All Logs</button>
              </div>
              <div className="space-y-3">
                 {activity.map((log, i) => (
                    <div key={i} className="flex items-center gap-4 bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 text-sm">
                       <span className="text-lg">{log.type === "bid" ? "💰" : log.type === "user" ? "👤" : "📦"}</span>
                       <div className="flex-1">
                          <p className="font-bold">{log.action}</p>
                          <p className="text-xs text-gray-400">{log.details}</p>
                       </div>
                       <span className="text-[10px] text-gray-400 font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                 ))}
              </div>
            </div>
          )}

          {activeTab === "payments" && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
               <div className="p-6 border-b dark:border-gray-800 flex justify-between items-center">
                  <h3 className="font-bold">Treasury History</h3>
                  <div className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold">Total: {payments.length}</div>
               </div>
               <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800 text-[10px] uppercase text-gray-400">
                    <tr>
                      <th className="p-6">Client</th>
                      <th className="p-6">Item</th>
                      <th className="p-6">Value</th>
                      <th className="p-6">Status</th>
                      <th className="p-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {payments.map((p) => (
                      <tr key={p._id} className="hover:bg-gray-50/50">
                        <td className="p-6 font-bold">{p.bidder?.name || p.user?.name || "User"}</td>
                        <td className="p-6 text-gray-500">{p.auction?.title || "N/A"}</td>
                        <td className="p-6 font-bold">ETB {p.amount?.toLocaleString()}</td>
                        <td className="p-6">
                           <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${p.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                             {p.status || "Pending"}
                           </span>
                        </td>
                        <td className="p-6 text-right">
                           <div className="flex justify-end gap-2">

                             <button onClick={() => handleDeletePayment(p._id)} className="text-red-500 font-bold hover:underline text-xs">Remove</button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;