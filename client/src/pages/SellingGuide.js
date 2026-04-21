import React from 'react';
import { Link } from 'react-router-dom';

function SellingGuide() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-6 py-12">
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-6">
            Seller's Guide
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            List your items, get bids, and make sales with our simple process.
          </p>
        </div>

        {/* QUICK LINKS */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Link to="#create-listing" className="group p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 dark:border-gray-700">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
              ➕
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-emerald-600">Create Listing</h3>
            <p className="text-gray-600 dark:text-gray-400">How to add your auction</p>
          </Link>

          <Link to="#approval-process" className="group p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 dark:border-gray-700">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
              ✅
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600">Approval</h3>
            <p className="text-gray-600 dark:text-gray-400">Get live in 24 hours</p>
          </Link>

          <Link to="#manage-auctions" className="group p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 dark:border-gray-700">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
              📊
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-purple-600">Dashboard</h3>
            <p className="text-gray-600 dark:text-gray-400">Track bids & payments</p>
          </Link>
        </div>

        {/* SECTIONS */}
        <div className="space-y-16">

          {/* CREATE LISTING */}
          <section id="create-listing" className="bg-white dark:bg-gray-800 rounded-3xl p-12 shadow-2xl">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Create Your Auction</h2>
            
            <div className="grid md:grid-cols-2 gap-12">
              <ol className="space-y-6 text-lg">
                <li className="flex items-start space-x-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold mt-0.5">1</span>
                  <div>
                    <h3 className="font-semibold text-xl mb-2">Register as Seller</h3>
                    <p className="text-gray-600 dark:text-gray-400">Sign up, verify email/phone, get approved (usually instant).</p>
                  </div>
                </li>
                <li className="flex items-start space-x-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold mt-0.5">2</span>
                  <div>
                    <h3 className="font-semibold text-xl mb-2">Click "Create Auction"</h3>
                    <p className="text-gray-600 dark:text-gray-400">Add title, description, photos, starting price, end date.</p>
                  </div>
                </li>
                <li className="flex items-start space-x-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold mt-0.5">3</span>
                  <div>
                    <h3 className="font-semibold text-xl mb-2">Submit for Review</h3>
                    <p className="text-gray-600 dark:text-gray-400">Admin approves within 24h → Live to thousands of bidders!</p>
                  </div>
                </li>
              </ol>
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/30 p-8 rounded-2xl">
                <h4 className="font-bold text-2xl mb-4 text-emerald-900 dark:text-emerald-100">📸 Requirements</h4>
                <ul className="space-y-2 text-lg">
                  <li>• Clear photos (max 5MB)</li>
                  <li>• End time min 24h future</li>
                  <li>• Starting price ETB 10+</li>
                  <li>• Honest description</li>
                </ul>
              </div>
            </div>
          </section>

          {/* APPROVAL */}
          <section id="approval-process" className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl p-12 shadow-2xl">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Approval Process</h2>
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                  <h3 className="text-2xl font-bold mb-4">⏱️ Timeline</h3>
                  <ul className="space-y-3 text-lg">
                    <li>📤 Submit → Pending</li>
                    <li>✅ Approved → LIVE!</li>
                    <li>❌ Rejected → Edit & resubmit</li>
                  </ul>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border-l-4 border-yellow-400">
                  <h4 className="font-semibold mb-2 text-xl">💡 Common Rejections</h4>
                  <p>• Blurry photos • Short duration • Unrealistic price</p>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-6">📧 You'll Receive</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-6 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/50 rounded-2xl text-green-900 dark:text-green-100">
                    <div className="text-2xl mb-2">✅ Approved</div>
                    <p>Auction live! Link included.</p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/50 rounded-2xl text-red-900 dark:text-red-100">
                    <div className="text-2xl mb-2">❌ Rejected</div>
                    <p>Reason + edit instructions.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* MANAGE */}
          <section id="manage-auctions" className="bg-white dark:bg-gray-800 rounded-3xl p-12 shadow-2xl">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Seller Dashboard</h2>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="p-6 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl">
                  <h3 className="font-bold text-xl mb-3">📊 Track Everything</h3>
                  <ul className="space-y-2">
                    <li>• Live bid updates (real-time)</li>
                    <li>• Payment approvals</li>
                    <li>• Winner notifications</li>
                    <li>• Sales analytics</li>
                  </ul>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-6">💰 After Sale</h3>
                <ol className="space-y-4 text-lg bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 p-6 rounded-2xl">
                  <li>1. Bidder uploads payment slip</li>
                  <li>2. Review & approve payment</li>
                  <li>3. Arrange delivery/pickup</li>
                  <li>4. Mark complete</li>
                </ol>
              </div>
            </div>
          </section>

        </div>

        {/* CTA */}
        <div className="text-center mt-24 py-12">
          <Link 
            to="/create-auction" 
            className="inline-flex items-center px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition shadow-xl hover:shadow-2xl transform hover:-translate-y-1 text-lg"
          >
            Start Selling Now ➕
          </Link>
        </div>

      </div>
    </div>
  );
}

export default SellingGuide;

