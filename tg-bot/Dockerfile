# Встановлюємо базовий образ Node.js
FROM node:18

# Встановлюємо робочу директорію
WORKDIR /usr/src/app

# Копіюємо package.json та package-lock.json
COPY package*.json ./

# Встановлюємо залежності
RUN npm install

# Копіюємо решту файлів
COPY . .

# Копіюємо .env файл
COPY .env .env

# Додаємо перевірку наявності файлів
RUN test -f bot.js && echo "bot.js exists" || (echo "bot.js is missing" && exit 1)

# Перевірка наявності .env файлу
RUN test -f .env && echo ".env exists" || (echo ".env is missing" && exit 1)

# Відкриваємо порт
EXPOSE 8000

# Запускаємо бота
CMD ["node", "bot.js"]
