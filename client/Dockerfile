# client/Dockerfile

FROM node:18.13

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Expose port 80
EXPOSE 80

# Start the application
CMD ["npx", "serve", "-s", "build", "-l", "80"]
