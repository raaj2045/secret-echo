FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy from builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

# Set environment to production
ENV NODE_ENV=production

EXPOSE 3000

# Start the application
CMD ["npm", "start"] 