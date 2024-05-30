const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
//const AuthUserModel = require('server\models\AuthUser.models.js');
//const AuthUserModel = require('./models/AuthUser.models');
const AuthUserModel = require('./models/AuthUser.models');
const PointModel = require('./models/Point.models');
const ImageModel = require('./models/ImageLink.models');
require('dotenv').config();

const bcrypt = require('bcrypt');

const mongoDB_token = process.env.MONGODB_TOKEN;

const token = process.env.TG_TOKEN;

try {
  mongoose.connect(
    `mongodb+srv://${mongoDB_token}@labs.rtfcsa6.mongodb.net/dimploma?retryWrites=false&w=majority`,
    {
    }
  );
} catch (error) {
  console.log(error);
}


  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "connection error: "));
  db.once("open", function () {
      console.log("connected to database successfully");
  });

// Створення об'єкту бота
const bot = new TelegramBot(token, { polling: true });

const rememberedUsers = {};

// Обробник команди /start
bot.onText(/\/start (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const username = match[1]; // Введене користувачем ім'я
  const telegramUsername = msg.from.username; // Username користувача в Telegram
  bot.sendMessage(chatId, 'With the help of this bot, you will be able to view new points in your city');

  // Перевірка, чи username користувача в Telegram збігається з введеним ім'ям
  if (username !== telegramUsername) {
    bot.sendMessage(chatId, 'The entered username does not match your Telegram username. Enter correct username and try again.');
    return;
  }

  try {
      const user = await AuthUserModel.findOne({telegram: username});
      if (!user) {
          bot.sendMessage(chatId, 'User not found');
          return;
      }
      const userInfo = {
          username: user.username,
          hashedPassword: user.hashedPassword,
          role: user.role,
          email: user.email,
          city: user.city,
          district: user.district,
          createdAt: user.createdAt,
      };
      rememberedUsers[chatId] = { username: userInfo.username, chatId, role: userInfo.role, city: userInfo.city.split(',')[0].trim() };

      if (userInfo.role === 'moderator') {
          bot.sendMessage(chatId, 'Please enter the moderator password:');
          bot.once('message', async (msg) => {
            console.log(msg.text, userInfo.hashedPassword);
            const isMatch = await bcrypt.compare(msg.text, userInfo.hashedPassword);
            if (isMatch) {
              bot.sendMessage(chatId, 'Access granted. Welcome, moderator!');
                  // Save moderator status to rememberedUsers
                  rememberedUsers[chatId].isAuthenticated = true;
            } else {
                  bot.sendMessage(chatId, 'Incorrect password. Access denied.');
                  delete rememberedUsers[chatId];
              }
          });
      } else {
            // Save user status to rememberedUsers
            rememberedUsers[chatId].isAuthenticated = true;
            const message = `Username: ${userInfo.username}\nCity: ${userInfo.city}`;
            bot.sendMessage(chatId, message);
      }
  } catch (error) {
      console.error(error);
      bot.sendMessage(chatId, 'Error finding user.');
  }
});

  
  // Приклад обробників інших команд, які враховують запам'ятаного користувача
  bot.onText(/\/getinfo/, async (msg) => {
    const chatId = msg.chat.id;
  const user = rememberedUsers[chatId];
  if (!user) {
    bot.sendMessage(chatId, 'Please start the bot first using /start yourUsername');
    return;
  }
    if (rememberedUsers[chatId]) {
      const { username, chatId, role, city } = rememberedUsers[chatId];
      const message = `Remembered User:\nUsername: ${username}\nRole: ${role}\nCity: ${city}`;
      bot.sendMessage(chatId, message);
    } else {
      bot.sendMessage(chatId, 'No user remembered in this chat.');
    }
  });

// Обробник команди /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Available commands:\n/start +username - Log in/Change user\n/getinfo - Get info about user\n/recentpoints - Get recently added points in your city\n/help - List of commands\n/getunpostedpoints - List of unposted points (moderator only)');
});

// Обробник відправлення повідомлення
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  console.log(msg.text);
});

bot.onText(/\/getunpostedpoints/, async (msg) => {
  const chatId = msg.chat.id;
  const user = rememberedUsers[chatId];
  if (!user) {
    bot.sendMessage(chatId, 'Please start the bot first using /start yourUsername');
    return;
  }

  if (rememberedUsers[chatId] && rememberedUsers[chatId].role === 'moderator' && rememberedUsers[chatId].isAuthenticated) {
    try {
      const pendingPoints = await PointModel.find({ isPosted: false });
      if (pendingPoints.length === 0) {
        bot.sendMessage(chatId, 'There are no unposted points.');
      } else {
        pendingPoints.forEach(async point => {
          const message = `Unposted point:\nPlace Name: ${point.place_name}\nCity: ${point.city}\nDescription: ${point.description}\nIncident date: ${point.dateOfDestruction}\nCategory: ${point.category}\nWeapon type: ${point.typeOfWeapon}\nSource: ${point.source}`;
          //bot.sendMessage(chatId, message);
          const images = await fetchImagesForPoint(point);
      
          sendNotificationToModerators(message, 'moderator', images);
        });
      }
    } catch (error) {
      console.error(error);
      bot.sendMessage(chatId, 'Error retrieving unposted points.');
    }
  } else {
    bot.sendMessage(chatId, 'You do not have permission to view unposted points.');
  }
});

