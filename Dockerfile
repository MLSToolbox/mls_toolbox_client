### STAGE 1:BUILD ###
# Defining a node image to be used as giving it an alias of "build"
# Which version of Node image to use depends on project dependencies 
# This is needed to build and compile our code 
# while generating the docker image
FROM node:20-alpine AS build

# Build arguments para configuración del ambiente
ARG API_URL=http://localhost:5000/api
ARG API_TIMEOUT=30000
ARG ENVIRONMENT=local

RUN mkdir -p /app

# Create a Virtual directory inside the docker image
WORKDIR /app

# Copy files to virtual directory
COPY package.json /app

# Copy files from local machine to virtual directory in docker image
COPY . .

# Crear archivo de environment con las variables de build
RUN echo "import { validateEnvironment } from './environment.schema';" > /app/src/environment/environment.ts && \
    echo "" >> /app/src/environment/environment.ts && \
    echo "const config = {" >> /app/src/environment/environment.ts && \
    echo "  apiUrl: '${API_URL}'," >> /app/src/environment/environment.ts && \
    echo "  apiTimeout: ${API_TIMEOUT}," >> /app/src/environment/environment.ts && \
    echo "};" >> /app/src/environment/environment.ts && \
    echo "" >> /app/src/environment/environment.ts && \
    echo "export const environment = validateEnvironment(config);" >> /app/src/environment/environment.ts

RUN npm install
RUN npm run build --omit=dev


### STAGE 2:RUN ###
# Defining nginx image to be used
FROM nginx:latest AS ngi
# Copying compiled code and nginx config to different folder
# NOTE: This path may change according to your project's output folder
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist/frontend /usr/share/nginx/html
COPY /nginx.conf  /etc/nginx/conf.d/default.conf
# Exposing a port, here it means that inside the container 
# the app will be using Port 80 while running
EXPOSE 80