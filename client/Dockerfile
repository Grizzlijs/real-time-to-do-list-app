FROM node:18-alpine as build

WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy client source code
COPY . ./

# Build client
RUN npm run build

# Use Nginx for serving the built client
FROM nginx:alpine

# Copy the built assets to nginx serving folder
COPY --from=build /app/build /usr/share/nginx/html

# Add custom nginx configuration for SPA support
RUN echo 'server { \
  listen 80; \
  location / { \
    root /usr/share/nginx/html; \
    index index.html; \
    try_files $uri $uri/ /index.html; \
  } \
}' > /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
