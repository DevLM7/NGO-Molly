import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FiCalendar, FiUsers, FiFileText, FiBox, FiAward, FiCheckCircle, FiClock } from 'react-icons/fi';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [connectedNGOs, setConnectedNGOs] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    completedEvents: 0,
    upcomingEvents: 0,
    totalHours: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get user's connected NGOs
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        
        if (userData.connectedNGOs && userData.connectedNGOs.length > 0) {
          const ngoPromises = userData.connectedNGOs.map(async (ngoId) => {
            const ngoRef = doc(db, 'users', ngoId);
            const ngoSnap = await getDoc(ngoRef);
            if (ngoSnap.exists()) {
              const ngoData = ngoSnap.data();
              return {
                id: ngoId,
                name: ngoData.name,
                description: ngoData.description,
                status: ngoData.status || 'pending',
                connectedDate: userData.connectedNGOsDates?.[ngoId] || new Date().toISOString()
              };
            }
            return null;
          });
          
          const ngos = (await Promise.all(ngoPromises)).filter(Boolean);
          setConnectedNGOs(ngos);
        }
        
        // Calculate stats
        setStats({
          totalEvents: userData.totalEvents || 0,
          completedEvents: userData.completedEvents || 0,
          upcomingEvents: userData.upcomingEvents || 0,
          totalHours: userData.totalHours || 0
        });
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.uid]);

  const quickActions = [
    {
      title: 'My Events',
      description: 'View and manage your volunteer events',
      icon: <FiCalendar className="w-6 h-6" />,
      path: '/events',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      title: 'My NGOs',
      description: 'View your connected NGOs',
      icon: <FiUsers className="w-6 h-6" />,
      path: '/ngos',
      color: 'from-green-500 to-emerald-600'
    },
    {
      title: 'My Profile',
      description: 'Update your volunteer profile',
      icon: <FiFileText className="w-6 h-6" />,
      path: '/profile',
      color: 'from-orange-500 to-amber-600'
    },
    {
      title: 'My Skills',
      description: 'Manage your skills and certifications',
      icon: <FiAward className="w-6 h-6" />,
      path: '/skills',
      color: 'from-purple-500 to-violet-600'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gray-900 mb-8"
      >
        Volunteer Dashboard
      </motion.h1>

      {/* Stats Section */}
      <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Total Events', value: stats.totalEvents, color: 'bg-blue-500' },
          { title: 'Completed Events', value: stats.completedEvents, color: 'bg-green-500' },
          { title: 'Upcoming Events', value: stats.upcomingEvents, color: 'bg-purple-500' },
          { title: 'Total Hours', value: stats.totalHours, color: 'bg-orange-500' }
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

      {/* Connected NGOs Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">My Connected NGOs</h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : connectedNGOs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectedNGOs.map(ngo => (
              <div 
                key={ngo.id} 
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{ngo.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    ngo.status === 'approved' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {ngo.status === 'approved' ? (
                      <span className="flex items-center">
                        <FiCheckCircle className="w-4 h-4 mr-1" />
                        Approved
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <FiClock className="w-4 h-4 mr-1" />
                        Pending
                      </span>
                    )}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ngo.description}</p>
                
                <div className="text-xs text-gray-500">
                  Connected since: {new Date(ngo.connectedDate).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">You haven't connected with any NGOs yet.</p>
            <button
              onClick={() => navigate('/ngos')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Browse NGOs
            </button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {quickActions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className={`bg-gradient-to-r ${action.color} rounded-lg p-3 inline-block mb-4`}>
              {action.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
            <p className="text-gray-600 mb-4">{action.description}</p>
            <button
              onClick={() => navigate(action.path)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Go to {action.title} →
            </button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Dashboard; 