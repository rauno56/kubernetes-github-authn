FROM node:10-alpine

EXPOSE 3000
WORKDIR /app/
CMD ["npm", "start", "--silent"]

COPY package-lock.json package.json ./
RUN npm ci --production

COPY . ./
