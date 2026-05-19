'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Package, MapPin, User, Phone, Mail, Scale, FileText, Send } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export default function CreateShipment() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    sender_name: '',
    sender_phone: '',
    sender_email: '',
    receiver_name: '',
    receiver_phone: '',
    receiver_email: '',
    pickup_location: '',
    delivery_location: '',
    shipment_type: 'Standard',
    package_weight: '',
    package_description: '',
  })
  const router = useRouter()
  const supabase = createClient()

  const generateTrackingId = () => {
    const prefix = 'LGT'
    const timestamp = Date.now().toString().slice(-8)
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `${prefix}${timestamp}${random}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const trackingId = generateTrackingId()
    const estimatedDelivery = new Date()
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 7)

    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('shipments')
      .insert({
        tracking_id: trackingId,
        sender_name: formData.sender_name,
        sender_phone: formData.sender_phone,
        sender_email: formData.sender_email,
        receiver_name: formData.receiver_name,
        receiver_phone: formData.receiver_phone,
        receiver_email: formData.receiver_email,
        pickup_location: formData.pickup_location,
        delivery_location: formData.delivery_location,
        shipment_type: formData.shipment_type,
        package_weight: parseFloat(formData.package_weight),
        package_description: formData.package_description,
        current_status: 'pending',
        current_location: formData.pickup_location,
        estimated_delivery: estimatedDelivery.toISOString().split('T')[0],
        progress_percentage: 10,
        created_by: user?.id
      })
      .select()
      .single()

    if (error) {
      toast.error('Failed to create shipment: ' + error.message)
    } else {
      // Add initial tracking update
      await supabase
        .from('tracking_updates')
        .insert({
          shipment_id: data.id,
          status: 'pending',
          location: formData.pickup_location,
          description: 'Shipment created and pending pickup',
          updated_by: user?.id
        })

      toast.success(`Shipment created! Tracking ID: ${trackingId}`)
      router.push('/dashboard/admin/shipments')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-navy">Create New Shipment</h1>
        <p className="text-gray-600 mt-1">Fill in the details to create a new shipment</p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-md p-6 space-y-6"
      >
        {/* Sender Information */}
        <div>
          <h2 className="text-xl font-bold text-navy mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-gold" />
            Sender Information
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.sender_name}
                onChange={(e) => setFormData({ ...formData, sender_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-gold focus:outline-none"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.sender_phone}
                onChange={(e) => setFormData({ ...formData, sender_phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-gold focus:outline-none"
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.sender_email}
                onChange={(e) => setFormData({ ...formData, sender_email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-gold focus:outline-none"
                placeholder="john@example.com"
              />
            </div>
          </div>
        </div>

        {/* Receiver Information */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-bold text-navy mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-gold" />
            Receiver Information
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.receiver_name}
                onChange={(e) => setFormData({ ...formData, receiver_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-gold focus:outline-none"
                placeholder="Jane Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.receiver_phone}
                onChange={(e) => setFormData({ ...formData, receiver_phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-gold focus:outline-none"
                placeholder="+1 (555) 987-6543"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.receiver_email}
                onChange={(e) => setFormData({ ...formData, receiver_email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-gold focus:outline-none"
                placeholder="jane@example.com"
              />
            </div>
          </div>
        </div>

        {/* Shipment Details */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-bold text-navy mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-gold" />
            Shipment Details
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location *</label>
              <input
                type="text"
                required
                value={formData.pickup_location}
                onChange={(e) => setFormData({ ...formData, pickup_location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-gold focus:outline-none"
                placeholder="City, State, ZIP"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Location *</label>
              <input
                type="text"
                required
                value={formData.delivery_location}
                onChange={(e) => setFormData({ ...formData, delivery_location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-gold focus:outline-none"
                placeholder="City, State, ZIP"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shipment Type</label>
              <select
                value={formData.shipment_type}
                onChange={(e) => setFormData({ ...formData, shipment_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-gold focus:outline-none"
              >
                <option value="Standard">Standard (5-7 days)</option>
                <option value="Express">Express (2-3 days)</option>
                <option value="Overnight">Overnight (Next day)</option>
                <option value="International">International</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Package Weight (kg) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.package_weight}
                onChange={(e) => setFormData({ ...formData, package_weight: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-gold focus:outline-none"
                placeholder="25.5"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Package Description</label>
              <textarea
                rows={3}
                value={formData.package_description}
                onChange={(e) => setFormData({ ...formData, package_description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-gold focus:outline-none"
                placeholder="Describe the package contents..."
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gold text-navy py-2 rounded-lg font-semibold hover:bg-gold/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Creating...' : 'Create Shipment'}
            <Send className="w-4 h-4" />
          </button>
        </div>
      </motion.form>
    </div>
  )
}