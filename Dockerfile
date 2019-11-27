# Filename: Dockerfile 
FROM node:10-alpine
RUN apk --no-cache add --virtual builds-deps build-base python
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "start"]