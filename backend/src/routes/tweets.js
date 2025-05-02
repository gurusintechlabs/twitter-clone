const express = require('express');
const Tweet = require('../models/Tweet');
const User = require('../models/User');
const Hashtag = require('../models/Hashtag');
const jwt = require('jsonwebtoken');

const router = express.Router();

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const extractHashtags = (content) => {
  const hashtagRegex = /#(\w+)/g;
  const matches = content.match(hashtagRegex);
  
  if (!matches) return [];
  
  return matches.map(tag => tag.slice(1).toLowerCase());
};

const updateHashtags = async (hashtags, tweetId) => {
  if (!hashtags || hashtags.length === 0) return;
  
  const operations = hashtags.map(tag => {
    return {
      updateOne: {
        filter: { name: tag },
        update: { 
          $inc: { count: 1 },
          $addToSet: { tweets: tweetId }
        },
        upsert: true
      }
    };
  });
  
  await Hashtag.bulkWrite(operations);
};

router.post('/', auth, async (req, res) => {
  try {
    const { content, media } = req.body;
    
    if (!content && (!media || media.length === 0)) {
      return res.status(400).json({ message: 'Tweet must have content or media' });
    }
    
    const hashtags = content ? extractHashtags(content) : [];
    
    const tweet = new Tweet({
      content: content || '',
      user: req.user._id,
      media: media || [],
      hashtags: hashtags
    });
    
    await tweet.save();
    
    await updateHashtags(hashtags, tweet._id);
    
    await tweet.populate('user', 'name username avatar');
    
    res.status(201).json({ tweet });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const tweets = await Tweet.find({
      $or: [
        { user: { $in: req.user.following } },
        { user: req.user._id }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('user', 'name username avatar');
    
    const count = await Tweet.countDocuments({
      $or: [
        { user: { $in: req.user.following } },
        { user: req.user._id }
      ]
    });
    
    const tweetsWithUserStatus = tweets.map(tweet => {
      const tweetObj = tweet.toObject();
      tweetObj.liked = tweet.likes.includes(req.user._id);
      tweetObj.retweeted = tweet.retweets.includes(req.user._id);
      return tweetObj;
    });
    
    res.json({
      tweets: tweetsWithUserStatus,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/user/:username', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const user = await User.findOne({ username: req.params.username });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const tweets = await Tweet.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'name username avatar');
    
    const count = await Tweet.countDocuments({ user: user._id });
    
    let currentUser = null;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        currentUser = await User.findById(decoded.userId);
      } catch (err) {
      }
    }
    
    const tweetsWithUserStatus = tweets.map(tweet => {
      const tweetObj = tweet.toObject();
      
      if (currentUser) {
        tweetObj.liked = tweet.likes.includes(currentUser._id);
        tweetObj.retweeted = tweet.retweets.includes(currentUser._id);
      } else {
        tweetObj.liked = false;
        tweetObj.retweeted = false;
      }
      
      return tweetObj;
    });
    
    res.json({
      tweets: tweetsWithUserStatus,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id)
      .populate('user', 'name username avatar')
      .populate('comments.user', 'name username avatar');
    
    if (!tweet) {
      return res.status(404).json({ message: 'Tweet not found' });
    }
    
    let currentUser = null;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        currentUser = await User.findById(decoded.userId);
      } catch (err) {
      }
    }
    
    const tweetObj = tweet.toObject();
    
    if (currentUser) {
      tweetObj.liked = tweet.likes.includes(currentUser._id);
      tweetObj.retweeted = tweet.retweets.includes(currentUser._id);
    } else {
      tweetObj.liked = false;
      tweetObj.retweeted = false;
    }
    
    res.json({ tweet: tweetObj });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/like', auth, async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);
    
    if (!tweet) {
      return res.status(404).json({ message: 'Tweet not found' });
    }
    
    const alreadyLiked = tweet.likes.includes(req.user._id);
    
    if (alreadyLiked) {
      tweet.likes = tweet.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      tweet.likes.push(req.user._id);
    }
    
    await tweet.save();
    
    res.json({
      liked: !alreadyLiked,
      likeCount: tweet.likes.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/retweet', auth, async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);
    
    if (!tweet) {
      return res.status(404).json({ message: 'Tweet not found' });
    }
    
    const alreadyRetweeted = tweet.retweets.includes(req.user._id);
    
    if (alreadyRetweeted) {
      tweet.retweets = tweet.retweets.filter(id => id.toString() !== req.user._id.toString());
    } else {
      tweet.retweets.push(req.user._id);
    }
    
    await tweet.save();
    
    res.json({
      retweeted: !alreadyRetweeted,
      retweetCount: tweet.retweets.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }
    
    const tweet = await Tweet.findById(req.params.id);
    
    if (!tweet) {
      return res.status(404).json({ message: 'Tweet not found' });
    }
    
    tweet.comments.push({
      user: req.user._id,
      content
    });
    
    await tweet.save();
    
    await tweet.populate('comments.user', 'name username avatar');
    
    res.status(201).json({
      comment: tweet.comments[tweet.comments.length - 1],
      commentCount: tweet.comments.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);
    
    if (!tweet) {
      return res.status(404).json({ message: 'Tweet not found' });
    }
    
    if (tweet.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this tweet' });
    }
    
    await tweet.deleteOne();
    
    res.json({ message: 'Tweet deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/hashtags/trending', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const trendingHashtags = await Hashtag.find()
      .sort({ count: -1 })
      .limit(parseInt(limit))
      .select('name count');
    
    res.json({ hashtags: trendingHashtags });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/hashtags/:tag', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const tag = req.params.tag.toLowerCase();
    
    const tweets = await Tweet.find({ hashtags: tag })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('user', 'name username avatar');
    
    const count = await Tweet.countDocuments({ hashtags: tag });
    
    let currentUser = null;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        currentUser = await User.findById(decoded.userId);
      } catch (err) {
      }
    }
    
    const tweetsWithUserStatus = tweets.map(tweet => {
      const tweetObj = tweet.toObject();
      
      if (currentUser) {
        tweetObj.liked = tweet.likes.includes(currentUser._id);
        tweetObj.retweeted = tweet.retweets.includes(currentUser._id);
      } else {
        tweetObj.liked = false;
        tweetObj.retweeted = false;
      }
      
      return tweetObj;
    });
    
    res.json({
      tweets: tweetsWithUserStatus,
      totalPages: Math.ceil(count / parseInt(limit)),
      currentPage: parseInt(page),
      hashtag: tag
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
