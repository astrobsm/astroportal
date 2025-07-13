# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies
RUN npm install --only=production
RUN cd server && npm install --only=production

# Copy application code
COPY . .

# Build the frontend
RUN npm run build

# Create uploads directory
RUN mkdir -p uploads

# Expose ports
EXPOSE 3001 4173

# Set environment to production
ENV NODE_ENV=production

# Create startup script
RUN echo '#!/bin/sh\n\
# Start backend in background\n\
cd /app/server && npm start &\n\
# Start frontend\n\
cd /app && npm run preview' > /app/start.sh && chmod +x /app/start.sh

# Use startup script
CMD ["/app/start.sh"]