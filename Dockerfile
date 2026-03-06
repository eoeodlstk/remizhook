# ==========================================
# 1. 빌드 스테이지 (Builder Stage)
# ==========================================
# Multi-arch 지원
FROM --platform=$TARGETPLATFORM node:22.9-slim AS builder

ARG TARGETPLATFORM
ARG BUILDPLATFORM

WORKDIR /app

# npm 캐시를 활용하기 위해 package 파일들만 먼저 복사
COPY package.json package-lock.json* ./

# SSL 설정 및 의존성, Typescript 설치 (빌드용)
RUN npm config set strict-ssl false \
  && npm install -g npm@10.8.3 typescript@5.6.2 \
  && npm ci --unsafe-perm

# 소스 코드 복사 및 빌드 진행
COPY tsconfig.json ./
COPY ./src/ ./src/
RUN tsc --build

# ==========================================
# 2. 실행 스테이지 (Production Stage)
# ==========================================
FROM --platform=$TARGETPLATFORM node:22.9-slim AS runner

# 레이블 설정
LABEL authors="jongchulno"
LABEL version="2.0"
LABEL description="RemizDiscordBot - Lightweight Axios/Cloudscraper crawler"

# Node.js 환경변수 설정
ENV NODE_ENV=production

WORKDIR /app

# 프로덕션 실행에 필요한 모듈만 설치 (DevDependencies 제외)
COPY package.json package-lock.json* ./
RUN npm config set strict-ssl false \
  && npm ci --only=production --unsafe-perm

# 빌드 스테이지에서 컴파일된 자바스크립트 파일만 가져오기
COPY --from=builder /app/build ./build

# 실제 실행
CMD ["node", "build/index.js"]
