'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ManageShipments() {
  const [shipments, setShipments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchShipments()
  }, [])

  const fetchShipments = async () => {
    const { data } = await supabase
      .from('shipments')
      .select('*')
      .order('created_at', { ascending: false })
    
    setShipments(data || [])
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string, progress: number, location: string) => {
    const { error } = await supabase
      .from('shipments')
      .update({ 
        current_status: status, 
        progress_percentage: progress,
        current_location: location 
      })
      .eq('id', id)

    if (!error) {
      await supabase
        .from('tracking_updates')
        .insert({
          shipment_id: id,
          status: status,
          location: location,
          description: `Shipment status updated to ${status}`
        })
      
      alert('Status updated!')
      fetchShipments()
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Manage Shipments</h1>
      
      <div className="space-y-4">
        {shipments.map((shipment) => (
          <div key={shipment.id} className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-500">Tracking ID</p>
                <p className="font-mono text-lg font-bold text-gold">{shipment.tracking_id}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-semibold">{shipment.current_status}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">From</p>
                <p className="text-sm">{shipment.pickup_location}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">To</p>
                <p className="text-sm">{shipment.delivery_location}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-semibold mb-2">Update Status</p>
              <div className="flex gap-2 flex-wrap">
                <button 
                  onClick={() => updateStatus(shipment.id, 'pending', 10, 'Hawaii, USA')}
                  className="px-3 py-1 bg-gray-200 rounded text-sm"
                >
                  Pending
                </button>
                <button 
                  onClick={() => updateStatus(shipment.id, 'picked_up', 25, 'Hawaii, USA')}
                  className="px-3 py-1 bg-blue-200 rounded text-sm"
                >
                  Picked Up
                </button>
                <button 
                  onClick={() => updateStatus(shipment.id, 'in_transit', 45, 'Los Angeles, CA')}
                  className="px-3 py-1 bg-gold/30 rounded text-sm"
                >
                  In Transit
                </button>
                <button 
                  onClick={() => updateStatus(shipment.id, 'warehouse', 65, 'Phoenix, AZ')}
                  className="px-3 py-1 bg-purple-200 rounded text-sm"
                >
                  At Warehouse
                </button>
                <button 
                  onClick={() => updateStatus(shipment.id, 'out_for_delivery', 85, 'Phoenix, AZ')}
                  className="px-3 py-1 bg-green-200 rounded text-sm"
                >
                  Out for Delivery
                </button>
                <button 
                  onClick={() => updateStatus(shipment.id, 'delivered', 100, 'Phoenix, AZ')}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                >
                  Delivered
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}