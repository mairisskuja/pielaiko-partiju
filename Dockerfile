# Pielaiko partiju – Node serveris (statiskie faili + rezultāta kartītes)
FROM node:20-slim

ENV NODE_ENV=production PORT=8080
WORKDIR /app

# Atkarības atsevišķā slānī, lai koda izmaiņas neizsauc npm ci
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY seo.json ./
COPY scripts/build-meta.js scripts/
COPY server/ server/
COPY programmas/ programmas/
COPY scripts/verify-why.js scripts/
COPY pielaiko-partiju/ pielaiko-partiju/

# SEO tagi no seo.json un ātrās pārbaudes jau attēla būvē
RUN node scripts/build-meta.js && node server/test.js && node scripts/verify-why.js

EXPOSE 8080
USER node
CMD ["node", "server/index.js"]
