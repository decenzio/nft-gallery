FROM node:20

ENV PNPM_VERSION 9.4.0
RUN npm i -g pnpm@$PNPM_VERSION

WORKDIR /app
COPY . .

# Install dependencies
RUN pnpm install

RUN pnpm --filter @kodadot1/static build
RUN pnpm --filter @kodadot1/brick build || echo "Brick build failed, continuing..."

ENV NODE_ENV=production
RUN NODE_OPTIONS="--max-old-space-size=6144" pnpm build

ENV HOST 0.0.0.0
EXPOSE 9090
