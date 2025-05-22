FROM node:18-alpine

WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./
RUN npm install

# Copy server source code
COPY . ./

# Build the server
RUN npm run build

# Expose the port the server listens on
EXPOSE 5000

# Set NODE_ENV to production
ENV NODE_ENV=production \
    PORT=5000 \
    CLIENT_URL=http://localhost \
    PG_USER=postgres \
    PG_PASSWORD=postgres \
    PG_HOST=localhost \
    PG_PORT=5432 \
    PG_DATABASE=todo_app

# Start the server
CMD ["npm", "start"]
