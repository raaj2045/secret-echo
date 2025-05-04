FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm install 

# Copy application code
COPY . .

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

# Set environment to production
ENV NODE_ENV=production

EXPOSE 10000

CMD ["npm", "start"] 