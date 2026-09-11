export type DeliveryStatus = "pending" | "completed" | "failed"

export interface Delivery {
  id: string
  user_id: string
  customer_id?: string | null
  driver_id?: string | null
  customer_name: string
  customer_phone: string
  customer_email: string | null
  delivery_notes: string | null
  delivery_address: string | null
  driver_link_token: string
  driver_phone: string | null
  photo_url: string | null
  signature_data: string | null
  completed_at: string | null
  status: DeliveryStatus
  created_at: string
  product_name?: string | null
  // AI photo verification (migration 007)
  ai_verified?: boolean | null
  ai_confidence?: number | null
  ai_reason?: string | null
  ai_mode?: string | null
  ai_verified_at?: string | null
  // GPS capture (migration 007)
  delivery_lat?: number | null
  delivery_lng?: number | null
}

export interface NotificationRecord {
  id: string
  delivery_id: string | null
  type: string
  channel: string | null
  recipient: string | null
  content: string | null
  sent_at: string
  status: string | null
}

export interface Profile {
  id: string
  email: string | null
  business_name: string
  business_logo_url: string | null
  phone: string | null
  created_at: string
  updated_at: string
}
