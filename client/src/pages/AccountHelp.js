import React from 'react';
import { Link } from 'react-router-dom';

function AccountHelp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-6 py-12">
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 bg-clip-text text-transparent mb-6">
            Account Help
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Manage your profile, security, and preferences easily.
          </p>
        </div>

        {/* QUICK LINKS */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Link to="#register-login" className="group p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 dark:border-gray-700">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
              👤
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-purple-600">Sign Up/Login</h3>
            <p className="text-gray-600 dark:text-gray-400">Create & access account</p>
          </Link>

          <Link to="#roles" className="group p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 dark:border-gray-700">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
              🎭
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600">Roles</h3>
            <p className="text-gray-600 dark:text-gray-400">Bidder, Seller, Admin</p>
          </Link>

          <Link to="#profile-security" className="group p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 dark:border-gray-700">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
              🔐
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-rose-600">Security</h3>
            <p className="text-gray-600 dark:text-gray-400">Password & 2FA</p>
          </Link>
        </div>

        {/* SECTIONS */}
        <div className="space-y-16">

          {/* REGISTER/LOGIN */}
          <section id="register-login" className="bg-white dark:bg-gray-800 rounded-3xl p-12 shadow-2xl">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Getting Started</h2>
            
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-bold mb-6">📝 Registration</h3>
                <ol className="space-y-4 text-lg">
                  <li>Email + Phone (Ethiopia format)</li>
                  <li>Choose role: Bidder/Seller</li>
                  <li>Strong password</li>
                  <li>Admin approval (usually fast)</li>
                </ol>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-6">🔑 Login</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Link to="/login" className="p-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-center font-semibold">Login</Link>
                  <Link to="/register" className="p-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition text-center font-semibold">Register</Link>
                </div>
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <p className="font-semibold mb-1">Demo Accounts:</p>
                  <div className="text-sm space-y-1">
                    <p>seller@mail.com / 123</p>
                    <p>bidder@mail.com / 123</p>
                    <p>admin@mail.com / admin123</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ROLES */}
          <section id="roles" className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-3xl p-12 shadow-2xl">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">User Roles</h2>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white p-10 rounded-3xl shadow-2xl">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-2xl font-bold mb-4">Bidder</h3>
                <ul className="space-y-2 text-indigo-100">
                  <li>• Browse auctions</li>
                  <li>• Place bids</li>
                  <li>• Payment dashboard</li>
                  <li>• Bid history</li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 text-white p-10 rounded-3xl shadow-2xl">
                <div className="text-4xl mb-4">🏪</div>
                <h3 className="text-2xl font-bold mb-4">Seller</h3>
                <ul className="space-y-2 text-emerald-100">
                  <li>• Create auctions</li>
                  <li>• Track bids real-time</li>
                  <li>• Approve payments</li>
                  <li>• Sales analytics</li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-gray-500 to-gray-600 text-white p-10 rounded-3xl shadow-2xl">
                <div className="text-4xl mb-4">⚙️</div>
                <h3 className="text-2xl font-bold mb-4">Admin</h3>
                <ul className="space-y-2 text-gray-200">
                  <li>• Approve users/auctions</li>
                  <li>• Monitor all activity</li>
                  <li>• Manage payments</li>
                  <li>• System stats</li>
                </ul>
              </div>
            </div>
          </section>

          {/* SECURITY */}
          <section id="profile-security" className="bg-white dark:bg-gray-800 rounded-3xl p-12 shadow-2xl">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Profile & Security</h2>
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-bold mb-6">✏️ Edit Profile</h3>
                <p className="text-lg mb-6 text-gray-600 dark:text-gray-400">Update name, phone, email, photo via /profile-edit</p>
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-2xl">
                  <h4 className="font-bold mb-2">✅ Saved automatically</h4>
                  <p>Changes reflect everywhere instantly.</p>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-6">🔐 Password</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl">
                    <h4 className="font-semibold mb-1">Forgot Password?</h4>
                    <p className="text-sm">Use /forgot-password → Email link → Reset</p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                    <h4 className="font-semibold mb-1">2FA Coming Soon</h4>
                    <p className="text-sm">SMS verification for login & payments</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* BACK CTA */}
        <div className="text-center mt-24 py-12">
          <Link 
            to="/contact" 
            className="inline-flex items-center px-8 py-4 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700 transition shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            Contact Support →
          </Link>
        </div>

      </div>
    </div>
  );
}

export default AccountHelp;

