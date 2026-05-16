'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Edit, Trash2, Eye, MapPin } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { StatusConfig } from '@/types'

interface Shipment {
  id: string
  tracking_id: string
  sender_name: string
  receiver_name: string
  current_status: string
  current_location: string
  progress_percentage: number
}

export default function AdminShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
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

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this shipment?')) {
      const { error } = await supabase
        .from('shipments')
        .delete()
        .eq('id', id)

      if (error) {
        toast.error('Failed to delete shipment')
      } else {
        toast.success('Shipment deleted successfully')
        fetchShipments()
      }
    }
  }

  const filteredShipments = shipments.filter(shipment =>
    shipment.tracking_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.sender_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Shipments</h1>
          <p className="text-white/70 mt-1">Manage all shipments</p>
        </div>
        <Link
          href="/dashboard/admin/shipments/create"
          className="bg-gold text-navy px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-gold/90 transition-all"
        >
          <Plus className="w-5 h-5" />
          Create Shipment
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by tracking ID or sender..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-gold"
        />
      </div>

      {/* Shipments Table */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Tracking ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Sender</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Receiver</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Location</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Progress</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredShipments.map((shipment) => (
                <motion.tr
                  key={shipment.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-t border-white/10 hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 py-3 text-white font-mono text-sm">{shipment.tracking_id}</td>
                  <td className="px-4 py-3 text-white/80 text-sm">{shipment.sender_name}</td>
                  <td className="px-4 py-3 text-white/80 text-sm">{shipment.receiver_name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      shipment.current_status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                      shipment.current_status === 'in_transit' ? 'bg-gold/20 text-gold' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {StatusConfig[shipment.current_status as keyof typeof StatusConfig]?.label || shipment.current_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/80 text-sm flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {shipment.current_location}
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-24 bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-gold rounded-full h-2 transition-all"
                        style={{ width: `${shipment.progress_percentage}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/track/${shipment.tracking_id}`}
                        className="p-1 hover:text-gold transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      <Link
                        href={`/dashboard/admin/shipments/${shipment.id}`}
                        className="p-1 hover:text-gold transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(shipment.id)}
                        className="p-1 hover:text-red-500 transition-colors"
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