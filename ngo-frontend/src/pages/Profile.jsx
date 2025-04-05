import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    skills: [],
    interests: [],
    bio: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        skills: user.skills || [],
        interests: user.interests || [],
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Profile Header */}
        <div className="bg-indigo-600 px-6 py-8 text-white">
          <div className="flex items-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-indigo-600 text-3xl font-bold">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="ml-6">
              <h1 className="text-3xl font-bold">{user.name || 'User'}</h1>
              <p className="text-indigo-100">{user.email}</p>
              <p className="text-indigo-200 mt-1 capitalize">{user.role || 'Volunteer'}</p>
            </div>
          </div>
        </div>

        {/* Profile Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gray-50 border-b">
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-gray-500 text-sm">Total Hours</p>
            <p className="text-2xl font-bold text-indigo-600">{user.totalHours || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-gray-500 text-sm">Badges Earned</p>
            <p className="text-2xl font-bold text-indigo-600">{user.badges?.length || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-gray-500 text-sm">Skills</p>
            <p className="text-2xl font-bold text-indigo-600">{user.skills?.length || 0}</p>
          </div>
        </div>

        {/* Profile Edit Form */}
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
                Skills (comma-separated)
              </label>
              <input
                type="text"
                id="skills"
                name="skills"
                value={formData.skills.join(', ')}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  skills: e.target.value.split(',').map(skill => skill.trim()).filter(Boolean)
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="e.g. Teaching, Web Development, Event Planning"
              />
            </div>

            <div>
              <label htmlFor="interests" className="block text-sm font-medium text-gray-700">
                Interests (comma-separated)
              </label>
              <input
                type="text"
                id="interests"
                name="interests"
                value={formData.interests.join(', ')}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  interests: e.target.value.split(',').map(interest => interest.trim()).filter(Boolean)
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="e.g. Education, Environment, Healthcare"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile; 