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

# Відкриваємо порт
EXPOSE 8000

# Запускаємо бота
CMD ["node", "bot.js"]
