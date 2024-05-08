# Use Node.js LTS version as base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install both dependencies and devDependencies
RUN yarn

# Copy application source code
COPY . .

# Expose port 3000
EXPOSE 5000

# Command to run the application in development mode with hot-reloading
CMD ["npm", "run", "start:dev"]