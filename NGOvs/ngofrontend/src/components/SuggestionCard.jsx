import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const SuggestionCard = ({ event, similarity, onRegister }) => {
  // Format the similarity score as a percentage
  const matchPercentage = Math.round(similarity * 100);
  
  // Format the date
  const formattedDate = format(new Date(event.date), 'MMM dd, yyyy • h:mm a');
  
  // Generate a default cover image if none provided
  const defaultCover = `https://source.unsplash.com/400x200/?${encodeURIComponent(event.category || 'volunteer')}`;
  const eventImage = event.coverImage || defaultCover;
  
  // Tags that matched user interests (this would be provided by the backend in a real app)
  const matchedTags = event.tags?.filter(tag => 
    localStorage.getItem('userInterests')?.includes(tag)
  ) || [];

  return (
    <div className="bg-surface rounded-lg shadow-md overflow-hidden border border-primary/20 hover:border-primary transition-colors relative">
      {/* Match Badge */}
      <div className="absolute top-2 right-2 z-10 bg-badge text-text font-medium rounded-full px-2 py-0.5 text-xs flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
        {matchPercentage}% Match
      </div>
      
      {/* Event Image */}
      <div className="relative h-40 overflow-hidden">
        <img 
          src={eventImage} 
          alt={event.title} 
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        
        {/* AI Recommendation Banner */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-secondary to-primary text-white text-xs text-center py-1">
          AI Suggested For You
        </div>
        
        {/* Category Tag */}
        <div className="absolute bottom-2 left-2 bg-primary/90 text-white px-2 py-1 rounded text-xs">
          {event.category}
        </div>
      </div>
      
      <div className="p-4">
        {/* Title */}
        <h3 className="font-header font-bold text-lg mb-1 truncate">{event.title}</h3>
        
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
          <span className="truncate">{event.location}</span>
        </div>
        
        {/* Why this was suggested */}
        <div className="bg-secondary/5 p-2 rounded mb-3">
          <p className="text-xs text-gray-700 font-medium mb-1">Why we suggested this:</p>
          <ul className="text-xs text-gray-600 list-disc list-inside space-y-0.5">
            {matchedTags.length > 0 && (
              <li>Matches your interests: {matchedTags.join(', ')}</li>
            )}
            <li>Close to your preferred location</li>
            <li>Similar to events you've attended</li>
          </ul>
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {event.tags?.map((tag, index) => (
            <span 
              key={index}
              className={`px-2 py-0.5 rounded-full text-xs ${
                matchedTags.includes(tag)
                  ? 'bg-secondary/20 text-secondary' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-between mt-2">
          <Link 
            to={`/events/${event._id}`}
            className="text-secondary hover:text-secondary/80 text-sm font-medium"
          >
            View Details
          </Link>
          
          <button
            onClick={() => onRegister(event._id)}
            className="text-sm px-3 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuggestionCard;
