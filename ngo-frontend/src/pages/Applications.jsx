import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import applicationService from '../services/applicationService';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FiCheck, FiX, FiEye, FiTrash2 } from 'react-icons/fi';

const Applications = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadApplications();
    loadStats();
  }, [user.id]);

  const loadApplications = async () => {
    try {
      const data = await applicationService.getNGOApplications(user.id);
      setApplications(data);
    } catch (error) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await applicationService.getApplicationStats(user.id);
      setStats(data);
    } catch (error) {
      toast.error('Failed to load application statistics');
    }
  };

  const handleStatusChange = async (applicationId, status) => {
    try {
      setLoading(true);
      await applicationService.updateApplicationStatus(applicationId, status);
      toast.success(`Application ${status} successfully`);
      loadApplications();
      loadStats();
    } catch (error) {
      toast.error('Failed to update application status');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (applicationId) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        setLoading(true);
        await applicationService.deleteApplication(applicationId);
        toast.success('Application deleted successfully');
        loadApplications();
        loadStats();
      } catch (error) {
        toast.error('Failed to delete application');
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Applications</h1>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg shadow"
          >
            <h3 className="text-lg font-semibold text-gray-600">Total Applications</h3>
            <p className="text-3xl font-bold">{stats.total}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-lg shadow"
          >
            <h3 className="text-lg font-semibold text-gray-600">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-lg shadow"
          >
            <h3 className="text-lg font-semibold text-gray-600">Approved</h3>
            <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-lg shadow"
          >
            <h3 className="text-lg font-semibold text-gray-600">Rejected</h3>
            <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
          </motion.div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No applications found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volunteer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.map((application) => (
                <tr key={application.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{application.volunteerName}</div>
                    <div className="text-sm text-gray-500">{application.volunteerEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{application.eventTitle}</div>
                    <div className="text-sm text-gray-500">{application.eventDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(application.createdAt?.toDate()).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedApplication(application);
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FiEye className="h-5 w-5" />
                      </button>
                      {application.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(application.id, 'approved')}
                            className="text-green-600 hover:text-green-900"
                          >
                            <FiCheck className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(application.id, 'rejected')}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FiX className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(application.id)}
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
            <h2 className="text-2xl font-bold mb-4">Application Details</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Volunteer Information</h3>
                <p className="mt-1">{selectedApplication.volunteerName}</p>
                <p className="text-gray-500">{selectedApplication.volunteerEmail}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Event Information</h3>
                <p className="mt-1">{selectedApplication.eventTitle}</p>
                <p className="text-gray-500">{selectedApplication.eventDate}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Message</h3>
                <p className="mt-1">{selectedApplication.message}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedApplication.status)}`}>
                  {selectedApplication.status}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Applied On</h3>
                <p className="mt-1">{new Date(selectedApplication.createdAt?.toDate()).toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications; 