import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.js';
import BulkFaceAttendance from '../components/BulkFaceAttendance';
import { eventAPI, reportAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiCalendar, FiUsers, FiFileText, FiBox, FiBarChart2, FiImage, FiSettings, FiUser, FiAward, FiX } from 'react-icons/fi';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const NGODashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeVolunteers: 0,
    completedEvents: 0,
    upcomingEvents: 0
  });
  const [connectedVolunteers, setConnectedVolunteers] = useState([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Get NGO ID from URL or use current user's ID
  const ngoId = new URLSearchParams(location.search).get('id') || user.uid;

  // Fetch NGO stats and connected volunteers
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get events
        const eventsResponse = await eventAPI.getNGOEvents();
        const events = eventsResponse.data || [];
        
        // Get report stats
        const reportsResponse = await reportAPI.getStats();
        const reportStats = reportsResponse.data || {};
        
        // Calculate stats
        const now = new Date();
        const totalEvents = events.length;
        const completedEvents = events.filter(event => new Date(event.date) < now).length;
        const upcomingEvents = events.filter(event => new Date(event.date) >= now).length;
        
        // Get connected volunteers
        const volunteersQuery = query(
          collection(db, 'users'),
          where('connectedNGOs', 'array-contains', ngoId)
        );
        const volunteersSnap = await getDocs(volunteersQuery);
        const volunteers = [];
        
        volunteersSnap.forEach(doc => {
          const data = doc.data();
          volunteers.push({
            id: doc.id,
            name: data.name,
            email: data.email,
            skills: data.skills || [],
            interests: data.interests || [],
            totalHours: data.totalHours || 0,
            profileImage: data.profileImage
          });
        });
        
        setConnectedVolunteers(volunteers);
        
        setStats({
          totalEvents,
          activeVolunteers: volunteers.length,
          completedEvents,
          upcomingEvents
        });
      } catch (error) {
        console.error('Error fetching NGO data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ngoId]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleProcessAttendance = async () => {
    try {
      setIsProcessing(true);
      const response = await eventAPI.processEventAttendance(selectedEvent.id);
      if (response.data.success) {
        toast.success('Attendance processed successfully!');
        setStats(prev => ({
          ...prev,
          completedEvents: prev.completedEvents + 1
        }));
      }
    } catch (error) {
      console.error('Error processing attendance:', error);
      toast.error('Failed to process attendance');
    } finally {
      setIsProcessing(false);
      setShowConfirmModal(false);
    }
  };

  const quickActions = [
    {
      title: 'Process Attendance',
      description: 'Mark attendance from event photos',
      icon: <FiUsers className="w-6 h-6" />,
      onClick: () => setShowConfirmModal(true),
      color: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Manage Events',
      description: 'Create and manage volunteer events',
      icon: <FiCalendar className="w-6 h-6" />,
      path: '/ngo/events',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      title: 'Applications',
      description: 'Review volunteer applications',
      icon: <FiUsers className="w-6 h-6" />,
      path: '/ngo/applications',
      color: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Resources',
      description: 'Manage event resources and materials',
      icon: <FiBox className="w-6 h-6" />,
      path: '/ngo/resources',
      color: 'from-orange-500 to-amber-600'
    },
    {
      title: 'Reports',
      description: 'View analytics and generate reports',
      icon: <FiBarChart2 className="w-6 h-6" />,
      path: '/ngo/reports',
      color: 'from-purple-500 to-violet-600'
    },
    {
      title: 'Photo Gallery',
      description: 'Manage event photos and media',
      icon: <FiImage className="w-6 h-6" />,
      path: '/gallery',
      color: 'from-pink-500 to-rose-600'
    },
    {
      title: 'Settings',
      description: 'Configure NGO profile and preferences',
      icon: <FiSettings className="w-6 h-6" />,
      path: '/ngo/settings',
      color: 'from-gray-500 to-gray-600'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gray-900 mb-8"
      >
        NGO Dashboard
      </motion.h1>

      {/* Stats Section */}
      <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Total Events', value: stats.totalEvents, color: 'bg-blue-500' },
          { title: 'Connected Volunteers', value: stats.activeVolunteers, color: 'bg-green-500' },
          { title: 'Completed Events', value: stats.completedEvents, color: 'bg-purple-500' },
          { title: 'Upcoming Events', value: stats.upcomingEvents, color: 'bg-orange-500' }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className={`${stat.color} rounded-md p-3 text-white mr-4`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loading ? '...' : stat.value}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(action.path)}
          >
            <div className={`bg-gradient-to-r ${action.color} p-4`}>
              <div className="text-white">{action.icon}</div>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900">{action.title}</h3>
              <p className="text-sm text-gray-500">{action.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Face Recognition Attendance Section */}
      {selectedEvent && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <BulkFaceAttendance eventId={selectedEvent.id} />
        </div>
      )}

      {/* Connected Volunteers Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Connected Volunteers</h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : connectedVolunteers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectedVolunteers.map(volunteer => (
              <div 
                key={volunteer.id} 
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedVolunteer(volunteer)}
              >
                <div className="flex items-center mb-3">
                  {volunteer.profileImage ? (
                    <img 
                      src={volunteer.profileImage} 
                      alt={volunteer.name} 
                      className="w-10 h-10 rounded-full mr-3"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                      <FiUser className="w-5 h-5 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900">{volunteer.name}</h3>
                    <p className="text-sm text-gray-500">{volunteer.email}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <FiAward className="w-4 h-4 mr-2" />
                    <span>{volunteer.totalHours} hours volunteered</span>
                  </div>
                  
                  {volunteer.skills && volunteer.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {volunteer.skills.map(skill => (
                        <span key={skill} className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-4">No connected volunteers yet</p>
        )}
      </div>

      {/* Volunteer Details Modal */}
      {selectedVolunteer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">{selectedVolunteer.name}</h2>
              <button 
                onClick={() => setSelectedVolunteer(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
                <p className="text-gray-900">{selectedVolunteer.email}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Volunteer Hours</h3>
                <p className="text-gray-900">{selectedVolunteer.totalHours} hours</p>
              </div>
              
              {selectedVolunteer.skills && selectedVolunteer.skills.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Skills</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedVolunteer.skills.map(skill => (
                      <span key={skill} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedVolunteer.interests && selectedVolunteer.interests.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Interests</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedVolunteer.interests.map(interest => (
                      <span key={interest} className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedVolunteer(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Process Attendance Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Process Attendance</h2>
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              This will process attendance for all uploaded event photos. Are you sure you want to continue?
            </p>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessAttendance}
                disabled={isProcessing}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NGODashboard;
