import React, { useState } from "react";

function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
    subject: "",
  });

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    setTimeout(() => {
      setStatus("Message sent successfully! 🚀");
      setForm({ name: "", email: "", message: "", subject: "" });
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-white">

      {/* HERO */}
      <div className="text-center py-20 px-6">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          Get In Touch
        </h1>
        <p className="max-w-2xl mx-auto mt-5 text-lg text-gray-600 dark:text-gray-400">
          Have questions about bidding, selling, or your account?
          <br />
          We’re here to help you anytime.
        </p>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 pb-24">

        {/* LEFT SIDE */}
        <div className="space-y-5">

          {[
            { title: "Email", value: "support@ethiobid.com", color: "text-indigo-500" },
            { title: "Phone", value: "+25187988902", color: "text-emerald-500" },
            { title: "Address", value: "Addis Ababa, Ethiopia", color: "text-purple-500" },
          ].map((item, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition"
            >
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className={`${item.color} mt-1 font-medium`}>
                {item.value}
              </p>
            </div>
          ))}

          {/* QUICK LINKS */}
          <div className="grid gap-3 mt-6">
            <a
              href="/help/bidding"
              className="p-4 rounded-xl text-center bg-indigo-600 hover:bg-indigo-700 transition text-white font-medium shadow"
            >
              Bidding Help
            </a>

            <a
              href="/help/selling"
              className="p-4 rounded-xl text-center bg-emerald-600 hover:bg-emerald-700 transition text-white font-medium shadow"
            >
              Selling Guide
            </a>

            <a
              href="/help/account"
              className="p-4 rounded-xl text-center bg-purple-600 hover:bg-purple-700 transition text-white font-medium shadow"
            >
              Account Help
            </a>
          </div>

        </div>

        {/* FORM */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">

          <h2 className="text-2xl font-bold mb-6 text-center">
            Send a Message
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            {[
              { name: "name", placeholder: "Full Name", type: "text" },
              { name: "email", placeholder: "Email Address", type: "email" },
              { name: "subject", placeholder: "Subject", type: "text" },
            ].map((field, i) => (
              <input
                key={i}
                name={field.name}
                type={field.type}
                placeholder={field.placeholder}
                value={form[field.name]}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            ))}

            <textarea
              name="message"
              rows="5"
              placeholder="Your message..."
              value={form.message}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 transition disabled:opacity-50 shadow-md"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>

          {/* STATUS */}
          {status && (
            <div className="mt-5 p-3 text-center rounded-lg bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium">
              {status}
            </div>
          )}

        </div>
      </div>

      {/* FOOTER */}
      <footer className="text-center py-8 text-sm text-gray-500 border-t border-gray-200 dark:border-gray-800">
        © 2026 EthioBid • Built for modern auction experience
      </footer>

    </div>
  );
}

export default Contact;