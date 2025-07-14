# Stage 1: Install dependencies and run server
FROM node:20-alpine
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

# Expose port (default is 3002, but can be overridden via ENV)
EXPOSE 3002

CMD ["node", "index.js"] 