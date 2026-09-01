const mongoose = require('mongoose');

const careerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [150, 'Job Title cannot exceed 150 characters'],
    },
    experience: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
    },
    joining: {
      type: String,
      trim: true,
    },
    responsibilities: {
      type: String,
    },
    requirements: {
      type: String,
    },
    slug:{
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      maxlength: [150, 'Slug cannot exceed 150 characters'],
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Career', careerSchema);