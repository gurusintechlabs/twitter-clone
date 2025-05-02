const mongoose = require('mongoose');

const HashtagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  count: {
    type: Number,
    default: 1
  },
  tweets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tweet'
  }]
}, {
  timestamps: true
});

HashtagSchema.index({ name: 1 });
HashtagSchema.index({ count: -1 }); // For trending queries

const Hashtag = mongoose.model('Hashtag', HashtagSchema);

module.exports = Hashtag;
