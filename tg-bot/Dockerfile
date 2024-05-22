# tg-bot/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 8000
CMD ["nodemon", "bot.js"]
