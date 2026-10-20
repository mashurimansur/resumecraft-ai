# ==========================================
# Stage 1: Build the React Application
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies with frozen lockfile for build reproducibility
COPY package.json package-lock.json ./
RUN npm ci

# Pass build-time environment arguments (configurable via docker-compose build args)
ARG VITE_AI_BASE_URL="https://9router.codehuri.my.id/v1"
ARG VITE_AI_API_KEY=""
ARG VITE_AI_MODEL="ag/gemini-3.8-flash"

ENV VITE_AI_BASE_URL=$VITE_AI_BASE_URL
ENV VITE_AI_API_KEY=$VITE_AI_API_KEY
ENV VITE_AI_MODEL=$VITE_AI_MODEL

# Copy source code and build production bundle
COPY . .
RUN npm run build

# ==========================================
# Stage 2: Serve with lightweight Nginx
# ==========================================
FROM nginx:1.27-alpine AS runner

# Remove default Nginx welcome page and config
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled SPA bundle from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
