# Use a base image with Node.js pre-installed
FROM node:bullseye-slim

WORKDIR /app

COPY package*.json ./
RUN npm uninstall --save vue vue-router chart.js font-awesome luxon pinia tabulator-tables \
    && npm ci --omit=dev && npm cache clean --force
# build deps first then copy over code to optimize docker image re-use
COPY build ./build

# Expose the specified port
EXPOSE 8085
RUN useradd --uid 1002 --no-create-home --shell /bin/bash fintrack2

USER fintrack2
CMD ["node","./build/server/main.js", "8085"]