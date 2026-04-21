import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function PublicNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobileMenu = () => setMobileOpen(!mobileOpen);

  const closeMobileMenu = () => setMobileOpen(false);

  const toggleDarkMode = () => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark');
      localStorage.theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
  };

  const isDark = typeof window !== 'undefined' && localStorage.theme === 'dark' || (!localStorage.theme && window.matchMedia('(prefers-color-scheme: dark)').matches);

 return (
  <>
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 lg:px-8">

        {/* Logo */}
        <Link to="/" className="flex items-center">
  <img 
    src=".\logo192.png" 
    alt="EthioBid Logo" 
    className="h-16 w-auto rounded-lg mr-2"
  />
</Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-300">
          <Link to="/" className="hover:text-indigo-600">Home</Link>
          <Link to="/about" className="hover:text-indigo-600">About</Link>
          <Link to="/contact" className="hover:text-indigo-600">Contact</Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">

          <Link
            to="/login"
            className="hidden sm:block px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Sign Up
          </Link>

          {/* Dark Mode */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            {isDark ? "🌙" : "☀️"}
          </button>

          {/* Mobile Button */}
          <button
            className="lg:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
            onClick={toggleMobileMenu}
          >
            ☰
          </button>
        </div>
      </div>
    </header>

    {/* Mobile Menu */}
    <div
      className={`fixed inset-0 z-40 bg-white dark:bg-gray-900 transition-transform duration-300 lg:hidden ${
        mobileOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="p-6 flex flex-col gap-6 text-lg font-medium">

        <Link to="/" onClick={closeMobileMenu}>Home</Link>
        <Link to="/about" onClick={closeMobileMenu}>About</Link>
        <Link to="/contact" onClick={closeMobileMenu}>Contact</Link>

        <div className="mt-6 flex flex-col gap-4">
          <Link
            to="/login"
            onClick={closeMobileMenu}
            className="text-center border border-indigo-600 text-indigo-600 py-3 rounded-lg"
          >
            Login
          </Link>

          <Link
            to="/register"
            onClick={closeMobileMenu}
            className="text-center bg-indigo-600 text-white py-3 rounded-lg"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  </>
);
}

export default PublicNav;
