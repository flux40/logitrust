"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Package, MapPin, Scale, ArrowRight } from "lucide-react";

export default function Hero() {
  const [formData, setFormData] = useState({
    pickup: "",
    delivery: "",
    weight: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Booking:", formData);
  };

  return (
    <section className="relative min-h-screen flex items-center pt-16">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-navy/90 to-navy/70" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Delivering More Than Packages,{" "}
              <span className="text-gold">We Deliver Trust.</span>
            </motion.h1>
            <motion.p
              className="mt-6 text-white/80 text-lg max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Fast, secure, and reliable logistics solutions across the globe.
              Track your shipment in real-time with our advanced system.
            </motion.p>

            {/* Quick Tracking Input */}
            <motion.div
              className="mt-8 flex gap-3 max-w-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <input
                type="text"
                placeholder="Enter tracking number"
                className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-gold transition-colors"
              />
              <button className="bg-gold text-navy px-6 py-3 rounded-lg font-semibold hover:bg-gold/90 transition-all hover:scale-105">
                Track
              </button>
            </motion.div>
          </motion.div>

          {/* Booking Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-2xl shadow-2xl p-6 md:p-8"
          >
            <h3 className="text-2xl font-bold text-navy mb-6">
              Book Your Shipment
            </h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="flex items-center gap-2 text-navy/70 text-sm font-medium mb-2">
                  <MapPin size={16} />
                  Pick-up Location
                </label>
                <input
                  type="text"
                  placeholder="City, Country"
                  value={formData.pickup}
                  onChange={(e) =>
                    setFormData({ ...formData, pickup: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-gold focus:outline-none transition-colors"
                  required
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-navy/70 text-sm font-medium mb-2">
                  <MapPin size={16} />
                  Delivery Location
                </label>
                <input
                  type="text"
                  placeholder="City, Country"
                  value={formData.delivery}
                  onChange={(e) =>
                    setFormData({ ...formData, delivery: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-gold focus:outline-none transition-colors"
                  required
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-navy/70 text-sm font-medium mb-2">
                  <Scale size={16} />
                  Package Weight (kg)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 25"
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData({ ...formData, weight: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-gold focus:outline-none transition-colors"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gold text-navy py-3 rounded-lg font-semibold hover:bg-gold/90 transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                Book Shipment
                <ArrowRight size={18} />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}