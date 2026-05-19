'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Package, MapPin, Edit, Trash2, Eye, Plus, ChevronDown } from 'lucide-react'
import Link from 'next/link'
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
  progress_percentage: number
  created_at: string
}

const statusOptions = [
  { value: 'pending', label: 'Pending', progress: 10 },
  { value: 'picked_up', label: 'Picked Up', progress: 25 },
  { value: 'in_transit', label: 'In Transit', progress: 45 },
  { value: 'warehouse', label: 'At Warehouse', progress: 65 },
  { value: 'customs', label: 'Customs Clearance', progress: 75 },
  { value: 'out_for_delivery', label: 'Out For Delivery', progress: 85 },
  { value: 'delivered', label: 'Delivered', progress: 100 },
]

export default function AdminShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<Record<string, string>>({})
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchShipments()
  }, [])

  const fetchShipments = async () => {
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Failed to fetch shipments')
    } else {
      setShipments(data || [])
    }
    setLoading(false)
  }

  const updateShipmentStatus = async (shipmentId: string, newStatus: string, progress: number) => {
    setUpdatingId(shipmentId)

    const { error } = await supabase
      .from('shipments')
      .update({ 
        current_status: newStatus,
        progress_percentage: progress,
        updated_at: new Date()
      })
      .eq('id', shipmentId)

    if (error) {
      toast.error('Failed to update status')
    } else {
      toast.success(`Status updated to ${newStatus.replace('_', ' ')}`)
      fetchShipments()
    }
    setUpdatingId(null)
  }

  const deleteShipment = async (id: string, trackingId: string) => {
    if (confirm(`Delete shipment ${trackingId}? This action cannot be undone.`)) {
      const { error } = await supabase
        .from('shipments')
        .delete()
        .eq('id', id)

      if (error) {
        toast.error('Failed to delete shipment')
      } else {
        toast.success('Shipment deleted')
        fetchShipments()
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-navy">Manage Shipments</h1>
          <p className="text-gray-600 mt-1">View and manage all shipments</p>
        </div>
        <Link
          href="/dashboard/admin/shipments/create"
          className="bg-gold text-navy px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-gold/90 transition-all"
        >
          <Plus className="w-5 h-5" />
          Create Shipment
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Tracking ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Sender</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Receiver</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Route</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Progress</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {shipments.map((shipment) => (
                <motion.tr
                  key={shipment.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-sm text-gold font-semibold">
                    {shipment.tracking_id}
                  </td>
                  <td className="px-6 py-4 text-gray-700">{shipment.sender_name}</td>
                  <td className="px-6 py-4 text-gray-700">{shipment.receiver_name}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="w-3 h-3" />
                      {shipment.pickup_location.split(',')[0]}
                      <span>→</span>
                      <MapPin className="w-3 h-3" />
                      {shipment.delivery_location.split(',')[0]}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={selectedStatus[shipment.id] || shipment.current_status}
                      onChange={(e) => {
                        const status = statusOptions.find(s => s.value === e.target.value)
                        if (status) {
                          updateShipmentStatus(shipment.id, status.value, status.progress)
                        }
                        setSelectedStatus({ ...selectedStatus, [shipment.id]: e.target.value })
                      }}
                      disabled={updatingId === shipment.id}
                      className="px-2 py-1 border border-gray-200 rounded-lg text-sm focus:border-gold focus:outline-none"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gold rounded-full h-2 transition-all"
                        style={{ width: `${shipment.progress_percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 mt-1">{shipment.progress_percentage}%</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/track/${shipment.tracking_id}`}
                        target="_blank"
                        className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => deleteShipment(shipment.id, shipment.tracking_id)}
                        className="p-1 text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}