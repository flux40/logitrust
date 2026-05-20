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

const statusConfig: Record<string, { label: string; color: string; mobileLabel: string }> = {
  pending: { label: 'Pending', color: 'bg-gray-500', mobileLabel: 'Pending' },
  picked_up: { label: 'Picked Up', color: 'bg-blue-500', mobileLabel: 'Picked' },
  in_transit: { label: 'In Transit', color: 'bg-gold', mobileLabel: 'Transit' },
  warehouse: { label: 'At Warehouse', color: 'bg-purple-500', mobileLabel: 'Warehouse' },
  customs: { label: 'Customs Clearance', color: 'bg-orange-500', mobileLabel: 'Customs' },
  out_for_delivery: { label: 'Out For Delivery', color: 'bg-green-500', mobileLabel: 'Delivery' },
  delivered: { label: 'Delivered', color: 'bg-green-600', mobileLabel: 'Delivered' }
}

const statusSteps = [
  { key: 'pending', label: 'Pending', mobileLabel: 'Pend' },
  { key: 'picked_up', label: 'Picked Up', mobileLabel: 'Pick' },
  { key: 'in_transit', label: 'In Transit', mobileLabel: 'Transit' },
  { key: 'warehouse', label: 'Warehouse', mobileLabel: 'WH' },
  { key: 'out_for_delivery', label: 'Out for Delivery', mobileLabel: 'Delivery' },
  { key: 'delivered', label: 'Delivered', mobileLabel: 'Done' }
]

