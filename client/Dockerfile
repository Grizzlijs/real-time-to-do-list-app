# Use an official Node.js runtime as a parent image
FROM node:18-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React application
RUN npm run build

# Stage 2: Serve the static files using a lightweight server
FROM node:18-alpine

WORKDIR /app

# Install serve to serve static files
RUN npm install -g serve

# Copy the build output from the build stage
COPY --from=build /app/build ./build

# Expose the port the app runs on
EXPOSE 3000

# Command to serve the static files
CMD ["serve", "-s", "build", "-l", "3000"]
