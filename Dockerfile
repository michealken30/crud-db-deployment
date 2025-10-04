# Use official Node LTS slim image
FROM node:20-alpine

# Create app dir
WORKDIR /usr/src/app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --production

# Copy source
COPY . .

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "src/index.js"]
