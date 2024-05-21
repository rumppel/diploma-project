const express = require('express');
const router = express.Router();
const AuthUserModel = require('../models/AuthUser.models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Для створення та перевірки токенів аутентифікації
const session = require('express-session');

router.get('/register', (req, res) => {
    res.render('register'); // Відображаємо EJS сторінку для реєстрації
  });

// Реєстрація нового користувача
router.post('/register', async (req, res)=>{
    try {
        const { username, password, email, city, district } = req.body;
    
        // Перевірка, чи користувач з таким іменем або email вже існує
        const existingUser = await AuthUserModel.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
          return res.json("Already registered");
        }
    
        // Хешування паролю перед зберіганням у базі даних
        const hashedPassword = await bcrypt.hash(password, 10); // 10 - кількість раундів солювання
        // Створення нового користувача
        const user = new AuthUserModel({
          username,
          hashedPassword: hashedPassword,
          email,
          city,
          district,
        });
    
        await user.save();
        res.status(201).json(user);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Помилка при реєстрації користувача' });
      }
    });

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Знайдемо користувача за ім'ям користувача
    const user = await AuthUserModel.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: 'Невірні дані аутентифікації' });
    }

    // Порівняємо введений пароль із збереженим хешем
    const isMatch = await bcrypt.compare(password, user.hashedPassword);

    if (!isMatch) {
      return res.json("Unsuccessfully");
    }
    
    req.session.user = {
      id: user._id,
      username: user.username,
      role: user.role,
      email: user.email,
      city: user.city,
      district: user.district,
      isLoggedIn: true
    };

    req.session.save();    
    res.json({ message: 'Success', user: req.session.user});
  } catch (error) {
    console.error(error);
    res.json("Unsuccessfully");
  }
});

router.post('/logout', async (req, res) => {
  try {
    req.session.destroy();
    res.clearCookie('usersession.sid', { path: '/' });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error(error);
    res.json("Unsuccessfully");
  }
});


router.get('/getsession', (req, res) => {
  const sessionuser = req.session.user;
  if (sessionuser) {
    res.send(sessionuser);
  } else {
    res.status(401);
    //res.redirect('/login');
  }
});

router.get('/profile', (req, res) => {
  res.render('profile'); // Відображаємо EJS сторінку для входу
});

router.get('/getprofiledata', async (req, res) => {
  try {
    // Перевірка наявності заголовка 'Authorization' у запиті
    if (!req.header('Authorization')) {
        return res.status(401).json({ error: 'Не вказано токен або невірний формат' });
    }

    // Реквест повинен містити токен у заголовках, наприклад, "Authorization: Bearer your_token"
    const token = req.header('Authorization').replace('Bearer ', '');

    // Перевірка та розкодування токена
    const decoded = jwt.verify(token, 'key'); // Замініть 'your_secret_key' на ваш ключ

    // Знайдемо користувача за ідентифікатором з токена
    const user = await AuthUserModel.findById(decoded.userId);

    if (!user) {
        return res.status(404).json({ error: 'Користувач не знайдений' });
    }

    // Повернення інформації про користувача
    res.status(200).json(user);
} catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка при отриманні інформації про користувача' });
}
});

router.post('/updateprofile', async (req, res) => {
  try {
    const { id, username, password, email, city, district } = req.body;

    let updatedUser = await AuthUserModel.findByIdAndUpdate(id, {
      username,
      email,
      city,
      district,
    }, { new: true });

    if (!(!password || password.trim() === '')) {
      const hashedPassword = await bcrypt.hash(password, 10);

      updatedUser = await AuthUserModel.findByIdAndUpdate(id, {
        hashedPassword,
      }, { new: true });
    }

    if (!updatedUser) {
      return res.status(404).json({ error: 'Користувач не знайдений' });
    }

    req.session.user = {
      id: updatedUser._id,
      username: updatedUser.username,
      role: updatedUser.role,
      email: updatedUser.email,
      city: updatedUser.city,
      district: updatedUser.district,
      isLoggedIn: true
    };

    req.session.save();

    res.status(200).json({user: req.session.user});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка при оновленні даних користувача' });
  }
});

router.get('/users', async (req, res) => {
  try {
      const users = await AuthUserModel.find();
      res.json(users);
  } catch (err) {
      res.status(500).send(err);
  }
});

router.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { username, email, role, city, district } = req.body;
  try {
      const updatedUser = await AuthUserModel.findByIdAndUpdate(id, { username, email, role, city, district }, { new: true });
      res.json(updatedUser);
  } catch (err) {
      res.status(500).send(err);
  }
});

router.delete('/users/:id', async (req, res) => {
  const userId = req.params.id;

  try {
      // Знайдемо користувача за ID та видалимо його
      await AuthUserModel.findByIdAndDelete(userId);
      res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
