FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/server/package.json apps/server/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN npm install

COPY . .

RUN npm run build --workspace @team-ape-rip/server

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV SERVER_PORT=3001

COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/server/package.json ./package.json

EXPOSE 3001

CMD ["node", "dist/main.js"]