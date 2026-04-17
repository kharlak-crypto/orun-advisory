FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10.4.1

# Copy shared package
COPY ../shared /shared

# Copy client files
COPY . .

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build
RUN pnpm build

# Production image with nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
