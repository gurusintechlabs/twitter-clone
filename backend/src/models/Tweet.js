const mongoose = require('mongoose');

const TweetSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hashtags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  retweets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  media: [{
    type: String
  }]
}, {
  timestamps: true
});

TweetSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

TweetSchema.virtual('retweetCount').get(function() {
  return this.retweets.length;
});

TweetSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

const Tweet = mongoose.model('Tweet', TweetSchema);

module.exports = Tweet;
