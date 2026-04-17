FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10.4.1

# Copy workspace files
COPY package.json ./
COPY ../pnpm-workspace.yaml ../pnpm-workspace.yaml 2>/dev/null || true

# Copy shared package
COPY ../shared /shared

# Copy server files
COPY . .

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build
RUN pnpm build

EXPOSE 3000

CMD ["node", "dist/src/index.js"]
