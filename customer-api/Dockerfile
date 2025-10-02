FROM node:18-alpine

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy shared code first
COPY shared/ ./shared/

# Copy customer-specific package.json
COPY customer-api/package*.json ./

# Install dependencies
RUN npm ci

# Copy customer-specific source code
COPY customer-api/src/ ./src/

# Copy customer-specific TypeScript config
COPY customer-api/tsconfig.json ./

EXPOSE 5000

CMD ["npm", "run", "dev"]