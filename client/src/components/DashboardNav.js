import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axiosInstance from "../utils/axiosInstance";

function DashboardNav() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isDark, setIsDark] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const theme = localStorage.theme === 'dark' || (!localStorage.theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDark(theme);
  }, []);

  // Fetch notifications - no deps to prevent duplicates
  const fetchNotifications = useCallback(async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const response = await axiosInstance.get('/notifications/my');
      const data = response.data.data || [];
      // Dedupe by ID
      const uniqueNotifs = Array.from(new Map(data.map(n => [n._id, n])).values());
      setNotifications(uniqueNotifs);
      setNotificationCount(uniqueNotifs.filter(n => !n.read).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Initial load + poll every 30s
  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchNotifications]);

  const markAllRead = async () => {
    try {
      await Promise.all(notifications.filter(n => !n.read).map(n => 
        axiosInstance.patch(`/notifications/${n._id}/read`)
      ));
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark read:', error);
    }
  };

  const toggleDarkMode = () => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark');
      localStorage.theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      setIsDark(!isDark);
    }
  };
  const deleteNotifications = async () => {
    if (!window.confirm("Clear all notifications? This cannot be undone.")) return;
    try {
      await axiosInstance.delete('/notifications/clear');
      setNotifications([]);
      setNotificationCount(0);
    } catch (error) {      console.error('Failed to clear notifications:', error);
    }
  };
  

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
    handleClose();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/auctions?search=${encodeURIComponent(searchValue)}`);
      setSearchOpen(false);
      setSearchValue('');
    }
  };

  const getIcon = (type) => {
    const icons = {
      'BID_PLACED': '🔔',
      'AUCTION_WON': '🎉',
      'PAYMENT_APPROVED': '💰',
      'PAYMENT_REJECTED': '❌',
      'AUCTION_ENDED': '⏰',
      'PAYMENT_REQUEST': '💳',
      'PAYMENT_DETAILS_NEEDED': '🏦',
      'AUCTION_APPROVED': '✅',
      'AUCTION_REJECTED': '🚫'
    };
    return icons[type] || '📢';
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 lg:px-8 py-3">
        {/* Logo */}
        <Link to="#" className="flex items-center gap-2 text-lg font-bold text-indigo-600">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
            E
          </div>
          Dashboard
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 relative"
            >
              🔔
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>

            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 max-h-96 overflow-auto">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Notifications</h3>
                  {notificationCount > 0 && (
                    <button 
                      onClick={markAllRead}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                  {notificationCount === 0 && (
                     <button
                    onClick={deleteNotifications}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Clear all
                  </button>
                  )}

                </div>

                {loading ? (
                  <div className="p-4 text-center text-gray-500">Loading...</div>
                ) : notifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif._id} className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 ${notif.read ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}`}>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center flex-shrink-0">
                          {getIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">{notif.message}</p>
                          {notif.auction && (
                            <p className="text-sm text-gray-500 truncate">Auction: {notif.auction.title}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notif.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Dark mode */}
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:ring-2 hover:ring-indigo-500 transition-all"
          >
            {isDark ? "☀️" : "🌙"}
          </button>

          {/* User */}
          <div className="relative">
            <button
              onClick={handleMenu}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold uppercase">
                {currentUser?.name?.charAt(0) || "U"}
              </div>
            </button>

            {/* Dropdown */}
            {anchorEl && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-50">
                <Link
                  to="/profile-edit"
                  onClick={handleClose}
                  className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 hover:bg-red-100 dark:hover:bg-red-900 text-sm text-red-600"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile search */}
          <button
            className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
            onClick={() => setSearchOpen(true)}
          >
            🔍
          </button>
        </div>
      </div>

      {/* Mobile Search */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/20 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 p-5 rounded-xl shadow-xl">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search..."
                className="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
              />
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
                Go
              </button>
            </form>
            <button
              onClick={() => setSearchOpen(false)}
              className="mt-4 w-full text-sm text-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default DashboardNav;

