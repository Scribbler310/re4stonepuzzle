# Stage 1: Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve stage
FROM nginx:stable-alpine

# Configure nginx to run on port 8080 for Hugging Face Space compatibility
RUN sed -i 's/80;/8080;/g' /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
