# Multi-arch build support
FROM --platform=$TARGETPLATFORM node:22.9

ARG TARGETPLATFORM
ARG BUILDPLATFORM

USER root
LABEL authors="jongchulno"
LABEL version="1.2"
LABEL description="RemizHook Discord Bot - Multi-arch supported"

# 시스템 패키지 업데이트 및 Chromium 설치
RUN apt-get update -qq \
  && apt-get install -qq --no-install-recommends \
    chromium \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* \
  && ln -s /usr/bin/chromium /usr/bin/google-chrome

# Puppeteer 설정
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV CHROMIUM_PATH=/usr/bin/google-chrome

WORKDIR /app
COPY package.json /app/
RUN npm config set strict-ssl false
RUN npm install -g npm@10.8.3
RUN npm install --unsafe-perm
RUN npm install -g typescript@5.6.2

COPY ./src/ /app/src/
COPY tsconfig.json /app/

RUN tsc --build

CMD ["node", "build/index.js"]
