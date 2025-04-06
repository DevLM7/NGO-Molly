import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ngoService from '../services/ngoService';
import { FiSearch, FiFilter, FiX, FiMapPin, FiUsers, FiAward, FiClock } from 'react-icons/fi';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const NGOList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, available, registered
  const [showFilters, setShowFilters] = useState(false);
  const [causeFilter, setCauseFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [error, setError] = useState(null);
  const [connectedNGOs, setConnectedNGOs] = useState([]);
  const [pendingNGOs, setPendingNGOs] = useState([]);

  useEffect(() => {
    fetchNGOs();
    if (user) {
      // Fetch user's connected and pending NGOs
      const fetchUserNGOs = async () => {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setConnectedNGOs(userData.connectedNGOs || []);
            setPendingNGOs(userData.pendingNGOs || []);
          }
        } catch (error) {
          console.error('Error fetching user NGOs:', error);
        }
      };
      fetchUserNGOs();
    }
  }, [user]);

  useEffect(() => {
    // Log current user data when it changes
    if (user) {
      console.log('Current user:', user);
      // Fetch and log the full user document
      const fetchUserData = async () => {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            console.log('User document:', userSnap.data());
          } else {
            console.log('No user document found!');
          }
        } catch (err) {
          console.error('Error fetching user document:', err);
        }
      };
      fetchUserData();
    }
  }, [user]);

  const fetchNGOs = async () => {
    try {
      setError(null);
      setLoading(true);
      console.log('Starting to fetch NGOs...');
      
      // Clear existing NGOs first to show loading state
      setNgos([]);
      
      const ngoData = await ngoService.getAllNGOs();
      console.log('Fetched NGOs:', ngoData);
      console.log('Number of NGOs fetched:', ngoData.length);
      
      // Log each NGO for debugging
      ngoData.forEach((ngo, index) => {
        console.log(`NGO ${index + 1}:`, ngo);
      });
      
      // Update the NGOs state with the fresh data
      setNgos(ngoData);
      
      // Reset filters to ensure all NGOs are shown
      setFilter('all');
      setSearchTerm('');
      setCauseFilter('');
      setLocationFilter('');
      
      setLoading(false);
      
      // Show success message
      toast.success(`Successfully refreshed NGO list. Found ${ngoData.length} NGOs.`);
      
    } catch (error) {
      console.error('Error fetching NGOs:', error);
      setError(error.message);
      setLoading(false);
      toast.error('Failed to refresh NGO list: ' + error.message);
    }
  };

  const handleConnect = async (ngoId) => {
    try {
      console.log('Connecting to NGO:', ngoId);
      console.log('Current user:', user);
      
      // Update user's pending NGOs in Firebase
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        pendingNGOs: arrayUnion(ngoId)
      });
      console.log('Successfully added to pending NGOs');
      
      // Update local state
      setPendingNGOs(prev => [...prev, ngoId]);
      
      // Show success message
      toast.success('Request sent successfully');
      
      // Redirect to volunteer dashboard with the correct path
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error connecting to NGO:', error);
      setError(error.message);
      toast.error('Failed to connect to NGO: ' + error.message);
    }
  };

  // Get unique causes and locations for filters
  const allCauses = [...new Set(ngos.flatMap(ngo => ngo.causes || []))];
  const allLocations = [...new Set(ngos.map(ngo => ngo.location).filter(Boolean))];

  const filteredNGOs = ngos.filter(ngo => {
    console.log('Filtering NGO:', ngo);
    console.log('User connected NGOs:', connectedNGOs);
    
    const matchesSearch = ngo.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ngo.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCause = !causeFilter || (ngo.causes && ngo.causes.includes(causeFilter));
    const matchesLocation = !locationFilter || ngo.location === locationFilter;
    
    if (filter === 'all') return matchesSearch && matchesCause && matchesLocation;
    if (filter === 'available') return matchesSearch && matchesCause && matchesLocation && !connectedNGOs.includes(ngo.id);
    if (filter === 'registered') return matchesSearch && matchesCause && matchesLocation && connectedNGOs.includes(ngo.id);
    
    return matchesSearch && matchesCause && matchesLocation;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setFilter('all');
    setCauseFilter('');
    setLocationFilter('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            Error: {error}
          </div>
        )}
        
        {/* Debug information */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg text-sm">
          <p>Total NGOs: {ngos.length}</p>
          <p>Filtered NGOs: {filteredNGOs.length}</p>
          <p>Current Filter: {filter}</p>
          <p>Connected NGOs: {connectedNGOs.length}</p>
          <p>Pending NGOs: {pendingNGOs.length}</p>
          <p>Search Term: {searchTerm}</p>
          <p>Cause Filter: {causeFilter}</p>
          <p>Location Filter: {locationFilter}</p>
          <button 
            onClick={fetchNGOs} 
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh NGO List
          </button>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">NGO Directory</h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FiFilter className="w-5 h-5" />
            <span>Filters</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search NGOs by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All NGOs</option>
              <option value="available">Not Connected</option>
              <option value="registered">Connected</option>
            </select>
          </div>

          {showFilters && (
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={causeFilter}
                  onChange={(e) => setCauseFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Causes</option>
                  {allCauses.map(cause => (
                    <option key={cause} value={cause}>{cause}</option>
                  ))}
                </select>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Locations</option>
                  {allLocations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
              {(causeFilter || locationFilter) && (
                <div className="flex justify-end mt-4">
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                  >
                    <FiX className="w-4 h-4" />
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="mb-4 text-gray-600">
          Showing {filteredNGOs.length} of {ngos.length} NGOs
        </div>

        {/* NGO Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNGOs.map(ngo => (
            <div key={ngo.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{ngo.name}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{ngo.description}</p>
                
                <div className="space-y-2 mb-4">
                  {ngo.location && (
                    <div className="flex items-center text-gray-600">
                      <FiMapPin className="w-4 h-4 mr-2" />
                      <span>{ngo.location}</span>
                    </div>
                  )}
                  {ngo.volunteerCount && (
                    <div className="flex items-center text-gray-600">
                      <FiUsers className="w-4 h-4 mr-2" />
                      <span>{ngo.volunteerCount} volunteers</span>
                    </div>
                  )}
                  {ngo.causes && (
                    <div className="flex items-center text-gray-600">
                      <FiAward className="w-4 h-4 mr-2" />
                      <div className="flex flex-wrap gap-1">
                        {ngo.causes.map(cause => (
                          <span key={cause} className="inline-block px-2 py-1 text-xs bg-gray-100 rounded">
                            {cause}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {connectedNGOs.includes(ngo.id) ? (
                  <div className="w-full px-4 py-2 bg-green-100 text-green-800 rounded-lg text-center">
                    Connected
                  </div>
                ) : pendingNGOs.includes(ngo.id) ? (
                  <div className="w-full px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-center flex items-center justify-center">
                    <FiClock className="w-4 h-4 mr-2" />
                    Waiting for approval
                  </div>
                ) : (
                  <button
                    onClick={() => handleConnect(ngo.id)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredNGOs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No NGOs found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NGOList; 