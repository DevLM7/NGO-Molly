import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import About from './pages/About';
import Contact from './pages/Contact';
import AccessDenied from './pages/AccessDenied';
import NotFound from './pages/NotFound';

// Protected pages
import Profile from './pages/Profile';
import NGODashboard from './pages/NGODashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';
import Applications from './pages/Applications';
import Resources from './pages/Resources';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Badges from './pages/Badges';
import PhotoGallery from './pages/PhotoGallery';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetails />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/access-denied" element={<AccessDenied />} />

              {/* Shared protected routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['volunteer', 'ngo', 'ngo_admin', 'organization', 'organization_admin']}>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gallery"
                element={
                  <ProtectedRoute allowedRoles={['volunteer', 'ngo', 'ngo_admin', 'organization', 'organization_admin']}>
                    <PhotoGallery />
                  </ProtectedRoute>
                }
              />

              {/* NGO routes */}
              <Route
                path="/ngo/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ngo', 'ngo_admin', 'organization', 'organization_admin']}>
                    <NGODashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ngo/events"
                element={
                  <ProtectedRoute allowedRoles={['ngo', 'ngo_admin', 'organization', 'organization_admin']}>
                    <Events />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ngo/applications"
                element={
                  <ProtectedRoute allowedRoles={['ngo', 'ngo_admin', 'organization', 'organization_admin']}>
                    <Applications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ngo/resources"
                element={
                  <ProtectedRoute allowedRoles={['ngo', 'ngo_admin', 'organization', 'organization_admin']}>
                    <Resources />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ngo/reports"
                element={
                  <ProtectedRoute allowedRoles={['ngo', 'ngo_admin', 'organization', 'organization_admin']}>
                    <Reports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ngo/settings"
                element={
                  <ProtectedRoute allowedRoles={['ngo', 'ngo_admin', 'organization', 'organization_admin']}>
                    <Settings />
                  </ProtectedRoute>
                }
              />

              {/* Volunteer routes */}
              <Route
                path="/volunteer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['volunteer']}>
                    <VolunteerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/volunteer/badges"
                element={
                  <ProtectedRoute allowedRoles={['volunteer']}>
                    <Badges />
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
