FROM node:22

WORKDIR /app

COPY package.json ./

RUN npm install --omit=dev

COPY . .

RUN npm run build

EXPOSE 3000