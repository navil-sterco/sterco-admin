const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'News title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'News description is required'],
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'News image is required'],
    },
    date: {
      type: Date,
      required: [true, 'News date is required'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('News', newsSchema);