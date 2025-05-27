# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy dependency files for caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the entire project
COPY . .

# Expose the application's port (Render sets this automatically)
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
