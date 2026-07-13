FROM oven/bun:1.3-alpine

WORKDIR /app

COPY --chown=bun:bun package.json bun.lock ./
RUN bun install --frozen-lockfile --production

COPY --chown=bun:bun tsconfig.json ./
COPY --chown=bun:bun src ./src
COPY --chown=root:root entrypoint.sh ./
RUN chmod +x entrypoint.sh

ENV NODE_ENV=production

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --spider -q http://127.0.0.1:5000/health || exit 1

CMD ["./entrypoint.sh"]