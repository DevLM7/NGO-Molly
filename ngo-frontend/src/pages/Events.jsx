import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import eventService from '../services/eventService';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiCalendar } from 'react-icons/fi';

const Events = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    maxVolunteers: '',
    skills: '',
    duration: ''
  });

  useEffect(() => {
    loadEvents();
    loadStats();
  }, [user.uid]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      console.log('Loading events for NGO:', user.uid);
      const data = await eventService.getNGOEvents(user.uid);
      console.log('Loaded events:', data);
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error(error.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      console.log('Loading stats for NGO:', user.uid);
      const data = await eventService.getEventStats(user.uid);
      console.log('Loaded stats:', data);
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error(error.message || 'Failed to load event statistics');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const eventData = {
        ...formData,
        ngoId: user.uid,
        maxVolunteers: parseInt(formData.maxVolunteers),
        skills: formData.skills.split(',').map(skill => skill.trim()),
        createdBy: user.uid
      };
      
      if (selectedEvent) {
        await eventService.updateEvent(selectedEvent.id, eventData);
        toast.success('Event updated successfully');
      } else {
        await eventService.createEvent(eventData);
        toast.success('Event created successfully');
      }
      
      setShowModal(false);
      setSelectedEvent(null);
      setFormData({
        title: '',
        description: '',
        date: '',
        location: '',
        maxVolunteers: '',
        skills: '',
        duration: ''
      });
      loadEvents();
      loadStats();
    } catch (error) {
      toast.error(error.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        setLoading(true);
        await eventService.deleteEvent(eventId);
        toast.success('Event deleted successfully');
        loadEvents();
        loadStats();
      } catch (error) {
        toast.error('Failed to delete event');
      } finally {
        setLoading(false);
      }
    }
  };

  const getEventStatus = (date) => {
    try {
      const eventDate = new Date(date);
      const now = new Date();
      return eventDate >= now ? 'upcoming' : 'completed';
    } catch (error) {
      console.error('Error determining event status:', error);
      return 'unknown';
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Events</h1>
        <button
          onClick={() => {
            setSelectedEvent(null);
            setFormData({
              title: '',
              description: '',
              date: '',
              location: '',
              maxVolunteers: '',
              skills: '',
              duration: ''
            });
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <FiPlus /> Create Event
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg shadow"
          >
            <h3 className="text-lg font-semibold text-gray-600">Total Events</h3>
            <p className="text-3xl font-bold">{stats.total}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-lg shadow"
          >
            <h3 className="text-lg font-semibold text-gray-600">Upcoming</h3>
            <p className="text-3xl font-bold text-green-600">{stats.upcoming}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-lg shadow"
          >
            <h3 className="text-lg font-semibold text-gray-600">Completed</h3>
            <p className="text-3xl font-bold text-gray-600">{stats.completed}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-lg shadow"
          >
            <h3 className="text-lg font-semibold text-gray-600">Total Volunteers</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalVolunteers}</p>
          </motion.div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No events found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volunteers</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.map((event) => (
                <tr key={event.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{event.title}</div>
                    <div className="text-sm text-gray-500">{event.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(event.date)}
                    </div>
                    <div className="text-sm text-gray-500">{event.duration}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {event.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(getEventStatus(event.date))}`}>
                      {getEventStatus(event.date)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(event.volunteers?.length || 0)} / {event.maxVolunteers}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedEvent(event);
                          setFormData({
                            title: event.title,
                            description: event.description,
                            date: event.date,
                            location: event.location,
                            maxVolunteers: event.maxVolunteers.toString(),
                            skills: event.skills.join(', '),
                            duration: event.duration
                          });
                          setShowModal(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <FiEdit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">
              {selectedEvent ? 'Edit Event' : 'Create Event'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="datetime-local"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                    placeholder="e.g., 2 hours"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Maximum Volunteers</label>
                  <input
                    type="number"
                    name="maxVolunteers"
                    value={formData.maxVolunteers}
                    onChange={handleChange}
                    required
                    min="1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Required Skills</label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="Comma-separated skills"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events; 