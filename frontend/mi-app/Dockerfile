FROM node:22.20.0-bookworm-slim

WORKDIR /app

# Copiar package files
COPY package.json package-lock.json* ./

# Install project dependencies using npm ci (ensures a clean, reproducible install)
RUN --mount=type=cache,target=/root/.npm npm ci

# Copy the rest of the application source code into the container
COPY .. .

CMD ["npm", "run", "dev"]