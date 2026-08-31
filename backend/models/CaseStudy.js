const mongoose = require('mongoose');

const caseStudySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Case study title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    thumbnailImage: {
      type: String,
      required: [true, 'Thumbnail image is required'],
    },
    logoImage: {
      type: String,
      required: [true, 'Logo image is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    htmlContent: {
      type: String,
      required: [true, 'Content is required'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CaseStudy', caseStudySchema);