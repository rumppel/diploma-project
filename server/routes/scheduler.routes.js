const cron = require('node-cron');
const express = require('express');
const router = express.Router();
const PointModel = require('../models/Point.models');


var schedule = cron.schedule('0 0 * * *', async () => { // Змініть "* * * * *" на ваш розклад (наприклад, '0 0 * * *' для щоденного запуску о північі)
    try {
      const points = await PointModel.find({ isPosted: false }); // Знайти всі непубліковані точки
  
      points.forEach(async (point) => {
        const now = new Date();
        const createdAt = new Date(point.createdAt);
  
        // Логіка планування публікації відповідно до розкладу
        if (point.scheduleType === 'low' && now - createdAt >= 14 * 24 * 60 * 60 * 1000) {
          point.isPosted = true;
        } else if (point.scheduleType === 'medium' && now - createdAt >= 2 * 30 * 24 * 60 * 60 * 1000) {
          point.isPosted = true;
        } else if (point.scheduleType === 'high' && now - createdAt >= 365 * 24 * 60 * 60 * 1000) {
          point.isPosted = true;
        } 
        else if (point.scheduleType === 'custom' && point.customScheduleDate <= now) {
          point.isPosted = true;
        }
  
        await point.save(); // Зберегти зміни
      });
    } catch (err) {
      console.error('Error scheduling points:', err);
    }
  });

schedule.start();
  
module.exports = router;