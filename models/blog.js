const mongoose = require('mongoose');
const { Schema } = mongoose;

const blogSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  body: {
    type: String,
    required: true,
    minlength: 10
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    type: String
  },
  comments: [{
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

// Virtual for formatted date
blogSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

module.exports = mongoose.model('Blog', blogSchema);