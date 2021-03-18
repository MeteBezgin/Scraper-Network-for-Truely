# Use an official Node runtime as a parent image
FROM node:12-alpine

ENV CHROME_BIN="/usr/bin/chromium-browser" \ 
  PUPPETEER_CHROMIUM_REVISION="72.0.3626.121-r0" \ 
  PUPPETEER_SKIP_DOWNLOAD="true"

# Set the working directory to /app
WORKDIR '/usr/src/app'

# Copy package.json to the working directory
COPY package.json .

# Install any needed packages specified in package.json
RUN npm install

RUN apk add --no-cache \
  udev \
  ttf-freefont 

# Copying the rest of the code to the working directory
COPY . .

# Make port 80 available to the world outside this container
EXPOSE 80

# Run index.js when the container launches
CMD ["node", "index.js"]