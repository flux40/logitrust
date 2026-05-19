// types/index.ts
export interface User {
  id: string
  full_name: string
  email: string
  role: 'admin' | 'customer'
  created_at: string
}

export interface Shipment {
  id: string
  tracking_id: string
  sender_name: string
  receiver_name: string
  pickup_location: string
  delivery_location: string
  shipment_type: string
  package_weight: number
  current_status: string
  current_location: string
  estimated_delivery: string
  progress_percentage: number
  created_at: string
}

export interface TrackingUpdate {
  id: string
  shipment_id: string
  status: string
  location: string
  description: string
  updated_at: string
}

export type ShipmentStatus = 
  | 'pending'
  | 'picked_up'
  | 'in_transit'
  | 'warehouse'
  | 'customs'
  | 'out_for_delivery'
  | 'delivered'

export const StatusConfig: Record<string, { label: string; progress: number; color: string }> = {
  pending: { label: 'Pending', progress: 10, color: 'bg-gray-500' },
  picked_up: { label: 'Picked Up', progress: 25, color: 'bg-blue-500' },
  in_transit: { label: 'In Transit', progress: 45, color: 'bg-gold' },
  warehouse: { label: 'At Warehouse', progress: 65, color: 'bg-purple-500' },
  customs: { label: 'Customs Clearance', progress: 75, color: 'bg-orange-500' },
  out_for_delivery: { label: 'Out For Delivery', progress: 85, color: 'bg-green-500' },
  delivered: { label: 'Delivered', progress: 100, color: 'bg-green-600' }
}