# Multi-stage Dockerfile for Node.js API Gateway
FROM node:20-alpine as base

# Set environment variables
ENV NODE_ENV=production \
    NPM_CONFIG_LOGLEVEL=warn

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Development stage
FROM base as development

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Run development server
CMD ["npm", "run", "dev"]

# Production dependencies stage
FROM base as dependencies

# Install only production dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Production stage
FROM node:20-alpine as production

WORKDIR /app

# Copy production dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node healthcheck.js || exit 1

# Expose port
EXPOSE 3001

# Start the server
CMD ["node", "src/index.js"]
