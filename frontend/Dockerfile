# ---- Stage 1: build the React app with Vite ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# API calls go to /api on the same host; Nginx forwards them to the backend
ENV VITE_API_URL=/api
RUN npm run build

# ---- Stage 2: serve the static files with Nginx ----
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
