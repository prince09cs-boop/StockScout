# frontend/Dockerfile - Node 20 (Debian)
FROM node:20-bullseye

WORKDIR /app

# install build tools if native modules are needed
RUN apt-get update && apt-get install -y python3 build-essential --no-install-recommends && rm -rf /var/lib/apt/lists/*

# copy package files first for caching
COPY package.json package-lock.json* ./

# install deps
RUN npm ci --legacy-peer-deps

# copy app source
COPY . .

EXPOSE 5173

ENV PATH /app/node_modules/.bin:$PATH

CMD ["npm", "run", "dev", "--", "--host"]
