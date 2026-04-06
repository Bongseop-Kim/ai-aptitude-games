FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV EXPO_NO_TELEMETRY=1
RUN npx expo export --platform web
RUN npm install --global serve

EXPOSE 8080

CMD ["serve", "-s", "dist", "-l", "8080"]
