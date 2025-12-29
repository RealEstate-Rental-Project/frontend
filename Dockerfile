FROM nginx:alpine

# L'argument passé par Jenkins (ex: public-app)
ARG APP_NAME

# Config Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nettoyage
RUN rm -rf /usr/share/nginx/html/*

# COPIE CRITIQUE : On prend ce que Jenkins a généré
COPY dist/apps/${APP_NAME}/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]