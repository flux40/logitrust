'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Package, TrendingUp, Clock, MessageCircle, Truck, CheckCircle, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface DashboardStats {
  totalShipments: number
  activeShipments: number
  deliveredShipments: number
  totalCustomers: number
  activeConversations: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalShipments: 0,
    activeShipments: 0,
    deliveredShipments: 0,
    totalCustomers: 0,
    activeConversations: 0
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAdminAndFetchStats()
  }, [])

  const checkAdminAndFetchStats = async () => {
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('email', user.email)
      .single()

    if (userData?.role !== 'admin') {
      router.push('/dashboard/customer')
      return
    }

    await fetchStats()
  }

  const fetchStats = async () => {
    // Fetch shipments count
    const { count: totalShipments } = await supabase
      .from('shipments')
      .select('*', { count: 'exact', head: true })

    const { count: activeShipments } = await supabase
      .from('shipments')
      .select('*', { count: 'exact', head: true })
      .neq('current_status', 'delivered')

    const { count: deliveredShipments } = await supabase
      .from('shipments')
      .select('*', { count: 'exact', head: true })
      .eq('current_status', 'delivered')

    const { count: totalCustomers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'customer')

    const { count: activeConversations } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    setStats({
      totalShipments: totalShipments || 0,
      activeShipments: activeShipments || 0,
      deliveredShipments: deliveredShipments || 0,
      totalCustomers: totalCustomers || 0,
      activeConversations: activeConversations || 0
    })
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const statCards = [
    { title: 'Total Shipments', value: stats.totalShipments, icon: Package, color: 'bg-blue-500' },
    { title: 'Active Shipments', value: stats.activeShipments, icon: Truck, color: 'bg-gold' },
    { title: 'Delivered', value: stats.deliveredShipments, icon: CheckCircle, color: 'bg-green-500' },
    { title: 'Total Customers', value: stats.totalCustomers, icon: Users, color: 'bg-purple-500' },
    { title: 'Active Chats', value: stats.activeConversations, icon: MessageCircle, color: 'bg-orange-500' },
  ]

  const quickActions = [
    { title: 'Create Shipment', href: '/dashboard/admin/shipments/create', icon: Package, color: 'bg-gold' },
    { title: 'Manage Shipments', href: '/dashboard/admin/shipments', icon: Truck, color: 'bg-blue-500' },
    { title: 'Customer Support', href: '/admin/chat', icon: MessageCircle, color: 'bg-green-500' },
    { title: 'View Customers', href: '/dashboard/admin/users', icon: Users, color: 'bg-purple-500' },
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
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-white/70 mt-1">Manage shipments, customers, and support</p>
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
        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-navy mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-xl`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-navy mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="bg-white rounded-2xl p-4 text-center hover:shadow-lg transition-all hover:scale-105"
              >
                <div className={`${action.color} w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-navy font-semibold">{action.title}</span>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-md overflow-hidden"
        >
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-navy">Recent Activity</h2>
          </div>
          <div className="p-12 text-center text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Recent activity will appear here</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}