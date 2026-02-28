### STAGE 1: BUILD ###
FROM node:20-alpine AS build

ARG API_URL=http://localhost:5000/api
ARG API_TIMEOUT=30000
ARG ENVIRONMENT=local

RUN mkdir -p /app
WORKDIR /app

COPY package.json /app
COPY . .

# Usar archivo de environment del ambiente correspondiente si existe,
# de lo contrario generar uno con los build args
RUN if [ -f "src/environment/environment.${ENVIRONMENT}.ts" ]; then \
      cp "src/environment/environment.${ENVIRONMENT}.ts" src/environment/environment.ts; \
    else \
      echo "import { validateEnvironment } from './environment.schema';" > /app/src/environment/environment.ts && \
      echo "" >> /app/src/environment/environment.ts && \
      echo "const config = {" >> /app/src/environment/environment.ts && \
      echo "  apiUrl: '${API_URL}'," >> /app/src/environment/environment.ts && \
      echo "  apiTimeout: ${API_TIMEOUT}," >> /app/src/environment/environment.ts && \
      echo "};" >> /app/src/environment/environment.ts && \
      echo "" >> /app/src/environment/environment.ts && \
      echo "export const environment = validateEnvironment(config);" >> /app/src/environment/environment.ts; \
    fi

RUN npm install
RUN npm run build --omit=dev

### STAGE 2: RUN ###
FROM nginx:latest AS ngi
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist/frontend /usr/share/nginx/html
COPY /nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
