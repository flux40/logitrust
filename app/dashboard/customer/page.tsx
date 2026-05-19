'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Package, Truck, CheckCircle, Clock, MapPin, 
  Calendar, Search, User, Settings, Headphones,
  LogOut, Menu, X, Bell, Filter, ArrowRight
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
  const [user, setUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUserAndLoadData()
    
    // Subscribe to realtime updates
    const subscription = supabase
      .channel('customer-shipments')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'shipments' }, 
        () => {
          fetchShipments()
          toast.info('Shipment updates available!', { duration: 3000 })
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const checkUserAndLoadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    setUser(user)
    await fetchShipments()
    setLoading(false)
  }

  const fetchShipments = async () => {
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching shipments:', error)
    } else {
      setShipments(data || [])
      filterShipments(data || [], searchTerm, statusFilter)
    }
  }

  const filterShipments = (data: Shipment[], search: string, status: string) => {
    let filtered = [...data]
    
    if (search) {
      filtered = filtered.filter(s => 
        s.tracking_id.toLowerCase().includes(search.toLowerCase()) ||
        s.sender_name.toLowerCase().includes(search.toLowerCase()) ||
        s.receiver_name.toLowerCase().includes(search.toLowerCase())
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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Mobile Header */}
      <div className="bg-navy text-white sticky top-0 z-50">
        <div className="px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-gold" />
            <span className="font-bold text-lg">LogiTrust</span>
          </div>
          <button 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-white/10"
            >
              <div className="p-4 space-y-2">
                <button 
                  onClick={() => { setActiveTab('overview'); setShowMobileMenu(false) }}
                  className="w-full text-left px-4 py-3 hover:bg-white/10 rounded-lg transition-colors"
                >
                  Overview
                </button>
                <button 
                  onClick={() => { setActiveTab('shipments'); setShowMobileMenu(false) }}
                  className="w-full text-left px-4 py-3 hover:bg-white/10 rounded-lg transition-colors"
                >
                  My Shipments
                </button>
                <Link href="/dashboard/customer/settings" className="block px-4 py-3 hover:bg-white/10 rounded-lg transition-colors">
                  Settings
                </Link>
                <Link href="/support" className="block px-4 py-3 hover:bg-white/10 rounded-lg transition-colors">
                  Support
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-red-400 hover:bg-white/10 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-navy">
            Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-500 text-sm mt-1">Track and manage your shipments</p>
        </motion.div>

        {/* Stats Cards - Mobile Friendly Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-4 shadow-sm"
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
            className="bg-white rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-2xl font-bold text-navy">{stats.delivered}</span>
            </div>
            <p className="text-xs text-gray-500">Delivered</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <span className="text-2xl font-bold text-navy">{stats.pending}</span>
            </div>
            <p className="text-xs text-gray-500">Pending</p>
          </motion.div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
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
            <button className="p-2 border border-gray-200 rounded-lg">
              <Filter className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          
          {/* Status Filters - Horizontal Scroll */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['all', 'pending', 'picked_up', 'in_transit', 'warehouse', 'out_for_delivery', 'delivered'].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusFilter(status)}
                className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
                  statusFilter === status 
                    ? 'bg-gold text-navy' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {status.replace(/_/g, ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Shipments List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-navy px-1">Your Shipments</h2>
          
          {filteredShipments.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No shipments found</p>
            </div>
          ) : (
            filteredShipments.map((shipment, index) => (
              <motion.div
                key={shipment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-mono text-xs text-gold font-semibold">{shipment.tracking_id}</p>
                    <p className="text-sm font-medium text-navy mt-1">{shipment.shipment_type}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    shipment.current_status === 'delivered' ? 'bg-green-100 text-green-700' :
                    shipment.current_status === 'in_transit' ? 'bg-gold/20 text-gold' :
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
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-gold rounded-full h-1.5 transition-all"
                      style={{ width: `${shipment.progress_percentage}%` }}
                    />
                  </div>
                </div>

                <Link
                  href={`/track/${shipment.tracking_id}`}
                  className="block w-full text-center bg-navy text-white py-2 rounded-lg text-sm font-semibold hover:bg-navy/90 transition-colors"
                >
                  Track Shipment
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="flex justify-around py-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              activeTab === 'overview' ? 'text-gold' : 'text-gray-500'
            }`}
          >
            <Package className="w-5 h-5" />
            <span className="text-xs mt-1">Overview</span>
          </button>
          <button 
            onClick={() => setActiveTab('shipments')}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              activeTab === 'shipments' ? 'text-gold' : 'text-gray-500'
            }`}
          >
            <Truck className="w-5 h-5" />
            <span className="text-xs mt-1">Shipments</span>
          </button>
          <Link 
            href="/dashboard/customer/settings"
            className="flex flex-col items-center p-2 rounded-lg text-gray-500 hover:text-gold transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span className="text-xs mt-1">Settings</span>
          </Link>
          <Link 
            href="/support"
            className="flex flex-col items-center p-2 rounded-lg text-gray-500 hover:text-gold transition-colors"
          >
            <Headphones className="w-5 h-5" />
            <span className="text-xs mt-1">Support</span>
          </Link>
        </div>
      </div>
    </div>
  )
}