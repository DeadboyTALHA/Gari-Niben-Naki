// ─── User ───────────────────────────────────────────────────
export type UserRole = 'customer' | 'owner' | 'admin' | 'both';

export interface User {
  id:               number;
  full_name:        string;
  email:            string;
  phone?:           string;
  role:             UserRole;
  is_verified:      boolean;
  is_kyc_approved:  boolean;
  profile_picture?: string;
  created_at:       string;
}

// ─── Vehicle ─────────────────────────────────────────────────
export type FuelType        = 'petrol' | 'diesel' | 'electric' | 'hybrid';
export type TransmissionType = 'manual' | 'automatic';
export type VehicleStatus   = 'pending' | 'active' | 'maintenance' | 'rejected';

export interface Vehicle {
  id:               number;
  owner_id:         number;
  brand:            string;
  model:            string;
  year:             number;
  color?:           string;
  license_plate:    string;
  fuel_type:        FuelType;
  transmission:     TransmissionType;
  seats:            number;
  doors:            number;
  daily_rate:       number;
  security_deposit: number;
  location_address?: string;
  location_city?:   string;
  description?:     string;
  status:           VehicleStatus;
  is_available:     boolean;
  average_rating:   number;
  total_reviews:    number;
  created_at:       string;
  images?:          VehicleImage[];
}

export interface VehicleImage {
  id:          number;
  vehicle_id:  number;
  image_url:   string;
  is_primary:  boolean;
}

export interface VehicleListResponse {
  total:       number;
  page:        number;
  page_size:   number;
  total_pages: number;
  vehicles:    Vehicle[];
}

// ─── Booking ─────────────────────────────────────────────────
export type BookingStatus  = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
export type InsuranceTier  = 'basic' | 'standard' | 'premium';

export interface Booking {
  id:               number;
  booking_ref:      string;
  customer_id:      number;
  vehicle_id:       number;
  vehicle?:         Vehicle;
  pickup_date:      string;
  return_date:      string;
  days:             number;
  daily_rate:       number;
  subtotal:         number;
  insurance_tier:   InsuranceTier;
  insurance_cost:   number;
  service_fee:      number;
  tax:              number;
  security_deposit: number;
  total_amount:     number;
  status:           BookingStatus;
  created_at:       string;
}

// ─── Review ──────────────────────────────────────────────────
export interface Review {
  id:          number;
  booking_id:  number;
  vehicle_id:  number;
  customer_id: number;
  customer?:   User;
  rating:      number;
  comment?:    string;
  created_at:  string;
}

// ─── Payment ─────────────────────────────────────────────────
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';

export interface Payment {
  id:         number;
  booking_id: number;
  amount:     number;
  currency:   string;
  status:     PaymentStatus;
  receipt_url?: string;
  paid_at?:   string;
}

// ─── Notification ────────────────────────────────────────────
export interface Notification {
  id:         number;
  type:       string;
  title:      string;
  message:    string;
  is_read:    boolean;
  link?:      string;
  created_at: string;
}

// ─── Dispute ─────────────────────────────────────────────────
export interface Dispute {
  id:          number;
  booking_id:  number;
  subject:     string;
  description: string;
  status:      string;
  resolution?: string;
  created_at:  string;
}

// ─── Filters ─────────────────────────────────────────────────
export interface VehicleFilters {
  city?:         string;
  fuel_type?:    FuelType;
  transmission?: TransmissionType;
  min_price?:    number;
  max_price?:    number;
  seats?:        number;
  sort_by?:      string;
  page?:         number;
}