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

# If VITE_AI_BASE_URL is set to a remote gateway, dynamically update Nginx upstream proxy
if [ -n "$VITE_AI_BASE_URL" ] && echo "$VITE_AI_BASE_URL" | grep -q "^http"; then
  TARGET_URL=$(echo "$VITE_AI_BASE_URL" | sed 's/\/*$//')/
  TARGET_HOST=$(echo "$VITE_AI_BASE_URL" | sed -e 's|^[^/]*//||' -e 's|/.*$||' -e 's|:.*$||')
  
  if [ -f /etc/nginx/conf.d/default.conf ]; then
    sed -i "s|proxy_pass https://api.openai.com/v1/;|proxy_pass ${TARGET_URL};|g" /etc/nginx/conf.d/default.conf
    sed -i "s|proxy_set_header Host api.openai.com;|proxy_set_header Host ${TARGET_HOST};|g" /etc/nginx/conf.d/default.conf
  fi
fi

# Execute the CMD passed to docker container
exec "$@"
