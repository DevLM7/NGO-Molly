import axios from 'axios';
import { auth } from '../firebase/config';

const API_URL = process.env.REACT_APP_API_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Event APIs
export const eventAPI = {
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  getById: (id) => api.get(`/events/${id}`),
  getAll: () => api.get('/events'),
  getNGOEvents: () => api.get('/events/ngo'),
  getSuggestedEvents: () => api.get('/events/suggested'),
  getEventVolunteers: (id) => api.get(`/events/${id}/volunteers`),
};

// Badge APIs
export const badgeAPI = {
  getVolunteerBadges: () => api.get('/badges/volunteer'),
  getBadgeProgress: () => api.get('/badges/progress'),
  checkAndAwardBadges: () => api.post('/badges/check'),
};

// Certificate APIs
export const certificateAPI = {
  generate: (eventId, data) => api.post(`/certificates/generate/${eventId}`, data),
  download: (certificateId) => api.get(`/certificates/download/${certificateId}`),
  send: (certificateId, data) => api.post(`/certificates/send/${certificateId}`, data),
};

// Face Recognition APIs
export const faceRecognitionAPI = {
  saveDescriptor: (data) => api.post('/face-recognition/save', data),
  matchFace: (data) => api.post('/face-recognition/match', data),
  markAttendance: (data) => api.post('/face-recognition/attendance', data),
};

// Report APIs
export const reportAPI = {
  create: (data) => api.post('/reports', data),
  update: (id, data) => api.put(`/reports/${id}`, data),
  delete: (id) => api.delete(`/reports/${id}`),
  getById: (id) => api.get(`/reports/${id}`),
  getEventReports: (eventId) => api.get(`/reports/event/${eventId}`),
  getUserReports: () => api.get('/reports/user'),
  getAssignedReports: () => api.get('/reports/assigned'),
  updateStatus: (id, status) => api.put(`/reports/${id}/status`, { status }),
  assign: (id, assigneeId) => api.put(`/reports/${id}/assign`, { assignee_id: assigneeId }),
  getStats: () => api.get('/reports/stats'),
};

// Error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      auth.signOut();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 