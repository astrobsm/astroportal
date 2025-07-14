# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm install

# Copy application code
COPY . .

# Build the frontend
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

# Create uploads directory
RUN mkdir -p uploads

# Expose port (only need one port now)
EXPOSE 3001

# Set environment to production
ENV NODE_ENV=production

# Start the backend server (which now serves the frontend)
CMD ["npm", "run", "server"]