# Use the official lightweight Node.js image
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy the remaining project files
COPY . .

# Inform Docker that the application uses port 3000
EXPOSE 3000

# Start the application
CMD ["npm", "start"]