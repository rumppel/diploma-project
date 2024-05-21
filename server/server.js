const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const RouterAdditional = require("./routes/additional.routes.js")
const RouterUser = require("./routes/user.routes.js")
const RouterPoint = require("./routes/point.routes.js")
const RouterSchedule = require("./routes/scheduler.routes.js")
const RouterProxy = require("./routes/proxy.routes.js")

const FileParser = require("./routes/fileparser.routes.js")
const cookieParser = require("cookie-parser");
const mapboxSdk = require('@mapbox/mapbox-sdk/services/geocoding');
const multer = require('multer');
const {GridFsStorage} = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const cron = require('node-cron');
const Dotenv = require('dotenv-webpack');
require('dotenv').config();

module.exports = {
    // інші налаштування
    plugins: [
        new Dotenv()
    ]
};

const mongoDB_token = process.env.MONGODB_TOKEN;
console.log(`MongoDB token: ${mongoDB_token}`);
const session_secret = process.env.SESSION_SECRET;

const app = express();
app.use(express.json());

const corsOptions ={
    origin:'http://localhost:5173', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}

app.use(cors(corsOptions));
app.options('*', cors())
app.use(cookieParser());

app.use(session({
    name: 'usersession.sid',
    secret: session_secret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: `mongodb+srv://${mongoDB_token}@labs.rtfcsa6.mongodb.net/dimploma?retryWrites=true&w=majority`
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 7, httpOnly: false } // Налаштування часу життя сесії
}));


mongoose.connect(
    `mongodb+srv://${mongoDB_token}@labs.rtfcsa6.mongodb.net/dimploma?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
);



let gfs;
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
    console.log("connected to database successfully");
});


//Налаштування збереження файлів у GridFS
const storageGFS = new GridFsStorage({
    db: db,
    file: (req, file) => {
      const filename = `${Date.now()}_${file.originalname}`;
      console.log('IN STORAGE GFS', filename);
      return {
        filename: filename,
        bucketName: 'images', // Ім'я бакету, куди зберігатимуться зображення
      };
    },
  });
  


module.exports = storageGFS;


app.use(RouterUser);
app.use(RouterAdditional);
app.use(RouterPoint);
app.use(RouterSchedule);
app.use(RouterProxy);
app.use(FileParser);

app.listen(3001, () => {
    console.log("Server listining on http://127.0.0.1:3001");

});