# STAGE 1
FROM node:14.17.5-alpine AS build
ENV NODE_ENV=production
# Add a work directory
WORKDIR /app
# Cache and Install dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm install
# Copy app files
COPY . ./

CMD ["node", "app.js"]
