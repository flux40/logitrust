'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Package, Truck, CheckCircle, Clock, MapPin, 
  Calendar, Search, LogOut, ArrowRight, Menu, X,
  User, Filter, Home, History, Settings
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface Shipment {
  id: string
  tracking_id: string
  sender_name: string
  receiver_name: string
  pickup_location: string
  delivery_location: string
  current_status: string
  current_location: string
  progress_percentage: number
  estimated_delivery: string
  shipment_type: string
  created_at: string
}

export default function CustomerDashboard() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string>('')
  const [userName, setUserName] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUserAndLoadShipments()
  }, [])

  const checkUserAndLoadShipments = async () => {
    try {
      // Get logged in user from Auth
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error('Auth error:', userError)
        router.push('/login')
        return
      }

      if (!user.email) {
        console.error('No email found for user')
        router.push('/login')
        return
      }

      console.log('Logged in user email:', user.email)
      setUserEmail(user.email)
      setUserName(user.user_metadata?.full_name || user.email.split('@')[0])

      // Load shipments where receiver_email matches
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .eq('receiver_email', user.email)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading shipments:', error)
        toast.error('Failed to load shipments')
      } else {
        console.log('Shipments found:', data?.length || 0)
        setShipments(data || [])
        filterShipments(data || [], searchTerm, statusFilter)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const filterShipments = (data: Shipment[], search: string, status: string) => {
    let filtered = [...data]
    
    if (search) {
      filtered = filtered.filter(s => 
        s.tracking_id.toLowerCase().includes(search.toLowerCase())
      )
    }
    
    if (status !== 'all') {
      filtered = filtered.filter(s => s.current_status === status)
    }
    
    setFilteredShipments(filtered)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    filterShipments(shipments, value, statusFilter)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    filterShipments(shipments, searchTerm, status)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    toast.success('Logged out successfully')
  }

  const stats = {
    active: shipments.filter(s => s.current_status !== 'delivered').length,
    delivered: shipments.filter(s => s.current_status === 'delivered').length,
    inTransit: shipments.filter(s => s.current_status === 'in_transit').length,
    pending: shipments.filter(s => s.current_status === 'pending').length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-navy text-white sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Package className="w-6 h-6 text-gold" />
              <div>
                <h1 className="text-lg font-bold">LogiTrust</h1>
                <p className="text-xs text-white/70">Customer Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/dashboard/customer/settings')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors md:hidden"
              >
                {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-white/10 md:hidden"
            >
              <div className="p-4 space-y-2">
                <button 
                  onClick={() => { setActiveTab('overview'); setShowMobileMenu(false) }}
                  className="w-full text-left px-4 py-3 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-3"
                >
                  <Home className="w-4 h-4" />
                  Overview
                </button>
                <button 
                  onClick={() => { setActiveTab('shipments'); setShowMobileMenu(false) }}
                  className="w-full text-left px-4 py-3 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-3"
                >
                  <Package className="w-4 h-4" />
                  My Shipments
                </button>
                <button 
                  onClick={() => { setActiveTab('history'); setShowMobileMenu(false) }}
                  className="w-full text-left px-4 py-3 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-3"
                >
                  <History className="w-4 h-4" />
                  History
                </button>
                <Link 
                  href="/dashboard/customer/settings"
                  className="block px-4 py-3 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-3"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy to-navy/90 text-white px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-bold">
            Welcome back, {userName}!
          </h2>
          <p className="text-white/70 text-sm mt-1">
            Track and manage your shipments in real-time
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <Truck className="w-5 h-5 text-gold" />
              <span className="text-2xl font-bold text-navy">{stats.active}</span>
            </div>
            <p className="text-xs text-gray-500">Active Shipments</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <span className="text-2xl font-bold text-navy">{stats.inTransit}</span>
            </div>
            <p className="text-xs text-gray-500">In Transit</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              <span className="text-2xl font-bold text-navy">{stats.pending}</span>
            </div>
            <p className="text-xs text-gray-500">Pending</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-2xl font-bold text-navy">{stats.delivered}</span>
            </div>
            <p className="text-xs text-gray-500">Delivered</p>
          </motion.div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <div className="flex gap-3 mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by tracking ID..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-gold focus:outline-none"
              />
            </div>
            <button className="p-2 border border-gray-200 rounded-lg hover:border-gold transition-colors">
              <Filter className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          
          {/* Status Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['all', 'pending', 'picked_up', 'in_transit', 'warehouse', 'out_for_delivery', 'delivered'].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusFilter(status)}
                className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
                  statusFilter === status 
                    ? 'bg-gold text-navy' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All' : status.replace(/_/g, ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Shipments List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-navy">Your Shipments</h2>
            <p className="text-xs text-gray-500">{filteredShipments.length} total</p>
          </div>
          
          {filteredShipments.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600">No Shipments Found</h3>
              <p className="text-gray-400 text-sm mt-2">
                {searchTerm ? 'Try a different tracking ID' : 'You don\'t have any shipments yet'}
              </p>
            </div>
          ) : (
            filteredShipments.map((shipment, index) => (
              <motion.div
                key={shipment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-mono text-xs text-gold font-semibold">
                      {shipment.tracking_id}
                    </p>
                    <p className="text-sm font-medium text-navy mt-1">
                      {shipment.shipment_type}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    shipment.current_status === 'delivered' ? 'bg-green-100 text-green-700' :
                    shipment.current_status === 'in_transit' ? 'bg-gold/20 text-gold' :
                    shipment.current_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {shipment.current_status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <MapPin className="w-3 h-3" />
                  <span>{shipment.pickup_location.split(',')[0]}</span>
                  <ArrowRight className="w-3 h-3" />
                  <MapPin className="w-3 h-3" />
                  <span>{shipment.delivery_location.split(',')[0]}</span>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{shipment.progress_percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div 
                      className="bg-gold rounded-full h-2"
                      initial={{ width: 0 }}
                      animate={{ width: `${shipment.progress_percentage}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link
                    href={`/track/${shipment.tracking_id}`}
                    className="flex-1 text-center bg-navy text-white py-2 rounded-xl text-sm font-semibold hover:bg-navy/90 transition-colors"
                  >
                    Track Shipment
                  </Link>
                  <button
                    onClick={() => navigator.clipboard.writeText(shipment.tracking_id)}
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-gold transition-colors"
                  >
                    Copy ID
                  </button>
                </div>

                {shipment.estimated_delivery && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>Est. Delivery: {new Date(shipment.estimated_delivery).toLocaleDateString()}</span>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-navy mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Link
              href="/send-package"
              className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-gold/10 transition-colors group"
            >
              <Package className="w-6 h-6 text-gold mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-navy">Send Package</span>
            </Link>
            <Link
              href="/track"
              className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-gold/10 transition-colors group"
            >
              <Search className="w-6 h-6 text-gold mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-navy">Track Shipment</span>
            </Link>
            <Link
              href="/dashboard/customer/settings"
              className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-gold/10 transition-colors group"
            >
              <User className="w-6 h-6 text-gold mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-navy">Profile Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}