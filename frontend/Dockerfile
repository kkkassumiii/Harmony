FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Clean cache and install dependencies
RUN npm cache clean --force && npm ci --legacy-peer-deps --prefer-offline --no-audit

# Copy application code
COPY . .

# Expose port for development
EXPOSE 3000

# Set environment variables for development
ENV REACT_APP_API_URL=http://backend:8000/api
ENV REACT_APP_APP_NAME="Гармония с собой"

# Start development server
CMD ["npm", "start"]
