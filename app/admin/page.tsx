'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    const { data: userData, error } = await supabase
      .from('users')
      .select('role')
      .eq('email', user.email)
      .single()

    console.log('Admin check - User role:', userData?.role)

    if (error || userData?.role !== 'admin') {
      console.log('Not admin, redirecting to customer dashboard')
      router.push('/dashboard/customer')
      return
    }

    setIsAdmin(true)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-navy text-white p-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-white/70">Welcome, Administrator!</p>
      </div>
      <div className="p-6">
        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/dashboard/admin/shipments" className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="font-bold text-navy">Manage Shipments</h2>
            <p className="text-sm text-gray-500 mt-1">View and manage all shipments</p>
          </Link>
          <Link href="/admin/chat" className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="font-bold text-navy">Customer Support</h2>
            <p className="text-sm text-gray-500 mt-1">Reply to customer messages</p>
          </Link>
          <Link href="/dashboard/admin/users" className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="font-bold text-navy">Manage Users</h2>
            <p className="text-sm text-gray-500 mt-1">View all registered users</p>
          </Link>
        </div>
      </div>
    </div>
  )
}