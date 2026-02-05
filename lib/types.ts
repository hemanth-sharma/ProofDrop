export type DeliveryStatus = "pending" | "completed" | "failed"

export interface Delivery {
  id: string
  user_id: string
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
