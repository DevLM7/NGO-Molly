import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import FaceAttendance from '../components/FaceAttendance';
import GalleryUpload from '../components/GalleryUpload';

const EventDetails = ({ user }) => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceMode, setAttendanceMode] = useState(false);
  const [uploadMode, setUploadMode] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [attendance, setAttendance] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [isNGO, setIsNGO] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  
  // Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/events/${eventId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Event not found');
        }
        
        const data = await response.json();
        setEvent(data);
        
        // Check if user is registered for this event
        setIsRegistered(data.registeredVolunteers?.includes(user.uid));
        
        // Check if user is the NGO that created this event
        setIsNGO(data.createdBy === user.uid);
      } catch (error) {
        console.error('Error fetching event:', error);
        setError('Could not load event details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvent();
  }, [eventId, user.uid]);
  
  // Fetch attendance status if registered
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!isRegistered) return;
      
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/attendance/user/${user.uid}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const data = await response.json();
        const eventAttendance = data.find(record => record.eventId === eventId);
        
        if (eventAttendance) {
          setAttendance(eventAttendance);
        }
      } catch (error) {
        console.error('Error fetching attendance:', error);
      }
    };
    
    fetchAttendance();
  }, [eventId, user.uid, isRegistered]);
  
  // Fetch event photos
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/gallery/event/${eventId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const data = await response.json();
        
        // If not NGO, only show approved and public photos, or own photos
        const filteredPhotos = isNGO 
          ? data 
          : data.filter(photo => 
              (photo.status === 'approved' && photo.visibility === 'public') || 
              photo.userId === user.uid
            );
        
        setPhotos(filteredPhotos);
      } catch (error) {
        console.error('Error fetching photos:', error);
      }
    };
    
    if (event) {
      fetchPhotos();
    }
  }, [eventId, event, isNGO, user.uid]);
  
  // Handle registration
  const handleRegister = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        setIsRegistered(true);
        
        // Update event data
        setEvent(prev => ({
          ...prev,
          registeredVolunteers: [...(prev.registeredVolunteers || []), user.uid]
        }));
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to register');
      }
    } catch (error) {
      console.error('Error registering for event:', error);
      alert(error.message || 'Failed to register for event');
    }
  };
  
  // Handle unregistration
  const handleUnregister = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/events/${eventId}/unregister`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        setIsRegistered(false);
        
        // Update event data
        setEvent(prev => ({
          ...prev,
          registeredVolunteers: prev.registeredVolunteers.filter(id => id !== user.uid)
        }));
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to unregister');
      }
    } catch (error) {
      console.error('Error unregistering from event:', error);
      alert(error.message || 'Failed to unregister from event');
    }
  };
  
  // Check if event is today
  const isEventToday = () => {
    if (!event) return false;
    
    const today = new Date();
    const eventDate = new Date(event.date);
    
    return (
      today.getDate() === eventDate.getDate() &&
      today.getMonth() === eventDate.getMonth() &&
      today.getFullYear() === eventDate.getFullYear()
    );
  };
  
  // Check if event is over
  const isEventOver = () => {
    if (!event) return false;
    
    const now = new Date();
    const eventEndDate = event.endDate ? new Date(event.endDate) : new Date(event.date);
    
    // If end date is not specified, assume event lasts 3 hours
    if (!event.endDate) {
      eventEndDate.setHours(eventEndDate.getHours() + 3);
    }
    
    return now > eventEndDate;
  };
  
  // Handle attendance marked callback
  const handleAttendanceMarked = (attendanceData) => {
    setAttendance(attendanceData);
    setAttendanceMode(false);
  };
  
  // Handle photo uploaded callback
  const handlePhotoUploaded = (photoData) => {
    setPhotos(prev => [photoData, ...prev]);
    setUploadMode(false);
  };
  
  // Handle photo action
  const handlePhotoAction = async (action, photoId) => {
    try {
      switch(action) {
        case 'like':
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/gallery/${photoId}/like`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to like photo');
          }
          
          // Update photos state to reflect the like
          setPhotos(prevPhotos => 
            prevPhotos.map(photo => 
              photo._id === photoId
                ? { ...photo, likes: [...photo.likes, user.uid], isLiked: true }
                : photo
            )
          );
          break;
          
        case 'comment':
          // Open comment modal or section
          setSelectedPhoto(photos.find(p => p._id === photoId));
          setShowCommentModal(true);
          break;
          
        case 'share':
          // Implement share functionality
          const shareUrl = `${window.location.origin}/photos/${photoId}`;
          try {
            await navigator.share({
              title: 'NGO Event Photo',
              text: 'Check out this photo from our NGO event!',
              url: shareUrl,
            });
          } catch (error) {
            // Fallback for browsers that don't support native share
            navigator.clipboard.writeText(shareUrl);
            alert('Link copied to clipboard!');
          }
          break;
          
        default:
          console.warn('Unknown photo action:', action);
      }
    } catch (error) {
      console.error('Error handling photo action:', error);
      alert('Failed to perform action. Please try again.');
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        <p className="mt-4 text-gray-600">Loading event details...</p>
      </div>
    );
  }
  
  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mx-auto max-w-lg">
          <p className="font-bold">Error</p>
          <p>{error || 'Event not found'}</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Go Back
        </button>
      </div>
    );
  }
  
  // Format dates
  const formattedDate = format(new Date(event.date), 'EEEE, MMMM dd, yyyy');
  const formattedTime = format(new Date(event.date), 'h:mm a');
  const formattedEndTime = event.endDate 
    ? format(new Date(event.endDate), 'h:mm a') 
    : format(new Date(new Date(event.date).setHours(new Date(event.date).getHours() + 3)), 'h:mm a');
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back
      </button>
      
      {/* Event Header */}
      <div className="bg-surface rounded-lg shadow-md overflow-hidden mb-8">
        <div className="relative h-64">
          <img 
            src={event.coverImage || `https://source.unsplash.com/1200x400/?${encodeURIComponent(event.category || 'volunteer')}`} 
            alt={event.title} 
            className="w-full h-full object-cover"
          />
          
          {/* Category Badge */}
          <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm">
            {event.category}
          </div>
          
          {/* Status Badge */}
          {event.status && (
            <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium
              ${event.status === 'upcoming' ? 'bg-blue-500 text-white' : 
                event.status === 'ongoing' ? 'bg-green-500 text-white' : 
                event.status === 'completed' ? 'bg-gray-500 text-white' : 
                'bg-red-500 text-white'}`}>
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </div>
          )}
        </div>
        
        <div className="p-6">
          <h1 className="text-3xl font-header font-bold mb-2">{event.title}</h1>
          
          <div className="flex flex-wrap items-center text-gray-600 mb-4">
            <div className="flex items-center mr-6 mb-2">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formattedDate}</span>
            </div>
            
            <div className="flex items-center mr-6 mb-2">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{formattedTime} - {formattedEndTime}</span>
            </div>
            
            <div className="flex items-center mb-2">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{event.location}</span>
            </div>
          </div>
          
          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {event.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="bg-secondary/10 text-secondary px-2 py-1 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          
          {/* Registration status and buttons */}
          <div className="flex flex-wrap items-center justify-between mb-6">
            <div>
              {event.maxVolunteers && (
                <div className="flex items-center mb-2">
                  <span className="text-sm text-gray-600 mr-2">
                    {(event.registeredVolunteers?.length || 0)}/{event.maxVolunteers} registered
                  </span>
                  
                  {/* Progress Bar */}
                  <div className="w-32 bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-primary h-1.5 rounded-full" 
                      style={{ width: `${Math.min(100, (event.registeredVolunteers?.length || 0) / event.maxVolunteers * 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {isRegistered && (
                <div className="text-sm flex items-center text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  You are registered for this event
                </div>
              )}
              
              {attendance && attendance.status === 'attended' && (
                <div className="text-sm flex items-center text-primary mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Attendance confirmed
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3 mt-2 sm:mt-0">
              {!isEventOver() && (
                isRegistered ? (
                  <>
                    {isEventToday() && attendance?.status !== 'attended' && (
                      <button
                        onClick={() => setAttendanceMode(true)}
                        className="btn-primary"
                      >
                        Mark Attendance
                      </button>
                    )}
                    
                    <button
                      onClick={handleUnregister}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50"
                    >
                      Cancel Registration
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleRegister}
                    disabled={event.maxVolunteers && event.registeredVolunteers?.length >= event.maxVolunteers}
                    className={`btn-primary ${
                      event.maxVolunteers && event.registeredVolunteers?.length >= event.maxVolunteers
                        ? 'opacity-50 cursor-not-allowed' 
                        : ''
                    }`}
                  >
                    {event.maxVolunteers && event.registeredVolunteers?.length >= event.maxVolunteers
                      ? 'Event Full'
                      : 'Register Now'
                    }
                  </button>
                )
              )}
              
              {isEventOver() && isRegistered && (
                <button
                  onClick={() => setUploadMode(true)}
                  className="btn-secondary"
                >
                  Share Photos
                </button>
              )}
            </div>
          </div>
          
          {/* Event description */}
          <div className="mb-8">
            <h2 className="text-xl font-header font-bold mb-3">About This Event</h2>
            <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
          </div>
        </div>
      </div>
      
      {/* Attendance Mode */}
      {attendanceMode && (
        <div className="mb-8">
          <FaceAttendance
            eventId={eventId}
            userId={user.uid}
            storedFaceDescriptor={user.faceDescriptor}
            onAttendanceMarked={handleAttendanceMarked}
          />
        </div>
      )}
      
      {/* Upload Mode */}
      {uploadMode && (
        <div className="mb-8">
          <GalleryUpload
            eventId={eventId}
            eventName={event.title}
            eventDate={event.date}
            onPhotoUploaded={handlePhotoUploaded}
          />
        </div>
      )}
      
      {/* Event Photos */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-header font-bold">Event Photos</h2>
          
          {isRegistered && isEventOver() && !uploadMode && (
            <button
              onClick={() => setUploadMode(true)}
              className="text-secondary hover:text-secondary/80 text-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Share Your Photos
            </button>
          )}
        </div>
        
        {photos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div 
                key={photo._id} 
                className={`relative rounded-lg overflow-hidden aspect-square ${
                  photo.status === 'pending' ? 'opacity-70' : ''
                }`}
              >
                <img 
                  src={photo.imageUrl} 
                  alt="Event memory" 
                  className="w-full h-full object-cover"
                />
                
                {photo.status === 'pending' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">Pending Approval</span>
                  </div>
                )}
                
                {isNGO && photo.status === 'pending' && (
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50 flex justify-around">
                    <button
                      onClick={() => handlePhotoAction('approve', photo._id)}
                      className="bg-green-500 text-white text-xs px-2 py-1 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handlePhotoAction('reject', photo._id)}
                      className="bg-red-500 text-white text-xs px-2 py-1 rounded"
                    >
                      Reject
                    </button>
                  </div>
                )}
                
                {photo.userId === user.uid && (
                  <div className="absolute top-2 right-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      photo.visibility === 'public' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                    }`}>
                      {photo.visibility === 'public' ? 'Public' : 'Private'}
                    </span>
                  </div>
                )}
                
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50 flex justify-around">
                  <button
                    onClick={() => handlePhotoAction('like', photo._id)}
                    className="text-white text-xs px-2 py-1 rounded"
                  >
                    Like
                  </button>
                  <button
                    onClick={() => handlePhotoAction('comment', photo._id)}
                    className="text-white text-xs px-2 py-1 rounded"
                  >
                    Comment
                  </button>
                  <button
                    onClick={() => handlePhotoAction('share', photo._id)}
                    className="text-white text-xs px-2 py-1 rounded"
                  >
                    Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-600 font-medium">No photos yet</p>
            {isRegistered && isEventOver() && (
              <button
                onClick={() => setUploadMode(true)}
                className="mt-3 text-sm text-secondary hover:text-secondary/80"
              >
                Be the first to share photos!
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetails;
