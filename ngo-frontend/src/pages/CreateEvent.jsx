import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    maxVolunteers: '',
    skills: '',
    duration: '',
    category: '',
    image: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Mock successful event creation
      const newEvent = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString(),
        status: 'active',
        currentVolunteers: 0
      };

      // Add to local storage for now (replace with API call later)
      const events = JSON.parse(localStorage.getItem('events') || '[]');
      events.push(newEvent);
      localStorage.setItem('events', JSON.stringify(events));

      toast.success('Event created successfully!');
      navigate('/events');
    } catch (error) {
      toast.error('Failed to create event. Please try again.');
      console.error('Error creating event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
  };

  const categories = [
    'Environmental',
    'Education',
    'Healthcare',
    'Community Service',
    'Animal Welfare',
    'Arts & Culture',
    'Disaster Relief',
    'Other'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8"
    >
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-3xl font-bold text-gray-900 mb-8"
      >
        Create New Event
      </motion.h1>
      
      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleSubmit}
        className="space-y-6 bg-white shadow-lg rounded-lg p-8"
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="col-span-2"
          >
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Event Title
            </label>
            <input
              type="text"
              name="title"
              id="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
            />
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="col-span-2"
          >
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              id="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
            />
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }}>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="date"
              name="date"
              id="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={formData.date}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
            />
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }}>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
              Duration (hours)
            </label>
            <input
              type="number"
              name="duration"
              id="duration"
              required
              min="1"
              value={formData.duration}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
            />
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }}>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              name="category"
              id="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }}>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              name="location"
              id="location"
              required
              value={formData.location}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
            />
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }}>
            <label htmlFor="maxVolunteers" className="block text-sm font-medium text-gray-700">
              Maximum Volunteers
            </label>
            <input
              type="number"
              name="maxVolunteers"
              id="maxVolunteers"
              required
              min="1"
              value={formData.maxVolunteers}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
            />
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }}>
            <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
              Required Skills
            </label>
            <input
              type="text"
              name="skills"
              id="skills"
              placeholder="e.g., Teaching, First Aid, etc."
              value={formData.skills}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
            />
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="col-span-2">
            <label htmlFor="image" className="block text-sm font-medium text-gray-700">
              Event Image
            </label>
            <input
              type="file"
              name="image"
              id="image"
              accept="image/*"
              onChange={handleChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </motion.div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <motion.button
            type="button"
            onClick={() => navigate('/events')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`${
              isSubmitting ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
            } py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200`}
          >
            {isSubmitting ? 'Creating...' : 'Create Event'}
          </motion.button>
        </div>
      </motion.form>
    </motion.div>
  );
};

export default CreateEvent;
