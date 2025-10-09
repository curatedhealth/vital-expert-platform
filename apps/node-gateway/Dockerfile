# Multi-stage Dockerfile for Node.js Gateway
FROM node:18-alpine as base

# Set working directory
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Development stage
FROM base as development

# Install development dependencies
RUN apk add --no-cache \
    curl \
    git

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY . .

# Set permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3001

# Run development server
CMD ["dumb-init", "npm", "run", "dev"]

# Build stage
FROM base as builder

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM base as production

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Create logs directory and set permissions
RUN mkdir -p /app/logs && \
    chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Expose port
EXPOSE 3001

# Start the application
CMD ["dumb-init", "node", "dist/server.js"]