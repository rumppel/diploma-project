# client/Dockerfile

FROM node:18.13

WORKDIR /usr/src/app

# Remove existing files in the working directory
RUN rm -rf /usr/src/app/*

COPY package*.json ./

RUN npm install

COPY . .

# Expose port 80
EXPOSE 5173

# Start the application
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
