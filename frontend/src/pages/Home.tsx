import React, { useState, useEffect } from 'react';
// import axios from 'axios'; // No longer needed directly
import { getTweets, Tweet } from '../services/api'; // Import getTweets and Tweet interface

const Sidebar = React.lazy(() => import('../components/Sidebar'));
const TweetForm = React.lazy(() => import('../components/TweetForm'));
const TweetList = React.lazy(() => import('../components/TweetList'));
const RightSidebar = React.lazy(() => import('../components/RightSidebar'));

// Local Tweet interface is removed, using the one from api.ts

const Home: React.FC = () => {
  const [tweets, setTweets] = useState<Tweet[]>([]); // Use imported Tweet interface
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1); // For pagination, if needed later
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchTweets = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getTweets(page); // Call getTweets from API service
        setTweets(response.tweets);
        setTotalPages(response.totalPages);
        setLoading(false);
      } catch (err: any) {
        if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError('Failed to fetch tweets. Please try again.');
        }
        setLoading(false);
      }
    };

    fetchTweets();
  }, [page]); // Refetch if page changes

  const handleNewTweet = (newTweet: Tweet) => { // Use imported Tweet interface
    setTweets(prevTweets => [newTweet, ...prevTweets]);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-twitter-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-twitter-background">
      <Sidebar />
      <main className="flex-1 border-x border-twitter-extra-light">
        <div className="max-w-2xl mx-auto">
          <div className="sticky top-0 z-10 bg-white bg-opacity-90 backdrop-blur-sm p-4 border-b border-twitter-extra-light">
            <h1 className="text-xl font-bold">Home</h1>
          </div>
          <TweetForm onNewTweet={handleNewTweet} />
          <TweetList tweets={tweets} />
        </div>
      </main>
      <RightSidebar />
    </div>
  );
};

export default Home;
