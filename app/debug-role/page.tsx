'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DebugRolePage() {
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)

    if (user) {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single()
      setUserData(data)
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug User Role</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <h2 className="font-bold mb-2">Auth User:</h2>
        <pre className="text-sm">{JSON.stringify(user, null, 2)}</pre>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="font-bold mb-2">Users Table Record:</h2>
        <pre className="text-sm">{JSON.stringify(userData, null, 2)}</pre>
      </div>

      {userData?.role === 'admin' ? (
        <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-lg">
          ✅ User has ADMIN role - Should go to /dashboard/admin
        </div>
      ) : (
        <div className="mt-4 p-4 bg-yellow-100 text-yellow-700 rounded-lg">
          ⚠️ User role is {userData?.role || 'not set'} - Will go to /dashboard/customer
        </div>
      )}

      <button
        onClick={() => window.location.href = '/dashboard/admin'}
        className="mt-4 bg-gold text-navy px-4 py-2 rounded-lg"
      >
        Force Go to Admin Dashboard
      </button>
    </div>
  )
}