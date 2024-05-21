const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Point',
  },
  filename: {
    type: String,
  },
  dataUrl: {
    type: String,
  },
});

const ImageModel = mongoose.model('ImageLink', imageSchema);
module.exports = ImageModel;
