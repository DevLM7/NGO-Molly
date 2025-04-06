import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { eventAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiCalendar, FiMapPin, FiClock, FiUsers } from 'react-icons/fi';

const EventList = ({ onSelectEvent }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await eventAPI.getNGOEvents();
        setEvents(response.data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No events found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Events</h2>
      
      {events.map((event, index) => (
        <motion.div
          key={event._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div 
            className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSelectEvent && onSelectEvent(event)}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
              <span className={`px-2 py-1 text-xs rounded ${
                new Date(event.date) < new Date() 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {new Date(event.date) < new Date() ? 'Completed' : 'Upcoming'}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <FiCalendar className="mr-2" />
                {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
              
              <div className="flex items-center">
                <FiMapPin className="mr-2" />
                {event.location}
              </div>
              
              <div className="flex items-center">
                <FiUsers className="mr-2" />
                {event.volunteersRegistered?.length || 0} volunteers registered
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default EventList;
