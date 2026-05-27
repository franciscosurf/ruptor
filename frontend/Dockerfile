FROM node:20-alpine

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package*.json ./

# Eliminamos la caché interna y reinstalamos con los overrides activos
RUN  npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]