export default function TrackingResult({ params }: { params: { id: string } }) {
  const [shipment, setShipment] = useState<ShipmentDetails | null>(null)
  const [updates, setUpdates] = useState<TrackingUpdate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [userRole, setUserRole] = useState<string>('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAccess()
  }, [params.id])

  const checkAccess = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        router.push(`/login?redirect=/track/${params.id}`)
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('email', user.email)
        .single()
      
      setUserRole(userData?.role || 'customer')

      const { data: shipmentData, error: shipmentError } = await supabase
        .from('shipments')
        .select('*')
        .eq('tracking_id', params.id)
        .single()

      if (shipmentError || !shipmentData) {
        setError('Shipment not found')
        setCheckingAuth(false)
        setLoading(false)
        return
      }

      if (shipmentData.receiver_email !== user.email) {
        toast.error('You do not have permission to view this shipment')
        router.push('/dashboard/customer')
        return
      }

      setShipment(shipmentData)
      
      const { data: updatesData } = await supabase
        .from('tracking_updates')
        .select('*')
        .eq('shipment_id', shipmentData.id)
        .order('updated_at', { ascending: false })

      setUpdates(updatesData || [])
      setError('')
    } catch (err) {
      console.error('Error:', err)
      setError('An error occurred')
    } finally {
      setCheckingAuth(false)
      setLoading(false)
    }
  }

  const getDashboardLink = () => {
    return userRole === 'admin' ? '/dashboard/admin' : '/dashboard/customer'
  }

  const getCurrentStepIndex = () => {
    if (!shipment) return 0
    const statusOrder = ['pending', 'picked_up', 'in_transit', 'warehouse', 'out_for_delivery', 'delivered']
    return statusOrder.indexOf(shipment.current_status)
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
  const currentStep = getCurrentStepIndex()

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy to-navy/90 py-8 px-4 sm:py-12">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link 
          href={getDashboardLink()} 
          className="inline-flex items-center gap-2 text-white/70 hover:text-gold mb-4 sm:mb-6 transition-colors text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Header Card - Mobile Friendly */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <p className="text-white/70 text-xs sm:text-sm">Tracking ID</p>
              <p className="text-lg sm:text-2xl font-bold text-white font-mono break-all">{shipment.tracking_id}</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-white/70 text-xs sm:text-sm">Current Status</p>
              <span className={`inline-block px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold ${statusInfo.color} text-white`}>
                {statusInfo.label}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Mobile-Friendly Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6"
        >
          {/* Desktop Progress Bar - Hidden on mobile */}
          <div className="hidden sm:block">
            <div className="flex justify-between text-white/70 text-xs sm:text-sm mb-2">
              {statusSteps.map((step) => (
                <span key={step.key} className="text-center flex-1">{step.label}</span>
              ))}
            </div>
            <div className="relative">
              <div className="w-full bg-white/20 rounded-full h-2 sm:h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${shipment.progress_percentage}%` }}
                  transition={{ duration: 1 }}
                  className="bg-gold rounded-full h-2 sm:h-3 relative"
                >
                  <div className="absolute right-0 -top-6 transform translate-x-1/2 hidden sm:block">
                    <div className="bg-gold text-navy text-xs font-bold px-2 py-1 rounded">
                      {shipment.progress_percentage}%
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Mobile Progress Steps - Visible only on mobile */}
          <div className="sm:hidden">
            <div className="flex justify-between mb-3">
              {statusSteps.map((step, index) => (
                <div key={step.key} className="text-center flex-1">
                  <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    index <= currentStep 
                      ? 'bg-gold text-navy' 
                      : 'bg-white/20 text-white/50'
                  }`}>
                    {index + 1}
                  </div>
                  <p className={`text-[10px] mt-1 ${
                    index <= currentStep ? 'text-gold' : 'text-white/50'
                  }`}>
                    {step.mobileLabel}
                  </p>
                </div>
              ))}
            </div>
            <div className="text-center mt-2">
              <span className="bg-gold text-navy text-xs font-bold px-2 py-1 rounded">
                {shipment.progress_percentage}% Complete
              </span>
            </div>
          </div>
        </motion.div>

        {/* Shipment and Package Info - Mobile Friendly Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Shipment Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6"
          >
            <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
              Shipment Details
            </h3>
            <div className="space-y-2 sm:space-y-3">
              <div>
                <p className="text-white/70 text-xs sm:text-sm">From</p>
                <p className="text-white font-medium text-sm sm:text-base break-words">{shipment.pickup_location}</p>
              </div>
              <div>
                <p className="text-white/70 text-xs sm:text-sm">To</p>
                <p className="text-white font-medium text-sm sm:text-base break-words">{shipment.delivery_location}</p>
              </div>
              <div>
                <p className="text-white/70 text-xs sm:text-sm">Current Location</p>
                <p className="text-white font-medium text-sm sm:text-base flex items-center gap-1">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gold" />
                  {shipment.current_location}
                </p>
              </div>
              <div>
                <p className="text-white/70 text-xs sm:text-sm">Estimated Delivery</p>
                <p className="text-white font-medium text-sm sm:text-base flex items-center gap-1">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gold" />
                  {new Date(shipment.estimated_delivery).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Package Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6"
          >
            <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
              Package Info
            </h3>
            <div className="space-y-2 sm:space-y-3">
              <div>
                <p className="text-white/70 text-xs sm:text-sm">Sender</p>
                <p className="text-white font-medium text-sm sm:text-base">{shipment.sender_name}</p>
              </div>
              <div>
                <p className="text-white/70 text-xs sm:text-sm">Receiver</p>
                <p className="text-white font-medium text-sm sm:text-base">{shipment.receiver_name}</p>
              </div>
              <div>
                <p className="text-white/70 text-xs sm:text-sm">Shipment Type</p>
                <p className="text-white font-medium text-sm sm:text-base">{shipment.shipment_type}</p>
              </div>
              <div>
                <p className="text-white/70 text-xs sm:text-sm">Weight</p>
                <p className="text-white font-medium text-sm sm:text-base">{shipment.package_weight} kg</p>
              </div>
              {shipment.package_description && (
                <div className="pt-2 sm:pt-3 mt-1 sm:mt-2 border-t border-white/10">
                  <p className="text-white/70 text-xs sm:text-sm">Package Description</p>
                  <p className="text-white text-xs sm:text-sm mt-1 font-medium break-words">
                    {shipment.package_description}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Tracking Timeline - Mobile Friendly */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6"
        >
          <h3 className="text-base sm:text-lg font-bold text-white mb-4 sm:mb-6">Tracking Timeline</h3>
          <div className="relative">
            {updates.length === 0 ? (
              <div className="text-center text-white/50 py-8">
                <p className="text-sm">No tracking updates yet</p>
              </div>
            ) : (
              updates.map((update, index) => (
                <div key={update.id} className="mb-4 sm:mb-6 relative">
                  {index !== updates.length - 1 && (
                    <div className="absolute left-4 sm:left-5 top-8 sm:top-10 bottom-0 w-px bg-white/20"></div>
                  )}
                  <div className="flex gap-3 sm:gap-4">
                    <div className="relative z-10">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gold/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
                      </div>
                    </div>
                    <div className="flex-1 pb-4 sm:pb-6">
                      <div className="bg-white/5 rounded-lg p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-1 sm:gap-2 mb-2">
                          <h4 className="font-semibold text-white text-sm sm:text-base">
                            {update.status.charAt(0).toUpperCase() + update.status.slice(1).replace(/_/g, ' ')}
                          </h4>
                          <span className="text-xs text-white/50">
                            {new Date(update.updated_at).toLocaleDateString()} {new Date(update.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-white/70 text-xs sm:text-sm">{update.location}</p>
                        {update.description && (
                          <p className="text-white/50 text-xs sm:text-sm mt-1">{update.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Security Note - Mobile Friendly */}
        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-white/40 text-xs flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" />
            This information is private and only visible to you
          </p>
        </div>
      </div>
    </div>
  )
}