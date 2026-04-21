import React from 'react';
import { Link } from 'react-router-dom';

function BiddingHelp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-6 py-12">
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-6">
            Bidding Help
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Everything you need to know to bid confidently and win your favorite items!
          </p>
        </div>

        {/* QUICK LINKS */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Link to="#how-to-bid" className="group p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 dark:border-gray-700">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
              🎯
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600">How to Bid</h3>
            <p className="text-gray-600 dark:text-gray-400">Step-by-step guide to placing your first bid</p>
          </Link>

          <Link to="#payment-methods" className="group p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 dark:border-gray-700">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
              💳
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-emerald-600">Payments</h3>
            <p className="text-gray-600 dark:text-gray-400">Accepted methods and payment process</p>
          </Link>

          <Link to="#winning-auction" className="group p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 dark:border-gray-700">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
              🏆
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-purple-600">Winning</h3>
            <p className="text-gray-600 dark:text-gray-400">What happens when you win</p>
          </Link>
        </div>

        {/* SECTIONS */}
        <div className="space-y-16">

          {/* HOW TO BID */}
          <section id="how-to-bid" className="bg-white dark:bg-gray-800 rounded-3xl p-12 shadow-2xl">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">How to Place a Bid</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <ol className="space-y-6 text-lg">
                <li className="flex items-start space-x-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold mt-0.5">1</span>
                  <div>
                    <h3 className="font-semibold text-xl mb-2">Browse Auctions</h3>
                    <p className="text-gray-600 dark:text-gray-400">Visit the home page and browse live auctions. Use search and filters.</p>
                  </div>
                </li>
                <li className="flex items-start space-x-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold mt-0.5">2</span>
                  <div>
                    <h3 className="font-semibold text-xl mb-2">Click "Place Bid"</h3>
                    <p className="text-gray-600 dark:text-gray-400">On any auction card, click the bid button. Enter amount higher than current.</p>
                  </div>
                </li>
                <li className="flex items-start space-x-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold mt-0.5">3</span>
                  <div>
                    <h3 className="font-semibold text-xl mb-2">Confirm & Win!</h3>
                    <p className="text-gray-600 dark:text-gray-400">Minimum +ETB 5. Real-time updates. You're now highest bidder!</p>
                  </div>
                </li>
              </ol>
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 p-8 rounded-2xl">
                <h4 className="font-bold text-2xl mb-4 text-indigo-900 dark:text-indigo-100">💡 Pro Tips</h4>
                <ul className="space-y-2 text-lg">
                  <li>• Must login as bidder to bid</li>
                  <li>• Auto-status: Ends after endTime</li>
                  <li>• Real-time: Socket.io updates everyone</li>
                  <li>• Min bid: Current + ETB 5</li>
                </ul>
              </div>
            </div>
          </section>

          {/* PAYMENTS */}
          <section id="payment-methods" className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-3xl p-12 shadow-2xl">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Payment Process</h2>
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-6">🏆 After Winning</h3>
                <ol className="space-y-4 text-lg">
                  <li>1. Go to Bidder Dashboard → "My Payments"</li>
                  <li>2. Click "Pay Now" on ended auction</li>
                  <li>3. Choose CBE Birr or Telebirr</li>
                  <li>4. Upload payment slip (proof)</li>
                  <li>5. Seller/Admin approves → Item yours! 🎉</li>
                </ol>
              </div>
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow">
                  <h4 className="font-bold text-xl mb-3">💰 Methods</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl text-emerald-800 dark:text-emerald-200">CBE Birr</div>
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-xl text-orange-800 dark:text-orange-200">Telebirr</div>
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border-l-4 border-yellow-400">
                  <p className="font-semibold mb-2">⚠️ Important</p>
                  <p>Upload clear payment slip. Seller approves within 24h.</p>
                </div>
              </div>
            </div>
          </section>

          {/* WINNING */}
          <section id="winning-auction" className="bg-white dark:bg-gray-800 rounded-3xl p-12 shadow-2xl">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">What Happens When You Win?</h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 rounded-2xl">
                    <span className="text-3xl">🏅</span>
                    <div>
                      <h3 className="font-bold text-xl mb-1">Auction Ends</h3>
                      <p className="text-gray-600 dark:text-gray-400">Highest bidder at endTime wins automatically.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 rounded-2xl">
                    <span className="text-3xl">📧</span>
                    <div>
                      <h3 className="font-bold text-xl mb-1">Get Notified</h3>
                      <p className="text-gray-600 dark:text-gray-400">Email + dashboard notification immediately.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 rounded-2xl">
                    <span className="text-3xl">📦</span>
                    <div>
                      <h3 className="font-bold text-xl mb-1">Contact Seller</h3>
                      <p className="text-gray-600 dark:text-gray-400">Arrange pickup/delivery after payment approval.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-10 rounded-3xl shadow-2xl">
                <h3 className="text-2xl font-bold mb-6">🚀 Quick Start</h3>
                <div className="space-y-4 text-lg">
                  <p><strong>Demo Accounts:</strong></p>
                  <p>seller@test.com / seller123</p>
                  <p>bidder@test.com / bidder123 (create via register)</p>
                  <p>admin@mail.com / admin123</p>
                  <p className="text-indigo-200">Seed more auctions: server/seedAuctions.js</p>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* BACK CTA */}
        <div className="text-center mt-24 py-12">
          <Link 
            to="/" 
            className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            ← Back to Auctions
          </Link>
        </div>

      </div>
    </div>
  );
}

export default BiddingHelp;
