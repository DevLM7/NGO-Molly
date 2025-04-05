import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EventList = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all'); // all, upcoming, past
  const [searchQuery, setSearchQuery] = useState('');

  // Mock events data
  const events = [
    {
      id: 1,
      title: 'Beach Cleanup Drive',
      date: '2025-04-15',
      location: 'Marina Beach',
      organization: 'Clean Earth NGO',
      volunteersNeeded: 20,
      volunteersJoined: 15,
      image: 'https://source.unsplash.com/800x400/?beach,cleanup',
      status: 'upcoming',
    },
    {
      id: 2,
      title: 'Food Distribution',
      date: '2025-04-20',
      location: 'City Center',
      organization: 'Food for All',
      volunteersNeeded: 10,
      volunteersJoined: 8,
      image: 'https://source.unsplash.com/800x400/?food,charity',
      status: 'upcoming',
    },
    {
      id: 3,
      title: 'Tree Planting',
      date: '2025-03-01',
      location: 'City Park',
      organization: 'Green Earth',
      volunteersNeeded: 30,
      volunteersJoined: 30,
      image: 'https://source.unsplash.com/800x400/?tree,planting',
      status: 'past',
    },
  ];

  const filteredEvents = events
    .filter(event => {
      if (filter === 'all') return true;
      return event.status === filter;
    })
    .filter(event =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Volunteer Events</h1>
        {user?.role === 'ngo' && (
          <Link
            to="/events/create"
            className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700"
          >
            Create Event
          </Link>
        )}
      </div>

      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-md ${
              filter === 'upcoming'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-4 py-2 rounded-md ${
              filter === 'past'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Past
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.map((event) => (
          <Link
            key={event.id}
            to={`/events/${event.id}`}
            className="block group"
          >
            <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600">
                  {event.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {event.organization}
                </p>
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex items-center text-sm text-gray-500">
                    <svg
                      className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <svg
                      className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {event.location}
                  </div>
                </div>
                <div className="mt-4">
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block text-indigo-600">
                          {Math.round((event.volunteersJoined / event.volunteersNeeded) * 100)}% Full
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-indigo-600">
                          {event.volunteersJoined}/{event.volunteersNeeded}
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                      <div
                        style={{ width: `${(event.volunteersJoined / event.volunteersNeeded) * 100}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default EventList;
