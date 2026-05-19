'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Package, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function TrackPage() {
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
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-navy to-navy/90 py-32 px-4">
        <div className="max-w-2xl mx-auto">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-white/70 hover:text-gold mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
            <div className="text-center mb-6">
              <Package className="w-16 h-16 text-gold mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-white">Track Your Shipment</h1>
              <p className="text-white/70 mt-2">
                Enter your tracking ID to get real-time updates
              </p>
            </div>
            
            <form onSubmit={handleTrack} className="space-y-4">
              <input
                type="text"
                placeholder="Enter tracking ID (e.g., LGT123456789)"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-gold transition-colors"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gold text-navy py-3 rounded-lg font-semibold hover:bg-gold/90 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Track Shipment
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-white/50 text-sm">
                Test with: <code className="text-gold font-semibold">LGT123456789</code>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}