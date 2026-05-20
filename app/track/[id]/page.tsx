'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { MapPin, Calendar, Package, Truck, CheckCircle, ArrowLeft, Lock } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface ShipmentDetails {
  id: string
  tracking_id: string
  sender_name: string
  receiver_name: string
  receiver_email: string
  pickup_location: string
  delivery_location: string
  shipment_type: string
  package_weight: number
  package_description: string
  current_status: string
  current_location: string
  estimated_delivery: string
  progress_percentage: number
  created_at: string
}

interface TrackingUpdate {
  id: string
  status: string
  location: string
  description: string
  updated_at: string
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-gray-500' },
  picked_up: { label: 'Picked Up', color: 'bg-blue-500' },
  in_transit: { label: 'In Transit', color: 'bg-gold' },
  warehouse: { label: 'At Warehouse', color: 'bg-purple-500' },
  customs: { label: 'Customs Clearance', color: 'bg-orange-500' },
  out_for_delivery: { label: 'Out For Delivery', color: 'bg-green-500' },
  delivered: { label: 'Delivered', color: 'bg-green-600' }
}

export default function TrackingResult({ params }: { params: { id: string } }) {
  const [shipment, setShipment] = useState<ShipmentDetails | null>(null)
  const [updates, setUpdates] = useState<TrackingUpdate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [checkingAuth, setCheckingAuth] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAccess()
  }, [params.id])

  const checkAccess = async () => {
    try {
      // Check if user is logged in
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        console.log('No user found, redirecting to login')
        router.push(`/login?redirect=/track/${params.id}`)
        return
      }

      console.log('Logged in user email:', user.email)

      // Fetch shipment
      const { data: shipmentData, error: shipmentError } = await supabase
        .from('shipments')
        .select('*')
        .eq('tracking_id', params.id)
        .single()

      if (shipmentError || !shipmentData) {
        console.error('Shipment not found:', shipmentError)
        setError('Shipment not found')
        setCheckingAuth(false)
        setLoading(false)
        return
      }

      console.log('Shipment receiver email:', shipmentData.receiver_email)
      console.log('Current user email:', user.email)

      // Check permission - compare emails
      if (shipmentData.receiver_email !== user.email) {
        console.log('Permission denied - emails do not match')
        toast.error('You do not have permission to view this shipment')
        router.push('/dashboard/customer')
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
      setError('')
    } catch (err) {
      console.error('Error in checkAccess:', err)
      setError('An error occurred')
    } finally {
      setCheckingAuth(false)
      setLoading(false)
    }
  }

  if (checkingAuth || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy to-navy/90 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    )
  }

  if (error || !shipment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy to-navy/90 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center max-w-md">
          <Package className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">Shipment Not Found</h2>
          <p className="text-white/70 mt-2">Please check your tracking ID and try again</p>
          <Link href="/track" className="inline-block mt-6 bg-gold text-navy px-6 py-2 rounded-lg font-semibold hover:bg-gold/90">
            Try Again
          </Link>
        </div>
      </div>
    )
  }

  const statusInfo = statusConfig[shipment.current_status] || statusConfig.pending

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy to-navy/90 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/dashboard/customer" 
          className="inline-flex items-center gap-2 text-white/70 hover:text-gold mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Header Card */}
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
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${statusInfo.color} text-white`}>
                {statusInfo.label}
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
                transition={{ duration: 1 }}
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

        {/* Shipment and Package Info */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Shipment Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
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

          {/* Package Info with Description */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
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
              {/* Package Description */}
              {shipment.package_description && (
                <div className="pt-3 mt-2 border-t border-white/10">
                  <p className="text-white/70 text-sm">Package Description</p>
                  <p className="text-white text-sm mt-1 font-medium">
                    {shipment.package_description}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Tracking Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold text-white mb-6">Tracking Timeline</h3>
          <div className="relative">
            {updates.length === 0 ? (
              <div className="text-center text-white/50 py-8">
                <p>No tracking updates yet</p>
              </div>
            ) : (
              updates.map((update, index) => (
                <div key={update.id} className="mb-6 relative">
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
                            {update.status.charAt(0).toUpperCase() + update.status.slice(1).replace(/_/g, ' ')}
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
              ))
            )}
          </div>
        </motion.div>

        {/* Security Note */}
        <div className="mt-6 text-center">
          <p className="text-white/40 text-xs flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" />
            This information is private and only visible to you
          </p>
        </div>
      </div>
    </div>
  )
}