'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Package } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function TrackingInput() {
  const [trackingId, setTrackingId] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault()
    if (trackingId.trim()) {
      router.push(`/track/${trackingId}`)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-lg rounded-2xl p-8"
    >
      <div className="text-center mb-6">
        <Package className="w-12 h-12 text-gold mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white">Track Your Shipment</h3>
        <p className="text-white/70 mt-2">Enter your tracking ID to get real-time updates</p>
      </div>
      
      <form onSubmit={handleTrack} className="flex gap-3">
        <input
          type="text"
          placeholder="Enter tracking ID (e.g., LGT123456789)"
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value)}
          className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-gold"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-gold text-navy px-6 py-3 rounded-lg font-semibold hover:bg-gold/90 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          <Search className="w-5 h-5" />
          Track
        </button>
      </form>
    </motion.div>
  )
}