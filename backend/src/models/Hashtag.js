// backend/src/models/Hashtag.js
const mongoose = require('mongoose');

const HashtagSchema = new mongoose.Schema({
  tag: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  count: {
    type: Number,
    default: 1,
    min: 0
  }
}, {
  timestamps: true // To know when a hashtag was last updated or became trending
});

HashtagSchema.index({ tag: 1 });
HashtagSchema.index({ count: -1 }); // For sorting by trending

const Hashtag = mongoose.model('Hashtag', HashtagSchema);

module.exports = Hashtag;
