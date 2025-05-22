FROM node:18-alpine AS client-build

# Set working directory for client build
WORKDIR /app/client

# Copy client package files and install dependencies
COPY client/package*.json ./
RUN npm install --legacy-peer-deps

# Copy client source code
COPY client/ ./

# Build client
RUN npm run build

FROM node:18-alpine AS server-build

# Set working directory for server build
WORKDIR /app/server

# Copy server package files and install dependencies
COPY server/package*.json ./
RUN npm install

# Copy server source code
COPY server/ ./

# Build server
RUN npm run build

FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy built server files
COPY --from=server-build /app/server/package*.json ./
COPY --from=server-build /app/server/dist ./dist
COPY --from=server-build /app/server/node_modules ./node_modules

# Copy built client files to serve from Express
COPY --from=client-build /app/client/build ./public

# Set production environment
ENV NODE_ENV=production

# Expose the port
EXPOSE 5000

# Start the server
CMD ["node", "dist/index.js"]
