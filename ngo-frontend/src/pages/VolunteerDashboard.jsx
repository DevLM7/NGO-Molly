import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import EventCard from '../components/EventCard';
import SuggestionCard from '../components/SuggestionCard';
import PostFeed from '../components/PostFeed';
import { useAuth } from '../context/AuthContext.js';
import { eventAPI, badgeAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiSearch, FiFilter, FiX, FiMapPin, FiUsers, FiAward, FiClock, FiArrowRight, FiGrid, FiList, FiCalendar, FiHome } from 'react-icons/fi';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import ngoService from '../services/ngoService';
import userService from '../services/userService';

const VolunteerDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState({
    suggestions: true,
    upcoming: true,
    feed: true,
    ngos: true
  });
  const [suggestedEvents, setSuggestedEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({
    eventsAttended: 0,
    volunteerHours: 0,
    badges: []
  });
  const [ngos, setNgos] = useState([]);
  const [connectedNGOs, setConnectedNGOs] = useState([]);
  const [pendingNGOs, setPendingNGOs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, available, registered
  const [showFilters, setShowFilters] = useState(false);
  const [causeFilter, setCauseFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('overview'); // overview, ngos, events, feed

  // Load suggested events
  useEffect(() => {
    const fetchSuggestedEvents = async () => {
      setLoading(prev => ({ ...prev, suggestions: true }));
      try {
        const response = await eventAPI.getSuggestedEvents();
        setSuggestedEvents(response.data.events || []);
      } catch (error) {
        console.error('Error fetching suggested events:', error);
        toast.error('Failed to load suggested events');
      } finally {
        setLoading(prev => ({ ...prev, suggestions: false }));
      }
    };

    fetchSuggestedEvents();
  }, [user.uid]);

  // Load upcoming events
  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      setLoading(prev => ({ ...prev, upcoming: true }));
      try {
        const response = await eventAPI.getAll();
        const upcoming = response.data.filter(event => 
          new Date(event.date) > new Date() && 
          event.volunteers?.includes(user.uid)
        );
        setUpcomingEvents(upcoming);
      } catch (error) {
        console.error('Error fetching upcoming events:', error);
        toast.error('Failed to load upcoming events');
      } finally {
        setLoading(prev => ({ ...prev, upcoming: false }));
      }
    };

    fetchUpcomingEvents();
  }, [user.uid]);

  // Load volunteer stats and badges
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get badges
        const badgesResponse = await badgeAPI.getVolunteerBadges();
        const badges = badgesResponse.data.badges || [];
        
        // Get badge progress
        const progressResponse = await badgeAPI.getBadgeProgress();
        const progress = progressResponse.data.progress || {};
        
        setStats({
          eventsAttended: progress.events?.current || 0,
          volunteerHours: progress.hours?.current || 0,
          badges: badges.map(badge => badge.name),
          progress: progress
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast.error('Failed to load volunteer statistics');
      }
    };

    fetchStats();
  }, [user.uid]);

  // Load NGOs and user's connected/pending NGOs with real-time updates
  useEffect(() => {
    let unsubscribeNGOs;
    
    const setupNGOs = async () => {
      setLoading(prev => ({ ...prev, ngos: true }));
      try {
        console.log('Setting up NGO subscription...');
        
        // First, get all NGOs directly
        const initialNGOs = await ngoService.getAllNGOs();
        console.log('Initial NGOs:', initialNGOs);
        setNgos(initialNGOs);
        
        // Then set up real-time listener for updates
        unsubscribeNGOs = ngoService.subscribeToNGOs((updatedNGOs) => {
          console.log('Received real-time NGO update:', updatedNGOs.length);
          console.log('Updated NGOs:', updatedNGOs);
          
          // Update the NGOs state with the latest data from Firebase
          setNgos(updatedNGOs);
          
          // Also update connected and pending NGOs if needed
          if (user) {
            userService.getUserData(user.uid).then(userData => {
              if (userData) {
                // Filter out any NGOs that no longer exist
                const validConnectedNGOs = (userData.connectedNGOs || []).filter(ngoId => 
                  updatedNGOs.some(ngo => ngo.id === ngoId)
                );
                
                const validPendingNGOs = (userData.pendingNGOs || []).filter(ngoId => 
                  updatedNGOs.some(ngo => ngo.id === ngoId)
                );
                
                console.log('Connected NGOs:', validConnectedNGOs);
                console.log('Pending NGOs:', validPendingNGOs);
                
                setConnectedNGOs(validConnectedNGOs);
                setPendingNGOs(validPendingNGOs);
              }
            });
          }
          
          setLoading(prev => ({ ...prev, ngos: false }));
        });
      } catch (error) {
        console.error('Error setting up NGO listeners:', error);
        toast.error('Failed to load NGO list');
        setLoading(prev => ({ ...prev, ngos: false }));
      }
    };

    setupNGOs();
    
    // Cleanup function to unsubscribe when component unmounts
    return () => {
      if (unsubscribeNGOs) {
        unsubscribeNGOs();
      }
    };
  }, [user]);

  // Load social feed
  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(prev => ({ ...prev, feed: true }));
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/feed/user`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const data = await response.json();
        setPosts(data.posts || []);
      } catch (error) {
        console.error('Error fetching feed:', error);
      } finally {
        setLoading(prev => ({ ...prev, feed: false }));
      }
    };

    fetchFeed();
  }, [user.uid]);

  const handleConnect = async (ngoId) => {
    try {
      // Update user's pending NGOs in Firebase
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        pendingNGOs: arrayUnion(ngoId)
      });
      
      // Update local state
      setPendingNGOs(prev => [...prev, ngoId]);
      
      // Show success message
      toast.success('Request sent successfully');
    } catch (error) {
      console.error('Error connecting to NGO:', error);
      toast.error('Failed to connect to NGO: ' + error.message);
    }
  };

  const handleRegister = async (eventId) => {
    try {
      await eventAPI.register(eventId);
      toast.success('Successfully registered for event');
      
      // Refresh upcoming events
      const response = await eventAPI.getAll();
      const upcoming = response.data.filter(event => 
        new Date(event.date) > new Date() && 
        event.volunteers?.includes(user.uid)
      );
      setUpcomingEvents(upcoming);
      
      // Check for new badges
      await badgeAPI.checkAndAwardBadges();
      
    } catch (error) {
      console.error('Error registering for event:', error);
      toast.error('Failed to register for event');
    }
  };

  const handleUnregister = async (eventId) => {
    try {
      await eventAPI.unregister(eventId);
      toast.success('Successfully unregistered from event');
      
      // Refresh upcoming events
      const response = await eventAPI.getAll();
      const upcoming = response.data.filter(event => 
        new Date(event.date) > new Date() && 
        event.volunteers?.includes(user.uid)
      );
      setUpcomingEvents(upcoming);
      
    } catch (error) {
      console.error('Error unregistering from event:', error);
      toast.error('Failed to unregister from event');
    }
  };

  // Filter NGOs based on search term and filters
  const filteredNGOs = useMemo(() => {
    console.log('Filtering NGOs...');
    console.log('Total NGOs:', ngos.length);
    console.log('NGOs data:', ngos);
    console.log('Search term:', searchTerm);
    console.log('Cause filter:', causeFilter);
    console.log('Location filter:', locationFilter);
    
    const filtered = ngos.filter(ngo => {
      // Skip any NGOs that don't have an ID or required fields
      if (!ngo.id || !ngo.name || !ngo.description) {
        console.log('Skipping invalid NGO:', ngo);
        return false;
      }
      
      // Check if NGO matches search term
      const matchesSearch = searchTerm === '' || 
        ngo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ngo.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Check if NGO matches cause filter
      const matchesCause = causeFilter === 'all' || 
        (ngo.causes && ngo.causes.includes(causeFilter));
      
      // Check if NGO matches location filter
      const matchesLocation = locationFilter === 'all' || 
        (ngo.location && ngo.location === locationFilter);
      
      const result = matchesSearch && matchesCause && matchesLocation;
      
      if (!result) {
        console.log('NGO filtered out:', ngo.name, {
          matchesSearch,
          matchesCause,
          matchesLocation
        });
      }
      
      return result;
    });
    
    console.log('Filtered NGOs:', filtered.length);
    return filtered;
  }, [ngos, searchTerm, causeFilter, locationFilter]);

  // Get unique causes and locations for filters
  const allCauses = useMemo(() => {
    const causes = [...new Set(ngos.flatMap(ngo => ngo.causes || []))];
    console.log('All causes:', causes);
    return causes;
  }, [ngos]);

  const allLocations = useMemo(() => {
    const locations = [...new Set(ngos.map(ngo => ngo.location).filter(Boolean))];
    console.log('All locations:', locations);
    return locations;
  }, [ngos]);

  // Render the NGO list section
  const renderNGOList = () => {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">NGOs</h2>
          <Link to="/ngos" className="text-blue-600 hover:text-blue-800 flex items-center">
            View All <FiArrowRight className="ml-1" />
          </Link>
        </div>
        
        {/* Search and Filter */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search NGOs..."
              className="w-full px-4 py-2 border rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FiSearch className="absolute right-3 top-3 text-gray-400" />
          </div>
          
          <div className="mt-2 flex items-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-800"
            >
              <FiFilter className="mr-1" /> Filters
            </button>
            
            {showFilters && (
              <div className="ml-4 flex space-x-2">
                <select
                  className="px-2 py-1 border rounded text-sm"
                  value={causeFilter}
                  onChange={(e) => setCauseFilter(e.target.value)}
                >
                  <option value="all">All Causes</option>
                  {allCauses.map(cause => (
                    <option key={cause} value={cause}>{cause}</option>
                  ))}
                </select>
                
                <select
                  className="px-2 py-1 border rounded text-sm"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                >
                  <option value="all">All Locations</option>
                  {allLocations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
                
                <button
                  onClick={() => {
                    setCauseFilter('all');
                    setLocationFilter('all');
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <FiX />
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* NGO List */}
        {loading.ngos ? (
          <div className="text-center py-4">Loading NGOs...</div>
        ) : ngos.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-600">No NGOs found in the database</p>
            <p className="text-sm text-gray-500 mt-2">Please check your Firebase configuration</p>
          </div>
        ) : filteredNGOs.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-600">No NGOs match your search criteria</p>
            <p className="text-sm text-gray-500 mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNGOs.slice(0, 3).map(ngo => (
              <div key={ngo.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">{ngo.name || 'Unnamed NGO'}</h3>
                    <p className="text-sm text-gray-600">{ngo.description || 'No description available'}</p>
                  </div>
                  {ngo.logo && (
                    <img src={ngo.logo} alt={ngo.name} className="w-12 h-12 rounded-full" />
                  )}
                </div>
                
                <div className="mt-2 flex flex-wrap gap-2">
                  {ngo.causes && ngo.causes.map(cause => (
                    <span key={cause} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      {cause}
                    </span>
                  ))}
                </div>
                
                <div className="mt-3 flex items-center text-sm text-gray-600">
                  <FiMapPin className="mr-1" />
                  <span>{ngo.location || 'Location not specified'}</span>
                </div>
                
                <div className="mt-3 flex justify-between items-center">
                  <div className="flex items-center text-sm text-gray-600">
                    <FiUsers className="mr-1" />
                    <span>{ngo.volunteerCount || 0} volunteers</span>
                  </div>
                  
                  {connectedNGOs.includes(ngo.id) ? (
                    <Link
                      to={`/ngo/dashboard?id=${ngo.id}`}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm hover:bg-green-200"
                    >
                      Connected
                    </Link>
                  ) : pendingNGOs.includes(ngo.id) ? (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md text-sm">
                      Pending
                    </span>
                  ) : (
                    <button
                      onClick={() => handleConnect(ngo.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render the full NGO tab content
  const renderNGOTab = () => {
    console.log('Rendering NGO tab');
    console.log('Loading state:', loading.ngos);
    console.log('Total NGOs:', ngos.length);
    console.log('Filtered NGOs:', filteredNGOs.length);
    
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">NGO Directory</h2>
        
        {/* Search and Filter */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search NGOs..."
              className="w-full px-4 py-2 border rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FiSearch className="absolute right-3 top-3 text-gray-400" />
          </div>
          
          <div className="mt-2 flex items-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-800"
            >
              <FiFilter className="mr-1" /> Filters
            </button>
            
            {showFilters && (
              <div className="ml-4 flex space-x-2">
                <select
                  className="px-2 py-1 border rounded text-sm"
                  value={causeFilter}
                  onChange={(e) => setCauseFilter(e.target.value)}
                >
                  <option value="all">All Causes</option>
                  {allCauses.map(cause => (
                    <option key={cause} value={cause}>{cause}</option>
                  ))}
                </select>
                
                <select
                  className="px-2 py-1 border rounded text-sm"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                >
                  <option value="all">All Locations</option>
                  {allLocations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
                
                <button
                  onClick={() => {
                    setCauseFilter('all');
                    setLocationFilter('all');
                    setSearchTerm('');
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <FiX />
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* NGO List */}
        {loading.ngos ? (
          <div className="text-center py-4">Loading NGOs...</div>
        ) : ngos.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-600">No NGOs found in the database</p>
            <p className="text-sm text-gray-500 mt-2">Please check your Firebase configuration</p>
          </div>
        ) : filteredNGOs.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-600">No NGOs match your search criteria</p>
            <p className="text-sm text-gray-500 mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNGOs.map(ngo => (
              <div key={ngo.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">{ngo.name || 'Unnamed NGO'}</h3>
                    <p className="text-sm text-gray-600">{ngo.description || 'No description available'}</p>
                  </div>
                  {ngo.logo && (
                    <img src={ngo.logo} alt={ngo.name} className="w-12 h-12 rounded-full" />
                  )}
                </div>
                
                <div className="mt-2 flex flex-wrap gap-2">
                  {ngo.causes && ngo.causes.map(cause => (
                    <span key={cause} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      {cause}
                    </span>
                  ))}
                </div>
                
                <div className="mt-3 flex items-center text-sm text-gray-600">
                  <FiMapPin className="mr-1" />
                  <span>{ngo.location || 'Location not specified'}</span>
                </div>
                
                <div className="mt-3 flex justify-between items-center">
                  <div className="flex items-center text-sm text-gray-600">
                    <FiUsers className="mr-1" />
                    <span>{ngo.volunteerCount || 0} volunteers</span>
                  </div>
                  
                  {connectedNGOs.includes(ngo.id) ? (
                    <Link
                      to={`/ngo/dashboard?id=${ngo.id}`}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm hover:bg-green-200"
                    >
                      Connected
                    </Link>
                  ) : pendingNGOs.includes(ngo.id) ? (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md text-sm">
                      Pending
                    </span>
                  ) : (
                    <button
                      onClick={() => handleConnect(ngo.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render the overview tab content
  const renderOverviewTab = () => {
    return (
      <>
        {/* Stats Overview */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Your Impact</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{stats.eventsAttended}</p>
              <p className="text-sm text-gray-600">Events Attended</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{stats.volunteerHours}</p>
              <p className="text-sm text-gray-600">Hours Volunteered</p>
            </div>
          </div>
        </div>
        
        {/* NGO List Section */}
        {renderNGOList()}
        
        {/* Upcoming Events */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Your Upcoming Events</h2>
          {loading.upcoming ? (
            <div className="text-center py-4">Loading...</div>
          ) : upcomingEvents.length > 0 ? (
            <div className="grid gap-4">
              {upcomingEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  onRegister={() => handleRegister(event.id)}
                  onUnregister={() => handleUnregister(event.id)}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No upcoming events</p>
          )}
        </div>
      </>
    );
  };

  // Render the events tab content
  const renderEventsTab = () => {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Your Events</h2>
        {loading.upcoming ? (
          <div className="text-center py-4">Loading...</div>
        ) : upcomingEvents.length > 0 ? (
          <div className="grid gap-4">
            {upcomingEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onRegister={() => handleRegister(event.id)}
                onUnregister={() => handleUnregister(event.id)}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No upcoming events</p>
        )}
      </div>
    );
  };

  // Render the feed tab content
  const renderFeedTab = () => {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Social Feed</h2>
        {loading.feed ? (
          <div className="text-center py-4">Loading...</div>
        ) : posts.length > 0 ? (
          <PostFeed posts={posts} />
        ) : (
          <p className="text-gray-600">No posts to display</p>
        )}
      </div>
    );
  };

  // Render the My NGOs tab content
  const renderMyNGOSTab = () => {
    const connectedNGODetails = ngos.filter(ngo => connectedNGOs.includes(ngo.id));
    const pendingNGODetails = ngos.filter(ngo => pendingNGOs.includes(ngo.id));

    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">My NGOs</h2>
        
        {/* Connected NGOs Section */}
        <div className="mb-8">
          <h3 className="text-md font-medium mb-4 text-green-700">Connected NGOs</h3>
          {connectedNGODetails.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {connectedNGODetails.map(ngo => (
                <div key={ngo.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{ngo.name}</h3>
                      <p className="text-sm text-gray-600">{ngo.description}</p>
                    </div>
                    {ngo.logo && (
                      <img src={ngo.logo} alt={ngo.name} className="w-12 h-12 rounded-full" />
                    )}
                  </div>
                  
                  <div className="mt-2 flex flex-wrap gap-2">
                    {ngo.causes && ngo.causes.map(cause => (
                      <span key={cause} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {cause}
                      </span>
                    ))}
                  </div>
                  
                  <div className="mt-3 flex items-center text-sm text-gray-600">
                    <FiMapPin className="mr-1" />
                    <span>{ngo.location || 'Location not specified'}</span>
                  </div>
                  
                  <div className="mt-3 flex justify-between items-center">
                    <div className="flex items-center text-sm text-gray-600">
                      <FiUsers className="mr-1" />
                      <span>{ngo.volunteerCount || 0} volunteers</span>
                    </div>
                    
                    <Link
                      to={`/ngo/dashboard?id=${ngo.id}`}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm hover:bg-green-200"
                    >
                      View Dashboard
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">You haven't connected with any NGOs yet.</p>
          )}
        </div>

        {/* Pending NGOs Section */}
        <div>
          <h3 className="text-md font-medium mb-4 text-yellow-700">Pending Connections</h3>
          {pendingNGODetails.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingNGODetails.map(ngo => (
                <div key={ngo.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{ngo.name}</h3>
                      <p className="text-sm text-gray-600">{ngo.description}</p>
                    </div>
                    {ngo.logo && (
                      <img src={ngo.logo} alt={ngo.name} className="w-12 h-12 rounded-full" />
                    )}
                  </div>
                  
                  <div className="mt-2 flex flex-wrap gap-2">
                    {ngo.causes && ngo.causes.map(cause => (
                      <span key={cause} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {cause}
                      </span>
                    ))}
                  </div>
                  
                  <div className="mt-3 flex items-center text-sm text-gray-600">
                    <FiMapPin className="mr-1" />
                    <span>{ngo.location || 'Location not specified'}</span>
                  </div>
                  
                  <div className="mt-3 flex justify-between items-center">
                    <div className="flex items-center text-sm text-gray-600">
                      <FiUsers className="mr-1" />
                      <span>{ngo.volunteerCount || 0} volunteers</span>
                    </div>
                    
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md text-sm">
                      Pending Approval
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No pending NGO connections.</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="md:col-span-2">
          <h1 className="text-2xl font-bold mb-6">Welcome, {user.name}!</h1>
          
          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="flex space-x-4">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiHome className="inline mr-1" /> Overview
              </button>
              <button
                onClick={() => setActiveTab('my-ngos')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'my-ngos'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiUsers className="inline mr-1" /> My NGOs
              </button>
              <button
                onClick={() => setActiveTab('ngos')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'ngos'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiGrid className="inline mr-1" /> NGOs
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'events'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiCalendar className="inline mr-1" /> Events
              </button>
              <button
                onClick={() => setActiveTab('feed')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'feed'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiList className="inline mr-1" /> Feed
              </button>
            </nav>
          </div>
          
          {/* Tab Content */}
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'my-ngos' && renderMyNGOSTab()}
          {activeTab === 'ngos' && renderNGOTab()}
          {activeTab === 'events' && renderEventsTab()}
          {activeTab === 'feed' && renderFeedTab()}
        </div>
        
        {/* Sidebar */}
        <div>
          {/* Suggested Events */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Suggested Events</h2>
            {loading.suggestions ? (
              <div className="text-center py-4">Loading...</div>
            ) : suggestedEvents.length > 0 ? (
              <div className="space-y-4">
                {suggestedEvents.map(event => (
                  <SuggestionCard
                    key={event.id}
                    event={event}
                    onRegister={() => handleRegister(event.id)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No suggestions available</p>
            )}
          </div>
          
          {/* Badges */}
          {stats.badges.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Your Badges</h2>
              <div className="flex flex-wrap gap-2">
                {stats.badges.map((badge, index) => (
                  <div
                    key={index}
                    className="bg-badge/20 px-2 py-1 rounded-full text-xs text-badge/90 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    {badge}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
