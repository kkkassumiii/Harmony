FROM node:18-bullseye-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV NPM_CONFIG_FETCH_RETRIES=5
ENV NPM_CONFIG_FETCH_RETRY_FACTOR=2
ENV NPM_CONFIG_FETCH_TIMEOUT=60000
ENV NPM_CONFIG_LOGLEVEL=warn

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps --prefer-offline --no-audit

# Copy application code
COPY . .

# Generate Prisma client
RUN npm run db:generate

EXPOSE 8000

# Start development server
CMD ["sh", "-c", "npm run db:push && npm run db:seed && npm run dev"]