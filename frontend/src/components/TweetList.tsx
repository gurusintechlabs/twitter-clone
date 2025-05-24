import React from 'react';
import TweetComponent from './Tweet'; // Renamed Tweet to TweetComponent to avoid conflict with interface
import { Tweet } from '../services/api'; // Import the Tweet interface

interface TweetListProps {
  tweets: Tweet[]; // Use the Tweet interface from api.ts
}

const TweetList: React.FC<TweetListProps> = ({ tweets }) => {
  if (tweets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <p className="text-xl font-bold mb-2">No tweets to display</p>
        <p className="text-gray-500">
          When new tweets are posted, they'll show up here.
        </p>
      </div>
    );
  }

  return (
    <div>
      {tweets.map((tweet) => (
        <TweetComponent key={tweet._id} tweet={tweet} /> 
      ))}
    </div>
  );
};

export default TweetList;
