const mongoose = require('mongoose');
const pointSchema = new mongoose.Schema({
  longitude: {
    type: String,
    required: true,
  },
  latitude: {
    type: String,
    required: true,
  },
  place_name: {
    type: String,
    required: true,
    unique: true,
  },
  category: {
    type: String,
    default: 'residential house',
  },
  city: {
    type: String,
    required: false,
    unique: false,
    default: '',
  },
  // images: [{
  //   name: String,
  //   data: Buffer,       // Дані зображення у форматі Buffer
  //   contentType: String, // Тип MIME зображення
  // }],
  description: {
    type: String,
  },
  dateOfDestruction: {
    type: Date,
    //required: true,
  },
  scheduleType: {
    type: String,
    enum: ['low', 'medium', 'high', 'custom'],
    //required: true,
    default: 'high',
  },
  customScheduleDate: {
    type: Date, // Нове поле для користувацького розкладу
    default: '',
  },
  typeOfWeapon: {
    type: String,
    default: 'Unknown',
  },
  isPosted: {
    type: Boolean,
    //required: true,
    default: false,
  },
  source: {
    type: String,
    //required: true,
    default: 'Unknown',
  },
  createdBy: {
    type: String,
    //required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  moderatedBy: {
    type: String,
    //required: true,
  },
}, { timestamps: true });


// Поле для завантаження зображень у точках
pointSchema.virtual('imageFiles', {
  ref: 'Image',
  localField: '_id',
  foreignField: 'parentId',
});

// Схема для зберігання зображень у GridFS
const imageSchema = new mongoose.Schema({
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'point',
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  data: {
    type: Buffer,
    required: true,
  },
  contentType: {
    type: String,
    required: true,
  },
  dataUri: {
    type: String,
    required: true,
  },
});

pointSchema.virtual('imageFiles', {
  ref: 'ImageLink',
  localField: '_id',
  foreignField: 'parentId',
});

pointSchema.methods.saveImagesLink = async function (files) {
  await mongoose.model('ImageLink').deleteMany({ parentId: this._id });
  const images = [];
  if (!Array.isArray(files)) {
    files = [files];
  }
  for (const file of files) {
    const image = new (mongoose.model('ImageLink'))({
      parentId: this._id,
      filename: `${Date.now()}_${file.originalname}`,
      dataUrl: dataUrl
    });
    await image.save();
    images.push(image);
  }
  return images;
};

pointSchema.methods.getImagesLinkByParentId = async function (parentId) {
  try {
    const images = await mongoose.model('ImageLink').find({ parentId });
    return images;
  } catch (error) {
    console.error('Error fetching images by parentId:', error);
    return null;
  }
};


const PointModel = mongoose.model('point', pointSchema);

module.exports = PointModel;