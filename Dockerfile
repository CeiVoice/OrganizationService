FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY nodemon.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 8001

# Start the application with nodemon
CMD ["npm", "start"]
