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

# Визначаємо аргументи збірки
ARG MONGODB_TOKEN
ARG TG_TOKEN

# Виставляємо змінні середовища
ENV MONGODB_TOKEN=${MONGODB_TOKEN}
ENV TG_TOKEN=${TG_TOKEN}

# Створюємо .env файл з токенами
RUN echo "MONGODB_TOKEN=${MONGODB_TOKEN}" > .env && \
    echo "TG_TOKEN=${TG_TOKEN}" >> .env

# Додаємо перевірку наявності файлів
RUN test -f bot.js && echo "bot.js exists" || (echo "bot.js is missing" && exit 1)

# Перевірка наявності .env файлу
RUN test -f .env && echo ".env exists" || (echo ".env is missing" && exit 1)

# Відкриваємо порт
EXPOSE 8000

# Запускаємо бота
CMD ["node", "bot.js"]
