# STAGE 1
FROM node:14.17.5-alpine AS build
ENV PORT=5000
ENV NODE_ENV=development
ENV NAMA="NAUVAL SHIDQI"
# Add a work directory
WORKDIR /app
# Cache and Install dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm install
# Copy app files
COPY . ./

CMD ["node", "app.js"]
