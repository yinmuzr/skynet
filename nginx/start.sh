#!/bin/sh
sed -i 's#$API_URL#'"$API_URL"'#g' /etc/nginx/conf.d/default.conf

if [ ! -z "${VUE_APP_SSO_LOGIN_URL}" ]; then
  echo "window.VUE_APP_SSO_LOGIN_URL='$VUE_APP_SSO_LOGIN_URL';" >> /usr/share/nginx/html/global.js
fi

if [ ! -z "${DEV_MODE}" ]; then
  echo "window.DEV_MODE='$DEV_MODE';" >> /usr/share/nginx/html/global.js
fi

nginx -g "daemon off;"
