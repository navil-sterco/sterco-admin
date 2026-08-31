const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
      maxlength: [80, 'Category name cannot exceed 80 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    imageUrl:{
      type:String,
      default: '',
    },
    slug:{
      type: String,
      unique: true,
      trim: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
