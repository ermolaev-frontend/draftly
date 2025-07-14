# Stage 1: Install dependencies and run server
FROM node:20-alpine
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

# Открываем порт (по умолчанию 3002, но можно переопределить через ENV)
EXPOSE 3002

CMD ["node", "index.js"] 