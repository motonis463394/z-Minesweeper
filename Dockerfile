# Use an official Node.js runtime
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the files
COPY . .

# Set environment variable for the application
ENV PORT=3000

# Expose the port your app runs on
EXPOSE $PORT

# Start the app using the environment variable
CMD ["node", "server.js"]
