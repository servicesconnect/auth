FROM node:23-alpine3.19 AS builder

WORKDIR /app
COPY *.json yarn.lock ./
COPY src ./src
RUN yarn install --frozen-lockfile && yarn build

FROM node:23-alpine3.19

WORKDIR /app
RUN apk add --no-cache curl
COPY *.json yarn.lock ./
RUN yarn global add pm2
RUN yarn install --production --frozen-lockfile
COPY --from=builder /app/build ./build

EXPOSE 5000

CMD [ "yarn", "start" ]