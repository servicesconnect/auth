FROM node:23-alpine3.19 as builder

WORKDIR /app
COPY *.json yarn.lock ./
COPY src ./src
RUN npm ci && npm run build

FROM node:23-alpine3.19

WORKDIR /app
RUN apk add --no-cache curl
COPY *.json yarn.lock ./
RUN npm install -g pm2
RUN npm ci --production
COPY --from=builder /app/build ./build

EXPOSE 5000

CMD [ "yarn", "start" ]