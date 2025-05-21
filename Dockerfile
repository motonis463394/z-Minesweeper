# Use an official Node.js runtime as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first for efficient caching
COPY package.json package-lock.json ./

# Install dependencies, including dotenv
RUN npm install

# Copy the entire project
COPY . .

# Set environment variables (Render will override these if set in the dashboard)
ENV PORT=3000

# Expose the application's port
EXPOSE $PORT

# Start the application using Express
CMD ["node", "server.js"]
