#!/bin/sh
set -e

# Generate runtime env-config.js dynamically from container environment variables
cat <<EOF > /usr/share/nginx/html/env-config.js
window.__ENV__ = {
  VITE_AI_BASE_URL: "${VITE_AI_BASE_URL:-}",
  VITE_AI_API_KEY: "${VITE_AI_API_KEY:-}",
  VITE_AI_MODEL: "${VITE_AI_MODEL:-}"
};
EOF

# Execute the CMD passed to docker container
exec "$@"
