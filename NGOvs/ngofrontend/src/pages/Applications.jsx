import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, arrayUnion, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-toastify';
import { FiUser, FiCheck, FiX, FiMail, FiCalendar, FiAward, FiBriefcase } from 'react-icons/fi';

const Applications = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!user) return;

    // Set up real-time listener for applications
    const applicationsQuery = query(
      collection(db, 'applications'),
      where('ngoId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(applicationsQuery, async (snapshot) => {
      try {
        const applicationsData = [];
        
        for (const docChange of snapshot.docChanges()) {
          const application = docChange.doc.data();
          
          // Fetch volunteer details
          const volunteerDoc = await getDoc(doc(db, 'users', application.volunteerId));
          const volunteerData = volunteerDoc.data();

          if (docChange.type === 'removed') {
            setApplications(prev => prev.filter(app => app.id !== docChange.doc.id));
            continue;
          }

          const applicationData = {
            id: docChange.doc.id,
            ...application,
            volunteer: {
              id: volunteerDoc.id,
              name: volunteerData.name,
              email: volunteerData.email,
              skills: volunteerData.skills || [],
              interests: volunteerData.interests || [],
              profileImage: volunteerData.profileImage,
              bio: volunteerData.bio,
              totalHours: volunteerData.totalHours || 0,
              joinedDate: volunteerData.createdAt ? new Date(volunteerData.createdAt.toDate()).toLocaleDateString() : 'N/A'
            }
          };

          if (docChange.type === 'added') {
            applicationsData.push(applicationData);
          } else if (docChange.type === 'modified') {
            setApplications(prev => 
              prev.map(app => app.id === docChange.doc.id ? applicationData : app)
            );
          }
        }

        if (applicationsData.length > 0) {
          setApplications(prev => [...prev, ...applicationsData]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error in real-time updates:', error);
        toast.error('Failed to get real-time updates');
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleAccept = async (applicationId) => {
    try {
      const applicationRef = doc(db, 'applications', applicationId);
      const application = applications.find(app => app.id === applicationId);

      await updateDoc(applicationRef, {
        status: 'accepted',
        updatedAt: new Date()
      });

      const volunteerRef = doc(db, 'users', application.volunteer.id);
      await updateDoc(volunteerRef, {
        connectedNGOs: arrayUnion(user.uid)
      });

      toast.success('Application accepted successfully');
    } catch (error) {
      console.error('Error accepting application:', error);
      toast.error('Failed to accept application');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      const applicationRef = doc(db, 'applications', selectedApplicationId);
      await updateDoc(applicationRef, {
        status: 'rejected',
        rejectionReason: rejectReason,
        updatedAt: new Date()
      });

      toast.success('Application rejected');
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedApplicationId(null);
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('Failed to reject application');
    }
  };

  const openRejectModal = (applicationId) => {
    setSelectedApplicationId(applicationId);
    setShowRejectModal(true);
  };

  const openDetailsModal = (application) => {
    setSelectedApplication(application);
    setShowDetailsModal(true);
  };

  const filteredApplications = applications.filter(app => {
    if (statusFilter === 'all') return true;
    return app.status === statusFilter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Volunteer Applications</h1>
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">All Applications</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FiUser className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No Applications</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have any {statusFilter !== 'all' ? statusFilter : ''} volunteer applications at the moment.
            </p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FiUser className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No {statusFilter} Applications</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have any {statusFilter} applications at the moment.
            </p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredApplications.map((application) => (
                <li key={application.id}>
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center cursor-pointer" onClick={() => openDetailsModal(application)}>
                        <div className="flex-shrink-0 h-12 w-12">
                          {application.volunteer.profileImage ? (
                            <img
                              className="h-12 w-12 rounded-full object-cover"
                              src={application.volunteer.profileImage}
                              alt={application.volunteer.name}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                              <FiUser className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">
                            {application.volunteer.name}
                          </h3>
                          <div className="flex items-center text-sm text-gray-500">
                            <FiMail className="flex-shrink-0 mr-1.5 h-4 w-4" />
                            <span>{application.volunteer.email}</span>
                          </div>
                          <div className="mt-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {application.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleAccept(application.id)}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              <FiCheck className="mr-2 h-4 w-4" />
                              Accept
                            </button>
                            <button
                              onClick={() => openRejectModal(application.id)}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <FiX className="mr-2 h-4 w-4" />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-sm text-gray-500">{application.volunteer.bio}</div>
                      {application.volunteer.skills.length > 0 && (
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-2">
                            {application.volunteer.skills.map((skill) => (
                              <span
                                key={skill}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Reject Application</h3>
            <div className="mb-4">
              <label htmlFor="rejectReason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Rejection
              </label>
              <textarea
                id="rejectReason"
                rows={4}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Please provide a reason for rejecting this application..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedApplicationId(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedApplication && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-16 w-16">
                  {selectedApplication.volunteer.profileImage ? (
                    <img
                      className="h-16 w-16 rounded-full object-cover"
                      src={selectedApplication.volunteer.profileImage}
                      alt={selectedApplication.volunteer.name}
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <FiUser className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedApplication.volunteer.name}
                  </h2>
                  <p className="text-gray-500">{selectedApplication.volunteer.email}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <FiBriefcase className="mr-2" /> Bio
                </h3>
                <p className="mt-2 text-gray-600">{selectedApplication.volunteer.bio || 'No bio provided'}</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <FiAward className="mr-2" /> Skills
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedApplication.volunteer.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <FiCalendar className="mr-2" /> Volunteer Information
                </h3>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Hours</p>
                    <p className="text-lg font-medium text-gray-900">{selectedApplication.volunteer.totalHours}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Joined Date</p>
                    <p className="text-lg font-medium text-gray-900">{selectedApplication.volunteer.joinedDate}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
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