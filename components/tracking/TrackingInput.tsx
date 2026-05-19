"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Package } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TrackingInput() {
  const [trackingId, setTrackingId] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingId.trim()) {
      router.push(`/track/${trackingId}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl shadow-2xl p-8"
    >
      <div className="text-center mb-6">
        <Package className="w-12 h-12 text-gold mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-navy">Track Your Shipment</h2>
        <p className="text-gray-600 mt-2">
          Enter your tracking ID to get real-time updates
        </p>
      </div>

      <form onSubmit={handleTrack} className="flex gap-3">
        <input
          type="text"
          placeholder="Enter tracking ID (e.g., LGT123456789)"
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value)}
          className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:border-gold focus:outline-none transition-colors"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-gold text-navy px-6 py-3 rounded-lg font-semibold hover:bg-gold/90 transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-2"
        >
          <Search className="w-5 h-5" />
          Track
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-gray-500 text-sm">
          Test with: <code className="text-gold font-semibold">LGT123456789</code>
        </p>
      </div>
    </motion.div>
  );
}