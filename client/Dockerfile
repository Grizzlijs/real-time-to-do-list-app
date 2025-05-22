# Stage 1: Build the React app
FROM node:22-alpine as build

WORKDIR /app

# Copy only package files for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci --silent && npm cache clean --force

# Copy all source files
COPY . .

# Build the React app
RUN npm run build

# Stage 2: Serve the build using Nginx
FROM nginx:alpine

# Copy built app from previous stage
COPY --from=build /app/build /usr/share/nginx/html

# Optional: Replace the default nginx config
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80 (used by Railway by default)
EXPOSE 80

# Start Nginx (default command is already set, but for clarity:)
CMD ["nginx", "-g", "daemon off;"]