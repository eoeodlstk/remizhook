FROM node:14.16.1
LABEL authors="jongchulno"
LABEL version="1.0"
LABEL description="This is a Dockerfile for nodejs"
WORKDIR /app
COPY package.json /app/
RUN npm install
RUN npm install -g typescript@4.8.4
COPY ./src/ /app/src/
#COPY .env /app/
#COPY data.json /app/
COPY tsconfig.json /app/
RUN tsc --build
#RUN npm run build-ts
CMD ["node", "build/index.js"]
