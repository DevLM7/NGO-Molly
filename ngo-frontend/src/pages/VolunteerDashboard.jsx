import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import EventCard from '../components/EventCard';
import SuggestionCard from '../components/SuggestionCard';
import PostFeed from '../components/PostFeed';
import { useAuth } from '../context/AuthContext.js';
import { eventAPI, badgeAPI } from '../services/api';
import { toast } from 'react-toastify';

const VolunteerDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState({
    suggestions: true,
    upcoming: true,
    feed: true
  });
  const [suggestedEvents, setSuggestedEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({
    eventsAttended: 0,
    volunteerHours: 0,
    badges: []
  });

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

  // Handle post liking
  const handleLike = async (postId, isLiked) => {
    try {
      const endpoint = isLiked ? 'unlike' : 'like';
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/${postId}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        // Update posts
        setPosts(prev => {
          const updatedPosts = [...prev];
          const postIndex = updatedPosts.findIndex(p => p._id === postId);

          if (postIndex !== -1) {
            const post = updatedPosts[postIndex];

            if (isLiked) {
              post.likes = post.likes.filter(uid => uid !== user.uid);
              post.isLiked = false;
            } else {
              post.likes = [...post.likes, user.uid];
              post.isLiked = true;
            }
          }

          return updatedPosts;
        });
      }
    } catch (error) {
      console.error('Error liking/unliking post:', error);
    }
  };

  // Handle post commenting
  const handleComment = async (postId, text) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ text })
      });

      const data = await response.json();

      if (response.ok) {
        // Update posts
        setPosts(prev => {
          const updatedPosts = [...prev];
          const postIndex = updatedPosts.findIndex(p => p._id === postId);

          if (postIndex !== -1) {
            updatedPosts[postIndex] = {
              ...updatedPosts[postIndex],
              comments: [
                ...updatedPosts[postIndex].comments,
                data.comment
              ]
            };
          }

          return updatedPosts;
        });
      }
    } catch (error) {
      console.error('Error commenting on post:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="md:col-span-2">
          <h1 className="text-2xl font-bold mb-6">Welcome, {user.name}!</h1>
          
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
