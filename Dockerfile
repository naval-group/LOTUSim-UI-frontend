FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve the application with nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

RUN rm -rf /docker-entrypoint.d/* && \
    ln -sf /dev/null /var/log/nginx/access.log && \
    ln -sf /dev/null /var/log/nginx/error.log
EXPOSE 80
CMD ["nginx", "-g", "daemon off; error_log stderr emerg;"]

