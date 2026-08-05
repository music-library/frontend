# build environment
FROM node:24-alpine AS build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY / /app
RUN apk update && apk add git
RUN corepack enable
RUN yarn install --immutable
RUN yarn build

# production environment
FROM nginx:1.16.0-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
