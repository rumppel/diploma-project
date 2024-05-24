# client/Dockerfile

FROM node:18.13

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 82

CMD ["npm", "run", "dev"]
