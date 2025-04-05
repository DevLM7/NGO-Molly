import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import EventCard from '../components/EventCard';
import SuggestionCard from '../components/SuggestionCard';
import PostFeed from '../components/PostFeed';
import { useAuth } from '../context/AuthContext';

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
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/suggestions/user/${user.uid}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const data = await response.json();
        setSuggestedEvents(data.events || []);
      } catch (error) {
        console.error('Error fetching suggested events:', error);
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
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/events/volunteer/${user.uid}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const data = await response.json();
        setUpcomingEvents(data || []);
      } catch (error) {
        console.error('Error fetching upcoming events:', error);
      } finally {
        setLoading(prev => ({ ...prev, upcoming: false }));
      }
    };

    fetchUpcomingEvents();
  }, [user.uid]);

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

  // Load volunteer stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/profile/${user.uid}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const data = await response.json();
        setStats({
          eventsAttended: data.eventsAttended || 0,
          volunteerHours: data.volunteerHours || 0,
          badges: data.badges || []
        });
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    };

    fetchStats();
  }, [user.uid]);

  // Handle event registration
  const handleRegister = async (eventId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        // Update upcoming events
        setUpcomingEvents(prev => {
          const updatedEvents = [...prev];
          const eventIndex = updatedEvents.findIndex(e => e._id === eventId);

          if (eventIndex !== -1) {
            updatedEvents[eventIndex] = {
              ...updatedEvents[eventIndex],
              registeredVolunteers: [
                ...(updatedEvents[eventIndex].registeredVolunteers || []),
                user.uid
              ]
            };
          }

          return updatedEvents;
        });

        // If it was a suggested event, maybe remove from suggestions
        setSuggestedEvents(prev => prev.filter(e => e._id !== eventId));
      }
    } catch (error) {
      console.error('Error registering for event:', error);
    }
  };

  // Handle event unregistration
  const handleUnregister = async (eventId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/events/${eventId}/unregister`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        // Update upcoming events
        setUpcomingEvents(prev => {
          const updatedEvents = [...prev];
          const eventIndex = updatedEvents.findIndex(e => e._id === eventId);

          if (eventIndex !== -1) {
            updatedEvents[eventIndex] = {
              ...updatedEvents[eventIndex],
              registeredVolunteers: updatedEvents[eventIndex].registeredVolunteers.filter(
                uid => uid !== user.uid
              )
            };
          }

          return updatedEvents;
        });
      }
    } catch (error) {
      console.error('Error unregistering from event:', error);
    }
  };

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
    <div className="min-h-screen" style={{ background: 'linear-gradient(to right, #1E3A8A, #76A1E2, #1E3A8A)' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header with stats */}
        <div className="bg-surface rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between">
            <div>
              <h1 className="text-2xl font-header font-bold">Welcome back, {user.name}!</h1>
              <p className="text-gray-600 mt-1">Here's what's happening in your volunteer community</p>
            </div>

            <div className="flex flex-wrap gap-4 mt-4 sm:mt-0">
              <div className="bg-primary/10 rounded-lg p-3 min-w-[110px] text-center">
                <div className="text-2xl font-bold text-primary">{stats.eventsAttended}</div>
                <div className="text-xs text-gray-600">Events Attended</div>
              </div>

              <div className="bg-secondary/10 rounded-lg p-3 min-w-[110px] text-center">
                <div className="text-2xl font-bold text-secondary">{stats.volunteerHours}</div>
                <div className="text-xs text-gray-600">Volunteer Hours</div>
              </div>

              <div className="bg-badge/10 rounded-lg p-3 min-w-[110px] text-center">
                <div className="text-2xl font-bold text-badge/90">{stats.badges.length}</div>
                <div className="text-xs text-gray-600">Badges Earned</div>
              </div>
            </div>
          </div>

          {/* Badges */}
          {stats.badges.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Badges Earned</h3>
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

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: Suggested & Upcoming Events */}
          <div className="lg:col-span-2 space-y-8">
            {/* Suggested Events */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-header font-bold">Recommended For You</h2>
                <Link to="/events" className="text-secondary hover:text-secondary/80 text-sm">
                  View All Events
                </Link>
              </div>

              {loading.suggestions ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2].map(i => (
                    <div key={i} className="bg-gray-100 rounded-lg h-64 animate-pulse"></div>
                  ))}
                </div>
              ) : suggestedEvents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {suggestedEvents.slice(0, 2).map((event, index) => (
                    <SuggestionCard
                      key={event._id}
                      event={event}
                      similarity={event.similarity || 0.7} // Mock value if not provided
                      onRegister={handleRegister}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <p className="text-gray-600">No event recommendations at the moment.</p>
                  <button
                    onClick={() => {
                      // Request new recommendations
                      fetch(`${process.env.REACT_APP_API_URL}/api/suggestions/request`, {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                      });
                    }}
                    className="mt-2 text-sm text-secondary hover:text-secondary/80"
                  >
                    Generate Recommendations
                  </button>
                </div>
              )}
            </section>

            {/* Upcoming Events */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-header font-bold">Your Upcoming Events</h2>
                <Link to="/events/registered" className="text-secondary hover:text-secondary/80 text-sm">
                  View All
                </Link>
              </div>

              {loading.upcoming ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2].map(i => (
                    <div key={i} className="bg-gray-100 rounded-lg h-64 animate-pulse"></div>
                  ))}
                </div>
              ) : upcomingEvents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {upcomingEvents.slice(0, 4).map(event => (
                    <EventCard
                      key={event._id}
                      event={event}
                      isRegistered={true}
                      onUnregister={handleUnregister}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <p className="text-gray-600">You haven't registered for any upcoming events.</p>
                  <Link to="/events" className="mt-2 block text-sm text-secondary hover:text-secondary/80">
                    Browse Events
                  </Link>
                </div>
              )}
            </section>
          </div>

          {/* Right column: Community Feed */}
          <div className="space-y-6">
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-header font-bold">Community Feed</h2>
                <Link to="/posts" className="text-secondary hover:text-secondary/80 text-sm">
                  View All
                </Link>
              </div>

              {loading.feed ? (
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="bg-gray-100 rounded-lg h-64 animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <PostFeed
                  posts={posts}
                  onLike={handleLike}
                  onComment={handleComment}
                  onLoadMore={() => {
                    // Load more posts
                  }}
                  canLoadMore={posts.length >= 10}
                />
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
