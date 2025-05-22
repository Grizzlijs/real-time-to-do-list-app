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
RUN echo "window.ENV = { REACT_APP_SOCKET_URL: '${REACT_APP_SOCKET_URL}' };" > /app/build/env-config.js

# Use Nginx for serving the built client
FROM nginx:alpine

# Copy the built assets to nginx serving folder
COPY --from=build /app/build /usr/share/nginx/html

# Create a script to update environment variables at runtime
RUN echo "#!/bin/sh\n\
if [ ! -z \"\$REACT_APP_SOCKET_URL\" ]; then\n\
  echo \"window.ENV = { REACT_APP_SOCKET_URL: '\$REACT_APP_SOCKET_URL' };\" > /usr/share/nginx/html/env-config.js;\n\
fi\n\
exec nginx -g 'daemon off;'" > /docker-entrypoint.sh && \
chmod +x /docker-entrypoint.sh

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

CMD ["/docker-entrypoint.sh"]
