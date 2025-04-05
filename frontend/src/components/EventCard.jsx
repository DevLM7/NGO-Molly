import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const EventCard = ({ event, isRegistered, onRegister, onUnregister }) => {
  const {
    _id,
    title,
    description,
    date,
    location,
    tags,
    category,
    coverImage,
    registeredVolunteers,
    maxVolunteers,
    status
  } = event;

  // Format the date
  const formattedDate = format(new Date(date), 'MMM dd, yyyy • h:mm a');
  
  // Check if event is full
  const isFull = maxVolunteers && registeredVolunteers?.length >= maxVolunteers;
  
  // Generate a default cover image if none provided
  const defaultCover = `https://source.unsplash.com/400x200/?${encodeURIComponent(category || 'volunteer')}`;
  const eventImage = coverImage || defaultCover;

  return (
    <div className="card overflow-hidden transition-all duration-300 hover:shadow-lg">
      {/* Event Status Badge */}
      {status && (
        <div className={`absolute top-2 right-2 z-10 px-2 py-1 rounded-full text-xs font-medium
          ${status === 'upcoming' ? 'bg-blue-100 text-blue-800' : 
            status === 'ongoing' ? 'bg-green-100 text-green-800' : 
            status === 'completed' ? 'bg-gray-100 text-gray-800' : 
            'bg-red-100 text-red-800'}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      )}
      
      {/* Event Image */}
      <div className="relative h-40 overflow-hidden">
        <img 
          src={eventImage} 
          alt={title} 
          className="w-full h-full object-cover"
        />
        
        {/* Category Tag */}
        <div className="absolute bottom-2 left-2 bg-primary/90 text-white px-2 py-1 rounded text-xs">
          {category}
        </div>
      </div>
      
      <div className="p-4">
        {/* Title */}
        <h3 className="font-header font-bold text-lg mb-1 truncate">{title}</h3>
        
        {/* Date & Location */}
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formattedDate}
        </div>
        
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate">{location}</span>
        </div>
        
        {/* Description */}
        <p className="text-sm text-gray-700 mb-3 line-clamp-2">
          {description}
        </p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {tags?.map((tag, index) => (
            <span 
              key={index}
              className="bg-secondary/10 text-secondary px-2 py-0.5 rounded-full text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
        
        {/* Registration Info */}
        {maxVolunteers && (
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500">
              {registeredVolunteers?.length || 0}/{maxVolunteers} registered
            </span>
            
            {/* Progress Bar */}
            <div className="w-2/3 bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-primary h-1.5 rounded-full" 
                style={{ width: `${Math.min(100, (registeredVolunteers?.length || 0) / maxVolunteers * 100)}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex justify-between mt-2">
          <Link 
            to={`/events/${_id}`}
            className="text-secondary hover:text-secondary/80 text-sm font-medium"
          >
            View Details
          </Link>
          
          {status === 'upcoming' && (
            isRegistered ? (
              <button
                onClick={() => onUnregister(_id)}
                className="text-sm px-3 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200"
              >
                Cancel
              </button>
            ) : (
              <button
                onClick={() => onRegister(_id)}
                disabled={isFull}
                className={`text-sm px-3 py-1 rounded ${
                  isFull
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                }`}
              >
                {isFull ? 'Full' : 'Register'}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
