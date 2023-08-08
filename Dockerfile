FROM node:18-alpine
USER root
LABEL authors="jongchulno"
LABEL version="1.0"
LABEL description="This is a Dockerfile for nodejs"
# chromium 설치
RUN apk add --no-cache udev ttf-freefont chromium
# npm 설치 시 chromium 다운하지 않도록 설정
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
# 설치된 위치를 환경 변수로 설정(node에서 사용)
ENV CHROMIUM_PATH /usr/bin/chromium-browser
WORKDIR /app
COPY package.json /app/
RUN npm config set strict-ssl false
RUN npm install -g npm@9.8.1
RUN npm install --unsafe-perm
RUN npm install -g typescript@5.1.6
COPY ./src/ /app/src/
#COPY .env /app/
#COPY data.json /app/
COPY tsconfig.json /app/
RUN tsc --build
#RUN npm run build-ts
CMD ["node", "build/index.js"]
