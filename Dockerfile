FROM nginx:stable-alpine
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY dist /usr/share/nginx/html
COPY nginx/start.sh /start.sh

ENV API_URL=http://localhost:8080
ENV VUE_APP_SSO_LOGIN_URL=http://localhost:8081
ENV DEV_MODE=false
CMD ["/start.sh"]
