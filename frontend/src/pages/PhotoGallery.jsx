import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const PhotoGallery = ({ user }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    tag: '',
    eventId: '',
    userId: ''
  });
  const [events, setEvents] = useState([]);
  const [allTags, setAllTags] = useState([]);
  
  // Fetch public photos
  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let url = `${process.env.REACT_APP_API_URL}/api/gallery/public`;
        const params = new URLSearchParams();
        
        if (filters.tag) params.append('tag', filters.tag);
        if (filters.eventId) params.append('eventId', filters.eventId);
        if (filters.userId) params.append('userId', filters.userId);
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch photos');
        }
        
        const data = await response.json();
        setPhotos(data.photos || []);
        
        // Extract all unique tags from photos
        const tags = new Set();
        data.photos.forEach(photo => {
          if (photo.tags && photo.tags.length) {
            photo.tags.forEach(tag => tags.add(tag));
          }
        });
        setAllTags(Array.from(tags));
      } catch (error) {
        console.error('Error fetching photos:', error);
        setError('Failed to load photos. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPhotos();
  }, [filters]);
  
  // Fetch events for filter dropdown
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/events`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        
        const data = await response.json();
        setEvents(data.events || []);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    
    fetchEvents();
  }, []);
  
  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Reset all filters
  const resetFilters = () => {
    setFilters({
      tag: '',
      eventId: '',
      userId: ''
    });
  };
  
  // Handle photo like
  const handleLike = async (photoId, isLiked) => {
    try {
      const endpoint = isLiked ? 'unlike' : 'like';
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/gallery/${photoId}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        // Update photo likes
        setPhotos(prev => 
          prev.map(photo => {
            if (photo._id === photoId) {
              return {
                ...photo,
                likes: isLiked 
                  ? photo.likes.filter(id => id !== user.uid)
                  : [...photo.likes, user.uid],
                isLiked: !isLiked
              };
            }
            return photo;
          })
        );
      }
    } catch (error) {
      console.error('Error liking/unliking photo:', error);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-header font-bold mb-6">Event Memories Gallery</h1>
      
      {/* Filters */}
      <div className="bg-surface rounded-lg shadow-md p-4 mb-8">
        <div className="flex flex-wrap gap-4">
          {/* Event filter */}
          <div className="w-full md:w-auto flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Event
            </label>
            <select
              value={filters.eventId}
              onChange={(e) => handleFilterChange('eventId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Events</option>
              {events.map(event => (
                <option key={event._id} value={event._id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>
          
          {/* Tag filter */}
          <div className="w-full md:w-auto flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Tag
            </label>
            <select
              value={filters.tag}
              onChange={(e) => handleFilterChange('tag', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>
          </div>
          
          {/* My Photos filter */}
          <div className="w-full md:w-auto flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Show Photos
            </label>
            <select
              value={filters.userId}
              onChange={(e) => handleFilterChange('userId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Photos</option>
              <option value={user.uid}>My Photos Only</option>
            </select>
          </div>
          
          {/* Reset button */}
          <div className="w-full md:w-auto flex items-end">
            <button
              onClick={resetFilters}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 w-full md:w-auto"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>
      
      {/* Photo grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading photos...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      ) : photos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {photos.map(photo => (
            <div key={photo._id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden shadow-md">
                <img 
                  src={photo.imageUrl} 
                  alt="Event memory" 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                
                {/* Overlay with info on hover */}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                  <div>
                    <Link 
                      to={`/events/${photo.eventId}`}
                      className="text-white text-sm font-medium hover:underline line-clamp-2"
                    >
                      {photo.eventTitle}
                    </Link>
                    <p className="text-white text-xs opacity-80 mt-1">
                      by {photo.userName}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => handleLike(photo._id, photo.isLiked)}
                      className={`flex items-center text-white text-xs ${photo.isLiked ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-4 w-4 mr-1" 
                        fill={photo.isLiked ? "currentColor" : "none"} 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={photo.isLiked ? 0 : 2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {photo.likes?.length || 0}
                    </button>
                    
                    <Link 
                      to={`/photos/${photo._id}`}
                      className="text-white text-xs opacity-80 hover:opacity-100"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Tags (visible all the time) */}
              {photo.tags && photo.tags.length > 0 && (
                <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1 pointer-events-none">
                  {photo.tags.slice(0, 2).map((tag, index) => (
                    <span 
                      key={index}
                      className="bg-black bg-opacity-50 text-white text-xs px-2 py-0.5 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                  {photo.tags.length > 2 && (
                    <span className="bg-black bg-opacity-50 text-white text-xs px-2 py-0.5 rounded-full">
                      +{photo.tags.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-600 font-medium">No photos found</p>
          <p className="text-gray-500 text-sm mt-1">Try changing your filters or check back later</p>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;
