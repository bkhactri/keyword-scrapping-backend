FROM node:20.11.0

WORKDIR /app

COPY . .

RUN npm ci --legacy-peer-deps

RUN npm run build

RUN npm i -g pm2

CMD ["pm2-runtime", "start","ecosystem.config.js"]

