# Use a base image with Node.js pre-installed
FROM node:bullseye-slim

WORKDIR /app

COPY package*.json ./
COPY build ./build

RUN npm ci --omit=dev && npm cache clean --force


# Expose the specified port
EXPOSE 8080

RUN id -u fintrack >/dev/null 2>&1 || \ 
    (groupadd --gid 1002 fintrack && \
    useradd --uid 1002 --gid 1002 --no-create-home --shell /bin/bash fintrack)
USER fintrack
CMD ["node","./build/server/main.js", "8080"]