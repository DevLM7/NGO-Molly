import React from 'react';
import { useAuth } from '../context/AuthContext';

const Badges = () => {
  const { user } = useAuth();

  // Sample badge definitions
  const badgeDefinitions = {
    'first-event': {
      name: 'First Event',
      description: 'Participated in your first volunteer event',
      icon: '🌟'
    },
    'ten-hours': {
      name: '10 Hours',
      description: 'Completed 10 hours of volunteer work',
      icon: '⏰'
    },
    'team-player': {
      name: 'Team Player',
      description: 'Participated in a group volunteer activity',
      icon: '👥'
    },
    'environmental': {
      name: 'Environmental Champion',
      description: 'Participated in an environmental conservation event',
      icon: '🌱'
    },
    'community': {
      name: 'Community Builder',
      description: 'Helped organize a community event',
      icon: '🏘️'
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Badges</h1>
        
        {/* User Stats */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600">{user?.totalHours || 0}</p>
              <p className="text-gray-600">Total Hours</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600">{user?.badges?.length || 0}</p>
              <p className="text-gray-600">Badges Earned</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600">{user?.skills?.length || 0}</p>
              <p className="text-gray-600">Skills Developed</p>
            </div>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {user?.badges?.map((badgeId) => {
            const badge = badgeDefinitions[badgeId];
            if (!badge) return null;

            return (
              <div key={badgeId} className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
                <span className="text-4xl mb-3">{badge.icon}</span>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{badge.name}</h3>
                <p className="text-gray-600 text-center text-sm">{badge.description}</p>
              </div>
            );
          })}
        </div>

        {/* If no badges */}
        {(!user?.badges || user.badges.length === 0) && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-4xl mb-4">🏅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Badges Yet</h3>
            <p className="text-gray-600">
              Start participating in volunteer events to earn badges and track your achievements!
            </p>
          </div>
        )}

        {/* Available Badges */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Badges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(badgeDefinitions).map(([id, badge]) => (
              <div 
                key={id} 
                className={`bg-white rounded-lg shadow-md p-6 flex flex-col items-center ${
                  user?.badges?.includes(id) ? 'opacity-50' : ''
                }`}
              >
                <span className="text-4xl mb-3">{badge.icon}</span>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{badge.name}</h3>
                <p className="text-gray-600 text-center text-sm">{badge.description}</p>
                {user?.badges?.includes(id) && (
                  <span className="mt-3 text-sm text-green-600 font-medium">✓ Earned</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Badges; 