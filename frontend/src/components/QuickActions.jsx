import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const QuickActions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const actions = [
    {
      title: 'Create New Event',
      description: 'Create and publish a new volunteer event',
      icon: '📅',
      path: '/events/create',
      role: 'ngo',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      title: 'View Applications',
      description: 'Review pending volunteer applications',
      icon: '📋',
      path: '/applications',
      role: 'ngo',
      color: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Generate Reports',
      description: 'View analytics and generate reports',
      icon: '📊',
      path: '/reports',
      role: 'ngo',
      color: 'from-purple-500 to-violet-600'
    },
    {
      title: 'Manage Resources',
      description: 'Manage event resources and materials',
      icon: '📦',
      path: '/resources',
      role: 'ngo',
      color: 'from-orange-500 to-amber-600'
    }
  ];

  const userActions = actions.filter(action => 
    user?.role === action.role || action.role === undefined
  );

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gray-900 mb-8 relative inline-block"
      >
        Quick Actions
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 transform origin-left"></div>
      </motion.h2>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {userActions.map((action, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              onClick={() => navigate(action.path)}
              className={`w-full h-full relative group overflow-hidden rounded-xl bg-white shadow-md hover:shadow-xl transition-all duration-300`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              <div className="relative p-6 flex flex-col items-center text-center">
                <motion.span 
                  className="text-4xl mb-4 transform transition-transform duration-300 group-hover:scale-110"
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                >
                  {action.icon}
                </motion.span>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors duration-300">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
                  {action.description}
                </p>
                <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${action.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>
              </div>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
