import React from "react";
import { Link } from "react-router-dom";
function Hero() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen bg-[#faf9f6]">
      {/* Text Side — second on mobile, first on desktop */}
      <div className="order-2 lg:order-1 w-full lg:w-1/2 flex items-center justify-center px-6 py-16 sm:px-12 md:px-16 lg:px-10 lg:py-0 lg:overflow-y-auto">
        <div className="text-[#2c2c2a] flex flex-col gap-5 w-full max-w-lg">
          {/* Tag Line */}
          <div className="flex items-center gap-3">
            <span className="w-8 h-[1.5px] bg-[#888780] rounded-full"></span>
            <p className="font-medium text-xs tracking-[0.15em] uppercase text-[#5f5e5a]">
              Our Best Sellers
            </p>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.1] tracking-tight">
            Style That <br />
            <span className="text-[#888780]">Speaks First.</span>
          </h1>

          {/* Subtext */}
          <p className="text-[#888780] text-sm sm:text-base leading-relaxed max-w-sm">
            Curated pieces for the ones who move with intention. Wardrobe
            staples, restocked weekly.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <button className="bg-[#2c2c2a] text-white text-sm font-medium px-6 py-3 sm:px-8 rounded-full hover:bg-[#444441] active:scale-95 transition-all duration-200">
              Shop Now
            </button>
            <Link to="/collection">
              <button className="flex items-center gap-2 text-sm font-medium text-[#2c2c2a] hover:text-[#5f5e5a] transition-colors duration-200 group">
                Explore Collection
                <span className="group-hover:translate-x-1 transition-transform duration-200">
                  →
                </span>
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 sm:gap-10 mt-2 pt-5 border-t border-[#d3d1c7]">
            {[
              ["2k+", "Products"],
              ["4.9★", "Rating"],
              ["Free", "Shipping"],
            ].map(([num, label]) => (
              <div key={label}>
                <p className="text-base sm:text-lg font-semibold text-[#2c2c2a]">
                  {num}
                </p>
                <p className="text-xs text-[#888780] tracking-wide">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Video Side — first on mobile, second on desktop */}
      <div className="order-1 lg:order-2 w-full lg:w-1/2 relative overflow-hidden h-[60vw] sm:h-[45vw] md:h-[35vw] lg:h-full bg-[#e8e5df]">
        <video
          autoPlay
          loop
          muted={true}
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
        >
          <source src="/hero/Tee_sp.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  );
}

export default Hero;
