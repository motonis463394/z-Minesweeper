# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first for efficient caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Verify that dotenv is installed (now it will work!)
RUN ls -la node_modules | grep dotenv || echo "dotenv not found"

# Copy the entire project
COPY . .

# Set environment variables
ENV PORT=3000

# Expose the application's port
EXPOSE $PORT

# Start the application
CMD ["node", "server.js"]
