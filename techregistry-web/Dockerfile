# syntax=docker/dockerfile:1

# Etapa 1: instala as dependencias e gera o build estatico do Vite.
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos primeiro os manifests para aproveitar o cache do Docker.
COPY package.json package-lock.json ./
RUN npm install

# Depois copiamos o restante do projeto e executamos o build.
COPY . .
RUN npm run build

# Etapa 2: publica os arquivos gerados com Nginx.
FROM nginx:1.27-alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