// Обробник команди /recentlypoints
bot.onText(/\/recentpoints/, async (msg) => {
  const chatId = msg.chat.id;
  const user = rememberedUsers[chatId];
  if (!user) {
    bot.sendMessage(chatId, 'Please start the bot first using /start yourUsername');
    return;
  }

  const { role, city } = user;

  try {
    let points = [];
    if (role === 'user') {
      // Отримання точок, що були опубліковані за останній тиждень в місті користувача
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7); // Віднімаємо 7 днів

      points = await PointModel.find({ isPosted: true, city, updatedAt: { $gte: lastWeek } });
    } else if (role === 'moderator') {
      // Отримання точок, що були запропоновані за останній тиждень в місті користувача
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7); // Віднімаємо 7 днів

      points = await PointModel.find({ city, updatedAt: { $gte: lastWeek } });
    }

    if (points.length === 0) {
      bot.sendMessage(chatId, 'No points found in your city in the last week.');
    } else {
      points.forEach(async point => {
        const message = `Point:\nPlace Name: ${point.place_name}\nCity: ${point.city}\nDescription: ${point.description}\nIncident date: ${point.dateOfDestruction}\nCategory: ${point.category}\nWeapon type: ${point.typeOfWeapon}\nSource: ${point.source}`;
        const images = await fetchImagesForPoint(point);
        sendNotificationToModerators(message, role, images);
      });
    }
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, 'Error retrieving points.');
  }
});

// Set up change stream
const pointChangeStream = PointModel.watch();

// Start watching for changes
pointChangeStream.on('change', async (change) => {
  if (change.operationType === 'insert') {
    const newPoint = change.fullDocument;
    const message = `New Point suggested:\nPlace Name: ${newPoint.place_name}\nCity: ${newPoint.city}`;
    // Send message to all users or specific users (depending on your logic)
    //sendNotificationToModerators(message);
    const images = await fetchImagesForPoint(newPoint);
      
    sendNotificationToModerators(message, 'moderator', images);
  }
});

function sendNotificationToModerators(message) {
    Object.values(rememberedUsers).forEach((userInfo) => {
        const { chatId, role: userRole } = userInfo;
        if (userRole === role) {
          
          bot.sendMessage(chatId, message);
        }
    });
  }

  pointChangeStream.on('change', async (change) => {
    if (change.operationType === 'update') {
      const updatedPoint = change.updateDescription.updatedFields;
      if (updatedPoint && updatedPoint.isPosted === true) {
        const { place_name, city } = await PointModel.findById(change.documentKey._id);
        const message = `New Point posted:\nPlace Name: ${place_name}\nCity: ${city}`;
        const point = await PointModel.findById(change.documentKey._id);
        const images = await fetchImagesForPoint(point);
      
        sendNotificationToUsersWithRoleAndCity(message, 'user', city, images);
      }
    }
  });

  async function fetchImagesForPoint(point) {
    try {
      const images = await point.getImagesLinkByParentId(point._id);
      console.log(images);
      return images.map(image => image.dataUrl);  // Assuming image.dataUrl contains the S3 URL
    } catch (error) {
      console.error('Error fetching images:', error);
      return [];
    }
  }

  function sendNotificationToUsersWithRoleAndCity(message, role, city, images) {
    Object.values(rememberedUsers).forEach((userInfo) => {
      const { chatId, role: userRole, city: userCity } = userInfo;
      if (userRole === role && userCity === city) {
        if (images && images.length > 0) {
          // Створення масиву для медіа-групи
          const mediaGroup = images.map((imageUrl, index) => ({
            type: 'photo',
            media: imageUrl,
            caption: index === 0 ? message : '', // Додаємо підпис лише до першого зображення
          }));
          
          bot.sendMediaGroup(chatId, mediaGroup);
        } else {
          bot.sendMessage(chatId, message);
        }
      }
    });
  }

  function sendNotificationToModerators(message, role, images) {
    Object.values(rememberedUsers).forEach((userInfo) => {
      const { chatId, role: userRole } = userInfo;
      if (userRole === role) {
        if (images && images.length > 0) {
          // Створення масиву для медіа-групи
          const mediaGroup = images.map((imageUrl, index) => ({
            type: 'photo',
            media: imageUrl,
            caption: index === 0 ? message : '', // Додаємо підпис лише до першого зображення
          }));
          
          bot.sendMediaGroup(chatId, mediaGroup);
        } else {
          bot.sendMessage(chatId, message);
        }
      }
    });
  }


console.log('bot started');
