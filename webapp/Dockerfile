# Dockerfile for Vite/React app container
FROM node:22-slim
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 5173
CMD ["npm", "run", "dev"]
