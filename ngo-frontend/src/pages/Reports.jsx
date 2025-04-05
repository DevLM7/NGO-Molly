import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import reportService from '../services/reportService';
import { toast } from 'react-toastify';

const Reports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadReports();
    loadStats();
  }, [user.uid]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const userReports = await reportService.getUserReports(user.uid);
      const assignedReports = await reportService.getAssignedReports(user.uid);
      
      // Combine and sort reports by date
      const allReports = [...userReports, ...assignedReports]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setReports(allReports);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const reportStats = await reportService.getReportStats(user.uid);
      setStats(reportStats);
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('Failed to load report statistics');
    }
  };

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      await reportService.updateReportStatus(reportId, newStatus);
      toast.success('Report status updated');
      loadReports();
      loadStats();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update report status');
    }
  };

  const handleAssign = async (reportId, assigneeId) => {
    try {
      await reportService.assignReport(reportId, assigneeId);
      toast.success('Report assigned successfully');
      loadReports();
    } catch (error) {
      console.error('Error assigning report:', error);
      toast.error('Failed to assign report');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-red-100 text-red-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.open;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Reports Management</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold capitalize">{key}</h3>
            <p className="text-3xl font-bold text-primary">{value}</p>
          </div>
        ))}
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">
                    No reports found
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {report.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {report.type}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedReport(report);
                          setShowModal(true);
                        }}
                        className="text-primary hover:text-primary-dark mr-4"
                      >
                        View
                      </button>
                      <select
                        value={report.status}
                        onChange={(e) => handleStatusChange(report.id, e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Details Modal */}
      {showModal && selectedReport && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                Report Details
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500 mb-2">
                  <span className="font-semibold">Title:</span> {selectedReport.title}
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  <span className="font-semibold">Description:</span> {selectedReport.description}
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  <span className="font-semibold">Type:</span> {selectedReport.type}
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  <span className="font-semibold">Status:</span> {selectedReport.status}
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  <span className="font-semibold">Created:</span>{' '}
                  {new Date(selectedReport.createdAt).toLocaleString()}
                </p>
                {selectedReport.assignedTo && (
                  <p className="text-sm text-gray-500 mb-2">
                    <span className="font-semibold">Assigned To:</span> {selectedReport.assignedTo}
                  </p>
                )}
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
