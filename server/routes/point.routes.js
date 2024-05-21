const express = require('express');
const router = express.Router();
const PointModel = require('../models/Point.models');
const multer = require('multer');
//const upload = require('../server');
const storageGFS = require('../server');
// Ініціалізація multer з налаштуваннями збереження у GridFS
//const upload = multer({ storageGFS });
const ImageModel = require('../models/ImageLink.models');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const GridFsStorage = require('multer-gridfs-storage');
const parsefile = require('./fileparser.routes');
const { ObjectId } = require('mongoose').Types;
  

const s3Client = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/addpoint', upload.array('images'), async (req, res) => {
  try {
    const {
      longitude,
      latitude,
      place_name,
      city,
      createdBy,
      category,
      description,
      typeOfWeapon,
      dateOfDestruction,
      source
    } = req.body;

    const existingPoint = await PointModel.findOne({ place_name });
    if (existingPoint) {
      return res.json("Already created");
    }

    const point = new PointModel({
      longitude,
      latitude,
      place_name,
      city,
      createdBy,
      category,
      description,
      typeOfWeapon,
      dateOfDestruction,
      source,
    });

    // Зберігаємо точку у базі даних
    await point.save();

    // Завантажуємо зображення до S3 та зберігаємо інформацію про зображення до бази даних
    const imageUploadPromises = req.files.map(async (file) => {
      const uploadParams = {
        Bucket: process.env.S3_BUCKET,
        Key: `${Date.now().toString()}-${file.originalname}`,
        Body: file.buffer,
        ACL: 'public-read',
        ContentType: file.mimetype,
      };

      const data = await s3Client.send(new PutObjectCommand(uploadParams));

      const image = new ImageModel({
        parentId: point._id,
        filename: file.originalname,
        dataUrl: `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com/${uploadParams.Key}`,
      });

      await image.save();
      return image;
    });

    await Promise.all(imageUploadPromises);

    res.status(201).json(point);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка при додаванні нової точки' });
  }
});

router.get('/getpoints', async (req, res) => {
  try {
    const points = await PointModel.find();
    res.json(points);
  } catch (err) {
    res.status(500).send(err);
  }
});

// router.get('/getpoint', async (req, res) => {
//   const { longitude, latitude } = req.query;

//   try {
//     const point = await PointModel.findOne({ longitude, latitude });
//     if (!point) {
//       return res.status(404).json({ message: 'Point not found' });
//     }

//     res.json(point);
//   } catch (err) {
//     res.status(500).send(err);
//   }
// });



