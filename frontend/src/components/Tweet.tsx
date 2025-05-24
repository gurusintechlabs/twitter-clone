import React, { useState, useEffect, useMemo } from 'react'; // Added useMemo
import { Link } from 'react-router-dom';
import { likeTweet, retweetTweet, Tweet as APITweet } from '../services/api'; // Import API functions and Tweet interface

interface TweetProps {
  tweet: APITweet; // Use the Tweet interface from api.ts
}

const Tweet: React.FC<TweetProps> = ({ tweet }) => {
  // Initialize state from the tweet prop.
  // The backend provides 'liked' and 'retweeted' booleans and counts.
  const [liked, setLiked] = useState(!!tweet.liked); 
  const [likesCount, setLikesCount] = useState(tweet.likeCount || tweet.likes?.length || 0);
  const [retweeted, setRetweeted] = useState(!!tweet.retweeted);
  const [retweetsCount, setRetweetsCount] = useState(tweet.retweetCount || tweet.retweets?.length || 0);
  const [error, setError] = useState<string | null>(null);

  // Update state if the tweet prop changes (e.g., parent list re-fetches)
  useEffect(() => {
    setLiked(!!tweet.liked);
    setLikesCount(tweet.likeCount || tweet.likes?.length || 0);
    setRetweeted(!!tweet.retweeted);
    setRetweetsCount(tweet.retweetCount || tweet.retweets?.length || 0);
  }, [tweet.liked, tweet.likeCount, tweet.likes, tweet.retweeted, tweet.retweetCount, tweet.retweets]);

  const renderContentWithHashtags = useMemo(() => {
    if (!tweet.content) return '';

    const parts = tweet.content.split(/(\s+)/); // Split by space, keeping spaces
    const hashtagRegex = /^#([a-zA-Z0-9_]+)$/;

    return parts.map((part, index) => {
      if (hashtagRegex.test(part.trim())) {
        const tag = part.trim().substring(1);
        return (
          <Link
            key={`${tweet._id}-hashtag-${tag}-${index}`} // Ensure unique key
            to={`/hashtags/${tag}`}
            className="text-twitter-blue hover:underline"
            onClick={(e) => e.stopPropagation()} // Prevent tweet click event
          >
            {part}
          </Link>
        );
      }
      // Use React.Fragment for non-linked parts, preserving the original part (which includes spaces)
      return <React.Fragment key={`${tweet._id}-text-${index}`}>{part}</React.Fragment>; 
    });
  }, [tweet.content, tweet._id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d`;
    }
    
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    if (date.getFullYear() !== now.getFullYear()) {
      options.year = 'numeric';
    }
    
    return date.toLocaleDateString('en-US', options);
  };

  const handleLike = async () => {
    setError(null);
    try {
      const response = await likeTweet(tweet._id); // Use tweet._id
      setLiked(response.liked);
      setLikesCount(response.likeCount);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to like/unlike tweet');
      console.error('Failed to like/unlike tweet', err);
    }
  };

  const handleRetweet = async () => {
    setError(null);
    try {
      const response = await retweetTweet(tweet._id); // Use tweet._id
      setRetweeted(response.retweeted);
      setRetweetsCount(response.retweetCount);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to retweet/unretweet tweet');
      console.error('Failed to retweet/unretweet tweet', err);
    }
  };

  return (
    <div className="border-b border-twitter-extra-light p-4 hover:bg-gray-50 transition-colors">
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      <div className="flex">
        <div className="mr-3">
          <Link to={`/profile/${tweet.user.username}`}>
            <img
              src={tweet.user.avatar || 'https://via.placeholder.com/50'} // Fallback avatar
              alt={tweet.user.name}
              className="w-12 h-12 rounded-full"
            />
          </Link>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center mb-1">
            <Link to={`/profile/${tweet.user.username}`} className="font-bold hover:underline mr-1">
              {tweet.user.name}
            </Link>
            <span className="text-gray-500">
              @{tweet.user.username} · {formatDate(tweet.createdAt)}
            </span>
          </div>
          
          <div className="mb-3 whitespace-pre-wrap">{renderContentWithHashtags}</div>
          
          <div className="flex justify-between max-w-md">
            <button className="flex items-center text-gray-500 hover:text-twitter-blue group">
              <div className="p-2 rounded-full group-hover:bg-blue-50">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  {/* Comment Icon Path */}
                  <g>
                    <path d="M14.046 2.242l-4.148-.01h-.002c-4.374 0-7.8 3.427-7.8 7.802 0 4.098 3.186 7.206 7.465 7.37v3.828c0 .108.044.286.12.403.142.225.384.347.632.347.138 0 .277-.038.402-.118.264-.168 6.473-4.14 8.088-5.506 1.902-1.61 3.04-3.97 3.043-6.312v-.017c-.006-4.367-3.43-7.787-7.8-7.788zm3.787 12.972c-1.134.96-4.862 3.405-6.772 4.643V16.67c0-.414-.335-.75-.75-.75h-.396c-3.66 0-6.318-2.476-6.318-5.886 0-3.534 2.768-6.302 6.3-6.302l4.147.01h.002c3.532 0 6.3 2.766 6.302 6.296-.003 1.91-.942 3.844-2.514 5.176z"></path>
                  </g>
                </svg>
              </div>
              <span className="ml-1">{tweet.commentCount || tweet.comments?.length || 0}</span>
            </button>
            
            <button
              onClick={handleRetweet}
              className={`flex items-center group ${
                retweeted ? 'text-green-500' : 'text-gray-500 hover:text-green-500'
              }`}
            >
              <div className="p-2 rounded-full group-hover:bg-green-50">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <g>
                    <path d="M23.77 15.67c-.292-.293-.767-.293-1.06 0l-2.22 2.22V7.65c0-2.068-1.683-3.75-3.75-3.75h-5.85c-.414 0-.75.336-.75.75s.336.75.75.75h5.85c1.24 0 2.25 1.01 2.25 2.25v10.24l-2.22-2.22c-.293-.293-.768-.293-1.06 0s-.294.768 0 1.06l3.5 3.5c.145.147.337.22.53.22s.383-.072.53-.22l3.5-3.5c.294-.292.294-.767 0-1.06zm-10.66 3.28H7.26c-1.24 0-2.25-1.01-2.25-2.25V6.46l2.22 2.22c.148.147.34.22.532.22s.384-.073.53-.22c.293-.293.293-.768 0-1.06l-3.5-3.5c-.293-.294-.768-.294-1.06 0l-3.5 3.5c-.294.292-.294.767 0 1.06s.767.293 1.06 0l2.22-2.22V16.7c0 2.068 1.683 3.75 3.75 3.75h5.85c.414 0 .75-.336.75-.75s-.337-.75-.75-.75z"></path>
                  </g>
                </svg>
              </div>
              <span className="ml-1">{retweetsCount}</span>
            </button>
            
            <button
              onClick={handleLike}
              className={`flex items-center group ${
                liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <div className="p-2 rounded-full group-hover:bg-red-50">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={liked ? "0" : "2"}>
                  {/* Heart Icon Path */}
                  <g>
                    <path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12z"></path>
                  </g>
                </svg>
              </div>
              <span className="ml-1">{likesCount}</span>
            </button>
            
            <button className="flex items-center text-gray-500 hover:text-twitter-blue group">
              <div className="p-2 rounded-full group-hover:bg-blue-50">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <g>
                    <path d="M17.53 7.47l-5-5c-.293-.293-.768-.293-1.06 0l-5 5c-.294.293-.294.768 0 1.06s.767.294 1.06 0l3.72-3.72V15c0 .414.336.75.75.75s.75-.336.75-.75V4.81l3.72 3.72c.146.147.338.22.53.22s.384-.072.53-.22c.293-.293.293-.767 0-1.06z"></path>
                    <path d="M19.708 21.944H4.292C3.028 21.944 2 20.916 2 19.652V14c0-.414.336-.75.75-.75s.75.336.75.75v5.652c0 .437.355.792.792.792h15.416c.437 0 .792-.355.792-.792V14c0-.414.336-.75.75-.75s.75.336.75.75v5.652c0 1.264-1.028 2.292-2.292 2.292z"></path>
                  </g>
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tweet;
