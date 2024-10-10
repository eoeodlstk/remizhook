FROM node:22.9-alpine
USER root
LABEL authors="jongchulno"
LABEL version="1.0"
LABEL description="This is a Dockerfile for nodejs"
# chromium 설치
RUN apk add --no-cache udev ttf-freefont chromium
RUN chromium-browser --version
# npm 설치 시 chromium 다운하지 않도록 설정
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV CHROMIUM_PATH=/usr/bin/chromium-browser
# 설치된 위치를 환경 변수로 설정(node에서 사용)
WORKDIR /app
COPY package.json /app/
RUN npm config set strict-ssl false
RUN npm install -g npm@10.8.3
RUN npm install --unsafe-perm
RUN npm install -g typescript@5.6.2
COPY ./src/ /app/src/
#COPY .env /app/
#COPY data.json /app/
COPY tsconfig.json /app/
RUN tsc --build
#RUN npm run build-ts
CMD ["node", "build/index.js"]
