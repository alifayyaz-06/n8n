# ---- Backend: Node.js + Express API ----
FROM node:22-alpine

WORKDIR /app

# Install production dependencies first (cached layer)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source
COPY src ./src

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

CMD ["node", "src/server.js"]
