FROM node:18-alpine as build

WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy client source code
COPY . ./

# Set build-time environment variables with default values
ARG REACT_APP_SOCKET_URL=http://localhost:5000
ENV REACT_APP_SOCKET_URL=${REACT_APP_SOCKET_URL}

# Build client
RUN npm run build

# Generate a runtime environment script that can be executed at container startup
RUN echo "window.ENV = { \
  REACT_APP_SOCKET_URL: '${REACT_APP_SOCKET_URL}', \
  REACT_APP_API_TIMEOUT: 30000, \
  REACT_APP_SOCKET_RECONNECT_ATTEMPTS: 5 \
};" > /app/build/env-config.js

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
  # Health check endpoint \
  location /health { \
    access_log off; \
    add_header Content-Type text/plain; \
    return 200 "healthy\n"; \
  } \
}' > /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Simple startup script
COPY --from=build /app/build/env-config.js /usr/share/nginx/html/env-config.js

CMD ["nginx", "-g", "daemon off;"]
