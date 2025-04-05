import { useState } from 'react';

const ApplicationList = () => {
  const [applications, setApplications] = useState([
    {
      id: 1,
      volunteerName: 'John Doe',
      eventName: 'Beach Cleanup',
      status: 'pending',
      appliedDate: '2025-04-01',
      skills: ['Environmental', 'Leadership']
    },
    {
      id: 2,
      volunteerName: 'Jane Smith',
      eventName: 'Food Distribution',
      status: 'approved',
      appliedDate: '2025-04-02',
      skills: ['Communication', 'Organization']
    }
  ]);

  const handleStatusChange = (applicationId, newStatus) => {
    setApplications(applications.map(app => 
      app.id === applicationId ? { ...app, status: newStatus } : app
    ));
  };

  const getStatusBadgeClass = (status) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    switch (status) {
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Volunteer Applications</h1>
        <div className="flex gap-2">
          <button className="bg-white px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            Filter
          </button>
          <button className="bg-white px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            Export
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {applications.map((application) => (
            <li key={application.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      {application.volunteerName}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Applied for: {application.eventName}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={getStatusBadgeClass(application.status)}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                    <div className="flex gap-2">
                      {application.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(application.id, 'approved')}
                            className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusChange(application.id, 'rejected')}
                            className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex gap-2">
                    {application.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Applied on: {application.appliedDate}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ApplicationList;
