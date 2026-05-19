'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, LogIn, Package } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard/customer'
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // Get user role and redirect
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('email', user.email)
        .single()
      
      if (userData?.role === 'admin') {
        router.push('/dashboard/admin')
      } else {
        router.push('/dashboard/customer')
      }
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)

    try {
      // Sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        toast.error(authError.message)
        setLoading(false)
        return
      }

      if (!authData.user) {
        toast.error('Login failed')
        setLoading(false)
        return
      }

      // IMPORTANT: Get user role from database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, full_name')
        .eq('email', email)
        .single()

      console.log('User data from DB:', userData) // Debug log

      if (userError) {
        console.error('Error fetching user role:', userError)
        // If no record, create one as customer
        await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: email,
            full_name: email.split('@')[0],
            role: 'customer'
          })
        toast.success('Login successful!')
        router.push('/dashboard/customer')
        setLoading(false)
        return
      }

      toast.success(`Welcome ${userData.full_name || email.split('@')[0]}!`)

      // Redirect based on role
      if (userData?.role === 'admin') {
        console.log('Redirecting to admin dashboard')
        router.push('/dashboard/admin')
      } else {
        console.log('Redirecting to customer dashboard')
        router.push('/dashboard/customer')
      }
      
    } catch (error) {
      console.error('Login error:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy to-navy/90 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Package className="w-12 h-12 text-gold" />
          </div>
          <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
          <p className="text-white/70 text-sm mt-1">Sign in to your account</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-white text-sm font-medium block mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-gold text-sm"
                placeholder="admin@logitrust.com"
                disabled={loading}
              />
            </div>
          </div>
          
          <div>
            <label className="text-white text-sm font-medium block mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-gold text-sm"
                placeholder="••••••••"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? 
                  <EyeOff className="w-4 h-4 text-white/50" /> : 
                  <Eye className="w-4 h-4 text-white/50" />
                }
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded border-white/20 bg-white/10 text-gold" />
              <span className="text-white/70">Remember me</span>
            </label>
            <Link href="/forgot-password" className="text-gold hover:text-gold/80">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold text-navy py-3 rounded-lg font-semibold hover:bg-gold/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
            ) : (
              <>
                Sign In
                <LogIn className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-white/70 text-sm mt-6">
          Don't have an account?{' '}
          <Link href="/register" className="text-gold font-semibold">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-navy" />}>
      <LoginForm />
    </Suspense>
  )
}