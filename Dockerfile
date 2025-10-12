# Use Node.js 18 as base
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN pnpm install

# Copy source code
COPY . .

# Build Next.js app
RUN pnpm build

# Expose port
EXPOSE 3000

# Start Next.js app
CMD ["pnpm", "start"]
