FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine AS runtime
RUN apk add --no-cache gettext
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD /bin/sh -c "envsubst '\${BACKEND_URL}' < /usr/share/nginx/html/config.js > /tmp/config.js && mv /tmp/config.js /usr/share/nginx/html/config.js && nginx -g 'daemon off;'"
