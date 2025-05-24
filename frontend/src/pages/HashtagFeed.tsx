import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTweetsByHashtag, Tweet } from '../services/api'; // Adjust path
import TweetList from '../components/TweetList'; // Adjust path
import Sidebar from '../components/Sidebar'; // Adjust path
import RightSidebar from '../components/RightSidebar'; // Adjust path

const HashtagFeed: React.FC = () => {
  const { tag } = useParams<{ tag: string }>();
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hashtagDisplayName, setHashtagDisplayName] = useState<string>('');
  // Optional: For pagination
  // const [currentPage, setCurrentPage] = useState<number>(1);
  // const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    if (tag) {
      const fetchTweets = async () => {
        try {
          setLoading(true);
          // Using currentPage=1 for now, add pagination later if needed
          const response = await getTweetsByHashtag(tag, 1, 10); 
          setTweets(response.tweets);
          setHashtagDisplayName(response.hashtag || tag); // Use hashtag from response if available
          // setTotalPages(response.totalPages);
          setError(null);
        } catch (err) {
          setError(`Failed to load tweets for #${tag}.`);
          console.error(err);
          setTweets([]); // Clear tweets on error
        } finally {
          setLoading(false);
        }
      };
      fetchTweets();
    }
  }, [tag]); // Add currentPage to dependency array if pagination is implemented

  return (
    <div className="flex min-h-screen bg-twitter-background">
      <Sidebar />
      <main className="flex-1 border-x border-twitter-extra-light">
        <div className="max-w-2xl mx-auto">
          <div className="sticky top-0 z-10 bg-white bg-opacity-90 backdrop-blur-sm p-4 border-b border-twitter-extra-light">
            <h1 className="text-xl font-bold">#{hashtagDisplayName || tag}</h1>
            {/* Can add tweet count here if backend provides it for the hashtag itself */}
          </div>
          
          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-twitter-blue"></div>
            </div>
          )}
          {error && (
            <div className="p-4">
              <p className="text-red-500 text-center">{error}</p>
            </div>
          )}
          {!loading && !error && tweets.length === 0 && (
            <div className="p-4">
              <p className="text-gray-500 text-center">
                No tweets found for #{hashtagDisplayName || tag}.
              </p>
            </div>
          )}
          {!loading && !error && tweets.length > 0 && (
            <TweetList tweets={tweets} />
          )}
          {/* TODO: Add pagination controls here if totalPages > 1 */}
        </div>
      </main>
      <RightSidebar />
    </div>
  );
};

export default HashtagFeed;
