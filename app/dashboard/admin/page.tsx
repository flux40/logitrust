'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Package, Truck, Users, MessageCircle, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      setUserEmail(user.email || '')

      // Try to get role from users table
      const { data: userData, error } = await supabase
        .from('users')
        .select('role')
        .eq('email', user.email)
        .maybeSingle()  // Use maybeSingle instead of single

      console.log('Admin check - User email:', user.email)
      console.log('Admin check - Role from DB:', userData?.role)
      console.log('Error if any:', error)

      // If no record exists, create one
      if (!userData && !error) {
        console.log('No user record found, creating...')
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
            role: 'customer'
          })
        
        if (insertError) {
          console.error('Error creating user record:', insertError)
        }
        router.push('/dashboard/customer')
        return
      }

      if (userData?.role !== 'admin') {
        console.log('Not admin, redirecting to customer')
        router.push('/dashboard/customer')
        return
      }

      setLoading(false)
    } catch (err) {
      console.error('Error in checkAdmin:', err)
      router.push('/dashboard/customer')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    toast.success('Logged out successfully')
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
      <div className="bg-navy text-white p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-white/70 mt-1">Welcome, {userEmail}!</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <LogOut className="w-4 h-4 inline mr-2" />
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/dashboard/admin/shipments" className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all">
            <Package className="w-8 h-8 text-gold mb-3" />
            <h2 className="font-bold text-navy text-lg">Manage Shipments</h2>
            <p className="text-gray-500 text-sm mt-1">View and manage all shipments</p>
          </Link>
          <Link href="/dashboard/admin/chat" className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all">
            <MessageCircle className="w-8 h-8 text-gold mb-3" />
            <h2 className="font-bold text-navy text-lg">Customer Support</h2>
            <p className="text-gray-500 text-sm mt-1">Reply to customer messages</p>
          </Link>
          <Link href="/dashboard/admin/users" className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all">
            <Users className="w-8 h-8 text-gold mb-3" />
            <h2 className="font-bold text-navy text-lg">Manage Users</h2>
            <p className="text-gray-500 text-sm mt-1">View all registered users</p>
          </Link>
        </div>
      </div>
    </div>
  )
}