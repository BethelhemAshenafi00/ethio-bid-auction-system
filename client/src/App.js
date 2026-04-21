import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./contexts/AuthContext";

import PublicNav from "./components/PublicNav";
import DashboardNav from "./components/DashboardNav";

// Pages
import ProfileEdit from "./pages/ProfileEdit";
import AuctionList from "./pages/AuctionList";
import Register from "./pages/Register";
import Login from "./pages/Login";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ForgotPassword from "./pages/ForgotPassword";
import CreateAuction from "./pages/CreateAuction";
import AdminDashboard from "./pages/AdminDashboard";
import SellerDashboard from "./pages/SellerDashboard";
import BidderDashboard from "./pages/BidderDashboard";
import AuctionDetails from "./pages/AuctionDetails";
import BiddingHelp from "./pages/BiddingHelp";
import SellingGuide from "./pages/SellingGuide";
import AccountHelp from "./pages/AccountHelp";


// 🔒 Protected Route
function RoleProtectedRoute({ children, allowedRole }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// 📌 Layout wrapper
function AppContent() {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  const publicPaths = [
    "/",
    "/auctions",
    "/login",
    "/register",
    "/about",
    "/contact",
    "/forgot-password",
  ];

  const dashboardPaths = [
    "/admin-dashboard",
    "/seller-dashboard",
    "/bidder-dashboard",
    "/create-auction",
  ];

  const isPublicPage = publicPaths.includes(pathname);
  const isDashboardPage =
    currentUser && dashboardPaths.some((path) => pathname.startsWith(path));

  return (
    <>
      {/* NAVBAR */}
      {isPublicPage && <PublicNav />}
      {isDashboardPage && <DashboardNav />}

      {/* ROUTES */}
      <Routes>
        <Route path="/" element={<AuctionList />} />
        <Route path="/auctions" element={<AuctionList />} />
        <Route path="/auction/:id" element={<AuctionDetails />} />

        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile-edit" element={<ProfileEdit />} />
        <Route path="/help/bidding" element={<BiddingHelp />} />
        <Route path="/help/selling" element={<SellingGuide />} />
        <Route path="/help/account" element={<AccountHelp />} />
        <Route path="/stats" element={<About />} />
        <Route path="/profile-edit" element={<ProfileEdit />} />
    

        {/* DASHBOARDS */}
        <Route
          path="/admin-dashboard"
          element={
            <RoleProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/seller-dashboard"
          element={
            <RoleProtectedRoute allowedRole="seller">
              <SellerDashboard />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/bidder-dashboard"
          element={
            <RoleProtectedRoute allowedRole="bidder">
              <BidderDashboard />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/create-auction"
          element={
            <RoleProtectedRoute allowedRole="seller">
              <CreateAuction />
            </RoleProtectedRoute>
          }
        />

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

// 🚀 MAIN APP
function App() {
  return (
    <Router>
      <AuthProvider>
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-screen">
              Loading...
            </div>
          }
        >
          <AppContent />
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;