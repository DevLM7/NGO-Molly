import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Reports = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState('month');
  const [reportType, setReportType] = useState('volunteer');

  // Mock data
  const mockData = {
    volunteer: {
      totalVolunteers: 150,
      activeVolunteers: 89,
      volunteerHours: 1250,
      topVolunteers: [
        { name: 'John Doe', hours: 45 },
        { name: 'Jane Smith', hours: 38 },
        { name: 'Mike Johnson', hours: 32 },
      ],
    },
    event: {
      totalEvents: 25,
      completedEvents: 18,
      upcomingEvents: 7,
      participationRate: 85,
      popularEvents: [
        { name: 'Beach Cleanup', participants: 45 },
        { name: 'Food Distribution', participants: 38 },
        { name: 'Tree Planting', participants: 32 },
      ],
    },
    impact: {
      peopleHelped: 2500,
      areasServed: 12,
      totalDonations: 15000,
      successStories: 15,
    },
  };

  const getButtonClass = (active) => 
    `px-4 py-2 rounded-md ${
      active
        ? 'bg-indigo-600 text-white'
        : 'bg-white text-gray-700 border border-gray-300'
    }`;

  const renderVolunteerMetrics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900">Total Volunteers</h3>
        <p className="mt-2 text-3xl font-semibold text-indigo-600">{mockData.volunteer.totalVolunteers}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900">Active Volunteers</h3>
        <p className="mt-2 text-3xl font-semibold text-indigo-600">{mockData.volunteer.activeVolunteers}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900">Total Hours</h3>
        <p className="mt-2 text-3xl font-semibold text-indigo-600">{mockData.volunteer.volunteerHours}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900">Avg Hours/Volunteer</h3>
        <p className="mt-2 text-3xl font-semibold text-indigo-600">
          {Math.round(mockData.volunteer.volunteerHours / mockData.volunteer.activeVolunteers)}
        </p>
      </div>
    </div>
  );

  const renderEventMetrics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900">Total Events</h3>
        <p className="mt-2 text-3xl font-semibold text-indigo-600">{mockData.event.totalEvents}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900">Completed Events</h3>
        <p className="mt-2 text-3xl font-semibold text-indigo-600">{mockData.event.completedEvents}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900">Upcoming Events</h3>
        <p className="mt-2 text-3xl font-semibold text-indigo-600">{mockData.event.upcomingEvents}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900">Participation Rate</h3>
        <p className="mt-2 text-3xl font-semibold text-indigo-600">{mockData.event.participationRate}%</p>
      </div>
    </div>
  );

  const renderImpactMetrics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900">People Helped</h3>
        <p className="mt-2 text-3xl font-semibold text-indigo-600">{mockData.impact.peopleHelped}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900">Areas Served</h3>
        <p className="mt-2 text-3xl font-semibold text-indigo-600">{mockData.impact.areasServed}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900">Total Donations</h3>
        <p className="mt-2 text-3xl font-semibold text-indigo-600">${mockData.impact.totalDonations}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900">Success Stories</h3>
        <p className="mt-2 text-3xl font-semibold text-indigo-600">{mockData.impact.successStories}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
        <button
          className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700"
          onClick={() => {
            console.log('Exporting report...');
          }}
        >
          Export PDF
        </button>
      </div>

      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setReportType('volunteer')}
            className={getButtonClass(reportType === 'volunteer')}
          >
            Volunteer Metrics
          </button>
          <button
            onClick={() => setReportType('event')}
            className={getButtonClass(reportType === 'event')}
          >
            Event Metrics
          </button>
          <button
            onClick={() => setReportType('impact')}
            className={getButtonClass(reportType === 'impact')}
          >
            Impact Metrics
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setDateRange('month')}
            className={getButtonClass(dateRange === 'month')}
          >
            This Month
          </button>
          <button
            onClick={() => setDateRange('quarter')}
            className={getButtonClass(dateRange === 'quarter')}
          >
            This Quarter
          </button>
          <button
            onClick={() => setDateRange('year')}
            className={getButtonClass(dateRange === 'year')}
          >
            This Year
          </button>
        </div>
      </div>

      {reportType === 'volunteer' && renderVolunteerMetrics()}
      {reportType === 'event' && renderEventMetrics()}
      {reportType === 'impact' && renderImpactMetrics()}

      <div className="mt-8">
        {reportType === 'volunteer' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Volunteers</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hours Contributed
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockData.volunteer.topVolunteers.map((volunteer, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {volunteer.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {volunteer.hours} hours
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === 'event' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Most Popular Events</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Participants
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockData.event.popularEvents.map((event, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {event.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event.participants} volunteers
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
