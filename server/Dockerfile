# server/Dockerfile

FROM node:18.13

WORKDIR /usr/src/app

# Remove existing files in the working directory
RUN rm -rf /usr/src/app/*

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
