import React from "react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">About Ekart</h1>
        <p className="text-gray-500 max-w-2xl mx-auto text-base leading-relaxed">
          We're a fashion-first e-commerce brand bringing the latest styles in men's, women's, and kids' clothing — straight to your door, across India.
        </p>
      </div>

      {/* Our Story */}
      <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
        <div>
          <h2 className="text-2xl font-bold mb-4">Our Story</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-4">
            Ekart started with a simple idea: make quality fashion accessible to everyone. We believe great style shouldn't come with a huge price tag or a complicated shopping experience.
          </p>
          <p className="text-gray-500 text-sm leading-relaxed">
            From casual everyday wear to occasion-ready outfits, we curate collections that work for real people living real lives — whether you're in Mumbai, Pune, or anywhere across India.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { number: "10,000+", label: "Happy Customers" },
            { number: "500+", label: "Products" },
            { number: "28", label: "States Delivered" },
            { number: "4.8★", label: "Average Rating" },
          ].map(({ number, label }) => (
            <div key={label} className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <p className="text-2xl font-bold text-black">{number}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Values */}
      <div className="mb-20">
        <h2 className="text-2xl font-bold text-center mb-10">Why Choose Us</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              icon: "🚚",
              title: "Fast Delivery",
              desc: "Orders delivered within 3–7 business days, pan-India. Cash on delivery available.",
            },
            {
              icon: "✅",
              title: "Quality Assured",
              desc: "Every product is checked before dispatch. 100% original, no counterfeits.",
            },
            {
              icon: "🔄",
              title: "Easy Returns",
              desc: "Not happy? Return within 7 days — no questions asked, hassle-free process.",
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="border border-gray-200 rounded-lg p-6 text-center hover:shadow-sm transition-shadow">
              <div className="text-4xl mb-4">{icon}</div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center bg-gray-50 border border-gray-200 rounded-xl p-10">
        <h2 className="text-2xl font-bold mb-3">Ready to shop?</h2>
        <p className="text-gray-500 text-sm mb-6">Explore our latest collection and find something you love.</p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/collection"
            className="bg-black text-white px-6 py-2.5 rounded-md text-sm hover:bg-gray-800 transition-colors"
          >
            Browse Collection
          </Link>
          <Link
            to="/contact"
            className="border border-gray-300 px-6 py-2.5 rounded-md text-sm hover:bg-gray-100 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;