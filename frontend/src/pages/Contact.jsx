import React, { useState } from "react";
import API from "../lib/axios";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setError("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await API.post("/contact", form);
      if (data.success) {
        setSubmitted(true);
        setForm({ name: "", email: "", message: "" });
      } else {
        setError(data.message || "Failed to send message.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-3">Contact Us</h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Questions, feedback, or just want to say hi? We're here for you — usually reply within a few hours.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">

        {/* ── Info ── */}
        <div className="space-y-6">
          {[
            {
              icon: "📍",
              title: "Our Store",
              lines: ["123 Fashion Street", "Mumbai, Maharashtra 400001"],
            },
            {
              icon: "📞",
              title: "Phone",
              lines: ["+91 98765 43210", "Mon–Sat, 10 AM – 6 PM"],
            },
            {
              icon: "✉️",
              title: "Email",
              lines: ["support@sarkar.com", "We reply within 24 hours"],
            },
          ].map(({ icon, title, lines }) => (
            <div key={title} className="flex gap-4">
              <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg text-2xl flex-shrink-0">
                {icon}
              </div>
              <div>
                <h3 className="font-semibold mb-1">{title}</h3>
                {lines.map((l) => (
                  <p key={l} className="text-sm text-gray-500">{l}</p>
                ))}
              </div>
            </div>
          ))}

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-medium mb-1">⏱ Response Time</p>
            <p className="text-sm text-gray-500">
              We typically respond to all queries within 4–8 business hours.
            </p>
          </div>
        </div>

        {/* ── Form ── */}
        <div>
          {submitted ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-green-200 rounded-lg bg-green-50">
              <p className="text-4xl mb-4">✅</p>
              <h3 className="font-semibold text-lg mb-2">Message Sent!</h3>
              <p className="text-gray-500 text-sm mb-6">
                Thanks for reaching out. We'll get back to you soon.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-sm underline text-gray-600 hover:text-black"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Your Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email Address</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="john@example.com"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="How can we help you?"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-2.5 rounded-md hover:bg-gray-800 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;