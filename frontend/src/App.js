import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import EventList from './pages/EventList';
import EventDetails from './pages/EventDetails';
import CreateEvent from './pages/CreateEvent';
import NGODashboard from './pages/NGODashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';
import Reports from './pages/Reports';
import PhotoGallery from './pages/PhotoGallery';
import ApplicationList from './pages/ApplicationList';
import ResourceManagement from './pages/ResourceManagement';
import NotFound from './pages/NotFound';

// Protected Route Component for NGO users
const NGORoute = ({ children }) => {
  const { user } = useAuth();
  if (!user || user.role !== 'ngo') {
    return <Navigate to="/login" />;
  }
  return children;
};

// Protected Route Component for Volunteers
const VolunteerRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user || user.role !== 'volunteer') {
    return <Navigate to="/login" />;
  }
  return children;
};

// Protected Route Component for any authenticated user
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
};

// AppRoutes component to use hooks
const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      
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
      <Route path="/ngo/dashboard" element={
        <NGORoute>
          <NGODashboard />
        </NGORoute>
      } />

      <Route path="/events/create" element={
        <NGORoute>
          <CreateEvent />
        </NGORoute>
      } />

      <Route path="/applications" element={
        <NGORoute>
          <ApplicationList />
        </NGORoute>
      } />

      <Route path="/resources" element={
        <NGORoute>
          <ResourceManagement />
        </NGORoute>
      } />

      <Route path="/reports" element={
        <NGORoute>
          <Reports />
        </NGORoute>
      } />

      {/* Volunteer Routes */}
      <Route path="/volunteer/dashboard" element={
        <VolunteerRoute>
          <VolunteerDashboard />
        </VolunteerRoute>
      } />

      {/* Shared Protected Routes */}
      <Route path="/gallery" element={
        <ProtectedRoute>
          <PhotoGallery />
        </ProtectedRoute>
      } />

      {/* Redirect based on user role */}
      <Route path="/dashboard" element={
        user ? (
          user.role === 'ngo' ? (
            <Navigate to="/ngo/dashboard" />
          ) : (
            <Navigate to="/volunteer/dashboard" />
          )
        ) : (
          <Navigate to="/login" />
        )
      } />

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <ToastContainer position="top-right" autoClose={3000} />
          <Header />
          <main className="flex-grow">
            <AppRoutes />
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
