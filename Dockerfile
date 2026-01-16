FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app

# Install FFmpeg and curl for health checks
RUN apk add --no-cache ffmpeg curl

# Create public directory if it doesn't exist
RUN mkdir -p /app/public

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package*.json ./

# Copy public files if they exist in builder
COPY --from=builder /app/public ./public || true

EXPOSE 3000
CMD ["npm", "start"]
