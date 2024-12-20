# syntax=docker/dockerfile:1

FROM node:20.18-alpine3.20 AS build-stage

ARG MODE=production

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

RUN npm i -D vite

ENV NODE_ENV=$MODE

RUN npm run build -- --mode $MODE

FROM nginx:1.27.2-alpine3.20 AS production-stage

WORKDIR /usr/share/nginx/html

COPY --from=build-stage /usr/src/app/dist .