router.get('/getpoint', async (req, res) => {
  const { longitude, latitude } = req.query;

  try {
    const point = await PointModel.findOne({ longitude, latitude });
    if (!point) {
      return res.status(401).json({ message: 'Point not found' });
    }

    //const imageIds = point.images.map(image => image._id); // Отримуємо масив _id зображень
  
  // // Отримуємо всі зображення для даного екземпляру PointModel
    const images = await point.getImagesLinkByParentId(point._id)
    console.log(images, point._id);
  const responseData = {
    point: point.toObject(), // Конвертуємо точку в об'єкт JavaScript
    images: images.map(image => ({
      filename: image.filename,
      dataUrl: image.dataUrl,
    })),
  };

  res.json(responseData);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get('/points/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const point = await PointModel.findById( id );
    if (!point) {
      return res.status(401).json({ message: 'Point not found' });
    }

    //const imageIds = point.images.map(image => image._id); // Отримуємо масив _id зображень
  
  // // Отримуємо всі зображення для даного екземпляру PointModel
    const images = await point.getImagesLinkByParentId(point._id)

  const responseData = {
    point: point.toObject(), // Конвертуємо точку в об'єкт JavaScript
    // images: images.map(image => ({
    //   filename: image.filename,
    //   dataUrl: image.dataUrl,
    // })),
    images,
  };

  res.json(responseData);
  } catch (err) {
    res.status(500).send(err);
  }
});


router.get('/points', async (req, res) => {
  try {
      const points = await PointModel.find();
      // const responseData = points.map(async point => {
      //   const imageIds = point.images.map(image => image._id); // Отримуємо масив _id зображень
      
      //   // Отримуємо всі зображення для даного екземпляру PointModel
      //   const images = await point.getImagesByParentId(point._id);
      
      //   return {
      //     point: point.toObject(), // Конвертуємо точку в об'єкт JavaScript
      //     images: images.map(image => ({
      //       filename: image.filename,
      //       dataUri: image.dataUri,
      //     })),
      //   };
      // });
      
      // const allResponses = await Promise.all(responseData); 
      res.json(points);
  } catch (err) {
      res.status(500).send(err);
  }
});

router.put('/updatelocation/:id', async (req, res) => {
  const { id } = req.params;
  const { longitude, latitude, place_name, city, moderatedBy } = req.body;
  console.log('IN UPDATE', place_name); 
  try {
    const updatedPoint = await PointModel.findByIdAndUpdate(id,
      {
        longitude,
        latitude,
        place_name,
        city,
        moderatedBy
      }, { new: true });
      
      res.json(updatedPoint);
  } catch (err) {
      res.status(500).send(err);
  }
});

router.put('/points/:id', upload.array('images'), async (req, res) => {
  const { id } = req.params;
  const { place_name, description, isPosted, scheduleType, city, category, typeOfWeapon, moderatedBy, customScheduleDate, dateOfDestruction, source } = req.body;
  let imageIds = req.body.imageIds;

// Перевіряємо, чи imageIds є масивом, і якщо ні, перетворюємо його в масив
if (!Array.isArray(imageIds)) {
  imageIds = [imageIds];
}

// Перетворення елементів масиву на ObjectId
try {
  imageIds = imageIds.map(id => new ObjectId(id));
} catch (error) {
  console.error('Error converting to ObjectId:', error);
  return; // або інша обробка помилки
}
  console.log('IN UPDATE', req.body);
  try {
      const updatedPoint = await PointModel.findByIdAndUpdate(id, { place_name, description, isPosted, scheduleType, city, category, typeOfWeapon, moderatedBy, customScheduleDate, dateOfDestruction, source }, { new: true });
      console.log('updated');
      //await ImageModel.deleteMany({ _id: { $nin: imageIds } });
      // Оновіть зображення точки, якщо є нові картинки
    if (req.files && req.files.length > 0) {
      console.log('FOUNG FILES', req.files);
      // Зберігаємо зображення до точки
      //const imagesToUpload = await updatedPoint.saveImages(req.files);

      // Оновлюємо зображення точки
      //point.images = imagesToUpload;
      // Завантажуємо зображення до S3 та зберігаємо інформацію про зображення до бази даних
    const imageUploadPromises = req.files.map(async (file) => {
      const images = await updatedPoint.getImagesLinkByParentId(updatedPoint._id);

      // Видаліть існуючі зображення точки
      

      const uploadParams = {
        Bucket: process.env.S3_BUCKET,
        Key: `${Date.now().toString()}-${file.originalname}`,
        Body: file.buffer,
        ACL: 'public-read',
        ContentType: file.mimetype,
      };

      const data = await s3Client.send(new PutObjectCommand(uploadParams));

      const image = new ImageModel({
        parentId: updatedPoint._id,
        filename: file.originalname,
        dataUrl: `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com/${uploadParams.Key}`,
      });
      imageIds.push(image._id);
      console.log(image.dataUrl);
      await image.save();
      return image;
    });

    await Promise.all(imageUploadPromises);
      
      // Оновлюємо точку з посиланням на зображення
      //await PointModel.findByIdAndUpdate(updatedPoint._id, { images: imagesToUpload });

    }
    await ImageModel.deleteMany({ _id: { $nin: imageIds } });
    // Збережіть оновлену точку в базі даних
    await updatedPoint.save();
      
      res.json(updatedPoint);
  } catch (err) {
      console.log(err);
      res.status(500).send(err);
  }
});

router.delete('/points/:id', async (req, res) => {
  const pointId = req.params.id;

  try {
      // Знайдемо користувача за ID та видалимо його
      await PointModel.findByIdAndDelete(pointId);
      res.status(200).json({ message: 'Point deleted successfully' });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Роут для отримання статистики
router.get('/fetchstatistics', async (req, res) => {
  try {
      let startDate = new Date(req.query.startDate);
      let endDate = new Date(req.query.endDate);

      // Перевірка на відсутність вказаної дати і встановлення відповідних значень
      if (!startDate || isNaN(startDate)) {
          const oldestPoint = await PointModel.findOne().sort({ dateOfDestruction: 1 });
          startDate = oldestPoint.dateOfDestruction;
      }

      if (!endDate || isNaN(endDate)) {
          const latestPoint = await PointModel.findOne().sort({ dateOfDestruction: -1 });
          endDate = latestPoint.dateOfDestruction;
      }

      const cityData = await PointModel.aggregate([
          { $match: { dateOfDestruction: { $gte: startDate, $lte: endDate }, isPosted: true } },
          { $group: { _id: { type: '$city', date: { $dateToString: { format: '%Y-%m-%d', date: '$dateOfDestruction' } } }, count: { $sum: 1 } } },
          { $sort: { '_id.date': 1 } }, // Сортування за датою
          { $limit: 1000 }, // Ліміт кількості міст
      ]);

      const categoryData = await PointModel.aggregate([
          { $match: { dateOfDestruction: { $gte: startDate, $lte: endDate }, isPosted: true  } },
          { $group: { _id: { type: '$category', date: { $dateToString: { format: '%Y-%m-%d', date: '$dateOfDestruction' } } }, count: { $sum: 1 } } },
          { $sort: { '_id.date': 1 } }, // Сортування за датою
          { $limit: 1000 }, // Ліміт кількості категорій
      ]);

      console.log(categoryData);

      const typeOfWeaponData = await PointModel.aggregate([
          { $match: { dateOfDestruction: { $gte: startDate, $lte: endDate }, isPosted: true  } },
          { $group: { _id: { type: '$typeOfWeapon', date: { $dateToString: { format: '%Y-%m-%d', date: '$dateOfDestruction' } } }, count: { $sum: 1 } } },
          { $sort: { '_id.date': 1 } }, // Сортування за датою
          { $limit: 1000 }, // Ліміт кількості типів зброї
      ]);

      res.json({
          city: cityData,
          category: categoryData,
          typeOfWeapon: typeOfWeaponData,
      });
  } catch (error) {
      console.error('Error fetching statistics:', error);
      res.status(500).json({ message: 'Server error' });
  }
});

router.get('/fetchstatistics/oldestpoint', async (req, res) => {
  try {
      const oldestPoint = await PointModel.findOne().sort({ dateOfDestruction: 1 });
      res.json(oldestPoint);
  } catch (error) {
      console.error('Error fetching oldest point:', error);
      res.status(500).json({ message: 'Server error' });
  }
});

router.get('/fetchstatistics/latestpoint', async (req, res) => {
  try {
      const latestPoint = await PointModel.findOne().sort({ dateOfDestruction: -1 });
      res.json(latestPoint);
  } catch (error) {
      console.error('Error fetching latest point:', error);
      res.status(500).json({ message: 'Server error' });
  }
});

router.get('/fetchstatisticspie', async (req, res) => {
  try {
      let startDate = new Date(req.query.startDate);
      let endDate = new Date(req.query.endDate);

      // Перевірка на відсутність вказаної дати і встановлення відповідних значень
      if (!startDate || isNaN(startDate)) {
          const oldestPoint = await PointModel.findOne().sort({ dateOfDestruction: 1 });
          startDate = oldestPoint.dateOfDestruction;
      }

      if (!endDate || isNaN(endDate)) {
          const latestPoint = await PointModel.findOne().sort({ dateOfDestruction: -1 });
          endDate = latestPoint.dateOfDestruction;
      }

      const cityData = await PointModel.aggregate([
          { $match: { dateOfDestruction: { $gte: startDate, $lte: endDate }, isPosted: true  } },
          { $group: { _id: { type: '$city'} , count: { $sum: 1 } } },
          { $sort: { '_id.date': 1 } }, // Сортування за датою
          { $limit: 1000 }, // Ліміт кількості міст
      ]);

      const categoryData = await PointModel.aggregate([
          { $match: { dateOfDestruction: { $gte: startDate, $lte: endDate }, isPosted: true  } },
          { $group: { _id: { type: '$category' }, count: { $sum: 1 } } },
          { $sort: { '_id.date': 1 } }, // Сортування за датою
          { $limit: 1000 }, // Ліміт кількості категорій
      ]);

      console.log(categoryData);

      const typeOfWeaponData = await PointModel.aggregate([
          { $match: { dateOfDestruction: { $gte: startDate, $lte: endDate }, isPosted: true  } },
          { $group: { _id: { type: '$typeOfWeapon' }, count: { $sum: 1 } } },
          { $sort: { '_id.date': 1 } }, // Сортування за датою
          { $limit: 1000 }, // Ліміт кількості типів зброї
      ]);

      res.json({
          city: cityData,
          category: categoryData,
          typeOfWeapon: typeOfWeaponData,
      });
  } catch (error) {
      console.error('Error fetching statistics:', error);
      res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;