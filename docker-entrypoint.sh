#!/bin/sh
set -e

HAS_SERVER_AUTH="false"

# If VITE_AI_BASE_URL is set to a remote or local gateway, dynamically update Nginx upstream proxy
if [ -n "$VITE_AI_BASE_URL" ] && echo "$VITE_AI_BASE_URL" | grep -q "^http"; then
  TARGET_URL=$(echo "$VITE_AI_BASE_URL" | sed 's/\/*$//')/
  TARGET_HOST=$(echo "$VITE_AI_BASE_URL" | sed -e 's|^[^/]*//||' -e 's|/.*$||')
  
  if [ -f /etc/nginx/conf.d/default.conf ]; then
    sed -i.bak \
      -e "s|proxy_pass .*|proxy_pass ${TARGET_URL};|g" \
      -e "s|proxy_set_header Host .*|proxy_set_header Host ${TARGET_HOST};|g" \
      /etc/nginx/conf.d/default.conf && rm -f /etc/nginx/conf.d/default.conf.bak
  fi
fi

# If VITE_AI_API_KEY is provided in container environment, inject it into Nginx server-side proxy
# so the API key is NEVER exposed to the client or browser!
if [ -n "$VITE_AI_API_KEY" ]; then
  HAS_SERVER_AUTH="true"
  if [ -f /etc/nginx/conf.d/default.conf ]; then
    sed -i.bak \
      -e "s|\"\" \"\";|\"\" \"Bearer ${VITE_AI_API_KEY}\";|g" \
      -e "s|\"Bearer \" \"\";|\"Bearer \" \"Bearer ${VITE_AI_API_KEY}\";|g" \
      -e "s|\"Bearer\" \"\";|\"Bearer\" \"Bearer ${VITE_AI_API_KEY}\";|g" \
      /etc/nginx/conf.d/default.conf && rm -f /etc/nginx/conf.d/default.conf.bak
  fi
fi

# Generate runtime env-config.js dynamically
# Note: VITE_AI_BASE_URL and VITE_AI_API_KEY are deliberately left blank in client env-config
# so default server credentials & internal URLs are never exposed. Users can still input custom ones in UI.
cat <<EOF > /usr/share/nginx/html/env-config.js
window.__ENV__ = {
  VITE_AI_BASE_URL: "",
  VITE_AI_MODEL: "${VITE_AI_MODEL:-ag/gemini-3.8-flash}",
  VITE_AI_SERVER_AUTH: ${HAS_SERVER_AUTH}
};
EOF

# Execute the CMD passed to docker container
exec "$@"
