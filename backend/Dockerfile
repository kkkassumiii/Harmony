FROM node:18-bullseye

RUN apt-get update && apt-get install -y libssl1.1 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps --prefer-offline --no-audit

# Copy application code
COPY . .

# Generate Prisma client
RUN npm run db:generate

EXPOSE 8000

# Start development server
CMD ["npm", "run", "dev"]
CMD ["sh", "-c", "npm run db:migrate && npm run db:seed && npm run dev"]