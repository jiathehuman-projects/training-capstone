FROM node:20-alpine as base
WORKDIR /app
COPY package*.json ./

FROM base as development
RUN npm install
EXPOSE 5173
CMD ["npm", "run", "dev"]

FROM base as production
RUN npm install --production
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]