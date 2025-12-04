FROM node:22-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.24.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/utils ./packages/utils
COPY packages/database ./packages/database
COPY apps/discord-bot ./apps/discord-bot

RUN pnpm install --frozen-lockfile

RUN pnpm --filter @lbf-bot/utils run build
RUN pnpm --filter @lbf-bot/database run build
RUN pnpm --filter @lbf/discord-bot run build

CMD ["node", "apps/discord-bot/dist/index.js"]
