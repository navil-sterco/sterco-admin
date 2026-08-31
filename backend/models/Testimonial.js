const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Testimonial name is required'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true,
      maxlength: [120, 'Designation cannot exceed 120 characters'],
    },
    imageUrl: {
      type: String,
      required: [true, 'Testimonial image is required'],
    },
    videoUrl: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Testimonial', testimonialSchema);