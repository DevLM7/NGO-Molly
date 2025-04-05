import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const PostFeed = ({ posts = [], onLike, onComment, onLoadMore, canLoadMore }) => {
  const [newComments, setNewComments] = useState({});

  // Handle new comment input change
  const handleCommentChange = (postId, value) => {
    setNewComments({
      ...newComments,
      [postId]: value
    });
  };

  // Handle comment submission
  const handleCommentSubmit = (postId) => {
    if (newComments[postId]?.trim()) {
      onComment(postId, newComments[postId]);
      // Clear comment input after submission
      setNewComments({
        ...newComments,
        [postId]: ''
      });
    }
  };

  return (
    <div className="space-y-6">
      {posts.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-lg shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-600 font-medium">No posts yet</p>
          <p className="text-gray-500 text-sm mt-1">Be the first to share your experience!</p>
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <div key={post._id} className="bg-surface rounded-lg shadow-sm overflow-hidden">
              {/* Post header */}
              <div className="flex items-center p-4">
                <img 
                  src={post.userProfilePicture || 'https://via.placeholder.com/40'} 
                  alt={post.userName}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="ml-3">
                  <div className="font-medium text-gray-800">{post.userName}</div>
                  <div className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </div>
                </div>
              </div>
              
              {/* Post image */}
              {post.photoUrl && (
                <div className="relative">
                  <img 
                    src={post.photoUrl} 
                    alt={post.caption} 
                    className="w-full max-h-96 object-cover"
                  />
                  
                  {/* Event tag if post is associated with an event */}
                  {post.eventId && post.eventTitle && (
                    <Link 
                      to={`/events/${post.eventId}`}
                      className="absolute bottom-3 left-3 bg-primary/80 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm"
                    >
                      {post.eventTitle}
                    </Link>
                  )}
                </div>
              )}
              
              {/* Post content */}
              <div className="p-4">
                <p className="text-gray-800 whitespace-pre-line">{post.caption}</p>
                
                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {post.tags.map((tag, index) => (
                      <Link 
                        key={index}
                        to={`/posts/tag/${tag}`}
                        className="text-secondary text-sm hover:underline"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                )}
                
                {/* Like and comment counts */}
                <div className="flex items-center mt-3 text-sm text-gray-500">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {post.likes?.length || 0} likes
                  </div>
                  <div className="flex items-center ml-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {post.comments?.length || 0} comments
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex border-t border-b border-gray-100 mt-3 -mx-4">
                  <button
                    onClick={() => onLike(post._id, post.isLiked)}
                    className={`flex-1 flex items-center justify-center py-2 text-sm font-medium 
                      ${post.isLiked ? 'text-primary' : 'text-gray-500 hover:text-primary'}`}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 mr-1" 
                      fill={post.isLiked ? "currentColor" : "none"}
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={post.isLiked ? 0 : 2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {post.isLiked ? 'Liked' : 'Like'}
                  </button>
                  
                  <button
                    onClick={() => {
                      const commentInput = document.getElementById(`comment-input-${post._id}`);
                      if (commentInput) {
                        commentInput.focus();
                      }
                    }}
                    className="flex-1 flex items-center justify-center py-2 text-sm font-medium text-gray-500 hover:text-secondary"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Comment
                  </button>
                  
                  <Link 
                    to={`/posts/${post._id}`}
                    className="flex-1 flex items-center justify-center py-2 text-sm font-medium text-gray-500 hover:text-secondary"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share
                  </Link>
                </div>
                
                {/* Comments */}
                {post.comments && post.comments.length > 0 && (
                  <div className="mt-3 space-y-3">
                    {post.comments.slice(0, 2).map((comment, index) => (
                      <div key={index} className="flex">
                        <img 
                          src={comment.userProfilePicture || 'https://via.placeholder.com/32'} 
                          alt={comment.userName}
                          className="h-8 w-8 rounded-full object-cover mr-2 mt-1"
                        />
                        <div className="bg-gray-100 rounded-lg px-3 py-2 flex-1">
                          <div className="font-medium text-sm">{comment.userName}</div>
                          <div className="text-sm">{comment.text}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {post.comments.length > 2 && (
                      <Link 
                        to={`/posts/${post._id}`}
                        className="block text-center text-sm text-secondary hover:underline"
                      >
                        View all {post.comments.length} comments
                      </Link>
                    )}
                  </div>
                )}
                
                {/* Add comment */}
                <div className="mt-3 flex">
                  <img 
                    src={localStorage.getItem('userProfilePicture') || 'https://via.placeholder.com/32'} 
                    alt="Your profile"
                    className="h-8 w-8 rounded-full object-cover mr-2"
                  />
                  <div className="flex-1 relative">
                    <input
                      id={`comment-input-${post._id}`}
                      type="text"
                      placeholder="Add a comment..."
                      value={newComments[post._id] || ''}
                      onChange={(e) => handleCommentChange(post._id, e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(post._id)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                    />
                    <button
                      onClick={() => handleCommentSubmit(post._id)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary hover:text-primary/80"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Load more button */}
          {canLoadMore && (
            <div className="text-center">
              <button
                onClick={onLoadMore}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PostFeed;
