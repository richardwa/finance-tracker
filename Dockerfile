# Use a base image with Node.js pre-installed
FROM node:bullseye-slim

WORKDIR /app

COPY package*.json ./
COPY build ./build

RUN npm ci --omit=dev && npm cache clean --force


# Expose the specified port
EXPOSE 8080

USER 1002
CMD ["node","./build/server/main.js", "8080"]