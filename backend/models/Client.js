const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
   name: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
      maxlength: [80, 'Client name cannot exceed 80 characters'],
    },
    imageUrl: {
      type: String,
      required: [true, 'Client image is required'],
    }, 
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);