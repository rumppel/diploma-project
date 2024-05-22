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

# Виставляємо змінні середовища
ENV MONGODB_TOKEN=${MONGODB_TOKEN}
ENV TG_TOKEN=${TG_TOKEN}

# Додаємо перевірку наявності файлів
RUN test -f bot.js && echo "bot.js exists" || (echo "bot.js is missing" && exit 1)

# Перевірка наявності токену MONGODB_TOKEN
RUN test -n "$MONGODB_TOKEN" && echo "MONGODB_TOKEN is set" || (echo "MONGODB_TOKEN is missing" && exit 1)

# Відкриваємо порт
EXPOSE 8000

# Запускаємо бота
CMD ["node", "bot.js"]
