# client/Dockerfile

FROM node:18.13

WORKDIR /usr/src/app

# Remove existing files in the working directory
RUN rm -rf /usr/src/app/*

COPY package*.json ./

RUN npm install

COPY . .

# Expose port 80
EXPOSE 80

# Start the application
CMD ["npm", "run", "dev", "--host", "http://client:5173"]
