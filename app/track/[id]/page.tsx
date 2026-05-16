'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Calendar, Package, Truck, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { StatusConfig } from '@/types'

interface ShipmentDetails {
  tracking_id: string
  sender_name: string
  receiver_name: string
  pickup_location: string
  delivery_location: string
  shipment_type: string
  package_weight: number
  current_status: string
  current_location: string
  estimated_delivery: string
  progress_percentage: number
}

interface TrackingUpdate {
  status: string
  location: string
  description: string
  updated_at: string
}

export default function TrackingPage({ params }: { params: { id: string } }) {
  const [shipment, setShipment] = useState<ShipmentDetails | null>(null)
  const [updates, setUpdates] = useState<TrackingUpdate[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchTrackingData()
  }, [params.id])

  const fetchTrackingData = async () => {
    // Fetch shipment details
    const { data: shipmentData, error: shipmentError } = await supabase
      .from('shipments')
      .select('*')
      .eq('tracking_id', params.id)
      .single()

    if (shipmentError) {
      console.error('Shipment not found')
      setLoading(false)
      return
    }

    setShipment(shipmentData)

    // Fetch tracking updates
    const { data: updatesData } = await supabase
      .from('tracking_updates')
      .select('*')
      .eq('shipment_id', shipmentData.id)
      .order('updated_at', { ascending: false })

    setUpdates(updatesData || [])
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy to-navy/90">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    )
  }

  if (!shipment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy to-navy/90">
        <div className="text-center">
          <Package className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">Shipment Not Found</h2>
          <p className="text-white/70 mt-2">Please check your tracking ID and try again</p>
        </div>
      </div>
    )
  }

  const statusInfo = StatusConfig[shipment.current_status as keyof typeof StatusConfig]

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy to-navy/90 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6"
        >
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <p className="text-white/70 text-sm">Tracking ID</p>
              <p className="text-2xl font-bold text-white font-mono">{shipment.tracking_id}</p>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-sm">Current Status</p>
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                shipment.current_status === 'delivered' ? 'bg-green-500/20 text-green-400' : 'bg-gold/20 text-gold'
              }`}>
                {statusInfo?.label}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6"
        >
          <div className="flex justify-between text-white/70 text-sm mb-2">
            <span>Pending</span>
            <span>Picked Up</span>
            <span>In Transit</span>
            <span>Warehouse</span>
            <span>Out for Delivery</span>
            <span>Delivered</span>
          </div>
          <div className="relative">
            <div className="w-full bg-white/20 rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${shipment.progress_percentage}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="bg-gold rounded-full h-3 relative"
              >
                <div className="absolute right-0 -top-6 transform translate-x-1/2">
                  <div className="bg-gold text-navy text-xs font-bold px-2 py-1 rounded">
                    {shipment.progress_percentage}%
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Shipment Details */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-gold" />
              Shipment Details
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-white/70 text-sm">From</p>
                <p className="text-white font-medium">{shipment.pickup_location}</p>
              </div>
              <div>
                <p className="text-white/70 text-sm">To</p>
                <p className="text-white font-medium">{shipment.delivery_location}</p>
              </div>
              <div>
                <p className="text-white/70 text-sm">Current Location</p>
                <p className="text-white font-medium flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-gold" />
                  {shipment.current_location}
                </p>
              </div>
              <div>
                <p className="text-white/70 text-sm">Estimated Delivery</p>
                <p className="text-white font-medium flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-gold" />
                  {new Date(shipment.estimated_delivery).toLocaleDateString()}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-gold" />
              Package Info
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-white/70 text-sm">Sender</p>
                <p className="text-white font-medium">{shipment.sender_name}</p>
              </div>
              <div>
                <p className="text-white/70 text-sm">Receiver</p>
                <p className="text-white font-medium">{shipment.receiver_name}</p>
              </div>
              <div>
                <p className="text-white/70 text-sm">Shipment Type</p>
                <p className="text-white font-medium">{shipment.shipment_type}</p>
              </div>
              <div>
                <p className="text-white/70 text-sm">Weight</p>
                <p className="text-white font-medium">{shipment.package_weight} kg</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold text-white mb-6">Tracking Timeline</h3>
          <div className="relative">
            {updates.map((update, index) => (
              <div key={index} className="mb-6 relative">
                {index !== updates.length - 1 && (
                  <div className="absolute left-5 top-10 bottom-0 w-px bg-white/20"></div>
                )}
                <div className="flex gap-4">
                  <div className="relative z-10">
                    <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-gold" />
                    </div>
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex justify-between items-start flex-wrap gap-2 mb-2">
                        <h4 className="font-semibold text-white">
                          {update.status.charAt(0).toUpperCase() + update.status.slice(1)}
                        </h4>
                        <span className="text-xs text-white/50">
                          {new Date(update.updated_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-white/70 text-sm">{update.location}</p>
                      {update.description && (
                        <p className="text-white/50 text-sm mt-1">{update.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}