# Use a base image with Node.js pre-installed
FROM node:bullseye-slim

WORKDIR /app

COPY package*.json ./
COPY build ./build

RUN npm ci --omit=dev && npm cache clean --force


# Expose the specified port
EXPOSE 8080

RUN id -u appuser >/dev/null 2>&1 || \ 
    (groupadd --gid 1001 appuser && \
    useradd --uid 1001 --gid 1001 --no-create-home --shell /bin/bash appuser)
USER appuser
CMD ["node","./build/server/main.js", "8080"]