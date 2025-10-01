FROM node:18 AS base
WORKDIR /app
COPY package*.json package-lock.json ./

FROM base AS development
# Clear any existing node_modules and package-lock to avoid platform conflicts
RUN rm -rf node_modules package-lock.json || true
# Install fresh dependencies for Linux platform
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

FROM base AS production
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]