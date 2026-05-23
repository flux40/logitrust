'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestRolePage() {
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    checkRole()
  }, [])

  const checkRole = async () => {
    // Check auth user
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)

    if (user) {
      // Check users table
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single()
      setUserData(data)
    }
    setLoading(false)
  }

  const updateToAdmin = async () => {
    if (userData) {
      const { error } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('email', userData.email)
      
      if (error) {
        alert('Error: ' + error.message)
      } else {
        alert('Role updated to admin! Refresh the page.')
        window.location.reload()
      }
    }
  }

  const goToAdmin = () => {
    window.location.href = '/dashboard/admin'
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Role Test</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <h2 className="font-bold mb-2">Auth User:</h2>
        <p>Email: {user?.email || 'Not logged in'}</p>
        <p>User ID: {user?.id || 'N/A'}</p>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <h2 className="font-bold mb-2">Users Table Record:</h2>
        <p>Full Name: {userData?.full_name || 'N/A'}</p>
        <p>Email: {userData?.email || 'N/A'}</p>
        <p>Role: <strong className="text-gold">{userData?.role || 'N/A'}</strong></p>
      </div>

      {userData?.role === 'admin' ? (
        <div className="p-4 bg-green-100 text-green-700 rounded-lg mb-4">
          ✅ You have ADMIN role! Click below to go to admin dashboard.
        </div>
      ) : (
        <div className="p-4 bg-yellow-100 text-yellow-700 rounded-lg mb-4">
          ⚠️ Your role is {userData?.role || 'not set'}. Click "Make Me Admin" to fix.
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={updateToAdmin}
          className="bg-gold text-navy px-4 py-2 rounded-lg font-semibold"
        >
          Make Me Admin
        </button>
        <button
          onClick={goToAdmin}
          className="bg-navy text-white px-4 py-2 rounded-lg font-semibold"
        >
          Go to Admin Dashboard
        </button>
      </div>

      {!user && (
        <div className="mt-4 p-4 bg-blue-100 text-blue-700 rounded-lg">
          <p>You are not logged in. </p>
          <a href="/login" className="text-gold font-semibold">Login here</a>
        </div>
      )}
    </div>
  )
}