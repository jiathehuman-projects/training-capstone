FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Clean install to avoid platform conflicts
RUN rm -rf node_modules package-lock.json
RUN npm install

# Copy source code (excluding node_modules from host)
COPY frontend/src ./src/
COPY frontend/public ./public/
COPY frontend/index.html ./
COPY frontend/vite.config.ts ./
COPY frontend/tsconfig.json ./
COPY frontend/tsconfig.node.json ./
COPY frontend/tailwind.config.js ./
COPY frontend/postcss.config.js ./

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
