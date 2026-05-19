'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Package, MapPin, Clock, CheckCircle, Truck, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Shipment {
  id: string
  tracking_id: string
  sender_name: string
  receiver_name: string
  pickup_location: string
  delivery_location: string
  current_status: string
  progress_percentage: number
  created_at: string
}

export default function CustomerDashboard() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [trackingId, setTrackingId] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    getUserAndShipments()
  }, [])

  const getUserAndShipments = async () => {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setUser(user)

    // Get user's shipments
    const { data } = await supabase
      .from('shipments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (data) {
      setShipments(data)
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleTrack = () => {
    if (trackingId.trim()) {
      router.push(`/track/${trackingId}`)
    }
  }

  const stats = [
    { 
      label: 'Active Shipments', 
      value: shipments.filter(s => s.current_status !== 'delivered').length, 
      icon: Truck, 
      color: 'text-gold' 
    },
    { 
      label: 'Delivered', 
      value: shipments.filter(s => s.current_status === 'delivered').length, 
      icon: CheckCircle, 
      color: 'text-green-500' 
    },
    { 
      label: 'In Transit', 
      value: shipments.filter(s => s.current_status === 'in_transit').length, 
      icon: Package, 
      color: 'text-blue-500' 
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Customer Dashboard</h1>
              <p className="text-white/70 mt-1">Welcome back, {user?.email?.split('@')[0]}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-navy mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`w-10 h-10 ${stat.color} opacity-50`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Track Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-navy to-navy/90 rounded-2xl p-8 mb-8 text-white"
        >
          <h2 className="text-2xl font-bold mb-2">Track Your Shipment</h2>
          <p className="text-white/70 mb-4">Enter your tracking ID to get real-time updates</p>
          <div className="flex gap-3 max-w-md">
            <input
              type="text"
              placeholder="Enter tracking number"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg text-gray-900"
            />
            <button
              onClick={handleTrack}
              className="bg-gold text-navy px-6 py-2 rounded-lg font-semibold hover:bg-gold/90 transition-all"
            >
              Track
            </button>
          </div>
        </motion.div>

        {/* Recent Shipments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-md overflow-hidden"
        >
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-navy">Recent Shipments</h2>
          </div>
          {shipments.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No shipments yet</p>
              <Link href="/" className="text-gold hover:underline mt-2 inline-block">
                Book a shipment
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {shipments.map((shipment) => (
                <div key={shipment.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                      <p className="font-mono text-sm text-gold font-semibold">{shipment.tracking_id}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {shipment.pickup_location}
                        </div>
                        <span>→</span>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {shipment.delivery_location}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        shipment.current_status === 'delivered' ? 'bg-green-100 text-green-700' :
                        shipment.current_status === 'in_transit' ? 'bg-gold/20 text-gold' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {shipment.current_status?.replace('_', ' ').toUpperCase()}
                      </span>
                      <div className="mt-2 w-32 bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-gold rounded-full h-1.5"
                          style={{ width: `${shipment.progress_percentage || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}