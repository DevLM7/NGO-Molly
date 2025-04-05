import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import resourceService from '../services/resourceService';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiDownload, FiArchive } from 'react-icons/fi';

const Resources = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'document',
    eventId: '',
    file: null
  });

  useEffect(() => {
    loadResources();
    loadStats();
  }, [user.id]);

  const loadResources = async () => {
    try {
      const data = await resourceService.getNGOResources(user.id);
      setResources(data);
    } catch (error) {
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await resourceService.getResourceStats(user.id);
      setStats(data);
    } catch (error) {
      toast.error('Failed to load resource statistics');
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const resourceData = {
        ...formData,
        ngoId: user.id,
        file: formData.file
      };
      delete resourceData.file;
      
      if (selectedResource) {
        await resourceService.updateResource(selectedResource.id, resourceData, formData.file);
        toast.success('Resource updated successfully');
      } else {
        await resourceService.createResource(resourceData, formData.file);
        toast.success('Resource created successfully');
      }
      
      setShowModal(false);
      setSelectedResource(null);
      setFormData({
        title: '',
        description: '',
        type: 'document',
        eventId: '',
        file: null
      });
      loadResources();
      loadStats();
    } catch (error) {
      toast.error(error.message || 'Failed to save resource');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (resourceId) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        setLoading(true);
        await resourceService.deleteResource(resourceId);
        toast.success('Resource deleted successfully');
        loadResources();
        loadStats();
      } catch (error) {
        toast.error('Failed to delete resource');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleArchive = async (resourceId) => {
    try {
      setLoading(true);
      await resourceService.updateResourceStatus(resourceId, 'archived');
      toast.success('Resource archived successfully');
      loadResources();
      loadStats();
    } catch (error) {
      toast.error('Failed to archive resource');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Resources</h1>
        <button
          onClick={() => {
            setSelectedResource(null);
            setFormData({
              title: '',
              description: '',
              type: 'document',
              eventId: '',
              file: null
            });
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <FiPlus /> Add Resource
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg shadow"
          >
            <h3 className="text-lg font-semibold text-gray-600">Total Resources</h3>
            <p className="text-3xl font-bold">{stats.total}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-lg shadow"
          >
            <h3 className="text-lg font-semibold text-gray-600">Active</h3>
            <p className="text-3xl font-bold text-green-600">{stats.active}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-lg shadow"
          >
            <h3 className="text-lg font-semibold text-gray-600">Archived</h3>
            <p className="text-3xl font-bold text-gray-600">{stats.archived}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-lg shadow"
          >
            <h3 className="text-lg font-semibold text-gray-600">Types</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(stats.byType).map(([type, count]) => (
                <span key={type} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  {type}: {count}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No resources found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {resources.map((resource) => (
                <tr key={resource.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{resource.title}</div>
                    <div className="text-sm text-gray-500">{resource.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {resource.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(resource.status)}`}>
                      {resource.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(resource.createdAt?.toDate()).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {resource.fileUrl && (
                        <a
                          href={resource.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FiDownload className="h-5 w-5" />
                        </a>
                      )}
                      <button
                        onClick={() => {
                          setSelectedResource(resource);
                          setFormData({
                            title: resource.title,
                            description: resource.description,
                            type: resource.type,
                            eventId: resource.eventId || '',
                            file: null
                          });
                          setShowModal(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <FiEdit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleArchive(resource.id)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <FiArchive className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(resource.id)}
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
              {selectedResource ? 'Edit Resource' : 'Add Resource'}
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
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="document">Document</option>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Event (Optional)</label>
                  <input
                    type="text"
                    name="eventId"
                    value={formData.eventId}
                    onChange={handleChange}
                    placeholder="Event ID"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">File</label>
                  <input
                    type="file"
                    name="file"
                    onChange={handleChange}
                    className="mt-1 block w-full"
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

export default Resources; 