const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Portfolio category is required'],
      index: true,
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubCategory',
      required: false,
      default: null,
    },  
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

portfolioSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model('Portfolio', portfolioSchema);