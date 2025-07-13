# Use a Node.js base image
FROM node:20-slim

# Set the working directory
WORKDIR /app

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install

# Copy the rest of the application code
COPY . .

# Expose the port Next.js runs on
EXPOSE 3000

# Command to run the application in development mode
RUN rm -rf .next/cache
CMD ["sh", "-c", "pnpm dev"]
