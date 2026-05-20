'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  User, Phone, Mail, MapPin, Package, Scale, 
  Calendar, AlertCircle, Send, ArrowLeft, Building,
  FileText, DollarSign, Shield
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export default function SendPackagePage() {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    // Sender Info
    sender_name: '',
    sender_phone: '',
    sender_email: '',
    sender_address: '',
    sender_city: '',
    sender_zip: '',
    
    // Receiver Info
    receiver_name: '',
    receiver_phone: '',
    receiver_email: '',
    receiver_address: '',
    receiver_city: '',
    receiver_zip: '',
    
    // Package Info
    weight: '',
    length: '',
    width: '',
    height: '',
    shipment_type: 'Standard',
    package_description: '',
    declared_value: '',
    is_fragile: false,
    signature_required: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const trackingId = `LGT${Date.now().toString().slice(-8)}${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    
    const estimatedDelivery = new Date()
    if (formData.shipment_type === 'Overnight') {
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 1)
    } else if (formData.shipment_type === 'Express') {
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 2)
    } else {
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 7)
    }

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('shipments')
      .insert({
        tracking_id: trackingId,
        sender_name: formData.sender_name,
        sender_phone: formData.sender_phone,
        sender_email: formData.sender_email,
        receiver_name: formData.receiver_name,
        receiver_phone: formData.receiver_phone,
        receiver_email: formData.receiver_email,
        pickup_location: `${formData.sender_address}, ${formData.sender_city}, ${formData.sender_zip}`,
        delivery_location: `${formData.receiver_address}, ${formData.receiver_city}, ${formData.receiver_zip}`,
        shipment_type: formData.shipment_type,
        package_weight: parseFloat(formData.weight),
        package_description: formData.package_description,
        current_status: 'pending',
        current_location: `${formData.sender_city}`,
        estimated_delivery: estimatedDelivery.toISOString().split('T')[0],
        progress_percentage: 10,
        created_by: user?.id
      })

    if (error) {
      toast.error('Failed to create shipment: ' + error.message)
    } else {
      toast.success(`Shipment created! Tracking ID: ${trackingId}`)
      router.push(`/track/${trackingId}`)
    }
    setLoading(false)
  }

  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-navy text-white sticky top-0 z-50">
        <div className="px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1 hover:bg-white/10 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Send a Package</h1>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="flex justify-around py-3">
          {['Sender Info', 'Receiver Info', 'Package Details'].map((label, index) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step > index + 1 ? 'bg-green-500 text-white' :
                step === index + 1 ? 'bg-gold text-navy' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > index + 1 ? '✓' : index + 1}
              </div>
              <span className={`text-xs ${step === index + 1 ? 'text-gold font-semibold' : 'text-gray-500'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit}>
          {/* Step 1: Sender Information */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h2 className="text-lg font-bold text-navy mb-4">Who is sending this package?</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.sender_name}
                    onChange={(e) => setFormData({ ...formData, sender_name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:border-gold focus:outline-none"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.sender_phone}
                      onChange={(e) => setFormData({ ...formData, sender_phone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:border-gold focus:outline-none"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={formData.sender_email}
                      onChange={(e) => setFormData({ ...formData, sender_email: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:border-gold focus:outline-none"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.sender_address}
                    onChange={(e) => setFormData({ ...formData, sender_address: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:border-gold focus:outline-none"
                    placeholder="123 Main St"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.sender_city}
                    onChange={(e) => setFormData({ ...formData, sender_city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-gold focus:outline-none"
                    placeholder="New York"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.sender_zip}
                    onChange={(e) => setFormData({ ...formData, sender_zip: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-gold focus:outline-none"
                    placeholder="10001"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Receiver Information */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h2 className="text-lg font-bold text-navy mb-4">Who is receiving this package?</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.receiver_name}
                    onChange={(e) => setFormData({ ...formData, receiver_name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:border-gold focus:outline-none"
                    placeholder="Jane Smith"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.receiver_phone}
                      onChange={(e) => setFormData({ ...formData, receiver_phone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:border-gold focus:outline-none"
                      placeholder="+1 (555) 987-6543"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={formData.receiver_email}
                      onChange={(e) => setFormData({ ...formData, receiver_email: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:border-gold focus:outline-none"
                      placeholder="jane@example.com"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.receiver_address}
                    onChange={(e) => setFormData({ ...formData, receiver_address: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:border-gold focus:outline-none"
                    placeholder="456 Oak Ave"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.receiver_city}
                    onChange={(e) => setFormData({ ...formData, receiver_city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-gold focus:outline-none"
                    placeholder="Los Angeles"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.receiver_zip}
                    onChange={(e) => setFormData({ ...formData, receiver_zip: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-gold focus:outline-none"
                    placeholder="90001"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Package Details */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <h2 className="text-lg font-bold text-navy mb-4">Package Details</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shipment Type *</label>
                <select
                  required
                  value={formData.shipment_type}
                  onChange={(e) => setFormData({ ...formData, shipment_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-gold focus:outline-none"
                >
                  <option value="Standard">Standard (5-7 business days)</option>
                  <option value="Express">Express (2-3 business days)</option>
                  <option value="Overnight">Overnight (Next business day)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg) *</label>
                <div className="relative">
                  <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:border-gold focus:outline-none"
                    placeholder="2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Length (cm)</label>
                  <input
                    type="number"
                    value={formData.length}
                    onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-gold focus:outline-none"
                    placeholder="30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Width (cm)</label>
                  <input
                    type="number"
                    value={formData.width}
                    onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-gold focus:outline-none"
                    placeholder="20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-gold focus:outline-none"
                    placeholder="15"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Package Description</label>
                <textarea
                  rows={3}
                  value={formData.package_description}
                  onChange={(e) => setFormData({ ...formData, package_description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-gold focus:outline-none"
                  placeholder="What's inside? (e.g., Electronics, Clothing, Documents)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Declared Value ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={formData.declared_value}
                    onChange={(e) => setFormData({ ...formData, declared_value: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:border-gold focus:outline-none"
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_fragile}
                    onChange={(e) => setFormData({ ...formData, is_fragile: e.target.checked })}
                    className="rounded text-gold focus:ring-gold"
                  />
                  <span className="text-sm text-gray-700">This package contains fragile items</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.signature_required}
                    onChange={(e) => setFormData({ ...formData, signature_required: e.target.checked })}
                    className="rounded text-gold focus:ring-gold"
                  />
                  <span className="text-sm text-gray-700">Signature required upon delivery</span>
                </label>
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex-1 bg-gold text-navy px-4 py-2 rounded-lg font-semibold hover:bg-gold/90 transition-colors"
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gold text-navy px-4 py-2 rounded-lg font-semibold hover:bg-gold/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Creating...' : 'Send Package'}
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}