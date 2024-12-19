FROM node:20.11.0

WORKDIR /app

COPY . .

RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /root/.cache/puppeteer && chmod -R 777 /root/.cache

RUN npm ci --legacy-peer-deps

RUN npm run build

RUN npm i -g pm2

CMD ["pm2-runtime", "start","ecosystem.config.js"]

