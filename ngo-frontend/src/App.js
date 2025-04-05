import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import EventList from './pages/EventList';
import EventDetails from './pages/EventDetails';
import Events from './pages/Events';
import Applications from './pages/Applications';
import Resources from './pages/Resources';
import NGODashboard from './pages/NGODashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';
import Reports from './pages/Reports';
import PhotoGallery from './pages/PhotoGallery';
import NotFound from './pages/NotFound';
import AccessDenied from './pages/AccessDenied';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './pages/Profile';
import Badges from './pages/Badges';

// AppRoutes component to use hooks
const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/access-denied" element={<AccessDenied />} />
      
      {/* Protected Routes */}
      <Route path="/events" element={
        <ProtectedRoute>
          <EventList />
        </ProtectedRoute>
      } />

      <Route path="/events/:eventId" element={
        <ProtectedRoute>
          <EventDetails />
        </ProtectedRoute>
      } />

      {/* NGO Routes */}
      <Route path="/ngo/*" element={
        <ProtectedRoute requiredRole="ngo_admin">
          <Routes>
            <Route path="/dashboard" element={<NGODashboard />} />
            <Route path="/events" element={<Events />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </ProtectedRoute>
      } />

      {/* Volunteer Routes */}
      <Route path="/volunteer/*" element={
        <ProtectedRoute requiredRole="volunteer">
          <Routes>
            <Route path="/dashboard" element={<VolunteerDashboard />} />
            <Route path="/events" element={<EventList />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/badges" element={<Badges />} />
          </Routes>
        </ProtectedRoute>
      } />

      <Route path="/gallery" element={
        <ProtectedRoute>
          <PhotoGallery />
        </ProtectedRoute>
      } />

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// Main App component
function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <AppRoutes />
          </main>
          <Footer />
        </div>
        <ToastContainer position="bottom-right" />
      </AuthProvider>
    </Router>
  );
}

export default App;
