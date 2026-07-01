# Stage 1: Build the Angular app
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

# Stage 2: Serve the app with Nginx
FROM nginx:alpine
# Copy build output to Nginx public folder
COPY --from=build /app/dist/smartech-fn/browser /usr/share/nginx/html
# Copy nginx template configuration for dynamic backend routing
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
EXPOSE 80
