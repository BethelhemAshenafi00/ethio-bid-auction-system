import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";

function About() {
  const [stats, setStats] = useState({
    activeAuctions: 0,
    totalUsers: 0,
    totalSold: 0,
    uptime: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("/stats");
        const data = res.data?.data || res.data;

        setStats({
          activeAuctions: data?.activeAuctions || 0,
          totalUsers: data?.totalUsers || 0,
          totalSold: data?.totalSold || 0,
          uptime: data?.uptime || 0,
        });
      } catch (error) {
        console.error("Error fetching stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, value, color }) => (
    <div className="p-8 rounded-3xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-xl text-center border border-gray-200 dark:border-gray-700 hover:scale-105 hover:shadow-2xl transition duration-300">
      <h2 className={`text-4xl font-extrabold ${color}`}>
        {value}
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mt-3 text-sm uppercase tracking-wide">
        {title}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen py-20 px-4 bg-gradient-to-br from-indigo-50 via-white to-purple-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">

      <div className="max-w-6xl mx-auto">

        {/* HERO */}
        <div className="text-center mb-20">
          <h1 className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-transparent bg-clip-text">
            EthioBid
          </h1>

          <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Experience the future of online auctions — fast, secure, and built for everyone.
          </p>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          /* STATS */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">

            <StatCard
              title="Active Auctions"
              value={`${stats.activeAuctions}+`}
              color="text-emerald-500"
            />

            <StatCard
              title="Total Users"
              value={`${stats.totalUsers}+`}
              color="text-indigo-500"
            />

            <StatCard
              title="Total Sold"
              value={`ETB ${stats.totalSold}`}
              color="text-purple-500"
            />

            <StatCard
              title="Uptime"
              value={`${stats.uptime}%`}
              color="text-amber-500"
            />

          </div>
        )}

        {/* INFO SECTION */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-12 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 mb-20 text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
            Why Choose EthioBid?
          </h2>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto">
            EthioBid is a modern real-time auction platform that allows users to create listings, 
            bid instantly, and complete secure transactions. The system is built using the 
            MERN stack (MongoDB, Express.js, React.js, Node.js) with Socket.io for real-time 
            updates and modern authentication techniques for security. It delivers a fast, 
            scalable, and transparent bidding experience designed for reliability and performance.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            to="/register"
            className="inline-block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white px-10 py-4 rounded-2xl text-lg font-bold shadow-lg hover:scale-110 hover:shadow-2xl transition duration-300"
          >
            🚀 Start Bidding Now
          </Link>
        </div>

      </div>
    </div>
  );
}

export default About;