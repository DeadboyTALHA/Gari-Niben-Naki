import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Automatically attach the auth token to every request
api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 Unauthorized (token expired) globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API function examples
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', new URLSearchParams({ username: email, password }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }),
  register: (data: object) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

export const vehiclesApi = {
  list: (params?: object) => api.get('/vehicles', { params }),
  get: (id: number) => api.get(`/vehicles/${id}`),
  create: (data: object) => api.post('/vehicles', data),
  update: (id: number, data: object) => api.put(`/vehicles/${id}`, data),
  delete: (id: number) => api.delete(`/vehicles/${id}`),
};

// ─── Bookings ─────────────────────────────────────────────
export const bookingsApi = {
  // Create a new booking (called from BookingWidget)
  create: (data: object) =>
    api.post('/bookings', data),

  // Get all bookings for the logged-in customer
  // Pass a status string to filter: 'active', 'confirmed', 'completed', 'cancelled'
  myBookings: (status?: string) =>
    api.get('/bookings/my', { params: status ? { status } : {} }),

  // Get a single booking by ID (used on the checkout page)
  get: (id: number) =>
    api.get(`/bookings/${id}`),

  // Cancel a booking
  cancel: (id: number) =>
    api.patch(`/bookings/${id}/cancel`),

  // Get bookings for an owner's vehicles
  ownerBookings: (status?: string) =>
    api.get('/bookings/owner', { params: status ? { status } : {} }),
};

// ─── Reviews ──────────────────────────────────────────────
export const reviewsApi = {
  // Submit a review for a completed booking
  create: (data: object) =>
    api.post('/reviews', data),

  // Get all reviews for a specific vehicle
  forVehicle: (vehicleId: number, page = 1) =>
    api.get(`/reviews/vehicle/${vehicleId}`, { params: { page } }),
};

// ─── Payments ─────────────────────────────────────────────
export const paymentsApi = {
  // Step 1: Create a Stripe PaymentIntent — returns client_secret
  createIntent: (bookingId: number) =>
    api.post('/payments/create-intent', { booking_id: bookingId }),

  // Refund a payment (admin or cancel flow)
  refund: (bookingId: number) =>
    api.post(`/payments/refund/${bookingId}`),
};

// ─── Users ────────────────────────────────────────────────
export const usersApi = {
  // Get own profile
  profile: () =>
    api.get('/users/profile'),

  // Update name / phone
  updateProfile: (data: object) =>
    api.put('/users/profile', data),

  // Change password
  changePassword: (data: object) =>
    api.post('/users/change-password', data),

  // Get notifications (pass unread_only=true for badge count)
  notifications: (unreadOnly = false) =>
    api.get('/users/notifications', { params: { unread_only: unreadOnly } }),

  // Mark a single notification as read
  markRead: (id: number) =>
    api.patch(`/users/notifications/${id}/read`),

  // Mark all notifications as read
  markAllRead: () =>
    api.patch('/users/notifications/read-all'),
};

// ─── Documents ────────────────────────────────────────────
export const documentsApi = {
  // Upload a KYC document (driving_license, national_id, etc.)
  // Uses FormData because it is a file upload
  upload: (documentType: string, file: File) => {
    const fd = new FormData();
    fd.append('document_type', documentType);
    fd.append('file', file);
    return api.post('/documents/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Get all documents uploaded by the current user
  myDocuments: () =>
    api.get('/documents/my'),
};

// ─── Vehicle Images ───────────────────────────────────────
export const vehicleImagesApi = {
  // Upload photos for a vehicle (up to 10 at once)
  upload: (vehicleId: number, files: File[]) => {
    const fd = new FormData();
    files.forEach(f => fd.append('files', f));
    return api.post(`/vehicles/${vehicleId}/images`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Get all images for a vehicle
  list: (vehicleId: number) =>
    api.get(`/vehicles/${vehicleId}/images`),

  // Set one image as the primary thumbnail
  setPrimary: (vehicleId: number, imageId: number) =>
    api.patch(`/vehicles/${vehicleId}/images/${imageId}/set-primary`),

  // Delete a single image
  delete: (vehicleId: number, imageId: number) =>
    api.delete(`/vehicles/${vehicleId}/images/${imageId}`),
};

// ─── Admin ────────────────────────────────────────────────
export const adminApi = {
  // Platform overview stats
  stats: () =>
    api.get('/admin/stats'),

  // List all users with optional pagination
  users: (page = 1) =>
    api.get('/admin/users', { params: { page } }),

  // Suspend a user account
  suspendUser: (id: number) =>
    api.patch(`/admin/users/${id}/suspend`),

  // Approve a vehicle listing
  approveVehicle: (id: number) =>
    api.patch(`/admin/vehicles/${id}/approve`),

  // Reject a vehicle listing with a reason
  rejectVehicle: (id: number, reason: string) =>
    api.patch(`/admin/vehicles/${id}/reject`, null, {
      params: { reason },
    }),
};