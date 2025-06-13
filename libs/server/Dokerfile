FROM debian AS builder

WORKDIR /usr/src/app

RUN apt update
RUN apt install curl unzip -y

RUN curl https://bun.sh/install | bash

COPY package.json .

RUN /root/.bun/bin/bun install --production

FROM gcr.io/distroless/base

WORKDIR /usr/src/app

COPY --from=builder /root/.bun/bin/bun bun
COPY --from=builder /usr/src/app/node_modules node_modules

COPY src src
COPY tsconfig.json .

ENV MONGODB_URI=""
ENV REDIS_URL=""
ENV ADMIN_TOKEN=""

EXPOSE 3000

CMD ["./bun", "src/index.ts"]