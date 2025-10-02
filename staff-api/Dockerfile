FROM node:18-alpine

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy shared code first
COPY shared/ ./shared/

# Copy staff-specific package.json
COPY staff-api/package*.json ./

# Install dependencies
RUN npm ci

# Copy staff-specific source code
COPY staff-api/src/ ./src/

# Copy staff-specific TypeScript config
COPY staff-api/tsconfig.json ./

EXPOSE 5001

CMD ["npm", "run", "dev"]