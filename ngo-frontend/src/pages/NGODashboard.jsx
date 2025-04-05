import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.js';
import { eventAPI, reportAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiCalendar, FiUsers, FiFileText, FiBox, FiBarChart2, FiImage, FiSettings } from 'react-icons/fi';

const NGODashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeVolunteers: 0,
    completedEvents: 0,
    upcomingEvents: 0
  });

  // Fetch NGO stats
  useEffect(() => {
    const fetchStats = async () => {
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
        const activeVolunteers = reportStats.active_volunteers || 0;
        
        setStats({
          totalEvents,
          activeVolunteers,
          completedEvents,
          upcomingEvents
        });
      } catch (error) {
        console.error('Error fetching NGO stats:', error);
        toast.error('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user.uid]);

  const quickActions = [
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
          { title: 'Active Volunteers', value: stats.activeVolunteers, color: 'bg-green-500' },
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                onClick={() => navigate(action.path)}
                className="w-full h-full relative group overflow-hidden rounded-xl bg-white shadow-md hover:shadow-xl transition-all duration-300"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                <div className="relative p-6 flex flex-col items-center text-center">
                  <span className="mb-4 transform transition-transform duration-300 group-hover:scale-110 text-gray-700 group-hover:text-indigo-600">
                    {action.icon}
                  </span>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors duration-300">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
                    {action.description}
                  </p>
                  <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${action.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default NGODashboard;
