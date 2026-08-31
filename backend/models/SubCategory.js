const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Sub Category name is required'],
      trim: true,
      unique: true,
      maxlength: [80, 'Sub Category name cannot exceed 80 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    slug:{
      type: String,
      unique: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Portfolio sub category is required'],
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SubCategory', subCategorySchema);
