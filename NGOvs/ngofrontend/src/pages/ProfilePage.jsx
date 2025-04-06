import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from 'firebase/auth';
import { auth } from '../firebase/config';
import FaceAttendance from '../components/FaceAttendance';

const ProfilePage = ({ user }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isFaceSetupMode, setIsFaceSetupMode] = useState(false);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [activities, setActivities] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    interests: user?.interests?.join(', ') || '',
    phone: user?.phone || '',
    location: user?.location || '',
    skills: user?.skills?.join(', ') || '',
  });
  
  // Fetch attendance stats
  useEffect(() => {
    if (!user || user.role !== 'volunteer') return;
    
    const fetchAttendanceStats = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/attendance/stats/${user.uid}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const data = await response.json();
        setAttendanceStats(data);
      } catch (error) {
        console.error('Error fetching attendance stats:', error);
      }
    };
    
    fetchAttendanceStats();
  }, [user]);
  
  // Fetch recent activities
  useEffect(() => {
    if (!user) return;
    
    const fetchActivities = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${user.uid}/activities`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const data = await response.json();
        setActivities(data.activities || []);
      } catch (error) {
        console.error('Error fetching user activities:', error);
      }
    };
    
    fetchActivities();
  }, [user]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Update Firebase profile for name
      if (formData.displayName !== user.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: formData.displayName
        });
      }
      
      // Process array fields
      const processedData = {
        ...formData,
        interests: formData.interests.split(',').map(item => item.trim()).filter(Boolean),
        skills: formData.skills.split(',').map(item => item.trim()).filter(Boolean),
      };
      
      // Update backend profile
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${user.uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(processedData)
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update profile');
      }
      
      setSuccess(true);
      setIsEditing(false);
      
      // Reload user data
      // This would typically be handled by a global state manager like Redux or Context
      window.location.reload();
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFaceSetupComplete = (faceData) => {
    setIsFaceSetupMode(false);
    // You would typically update the user's face data in the backend here
    // For now, we'll just show a success message
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mx-auto max-w-md">
          <p className="font-bold">Error</p>
          <p>You must be logged in to view this page</p>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="mt-6 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Go to Login
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-header font-bold mb-6">Your Profile</h1>
      
      {/* Success message */}
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
          <p className="font-bold">Success</p>
          <p>Your profile has been updated successfully</p>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile sidebar */}
        <div className="col-span-1">
          <div className="bg-surface rounded-lg shadow p-6">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 mb-4">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'User'} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary text-white text-4xl">
                    {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              
              <h2 className="text-xl font-header font-bold">
                {user.displayName || 'New User'}
              </h2>
              
              <p className="text-gray-600 text-sm">{user.role?.toUpperCase()}</p>
              
              <p className="text-gray-600 mt-2">{user.email}</p>
              
              {/* Face recognition setup button (for volunteers) */}
              {user.role === 'volunteer' && (
                <button
                  onClick={() => setIsFaceSetupMode(true)}
                  className="mt-4 w-full px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary/10"
                >
                  {user.faceDescriptor ? 'Update' : 'Set up'} Face Recognition
                </button>
              )}
            </div>
            
            {/* Stats for volunteers */}
            {user.role === 'volunteer' && attendanceStats && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-header font-medium mb-3">Your Stats</h3>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Events Attended</p>
                    <p className="text-2xl font-bold text-primary">{attendanceStats.totalEvents || 0}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Volunteer Hours</p>
                    <p className="text-2xl font-bold text-primary">{attendanceStats.totalHours || 0}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Impact Score</p>
                    <p className="text-2xl font-bold text-primary">{attendanceStats.impactScore || 0}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Stats for NGOs */}
            {user.role === 'ngo' && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-header font-medium mb-3">Your Stats</h3>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Events Organized</p>
                    <p className="text-2xl font-bold text-primary">{user.eventCount || 0}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Total Volunteers</p>
                    <p className="text-2xl font-bold text-primary">{user.volunteerCount || 0}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Community Rating</p>
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-primary mr-2">{user.rating || 0}</span>
                      <div className="flex text-yellow-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill={star <= Math.round(user.rating || 0) ? 'currentColor' : 'none'}>
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Main content */}
        <div className="col-span-1 lg:col-span-2">
          {/* Face setup mode */}
          {isFaceSetupMode ? (
            <div className="bg-surface rounded-lg shadow p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-header font-bold">Face Recognition Setup</h2>
                <button
                  onClick={() => setIsFaceSetupMode(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <FaceAttendance
                userId={user.uid}
                setupMode={true}
                onSetupComplete={handleFaceSetupComplete}
              />
            </div>
          ) : (
            <>
              {/* Profile form */}
              <div className="bg-surface rounded-lg shadow p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-header font-bold">Profile Information</h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-secondary hover:text-secondary/80"
                  >
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        id="displayName"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border rounded-md ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary' : 'border-gray-200 bg-gray-50'}`}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border rounded-md ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary' : 'border-gray-200 bg-gray-50'}`}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border rounded-md ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary' : 'border-gray-200 bg-gray-50'}`}
                      />
                    </div>
                    
                    {user.role === 'volunteer' && (
                      <div>
                        <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-1">
                          Interests (comma separated)
                        </label>
                        <input
                          type="text"
                          id="interests"
                          name="interests"
                          value={formData.interests}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border rounded-md ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary' : 'border-gray-200 bg-gray-50'}`}
                        />
                      </div>
                    )}
                    
                    {user.role === 'volunteer' && (
                      <div className="md:col-span-2">
                        <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
                          Skills (comma separated)
                        </label>
                        <input
                          type="text"
                          id="skills"
                          name="skills"
                          value={formData.skills}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border rounded-md ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary' : 'border-gray-200 bg-gray-50'}`}
                        />
                      </div>
                    )}
                    
                    <div className="md:col-span-2">
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows="4"
                        value={formData.bio}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border rounded-md ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary' : 'border-gray-200 bg-gray-50'}`}
                      ></textarea>
                    </div>
                  </div>
                  
                  {isEditing && (
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </form>
              </div>
              
              {/* Recent activities */}
              <div className="bg-surface rounded-lg shadow p-6">
                <h2 className="text-xl font-header font-bold mb-4">Recent Activities</h2>
                
                {activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity._id} className="flex items-start">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          activity.type === 'event_registration' ? 'bg-blue-100 text-blue-600' :
                          activity.type === 'event_attendance' ? 'bg-green-100 text-green-600' :
                          activity.type === 'photo_upload' ? 'bg-purple-100 text-purple-600' :
                          activity.type === 'certificate' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {activity.type === 'event_registration' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          )}
                          {activity.type === 'event_attendance' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          {activity.type === 'photo_upload' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          )}
                          {activity.type === 'certificate' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                          )}
                        </div>
                        
                        <div className="ml-4">
                          <p className="text-gray-800">{activity.description}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(activity.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-gray-600">No recent activities to display</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
