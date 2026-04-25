# Stage 1: Build
FROM node:20-alpine AS builder

# Prisma requires OpenSSL on Alpine Linux
RUN apk add --no-cache openssl

WORKDIR /usr/src/app

# Copy package files and prisma schema first
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (using ci for reproducible builds)
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the NestJS application
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine AS runner

# Ensure OpenSSL is also available in the runner stage
RUN apk add --no-cache openssl

WORKDIR /usr/src/app

# Copy built assets and production dependencies from builder
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/prisma ./prisma

# Use non-root node user for security
USER node

# Expose the application port (NestJS is configured for 5000)
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production

# Start the application
CMD ["npm", "run", "start:prod"]
